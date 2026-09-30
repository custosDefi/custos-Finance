import io,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
import pytest
from eth_account import Account
from eth_account.messages import encode_defunct
from fastapi import FastAPI
from fastapi.testclient import TestClient
from PIL import Image
import reality as r

@pytest.fixture
def setup(tmp_path,monkeypatch):
    monkeypatch.setenv('REALITY_DATA_DIR',str(tmp_path));monkeypatch.delenv('K_SERVICE',raising=False);monkeypatch.delenv('REALITY_DATABASE_URL',raising=False);monkeypatch.delenv('REALITY_GCS_BUCKET',raising=False)
    if r._engine:r._engine.dispose()
    r._engine=None
    owner,other,admin=Account.create(),Account.create(),Account.create();monkeypatch.setenv('REALITY_ADMIN_WALLETS',admin.address)
    app=FastAPI();app.include_router(r.router);client=TestClient(app)
    def auth(account):
        c=client.post('/api/reality/auth/challenge',json={'wallet':account.address}).json()
        sig=Account.sign_message(encode_defunct(text=c['message']),account.key).signature.hex()
        response=client.post('/api/reality/auth/login',json={'id':c['id'],'signature':'0x'+sig});assert response.status_code==200,response.text
        return {'Authorization':'Bearer '+response.json()['token']}
    yield client,owner,other,admin,auth
    r._engine.dispose();r._engine=None

def image_bytes():
    b=io.BytesIO();Image.new('RGB',(64,48),'green').save(b,format='PNG');return b.getvalue()
def create(client,headers,mode='free',upload_id=None):
    if not upload_id:
        image=client.post('/api/reality/uploads',headers={**headers,'Content-Type':'image/png'},content=image_bytes());assert image.status_code==200,image.text;upload_id=image.json()['id']
    return client.post('/api/reality/assets',headers=headers,json={'name':'真实相机','symbol':'CAM','story':'家人留下的相机','description':'我的原创照片','category':'things','mode':mode,'image_id':upload_id,'supply':'1000000','review_status':'approved','verified':True})

def test_signed_login_cannot_be_replayed_or_forged(setup):
    c,owner,other,_,_=setup
    challenge=c.post('/api/reality/auth/challenge',json={'wallet':owner.address}).json()
    bad='0x'+Account.sign_message(encode_defunct(text=challenge['message']),other.key).signature.hex()
    assert c.post('/api/reality/auth/login',json={'id':challenge['id'],'signature':bad}).status_code==401
    good='0x'+Account.sign_message(encode_defunct(text=challenge['message']),owner.key).signature.hex()
    assert c.post('/api/reality/auth/login',json={'id':challenge['id'],'signature':good}).status_code==200
    assert c.post('/api/reality/auth/login',json={'id':challenge['id'],'signature':good}).status_code==401

def test_upload_ownership_private_proofs_and_review_authority(setup):
    c,owner,other,admin,auth=setup;h,other_h,admin_h=auth(owner),auth(other),auth(admin)
    response=create(c,h,'verified');assert response.status_code==200,response.text;a=response.json();assert not a['verified']
    assert create(c,other_h,upload_id=a['image_id']).status_code==400
    proof=c.post('/api/reality/uploads?private=true',headers={**h,'Content-Type':'image/png'},content=image_bytes()).json()
    assert c.get('/api/reality/media/'+proof['id']).status_code==401
    assert c.get('/api/reality/media/'+proof['id'],headers=other_h).status_code==403
    assert c.get('/api/reality/media/'+proof['id'],headers=admin_h).status_code==200
    assert c.post('/api/reality/assets/'+a['id']+'/proof',headers=other_h,json={'proof_ids':[proof['id']]}).status_code==403
    assert c.post('/api/reality/assets/'+a['id']+'/proof',headers=h,json={'proof_ids':[proof['id']]}).status_code==200
    assert c.get('/api/reality/admin/reviews',headers=h).status_code==403
    assert c.post('/api/reality/admin/reviews/'+a['id'],headers=h,json={'decision':'approved','note':'真实证据充分'}).status_code==403
    assert c.post('/api/reality/admin/reviews/'+a['id'],headers=admin_h,json={'decision':'approved','note':'已检查原创图和权属证明'}).status_code==200
    assert c.get('/api/reality/assets/'+a['id']).json()['verified'] is True
    assert c.post('/api/reality/admin/reviews/'+a['id'],headers=admin_h,json={'decision':'revoked','note':'后续权属有争议'}).status_code==200
    assert c.get('/api/reality/assets/'+a['id']).json()['verified'] is False

def test_social_values_are_durable_and_not_self_valued(setup):
    c,owner,other,_,auth=setup;h,oh=auth(owner),auth(other);a=create(c,h).json();path='/api/reality/assets/'+a['id']
    assert c.post(path+'/valuations',headers=h,json={'amount':120}).status_code==400
    assert c.post(path+'/valuations',headers=oh,json={'amount':120}).status_code==200
    assert c.post(path+'/valuations',headers=oh,json={'amount':200}).status_code==200
    assert c.post(path+'/reactions',headers=oh,json={'kind':'love'}).json()['active'] is True
    assert c.post(path+'/comments',headers=oh,json={'body':'真实故事很动人'}).status_code==200
    row=c.get(path).json();assert row['community_value']==200 and row['valuation_count']==1 and row['love_count']==1 and len(row['comments'])==1
    r._engine.dispose();r._engine=None
    assert c.get(path).json()['community_value']==200
    assert c.post(path+'/reactions',headers=oh,json={'kind':'love'}).json()['active'] is False

def test_verification_lane_cannot_attach_before_review(setup):
    c,owner,_,_,auth=setup;h=auth(owner);a=create(c,h,'verified').json()
    assert c.post('/api/reality/assets/'+a['id']+'/attach',headers=h,json={'tx_hash':'0x'+'a'*64}).status_code==403

def test_upload_rejects_active_content_and_invalid_images(setup):
    c,owner,_,_,auth=setup;h=auth(owner)
    assert c.post('/api/reality/uploads',headers={**h,'Content-Type':'image/svg+xml'},content=b'<svg/>').status_code==400
    assert c.post('/api/reality/uploads',headers={**h,'Content-Type':'image/png'},content=b'<script/>').status_code==400
    assert c.post('/api/reality/uploads',headers={**h,'Content-Type':'application/pdf'},content=b'%PDF-').status_code==400

def test_attach_rejects_wrong_transaction_sender(setup,monkeypatch):
    c,owner,other,_,auth=setup;h=auth(owner);a=create(c,h).json()
    address='0x'+'1'*40
    monkeypatch.setenv('REALITY_LAUNCHPAD_ADDRESS',address)
    async def fake_rpc(method,params):
        if method=='eth_chainId':return hex(91342)
        if method=='eth_getTransactionReceipt':return {'status':'0x1','to':address,'from':other.address.lower(),'blockNumber':'0x10','logs':[]}
        raise AssertionError(method)
    monkeypatch.setattr(r,'rpc',fake_rpc)
    assert c.post('/api/reality/assets/'+a['id']+'/attach',headers=h,json={'tx_hash':'0x'+'a'*64}).status_code==400
    assert c.get('/api/reality/assets/'+a['id']).json()['token_address'] is None

def test_administrator_cannot_approve_own_asset(setup):
    c,_,_,admin,auth=setup;h=auth(admin);a=create(c,h,'verified').json()
    proof=c.post('/api/reality/uploads?private=true',headers={**h,'Content-Type':'image/png'},content=image_bytes()).json()
    assert c.post('/api/reality/assets/'+a['id']+'/proof',headers=h,json={'proof_ids':[proof['id']]}).status_code==200
    assert c.post('/api/reality/admin/reviews/'+a['id'],headers=h,json={'decision':'approved','note':'自己的证明'}).status_code==403

def test_index_orders_same_block_events_and_hides_stale_volume(setup):
    c,owner,_,_,auth=setup;h=auth(owner);a=create(c,h).json();timestamp=r.now()
    with r.engine().begin() as db:
        db.execute(r.update(r.assets).where(r.assets.c.id==a['id']).values(token_address='0x'+'2'*40,launch_id=1))
        for index,reserve in [(10,300),(2,200)]:
            db.execute(r.insert(r.trades).values(id='0xabc:'+str(index),launch_id=1,block_number=1,timestamp=timestamp,wallet=owner.address.lower(),side='buy',quote_amount=str(10**18),token_amount='1',quote_reserve=str(reserve),token_reserve='100',tx_hash='0xabc'))
        db.execute(r.insert(r.runtime_settings),[{'key':'index_block','value':'2'},{'key':'index_updated_at','value':str(timestamp)}])
    stats=c.get('/api/reality/market-stats').json();assert stats['items'][a['id']]['history'][-1]['price']==3
    assert stats['items'][a['id']]['volume_eth']==2
    with r.engine().begin() as db:db.execute(r.update(r.runtime_settings).where(r.runtime_settings.c.key=='index_updated_at').values(value='0'))
    assert c.get('/api/reality/market-stats').json()['items'][a['id']]['volume_eth'] is None
