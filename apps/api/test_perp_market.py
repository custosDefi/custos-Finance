import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import perp_market as p


def run_worker(monkeypatch, messages, attempts=1):
    hub = p.MarketStreamHub()
    url = 'wss://market.example.test'
    hub.node_status[url] = {'connected': False, 'messages': 0, 'error': ''}
    hub.running = True
    sent = []
    sleeps = []

    class Socket:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            nonlocal attempts
            attempts -= 1
            hub.running = attempts > 0

        async def send(self, data):
            sent.append(json.loads(data))

        async def __aiter__(self):
            for message in messages:
                yield json.dumps(message)

    async def sleep(seconds):
        sleeps.append(seconds)

    monkeypatch.setattr(p, 'websocket_connect', lambda *args, **kwargs: Socket())
    monkeypatch.setattr(p.asyncio, 'sleep', sleep)
    asyncio.run(hub._worker(url, 0))
    return hub, url, sent, sleeps


def test_subscription_rejection_is_reported_and_disconnects(monkeypatch):
    hub, url, sent, sleeps = run_worker(monkeypatch, [
        {'type': 'subscriptionError', 'subscriptionId': 100,
         'error': 'No valid feeds to subscribe to: Not entitled: feed 1'}
    ])
    status = hub.node_status[url]
    assert not status['connected']
    assert status['messages'] == 1
    assert 'Pyth subscription rejected' in status['error']
    assert 'Not entitled' in status['error']
    assert sent[0]['type'] == 'subscribe'
    assert sleeps == [1.0]
    assert not hub.quotes


def test_valid_price_stream_still_updates_quote(monkeypatch):
    hub, url, _, _ = run_worker(monkeypatch, [
        {'type': 'subscribed', 'subscriptionId': 100},
        {'type': 'streamUpdated', 'parsed': {
            'timestampUs': 123456789,
            'priceFeeds': [{'priceFeedId': 1, 'price': '123456789',
                            'exponent': -3, 'marketSession': 'regular',
                            'feedUpdateTimestamp': 123456789}]
        }}
    ])
    assert hub.node_status[url]['error'] == ''
    assert hub.quotes['BTC']['price'] == 123456.789
    assert hub.quotes['BTC']['source'] == 'pyth-pro-websocket'
    assert hub.quotes['BTC']['fresh']


def test_subscription_rejections_back_off_instead_of_retrying_every_second(monkeypatch):
    _, _, _, sleeps = run_worker(monkeypatch, [
        {'type': 'subscriptionError', 'error': 'Not entitled'}
    ], attempts=3)
    assert sleeps == [1.0, 1.8, 3.24]
