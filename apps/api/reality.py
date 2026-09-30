"""Reality Launchpad: signed wallet sessions, durable content and human review.

No price seeds, self-issued verification badges or unsigned chain attachments.
SQLite is suitable for a single persistent VM. Cloud Run requires PostgreSQL + GCS.
"""
from __future__ import annotations
import asyncio, hashlib, io, json, os, re, secrets, time, uuid
from pathlib import Path
from typing import Literal
import httpx
from eth_account import Account
from eth_account.messages import encode_defunct
from eth_abi import decode
from eth_utils import keccak
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field
from PIL import Image, UnidentifiedImageError
from sqlalchemy import (create_engine, MetaData, Table, Column, String, Text, Integer, Float,
                        ForeignKey, UniqueConstraint, select, insert, update, delete, func, event)

router=APIRouter(prefix='/api/reality', tags=['Reality Launchpad'])
metadata=MetaData()
users=Table('reality_users', metadata, Column('wallet',String(42),primary_key=True),Column('created_at',Integer,nullable=False))
nonces=Table('reality_nonces',metadata,Column('id',String,primary_key=True),Column('wallet',String,nullable=False),Column('message',Text,nullable=False),Column('expires_at',Integer,nullable=False))
sessions=Table('reality_sessions',metadata,Column('hash',String,primary_key=True),Column('wallet',String,nullable=False),Column('expires_at',Integer,nullable=False))
uploads=Table('reality_uploads',metadata,Column('id',String,primary_key=True),Column('wallet',String,nullable=False),Column('name',String,nullable=False),Column('type',String,nullable=False),Column('private',Integer,nullable=False),Column('created_at',Integer,nullable=False))
assets=Table('reality_assets',metadata,Column('id',String,primary_key=True),Column('wallet',String,nullable=False),Column('name',String,nullable=False),Column('symbol',String,nullable=False),Column('story',String,nullable=False),Column('description',Text,nullable=False),Column('category',String,nullable=False),Column('image_id',String,ForeignKey('reality_uploads.id'),nullable=False),Column('mode',String,nullable=False),Column('supply',String,nullable=False),Column('review_status',String,nullable=False),Column('proof_code',String,nullable=False),Column('proof_ids',Text,nullable=False),Column('review_note',Text,nullable=False),Column('token_address',String),Column('launch_id',Integer),Column('tx_hash',String),Column('created_at',Integer,nullable=False),UniqueConstraint('token_address'))
reactions=Table('reality_reactions',metadata,Column('id',String,primary_key=True),Column('asset_id',String,ForeignKey('reality_assets.id'),nullable=False),Column('wallet',String,nullable=False),Column('kind',String,nullable=False),UniqueConstraint('asset_id','wallet','kind'))
comments=Table('reality_comments',metadata,Column('id',String,primary_key=True),Column('asset_id',String,ForeignKey('reality_assets.id'),nullable=False),Column('wallet',String,nullable=False),Column('body',Text,nullable=False),Column('created_at',Integer,nullable=False))
valuations=Table('reality_valuations',metadata,Column('id',String,primary_key=True),Column('asset_id',String,ForeignKey('reality_assets.id'),nullable=False),Column('wallet',String,nullable=False),Column('amount',Float,nullable=False),UniqueConstraint('asset_id','wallet'))
audits=Table('reality_audits',metadata,Column('id',String,primary_key=True),Column('asset_id',String,nullable=False),Column('wallet',String,nullable=False),Column('decision',String,nullable=False),Column('note',Text,nullable=False),Column('created_at',Integer,nullable=False))
runtime_settings=Table('reality_settings',metadata,Column('key',String,primary_key=True),Column('value',Text,nullable=False))
trades=Table('reality_trades',metadata,Column('id',String,primary_key=True),Column('launch_id',Integer,nullable=False),Column('block_number',Integer,nullable=False),Column('timestamp',Integer,nullable=False),Column('wallet',String,nullable=False),Column('side',String,nullable=False),Column('quote_amount',String,nullable=False),Column('token_amount',String,nullable=False),Column('quote_reserve',String,nullable=False),Column('token_reserve',String,nullable=False),Column('tx_hash',String,nullable=False))
_engine=None

def engine():
    global _engine
    if _engine is None:
        url=os.getenv('REALITY_DATABASE_URL','').strip()
        if os.getenv('K_SERVICE') and (not url.startswith('postgresql') or not os.getenv('REALITY_GCS_BUCKET')):
            raise HTTPException(503,'Cloud Run 需要配置持久化 PostgreSQL 和 GCS 存储')
        if not url:
            root=Path(os.getenv('REALITY_DATA_DIR',str(Path(__file__).parent/'data'/'reality'))).resolve()
            root.mkdir(parents=True,exist_ok=True)
            url='sqlite:///'+str(root/'reality.db').replace('\\','/')
        if url.startswith('postgresql://'): url=url.replace('postgresql://','postgresql+psycopg://',1)
        _engine=create_engine(url,connect_args={'check_same_thread':False,'timeout':30} if url.startswith('sqlite') else {},pool_pre_ping=True)
        if url.startswith('sqlite'):
            @event.listens_for(_engine,'connect')
            def sqlite_setup(dbapi, _):
                dbapi.execute('PRAGMA foreign_keys=ON'); dbapi.execute('PRAGMA journal_mode=WAL')
        metadata.create_all(_engine)
    return _engine

def uid(): return str(uuid.uuid4())
def now(): return int(time.time())
def admins(): return {x.strip().lower() for x in os.getenv('REALITY_ADMIN_WALLETS','').split(',') if re.fullmatch(r'0x[0-9a-fA-F]{40}',x.strip())}
def config():
    with engine().connect() as db: stored={r.key:r.value for r in db.execute(select(runtime_settings))}
    return {'chain_id':91342,'name':'GIWA Sepolia','rpc':os.getenv('GIWA_RPC_URL','https://sepolia-rpc.giwa.io'),
            'explorer':'https://sepolia-explorer.giwa.io','testnet':True,
            'launchpad':os.getenv('REALITY_LAUNCHPAD_ADDRESS','') or stored.get('launchpad',''),'platform_token':os.getenv('REALITY_PLATFORM_TOKEN','') or stored.get('platform_token',''),
            'swap_router':os.getenv('REALITY_SWAP_ROUTER','') or stored.get('swap_router',''),'swap_factory':os.getenv('REALITY_SWAP_FACTORY','') or stored.get('swap_factory',''),
            'weth':'0x4200000000000000000000000000000000000006','admin_configured':bool(admins())}
def wallet_auth(request:Request):
    value=request.headers.get('authorization','')
    if not value.startswith('Bearer '): raise HTTPException(401,'请连接钱包并签名登录')
    digest=hashlib.sha256(value[7:].encode()).hexdigest()
    with engine().connect() as db: row=db.execute(select(sessions).where(sessions.c.hash==digest,sessions.c.expires_at>now())).mappings().first()
    if not row: raise HTTPException(401,'登录已过期，请重新签名')
    return row['wallet']
def admin_auth(wallet=Depends(wallet_auth)):
    if wallet not in admins(): raise HTTPException(403,'仅管理员可操作')
    return wallet
def find_asset(db,id):
    row=db.execute(select(assets).where(assets.c.id==id)).mappings().first()
    if not row: raise HTTPException(404,'项目不存在')
    return dict(row)
def own(row,wallet):
    if row['wallet']!=wallet: raise HTTPException(403,'仅项目创建者可操作')
def check_upload(db,id,wallet,private=None):
    row=db.execute(select(uploads).where(uploads.c.id==id,uploads.c.wallet==wallet)).mappings().first()
    if not row or (private is not None and bool(row['private'])!=private): raise HTTPException(400,'附件不存在、无权限或类型不符')
    return row
def image_url(id): return '/api/reality/media/'+id
def enrich(db,row,wallet=''):
    result=dict(row);result['image_url']=image_url(row['image_id']);result['verified']=row['review_status']=='approved'
    # Verification is only computed from the server-controlled review result.
    for kind in ('love','collect','watch'):
        result[kind+'_count']=db.execute(select(func.count()).select_from(reactions).where(reactions.c.asset_id==row['id'],reactions.c.kind==kind)).scalar()
        result[kind+'d']=bool(db.execute(select(reactions.c.id).where(reactions.c.asset_id==row['id'],reactions.c.kind==kind,reactions.c.wallet==wallet)).first())
    offers=list(db.execute(select(valuations.c.amount).where(valuations.c.asset_id==row['id'])).scalars())
    offers.sort();n=len(offers);result['valuation_count']=n
    result['community_value']=None if not n else (offers[n//2] if n%2 else (offers[n//2-1]+offers[n//2])/2)
    if row['wallet']!=wallet and wallet not in admins():
        result.pop('proof_ids',None);result.pop('proof_code',None);result.pop('review_note',None)
    return result

class Challenge(BaseModel): wallet:str=Field(pattern=r'^0x[0-9a-fA-F]{40}$')
class Login(BaseModel): id:str;signature:str=Field(min_length=100,max_length=200)
@router.get('/config')
def get_config(): return config()
@router.post('/auth/challenge')
def challenge(body:Challenge,request:Request):
    id=uid();wallet=body.wallet.lower();stamp=now()
    domain=os.getenv('REALITY_PUBLIC_ORIGIN','').strip() or str(request.base_url).rstrip('/')
    message=f'{domain} requests a Custos wallet login.\nWallet: {wallet}\nChain ID: 91342\nNonce: {secrets.token_hex(16)}\nIssued: {stamp}\nExpires: {stamp+300}\nSign in only. No transaction or token allowance.'
    with engine().begin() as db:
        db.execute(delete(nonces).where(nonces.c.expires_at<stamp));db.execute(delete(sessions).where(sessions.c.expires_at<stamp))
        existing=db.execute(select(func.count()).select_from(nonces).where(nonces.c.wallet==wallet)).scalar()
        if existing>=5: raise HTTPException(429,'请求过于频繁，请五分钟后重试')
        db.execute(insert(nonces).values(id=id,wallet=wallet,message=message,expires_at=stamp+300))
    return {'id':id,'message':message}
@router.post('/auth/login')
def login(body:Login):
    with engine().begin() as db:
        row=db.execute(select(nonces).where(nonces.c.id==body.id,nonces.c.expires_at>now())).mappings().first()
        if not row: raise HTTPException(401,'签名请求已过期或已使用')
        try: address=Account.recover_message(encode_defunct(text=row['message']),signature=body.signature).lower()
        except Exception: raise HTTPException(401,'签名无效')
        if address!=row['wallet']: raise HTTPException(401,'签名钱包不匹配')
        consumed=db.execute(delete(nonces).where(nonces.c.id==body.id))
        if consumed.rowcount!=1: raise HTTPException(401,'签名请求已使用')
        if not db.execute(select(users.c.wallet).where(users.c.wallet==address)).first(): db.execute(insert(users).values(wallet=address,created_at=now()))
        token=secrets.token_urlsafe(48);db.execute(insert(sessions).values(hash=hashlib.sha256(token.encode()).hexdigest(),wallet=address,expires_at=now()+86400))
    return {'token':token,'wallet':address,'is_admin':address in admins(),'expires_at':now()+86400}
@router.get('/me')
def me(wallet=Depends(wallet_auth)): return {'wallet':wallet,'is_admin':wallet in admins()}
@router.post('/auth/logout')
def logout(request:Request,wallet=Depends(wallet_auth)):
    with engine().begin() as db: db.execute(delete(sessions).where(sessions.c.hash==hashlib.sha256(request.headers['authorization'][7:].encode()).hexdigest()))
    return {'ok':True}

def store_bytes(id,data):
    bucket=os.getenv('REALITY_GCS_BUCKET','')
    if bucket:
        from google.cloud import storage
        storage.Client().bucket(bucket).blob('reality/'+id).upload_from_string(data)
    else:
        root=Path(os.getenv('REALITY_DATA_DIR',str(Path(__file__).parent/'data'/'reality')))/'files';root.mkdir(parents=True,exist_ok=True)
        (root/id).write_bytes(data)
def read_bytes(id):
    bucket=os.getenv('REALITY_GCS_BUCKET','')
    if bucket:
        from google.cloud import storage
        return storage.Client().bucket(bucket).blob('reality/'+id).download_as_bytes()
    return (Path(os.getenv('REALITY_DATA_DIR',str(Path(__file__).parent/'data'/'reality')))/'files'/id).read_bytes()
@router.post('/uploads')
async def upload(request:Request,private:bool=False,wallet=Depends(wallet_auth)):
    mime=request.headers.get('content-type','').split(';')[0];name=request.headers.get('x-file-name','upload')[:180]
    data=bytearray()
    async for chunk in request.stream():
        data.extend(chunk)
        if len(data)>10*1024*1024: raise HTTPException(413,'每个附件不能超过 10 MB')
    if not data: raise HTTPException(400,'文件为空')
    if mime in ('image/jpeg','image/png','image/webp'):
        try:
            Image.MAX_IMAGE_PIXELS=24_000_000
            photo=Image.open(io.BytesIO(data));photo.load();photo=photo.convert('RGB');photo.thumbnail((2400,2400));buffer=io.BytesIO();photo.save(buffer,format='JPEG',quality=90);data=buffer.getvalue();mime='image/jpeg'
        except (UnidentifiedImageError,Image.DecompressionBombError,Image.DecompressionBombWarning,OSError,ValueError): raise HTTPException(400,'图片无效或尺寸过大')
    elif private and mime=='application/pdf' and bytes(data).startswith(b'%PDF-'): data=bytes(data)
    elif private and mime=='video/mp4' and bytes(data)[4:8]==b'ftyp':data=bytes(data)
    elif private and mime=='video/webm' and bytes(data).startswith(b'\x1a\x45\xdf\xa3'):data=bytes(data)
    else: raise HTTPException(400,'图片支持 JPG/PNG/WebP，私密证明另支持 PDF/MP4/WebM')
    with engine().connect() as db:
        count=db.execute(select(func.count()).select_from(uploads).where(uploads.c.wallet==wallet,uploads.c.created_at>now()-3600)).scalar()
        if count>=50: raise HTTPException(429,'每小时最多上传 50 个附件')
    id=uid();store_bytes(id,data)
    with engine().begin() as db: db.execute(insert(uploads).values(id=id,wallet=wallet,name=name,type=mime,private=int(private),created_at=now()))
    return {'id':id,'url':image_url(id),'name':name,'private':private}
@router.get('/media/{id}')
def media(id:str,request:Request):
    with engine().connect() as db: row=db.execute(select(uploads).where(uploads.c.id==id)).mappings().first()
    if not row: raise HTTPException(404,'附件不存在')
    if row['private']:
        wallet=wallet_auth(request)
        if wallet!=row['wallet'] and wallet not in admins(): raise HTTPException(403,'证明文件仅创建者与审核员可见')
    try: data=read_bytes(id)
    except Exception: raise HTTPException(503,'附件存储暂时不可用')
    return Response(data,media_type=row['type'],headers={'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store' if row['private'] else 'public, max-age=86400','Content-Disposition':'attachment' if row['type']=='application/pdf' else 'inline'})

class CreateAsset(BaseModel):
    name:str=Field(min_length=2,max_length=80);symbol:str=Field(pattern=r'^[A-Z0-9]{2,12}$')
    story:str=Field(min_length=3,max_length=180);description:str=Field(default='',max_length=5000)
    category:Literal['memories','things','assets'];mode:Literal['free','verified'];image_id:str
    supply:str=Field(pattern=r'^[1-9][0-9]{0,11}$')
@router.post('/assets')
def create_asset(body:CreateAsset,wallet=Depends(wallet_auth)):
    with engine().begin() as db:
        check_upload(db,body.image_id,wallet,False)
        count=db.execute(select(func.count()).select_from(assets).where(assets.c.wallet==wallet,assets.c.created_at>now()-3600)).scalar()
        if count>=10: raise HTTPException(429,'每小时最多创建 10 个项目')
        row={**body.model_dump(),'id':uid(),'wallet':wallet,'review_status':'unverified','proof_code':'CUS-'+secrets.token_hex(3).upper(),'proof_ids':'[]','review_note':'','created_at':now()}
        db.execute(insert(assets).values(**row));return enrich(db,row,wallet)
@router.get('/assets')
def list_assets(search:str='',category:str='',verification:str='',sort:Literal['new','popular']='new',page:int=1,limit:int=24,request:Request=None):
    limit=max(1,min(limit,60));page=max(1,page);wallet=''
    if request and request.headers.get('authorization'):
        try: wallet=wallet_auth(request)
        except HTTPException: pass
    with engine().connect() as db:
        query=select(assets)
        if search: query=query.where((assets.c.name.contains(search[:100],autoescape=True))|(assets.c.symbol.contains(search[:100],autoescape=True)))
        if category in ('memories','things','assets'): query=query.where(assets.c.category==category)
        if verification=='verified': query=query.where(assets.c.review_status=='approved')
        elif verification=='free': query=query.where(assets.c.mode=='free')
        if sort=='popular':
            count=select(func.count()).select_from(reactions).where(reactions.c.asset_id==assets.c.id,reactions.c.kind=='love').scalar_subquery();query=query.order_by(count.desc(),assets.c.created_at.desc())
        else: query=query.order_by(assets.c.created_at.desc())
        rows=db.execute(query.limit(limit+1).offset((page-1)*limit)).mappings().all()
        return {'items':[enrich(db,r,wallet) for r in rows[:limit]],'has_more':len(rows)>limit,'page':page}
@router.get('/assets/{id}')
def asset_detail(id:str,request:Request):
    wallet=''
    if request.headers.get('authorization'):
        try: wallet=wallet_auth(request)
        except HTTPException: pass
    with engine().connect() as db:
        row=enrich(db,find_asset(db,id),wallet)
        row['comments']=[dict(r) for r in db.execute(select(comments).where(comments.c.asset_id==id).order_by(comments.c.created_at.desc()).limit(100)).mappings()]
    return row
@router.get('/assets/{id}/metadata')
def asset_metadata(id:str,request:Request):
    with engine().connect() as db: row=find_asset(db,id)
    base=os.getenv('REALITY_PUBLIC_ORIGIN','').rstrip('/') or str(request.base_url).rstrip('/')
    return {'name':row['name'],'symbol':row['symbol'],'description':row['description'] or row['story'],'image':base+image_url(row['image_id']),'external_url':base+'/#/reality/asset/'+id,'properties':{'custos_id':id,'creator':row['wallet'],'category':row['category'],'verification':row['review_status']}}
@router.get('/portfolio')
def portfolio(wallet=Depends(wallet_auth)):
    with engine().connect() as db:
        owned=db.execute(select(assets).where(assets.c.wallet==wallet).order_by(assets.c.created_at.desc())).mappings().all()
        watched=db.execute(select(assets).join(reactions,reactions.c.asset_id==assets.c.id).where(reactions.c.wallet==wallet,reactions.c.kind=='watch')).mappings().all()
        collected=db.execute(select(assets).join(reactions,reactions.c.asset_id==assets.c.id).where(reactions.c.wallet==wallet,reactions.c.kind=='collect')).mappings().all()
        return {'owned':[enrich(db,r,wallet) for r in owned],'watched':[enrich(db,r,wallet) for r in watched],'collected':[enrich(db,r,wallet) for r in collected]}
class Reaction(BaseModel): kind:Literal['love','collect','watch']
@router.post('/assets/{id}/reactions')
def reaction(id:str,body:Reaction,wallet=Depends(wallet_auth)):
    with engine().begin() as db:
        find_asset(db,id);where=(reactions.c.asset_id==id)&(reactions.c.wallet==wallet)&(reactions.c.kind==body.kind)
        row=db.execute(select(reactions.c.id).where(where)).first()
        if row: db.execute(delete(reactions).where(where))
        else: db.execute(insert(reactions).values(id=uid(),asset_id=id,wallet=wallet,kind=body.kind))
    return {'active':not bool(row)}
class Comment(BaseModel): body:str=Field(min_length=1,max_length=1000)
@router.post('/assets/{id}/comments')
def comment(id:str,body:Comment,wallet=Depends(wallet_auth)):
    with engine().begin() as db:
        find_asset(db,id);recent=db.execute(select(func.count()).select_from(comments).where(comments.c.wallet==wallet,comments.c.created_at>now()-60)).scalar()
        if recent>=5: raise HTTPException(429,'请稍后再留言')
        db.execute(insert(comments).values(id=uid(),asset_id=id,wallet=wallet,body=body.body.strip(),created_at=now()))
    return {'ok':True}
class Valuation(BaseModel): amount:float=Field(gt=0,le=1_000_000_000,allow_inf_nan=False)
@router.post('/assets/{id}/valuations')
def valuation(id:str,body:Valuation,wallet=Depends(wallet_auth)):
    with engine().begin() as db:
        row=find_asset(db,id)
        if row['wallet']==wallet: raise HTTPException(400,'不能为自己的项目提交社区估值')
        where=(valuations.c.asset_id==id)&(valuations.c.wallet==wallet)
        if db.execute(select(valuations.c.id).where(where)).first(): db.execute(update(valuations).where(where).values(amount=body.amount))
        else: db.execute(insert(valuations).values(id=uid(),asset_id=id,wallet=wallet,amount=body.amount))
    return {'ok':True}
class Proof(BaseModel): proof_ids:list[str]=Field(min_length=1,max_length=12);note:str=Field(default='',max_length=2000)
@router.post('/assets/{id}/proof')
def submit_proof(id:str,body:Proof,wallet=Depends(wallet_auth)):
    with engine().begin() as db:
        row=find_asset(db,id);own(row,wallet)
        if row['review_status'] in ('pending','approved'): raise HTTPException(409,'项目已在审核中或已通过审核')
        for file in body.proof_ids: check_upload(db,file,wallet,True)
        db.execute(update(assets).where(assets.c.id==id).values(proof_ids=json.dumps(body.proof_ids),review_status='pending',review_note=body.note))
    return {'ok':True,'review_status':'pending'}
@router.get('/admin/reviews')
def reviews(wallet=Depends(admin_auth)):
    with engine().connect() as db:
        rows=db.execute(select(assets).where(assets.c.review_status.in_(['pending','approved'])).order_by(assets.c.created_at.desc())).mappings().all()
        result=[]
        for r in rows:
            row=enrich(db,r,wallet);ids=json.loads(row['proof_ids'])
            row['proof_files']=[dict(x) for x in db.execute(select(uploads).where(uploads.c.id.in_(ids))).mappings()];result.append(row)
    return {'items':result}
class Review(BaseModel): decision:Literal['approved','rejected','revoked'];note:str=Field(min_length=3,max_length=2000)
@router.post('/admin/reviews/{id}')
def review(id:str,body:Review,wallet=Depends(admin_auth)):
    with engine().begin() as db:
        row=find_asset(db,id)
        if row['wallet']==wallet: raise HTTPException(403,'审核员不能审核自己的项目')
        if (body.decision=='revoked' and row['review_status']!='approved') or (body.decision!='revoked' and row['review_status']!='pending'): raise HTTPException(409,'审核状态已变化，请刷新')
        db.execute(update(assets).where(assets.c.id==id).values(review_status=body.decision,review_note=body.note))
        db.execute(insert(audits).values(id=uid(),asset_id=id,wallet=wallet,decision=body.decision,note=body.note,created_at=now()))
    return {'ok':True}

async def rpc(method,params):
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r=await client.post(config()['rpc'],json={'jsonrpc':'2.0','id':1,'method':method,'params':params});r.raise_for_status();body=r.json()
    except (httpx.HTTPError,ValueError):
        raise HTTPException(503,'链上节点暂时不可用，请稍后重试')
    if body.get('error'): raise HTTPException(503,'链上节点暂时不可用')
    return body.get('result')
class Attachment(BaseModel): tx_hash:str=Field(pattern=r'^0x[0-9a-fA-F]{64}$')
@router.post('/assets/{id}/attach')
async def attach(id:str,body:Attachment,wallet=Depends(wallet_auth)):
    with engine().connect() as db: row=find_asset(db,id);own(row,wallet)
    if row['token_address']: raise HTTPException(409,'该项目已绑定代币')
    if row['mode']=='verified' and row['review_status']!='approved': raise HTTPException(403,'认证发行须先通过人工审核')
    launchpad=config()['launchpad'].lower()
    if not re.fullmatch(r'0x[0-9a-f]{40}',launchpad): raise HTTPException(503,'GIWA 发射台合约尚未部署或配置')
    chain=await rpc('eth_chainId',[])
    if int(chain,16)!=91342: raise HTTPException(503,'RPC 链与 GIWA 配置不符')
    receipt=await rpc('eth_getTransactionReceipt',[body.tx_hash])
    if not receipt or receipt.get('status')!='0x1': raise HTTPException(409,'交易未成功确认')
    if receipt.get('to','').lower()!=launchpad or receipt.get('from','').lower()!=wallet: raise HTTPException(400,'交易合约或创建者不匹配')
    head=int(await rpc('eth_blockNumber',[]),16)
    if head-int(receipt['blockNumber'],16)<1: raise HTTPException(409,'等待更多链上确认后重试')
    topic='0x'+keccak(text='LaunchCreated(uint256,address,address,bool,string)').hex()
    found=None
    for log in receipt.get('logs',[]):
        topics=log.get('topics',[])
        if log.get('address','').lower()==launchpad and len(topics)==4 and topics[0].lower()==topic:
            if '0x'+topics[2][-40:].lower()!=wallet: continue
            curated,uri=decode(['bool','string'],bytes.fromhex(log['data'][2:]))
            if not uri.endswith('/api/reality/assets/'+id+'/metadata'): continue
            found=(int(topics[1],16),'0x'+topics[3][-40:].lower());break
    if not found: raise HTTPException(400,'交易中没有对应项目的发行记录')
    launch_id,token=found
    raw=await rpc('eth_call',[{'to':launchpad,'data':'0x'+keccak(text='getLaunch(uint256)')[:4].hex()+hex(launch_id)[2:].zfill(64)},'latest'])
    value=decode(['(address,address,string,string,string,uint256,uint256,uint256,uint256,uint64,uint64,bool,bool)'],bytes.fromhex(raw[2:]))[0]
    if value[0].lower()!=wallet or value[1].lower()!=token or value[2]!=row['name'] or value[3]!=row['symbol'] or value[5]!=int(row['supply'])*10**18: raise HTTPException(400,'链上名称、数量或发行者与项目不符')
    with engine().begin() as db:
        changed=db.execute(update(assets).where(assets.c.id==id,assets.c.token_address.is_(None)).values(token_address=token,launch_id=launch_id,tx_hash=body.tx_hash))
        if changed.rowcount!=1: raise HTTPException(409,'项目已绑定代币')
    return {'ok':True,'token_address':token,'launch_id':launch_id}

@router.get('/activity')
def activity():
    with engine().connect() as db:
        created=[{'id':r['id'],'asset_id':r['id'],'wallet':r['wallet'],'text':'创建了 '+r['name'],'created_at':r['created_at']} for r in db.execute(select(assets).order_by(assets.c.created_at.desc()).limit(12)).mappings()]
        reviewed=[{'id':r['id'],'asset_id':r['asset_id'],'wallet':r['wallet'],'text':{'approved':'通过了资产证明审核','rejected':'完成了证明审核','revoked':'撤销了资产认证'}[r['decision']],'created_at':r['created_at']} for r in db.execute(select(audits).order_by(audits.c.created_at.desc()).limit(12)).mappings()]
    return {'items':sorted(created+reviewed,key=lambda x:x['created_at'],reverse=True)[:12]}

_index_task=None
async def sync_trades():
    address=config()['launchpad']
    if not address: return
    with engine().connect() as db:
        txs=list(db.execute(select(assets.c.tx_hash).where(assets.c.token_address.is_not(None))).scalars())
        cursor=db.execute(select(runtime_settings.c.value).where(runtime_settings.c.key=='index_block')).scalar()
    if not txs: return
    if not cursor:
        blocks=[]
        for offset in range(0,len(txs),20):
            receipts=await asyncio.gather(*(rpc('eth_getTransactionReceipt',[tx]) for tx in txs[offset:offset+20]))
            blocks.extend(int(x['blockNumber'],16) for x in receipts if x)
        if not blocks:return
        start=min(blocks)
    else:start=max(0,int(cursor)-16)
    latest=int(await rpc('eth_blockNumber',[]),16)-2
    buy='0x'+keccak(text='TokensPurchased(uint256,address,uint256,uint256,uint256,uint256)').hex()
    sell='0x'+keccak(text='TokensSold(uint256,address,uint256,uint256,uint256,uint256)').hex()
    # Bounded backfill, then resume from the persisted cursor on the next pass.
    end=min(latest,start+4999)
    if end<start:return
    block_times={}
    for a in range(start,end+1,1000):
        b=min(end,a+999)
        logs=await rpc('eth_getLogs',[{'address':address,'fromBlock':hex(a),'toBlock':hex(b),'topics':[[buy,sell]]}])
        records=[]
        for log in logs:
            if log.get('removed'):continue
            block=int(log['blockNumber'],16)
            if block not in block_times:
                header=await rpc('eth_getBlockByNumber',[hex(block),False]);block_times[block]=int(header['timestamp'],16)
            first,second,quote_reserve,token_reserve=decode(['uint256']*4,bytes.fromhex(log['data'][2:]))
            is_buy=log['topics'][0].lower()==buy.lower()
            records.append({'id':log['transactionHash']+':'+str(int(log['logIndex'],16)),'launch_id':int(log['topics'][1],16),'wallet':'0x'+log['topics'][2][-40:].lower(),'block_number':block,'timestamp':block_times[block],'side':'buy' if is_buy else 'sell','quote_amount':str(first if is_buy else second),'token_amount':str(second if is_buy else first),'quote_reserve':str(quote_reserve),'token_reserve':str(token_reserve),'tx_hash':log['transactionHash']})
        with engine().begin() as db:
            db.execute(delete(trades).where(trades.c.block_number>=a,trades.c.block_number<=b))
            if records:db.execute(insert(trades),records)
            db.execute(delete(runtime_settings).where(runtime_settings.c.key=='index_block'));db.execute(insert(runtime_settings).values(key='index_block',value=str(b+1)))
    with engine().begin() as db:
        db.execute(delete(runtime_settings).where(runtime_settings.c.key=='index_updated_at'))
        db.execute(insert(runtime_settings).values(key='index_updated_at',value=str(now()) if end==latest else '0'))

async def start_reality_index():
    global _index_task
    async def loop():
        while True:
            try:await sync_trades()
            except asyncio.CancelledError:raise
            except Exception as e:
                import logging
                logging.getLogger('custos.reality').warning('Reality index unavailable: %s',type(e).__name__)
            await asyncio.sleep(30)
    _index_task=asyncio.create_task(loop())
async def stop_reality_index():
    if _index_task:
        _index_task.cancel()
        try:await _index_task
        except asyncio.CancelledError:pass

@router.get('/market-stats')
def market_stats():
    cutoff=now()-86400
    with engine().connect() as db:
        rows=db.execute(select(assets.c.id,assets.c.launch_id).where(assets.c.token_address.is_not(None))).mappings().all()
        cursor=db.execute(select(runtime_settings.c.value).where(runtime_settings.c.key=='index_block')).scalar()
        updated=db.execute(select(runtime_settings.c.value).where(runtime_settings.c.key=='index_updated_at')).scalar()
        complete=bool(cursor and updated and now()-int(updated)<120)
        result={}
        for row in rows:
            records=db.execute(select(trades).where(trades.c.launch_id==row['launch_id']).order_by(trades.c.block_number.asc(),trades.c.id.asc())).mappings().all()
            records=sorted(records,key=lambda t:(t['block_number'],int(t['id'].rsplit(':',1)[-1])))
            recent=[t for t in records if t['timestamp']>=cutoff]
            before=[t for t in records if t['timestamp']<cutoff]
            # Never invent a 24-hour reference price when index history is absent.
            reference=before[-1] if before else None
            last=records[-1] if records else None
            baseline=int(reference['quote_reserve'])/int(reference['token_reserve']) if reference and int(reference['token_reserve']) else None
            latest=int(last['quote_reserve'])/int(last['token_reserve']) if last and int(last['token_reserve']) else None
            result[row['id']]={'volume_eth':sum(int(t['quote_amount']) for t in recent)/10**18 if complete else None,'change_24h':(latest/baseline-1)*100 if complete and baseline and latest else None,'history':[{'time':t['timestamp'],'price':int(t['quote_reserve'])/int(t['token_reserve'])} for t in recent[-100:] if int(t['token_reserve'])]}
    return {'items':result,'indexed':complete}

class RuntimeConfig(BaseModel):
    launchpad:str=Field(default='',max_length=42);platform_token:str=Field(default='',max_length=42)
    swap_router:str=Field(default='',max_length=42);swap_factory:str=Field(default='',max_length=42)
@router.post('/admin/config')
async def set_runtime_config(body:RuntimeConfig,wallet=Depends(admin_auth)):
    values=body.model_dump()
    if int(await rpc('eth_chainId',[]),16)!=91342: raise HTTPException(503,'节点链 ID 不正确')
    for key,value in values.items():
        if not value: continue
        if not re.fullmatch(r'0x[0-9a-fA-F]{40}',value): raise HTTPException(400,'无效的合约地址')
        code=await rpc('eth_getCode',[value,'latest'])
        if code in ('0x','0x0',None): raise HTTPException(400,f'{key} 在 GIWA 上没有合约代码')
        if key=='launchpad':
            artifact=json.loads((Path(__file__).parent/'reality-contract.json').read_text())
            if code.lower()!=artifact['deployedBytecode'].lower(): raise HTTPException(400,'发射台合约代码与当前版本不匹配')
            current=config()['launchpad']
            if current and current.lower()!=value.lower():
                with engine().connect() as db: issued=db.execute(select(func.count()).select_from(assets).where(assets.c.token_address.is_not(None))).scalar()
                if issued: raise HTTPException(409,'已有发行项目，不允许直接替换发射台合约')
    if values['swap_router']:
        raw=await rpc('eth_call',[{'to':values['swap_router'],'data':'0x'+keccak(text='factory()')[:4].hex()},'latest'])
        if not values['swap_factory'] or ('0x'+raw[-40:]).lower()!=values['swap_factory'].lower(): raise HTTPException(400,'Router 与 Factory 不匹配')
    with engine().begin() as db:
        for key,value in values.items():
            db.execute(delete(runtime_settings).where(runtime_settings.c.key==key));db.execute(insert(runtime_settings).values(key=key,value=value))
    return config()

@router.get('/health')
def health():
    with engine().connect() as db: db.execute(select(func.count()).select_from(users))
    return {'ok':True,'chain_id':91342,'launchpad_configured':bool(config()['launchpad'])}
