import asyncio
import sys
from pathlib import Path
from unittest.mock import AsyncMock

import httpx
import pytest
from eth_account import Account
from fastapi import FastAPI, HTTPException
from starlette.requests import Request

sys.path.insert(0, str(Path(__file__).parent))
import faucet as f

RECIPIENT = '0x2222222222222222222222222222222222222222'
CONTRACT = '0x3333333333333333333333333333333333333333'
HASH = '0x' + 'ab' * 32


def settings(tmp_path):
    # Fresh isolated signer: never uses any project credential or public chain.
    return f.Settings(enabled=True, contract=CONTRACT, key=Account.create().key.hex(),
                      captcha_secret='test-secret', site_key='test-site', database=str(tmp_path / 'faucet.db'))


def info(**changes):
    return dict(amountWei='1000000000000000', cooldownSeconds=86400,
                dailyLimitWei='100000000000000000', distributedTodayWei='0',
                paused=False, nextClaimAt=0, reserveWei='100000000000000000',
                blockTime=100000, **changes)


def request(origin='https://www.custosfinance.xyz', peer='127.0.0.1', forwarded=None):
    headers = [(b'origin', origin.encode())]
    if forwarded:
        headers.append((b'x-real-ip', forwarded.encode()))
    return Request({'type': 'http', 'method': 'POST', 'path': '/', 'headers': headers, 'client': (peer, 1234)})


@pytest.mark.parametrize('value', ['not-an-address', f.ZERO, '0x1234', '0x52908400098527886E0F7030069857D2e4169EE7'])
def test_address_validation(value):
    with pytest.raises(ValueError):
        f.address(value)


def test_address_normalizes_valid_lowercase():
    assert f.address('0x52908400098527886e0f7030069857d2e4169ee7') == '0x52908400098527886E0F7030069857D2E4169EE7'


def test_caller_cannot_request_custom_amount_or_calldata():
    with pytest.raises(ValueError):
        f.ClaimRequest(address=RECIPIENT, captchaToken='test', amount='1 ETH', calldata='0x')


def test_settings_do_not_fall_back_to_project_relayer_key(monkeypatch):
    monkeypatch.setenv('RELAYER_PRIVATE_KEY', Account.create().key.hex())
    monkeypatch.delenv('FAUCET_OPERATOR_PRIVATE_KEY', raising=False)
    assert not f.Settings.environment().key
    assert not f.Settings().ready()


def test_disabled_api_returns_configuration_without_keys(tmp_path, monkeypatch):
    current = f.FaucetService(f.Settings(database=str(tmp_path / 'unused.db')))
    monkeypatch.setattr(f, '_service', current)
    async def run():
        app = FastAPI();app.include_router(f.router)
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
            response = await client.get('/api/faucet/config')
            assert response.status_code == 200 and not response.json()['enabled']
            rejected = await client.post('/api/faucet/requests', json={'address': RECIPIENT, 'captchaToken': 'test'})
            assert rejected.status_code == 503
            assert 'secret' not in response.text and 'private' not in response.text
        await current.close()
    asyncio.run(run())
    assert not Path(current.settings.database).exists()


def test_queue_deduplicates_address_and_survives_restart(tmp_path):
    store = f.Store(str(tmp_path / 'faucet.db'))
    first = store.enqueue(RECIPIENT, 100)
    assert store.enqueue(RECIPIENT, 100)['id'] == first['id']
    store.update(first['id'], state='signed', raw_tx='private-signed-bytes', tx_hash=HASH)
    recovered = f.Store(store.filename).next()
    assert recovered['id'] == first['id'] and recovered['raw_tx'] == 'private-signed-bytes'
    assert 'raw_tx' not in f.public_job(recovered)
    assert Path(store.filename).stat().st_mode & 0o777 == 0o600


def test_persistent_client_rate_daily_budget_and_worker_lease(tmp_path):
    store = f.Store(str(tmp_path / 'faucet.db'))
    store.attempt('hashed-client', 1)
    with pytest.raises(HTTPException) as error:
        store.attempt('hashed-client', 1)
    assert error.value.status_code == 429
    store.enqueue(RECIPIENT, 1)
    with pytest.raises(HTTPException):
        store.enqueue('0x4444444444444444444444444444444444444444', 1)
    assert store.acquire('first') and not store.acquire('second')
    store.release('first');assert store.acquire('second')


@pytest.mark.parametrize('changes,code', [({'paused': True}, 'PAUSED'), ({'reserveWei': '0'}, 'EMPTY'),
                                        ({'nextClaimAt': 200000}, 'COOLDOWN'), ({'distributedTodayWei': '100000000000000000'}, 'DAILY_LIMIT')])
def test_eligibility_fails_closed(changes, code):
    data = info();data.update(changes)
    with pytest.raises(HTTPException) as error:
        f.check_info(data)
    assert error.value.detail['code'] == code


def test_client_cannot_spoof_forwarded_ip_without_trusted_proxy(tmp_path):
    current = f.FaucetService(settings(tmp_path))
    assert current.client_ip(request(peer='192.0.2.1', forwarded='192.0.2.9')) == '192.0.2.1'
    current.settings.trusted_proxies = ('127.0.0.1/32',)
    assert current.client_ip(request(forwarded='192.0.2.9')) == '192.0.2.9'
    asyncio.run(current.close())


def test_submit_requires_captcha_and_checks_address_before_queue(tmp_path):
    async def run():
        current = f.FaucetService(settings(tmp_path))
        try:
            current.verify_captcha = AsyncMock(side_effect=HTTPException(400, 'captcha denied'))
            current.chain.info = AsyncMock(return_value=info())
            body = f.ClaimRequest(address=RECIPIENT, captchaToken='one-use-token')
            with pytest.raises(HTTPException):
                await current.submit(body, request())
            assert not current.store.next()
            current.verify_captcha = AsyncMock()
            job = await current.submit(body, request())
            assert job['state'] == 'queued' and 'raw_tx' not in job
            assert (await current.submit(body, request()))['id'] == job['id']
            with pytest.raises(HTTPException) as error:
                await current.submit(body, request(origin='https://attacker.test'))
            assert error.value.status_code == 403
        finally:
            await current.close()
    asyncio.run(run())


def test_captcha_hostname_and_action_are_verified(tmp_path):
    async def run():
        current = f.FaucetService(settings(tmp_path))
        payload = {'success': True, 'hostname': 'www.custosfinance.xyz', 'action': 'wrong-action'}
        async def handler(request):
            return httpx.Response(200, json=payload)
        await current.client.aclose();current.client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        try:
            with pytest.raises(HTTPException):
                await current.verify_captcha('token', '127.0.0.1')
            payload['action'] = 'faucet';await current.verify_captcha('token', '127.0.0.1')
            payload['hostname'] = 'attacker.test'
            with pytest.raises(HTTPException):
                await current.verify_captcha('token', '127.0.0.1')
        finally:
            await current.close()
    asyncio.run(run())


def test_uncertain_broadcast_reuses_same_raw_transaction_after_restart(tmp_path):
    async def run():
        cfg = settings(tmp_path)
        current = f.FaucetService(cfg)
        job = current.store.enqueue(RECIPIENT, 100)
        current.chain.prepare = AsyncMock(return_value=('same-signed-bytes', HASH))
        calls = []
        async def rpc(method, params):
            calls.append((method, params))
            if method == 'eth_getTransactionReceipt':
                return None
            if method == 'eth_sendRawTransaction':
                raise RuntimeError('socket closed after broadcast')
        current.chain.rpc = rpc
        await current.step()
        assert current.store.get(job['id'])['state'] == 'signed'
        await current.close()
        restarted = f.FaucetService(cfg)
        restarted.store.update(job['id'], retry_at=0)
        restarted.chain.prepare = AsyncMock(side_effect=AssertionError('must not sign again'))
        async def recovered(method, params):
            if method == 'eth_getTransactionReceipt':
                return {'transactionHash': HASH, 'status': '0x1', 'blockNumber': '0x64'}
            if method == 'eth_blockNumber':
                return '0x65'
            raise AssertionError('confirmed transaction must not be broadcast again')
        restarted.chain.rpc = recovered
        await restarted.step()
        assert restarted.store.get(job['id'])['state'] == 'confirmed'
        assert calls[-1] == ('eth_sendRawTransaction', ['same-signed-bytes'])
        await restarted.close()
    asyncio.run(run())


def test_rpc_failure_before_signature_does_not_send_or_claim_success(tmp_path):
    async def run():
        current = f.FaucetService(settings(tmp_path))
        job = current.store.enqueue(RECIPIENT, 100)
        current.chain.prepare = AsyncMock(side_effect=RuntimeError('no gas'))
        current.chain.rpc = AsyncMock()
        await current.step()
        assert current.store.get(job['id'])['state'] == 'failed'
        assert not current.store.get(job['id'])['tx_hash']
        current.chain.rpc.assert_not_called()
        await current.close()
    asyncio.run(run())


def test_uncertain_nonce_blocks_other_recipients_until_operator_review(tmp_path):
    async def run():
        current = f.FaucetService(settings(tmp_path))
        first = current.store.enqueue(RECIPIENT, 100)
        current.store.update(first['id'], state='attention', raw_tx='signed', tx_hash=HASH)
        second = current.store.enqueue('0x4444444444444444444444444444444444444444', 100)
        current.chain.prepare = AsyncMock()
        await current.step()
        assert current.store.get(second['id'])['state'] == 'queued'
        current.chain.prepare.assert_not_called()
        await current.close()
    asyncio.run(run())
