"""Custos Asset Hub API.

The API is deliberately metadata-only. It records Launch submissions and the
references needed by Market; it does not mint tokens, custody funds, execute
swaps, verify legal claims, or decide investment eligibility.
"""

from __future__ import annotations

import hashlib
import os
import re
import secrets
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

DB_PATH = BASE_DIR / os.getenv("DATABASE_PATH", "custos_asset_hub.db")
CHAIN_ID = int(os.getenv("CHAIN_ID", "47805"))
NETWORK_NAME = os.getenv("NETWORK_NAME", "Custos L2")
RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:7545")
EXPLORER_URL = os.getenv("EXPLORER_URL", "")
# There is intentionally no launch contract adapter in this repository yet.
# Do not infer availability from an environment variable: a string alone must
# never make the API claim that a token was deployed or that an adapter exists.
CONTRACT_ADAPTER_CONFIGURED = False

EVM_ADDRESS_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")

app = FastAPI(
    title="Custos Asset Hub API",
    version="1.0.0",
    description="Metadata registry for Custos Launch and Market.",
)

default_origins = [
    "http://127.0.0.1:3001",
    "http://localhost:3001",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]
configured_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGIN", "").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(default_origins + configured_origins)),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PermissionlessLaunchRequest(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    symbol: str = Field(min_length=3, max_length=14)
    decimals: int = Field(default=18, ge=0, le=18)
    supply_model: str = Field(default="Fixed supply", min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=1_000)
    creator_wallet: str = Field(default="", max_length=80)
    metadata_uri: str = Field(default="", max_length=500)
    token_address: str = Field(default="", max_length=80)
    pool_address: str = Field(default="", max_length=80)
    risk_acknowledged: bool = False

    @field_validator("symbol")
    @classmethod
    def normalize_symbol(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if not re.fullmatch(r"[A-Z0-9][A-Z0-9_-]{2,13}", cleaned):
            raise ValueError("symbol must be 3-14 characters: A-Z, 0-9, '-' or '_'")
        return cleaned

    @field_validator("creator_wallet", "token_address", "pool_address")
    @classmethod
    def validate_optional_address(cls, value: str) -> str:
        cleaned = value.strip()
        if cleaned and not EVM_ADDRESS_RE.fullmatch(cleaned):
            raise ValueError("address must be a 20-byte EVM address")
        return cleaned


class CuratedRwaLaunchRequest(PermissionlessLaunchRequest):
    asset_type: str = Field(min_length=3, max_length=80)
    issuer: str = Field(min_length=3, max_length=160)
    jurisdiction: str = Field(min_length=2, max_length=80)
    custody_provider: str = Field(min_length=3, max_length=160)
    document_uri: str = Field(min_length=8, max_length=500)
    audit_uri: str = Field(min_length=8, max_length=500)
    proof_hash: str = Field(min_length=8, max_length=200)


class ChainAttachment(BaseModel):
    token_address: str = Field(default="", max_length=80)
    pool_address: str = Field(default="", max_length=80)
    metadata_uri: str = Field(default="", max_length=500)

    @field_validator("token_address", "pool_address")
    @classmethod
    def validate_optional_address(cls, value: str) -> str:
        cleaned = value.strip()
        if cleaned and not EVM_ADDRESS_RE.fullmatch(cleaned):
            raise ValueError("address must be a 20-byte EVM address")
        return cleaned


class ReviewRequest(BaseModel):
    status: Literal["review", "approved", "listed", "rejected", "paused"]
    reviewer: str = Field(min_length=3, max_length=120)
    featured: bool = False


class HashRequest(BaseModel):
    text: str = Field(min_length=1, max_length=100_000)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sha256_text(value: str) -> str:
    return "0x" + hashlib.sha256(value.encode("utf-8")).hexdigest()


def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_conn()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS listings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          channel TEXT NOT NULL CHECK(channel IN ('permissionless', 'curated_rwa')),
          name TEXT NOT NULL,
          symbol TEXT NOT NULL UNIQUE,
          decimals INTEGER NOT NULL DEFAULT 18,
          supply_model TEXT NOT NULL,
          description TEXT NOT NULL,
          creator_wallet TEXT DEFAULT '',
          asset_type TEXT DEFAULT '',
          issuer TEXT DEFAULT '',
          jurisdiction TEXT DEFAULT '',
          custody_provider TEXT DEFAULT '',
          document_uri TEXT DEFAULT '',
          audit_uri TEXT DEFAULT '',
          proof_hash TEXT DEFAULT '',
          metadata_uri TEXT DEFAULT '',
          token_address TEXT DEFAULT '',
          pool_address TEXT DEFAULT '',
          status TEXT NOT NULL,
          featured INTEGER NOT NULL DEFAULT 0,
          risk_acknowledged INTEGER NOT NULL DEFAULT 0,
          reviewer TEXT DEFAULT '',
          risk_note TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    if conn.execute("SELECT COUNT(*) AS count FROM listings").fetchone()["count"] == 0:
        seed_demo_listings(conn)
    conn.close()


def seed_demo_listings(conn: sqlite3.Connection) -> None:
    seeds = [
        {
            "channel": "curated_rwa",
            "name": "Demo Solar Equipment Lease",
            "symbol": "DSOLAR",
            "decimals": 18,
            "supply_model": "Fixed supply · demo only",
            "description": "A clearly labelled demo listing showing the minimum information required for a curated RWA project.",
            "creator_wallet": "",
            "asset_type": "Equipment lease",
            "issuer": "Demo issuer",
            "jurisdiction": "Demo jurisdiction",
            "custody_provider": "Demo service provider",
            "document_uri": "https://example.com/custos/demo-solar-docs",
            "audit_uri": "https://example.com/custos/demo-solar-review",
            "proof_hash": sha256_text("custos demo solar equipment lease"),
            "metadata_uri": "ipfs://custos/demo-solar",
            "status": "listed",
            "featured": 1,
            "risk_acknowledged": 1,
            "reviewer": "Custos demo review",
            "risk_note": "Demo data. No token, custody, redemption right, yield or legal claim is provided.",
        },
        {
            "channel": "curated_rwa",
            "name": "Demo Export Receivable",
            "symbol": "DEXPORT",
            "decimals": 18,
            "supply_model": "Fixed supply · demo only",
            "description": "A demo trade-receivable listing used to demonstrate the curated RWA Market surface.",
            "creator_wallet": "",
            "asset_type": "Trade receivable",
            "issuer": "Demo issuer",
            "jurisdiction": "Demo jurisdiction",
            "custody_provider": "Demo service provider",
            "document_uri": "https://example.com/custos/demo-export-docs",
            "audit_uri": "https://example.com/custos/demo-export-review",
            "proof_hash": sha256_text("custos demo export receivable"),
            "metadata_uri": "ipfs://custos/demo-export",
            "status": "listed",
            "featured": 0,
            "risk_acknowledged": 1,
            "reviewer": "Custos demo review",
            "risk_note": "Demo data. No token, custody, redemption right, yield or legal claim is provided.",
        },
        {
            "channel": "permissionless",
            "name": "Custos Demo Token",
            "symbol": "CDEMO",
            "decimals": 18,
            "supply_model": "Fixed supply · demo only",
            "description": "A demo community token listing. Permissionless listings are not audited or endorsed by Custos.",
            "creator_wallet": "",
            "asset_type": "",
            "issuer": "",
            "jurisdiction": "",
            "custody_provider": "",
            "document_uri": "",
            "audit_uri": "",
            "proof_hash": "",
            "metadata_uri": "ipfs://custos/demo-community-token",
            "status": "listed",
            "featured": 0,
            "risk_acknowledged": 1,
            "reviewer": "",
            "risk_note": "Community listing. Custos does not verify the token contract, issuer, value or liquidity.",
        },
    ]
    timestamp = now_iso()
    for seed in seeds:
        conn.execute(
            """
            INSERT INTO listings (
              channel, name, symbol, decimals, supply_model, description, creator_wallet,
              asset_type, issuer, jurisdiction, custody_provider, document_uri, audit_uri,
              proof_hash, metadata_uri, token_address, pool_address, status, featured,
              risk_acknowledged, reviewer, risk_note, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                seed["channel"],
                seed["name"],
                seed["symbol"],
                seed["decimals"],
                seed["supply_model"],
                seed["description"],
                seed["creator_wallet"],
                seed["asset_type"],
                seed["issuer"],
                seed["jurisdiction"],
                seed["custody_provider"],
                seed["document_uri"],
                seed["audit_uri"],
                seed["proof_hash"],
                seed["metadata_uri"],
                seed.get("token_address", ""),
                seed.get("pool_address", ""),
                seed["status"],
                seed["featured"],
                seed["risk_acknowledged"],
                seed["reviewer"],
                seed["risk_note"],
                timestamp,
                timestamp,
            ),
        )
    conn.commit()


def serialize_listing(row: sqlite3.Row) -> dict[str, Any]:
    data = dict(row)
    channel = data["channel"]
    status = data["status"]
    return {
        "id": data["id"],
        "channel": channel,
        "channelLabel": "Curated RWA" if channel == "curated_rwa" else "Community Token",
        "name": data["name"],
        "symbol": data["symbol"],
        "decimals": data["decimals"],
        "supplyModel": data["supply_model"],
        "description": data["description"],
        "creatorWallet": data["creator_wallet"],
        "assetType": data["asset_type"],
        "issuer": data["issuer"],
        "jurisdiction": data["jurisdiction"],
        "custodyProvider": data["custody_provider"],
        "documentUri": data["document_uri"],
        "auditUri": data["audit_uri"],
        "proofHash": data["proof_hash"],
        "metadataUri": data["metadata_uri"],
        "tokenAddress": data["token_address"],
        "poolAddress": data["pool_address"],
        "status": status,
        "featured": bool(data["featured"]),
        "curated": channel == "curated_rwa",
        "contractAttached": bool(data["token_address"]),
        "poolAttached": bool(data["pool_address"]),
        "reviewer": data["reviewer"],
        "riskNote": data["risk_note"],
        "createdAt": data["created_at"],
        "updatedAt": data["updated_at"],
    }


def get_listing(conn: sqlite3.Connection, listing_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM listings WHERE id = ?", (listing_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Listing not found")
    return row


def require_admin_key(admin_key: Optional[str]) -> None:
    configured_key = os.getenv("ADMIN_REVIEW_KEY", "")
    if not configured_key:
        raise HTTPException(status_code=503, detail="Admin workflow is not configured")
    if not admin_key or not secrets.compare_digest(admin_key, configured_key):
        raise HTTPException(status_code=403, detail="Invalid admin credentials")


def insert_listing(
    conn: sqlite3.Connection,
    channel: str,
    payload: PermissionlessLaunchRequest | CuratedRwaLaunchRequest,
    *,
    status: str,
    risk_note: str,
) -> dict[str, Any]:
    timestamp = now_iso()
    values = payload.model_dump()
    if not values["risk_acknowledged"]:
        raise HTTPException(status_code=400, detail="Risk acknowledgement is required")
    try:
        cursor = conn.execute(
            """
            INSERT INTO listings (
              channel, name, symbol, decimals, supply_model, description, creator_wallet,
              asset_type, issuer, jurisdiction, custody_provider, document_uri, audit_uri,
              proof_hash, metadata_uri, token_address, pool_address, status, featured,
              risk_acknowledged, reviewer, risk_note, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, '', ?, ?, ?)
            """,
            (
                channel,
                values["name"].strip(),
                values["symbol"],
                values["decimals"],
                values["supply_model"].strip(),
                values["description"].strip(),
                values.get("creator_wallet", "").strip(),
                values.get("asset_type", ""),
                values.get("issuer", ""),
                values.get("jurisdiction", ""),
                values.get("custody_provider", ""),
                values.get("document_uri", ""),
                values.get("audit_uri", ""),
                values.get("proof_hash", ""),
                values.get("metadata_uri", ""),
                values.get("token_address", "").strip(),
                values.get("pool_address", "").strip(),
                status,
                risk_note,
                timestamp,
                timestamp,
            ),
        )
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=409, detail="Token symbol already exists") from exc
    conn.commit()
    return serialize_listing(get_listing(conn, int(cursor.lastrowid)))


@app.on_event("startup")
async def startup() -> None:
    init_db()


@app.get("/")
def root() -> dict[str, Any]:
    return {"ok": True, "service": "Custos Asset Hub API", "version": "1.0.0"}


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "Custos Asset Hub API",
        "chainId": CHAIN_ID,
        "network": NETWORK_NAME,
        "contractAdapterConfigured": CONTRACT_ADAPTER_CONFIGURED,
        "time": now_iso(),
    }


@app.get("/api/config")
def config() -> dict[str, Any]:
    return {
        "network": {"name": NETWORK_NAME, "chainId": CHAIN_ID, "rpc": RPC_URL, "explorer": EXPLORER_URL},
        "launch": {
            "permissionlessEnabled": True,
            "curatedRwaRequiresReview": True,
            "contractAdapterConfigured": CONTRACT_ADAPTER_CONFIGURED,
            "mode": "contract-backed" if CONTRACT_ADAPTER_CONFIGURED else "metadata-only",
        },
        "disclaimer": "Listings are informational. Custos does not provide custody, redemption, legal or investment guarantees.",
    }


@app.get("/api/overview")
def overview() -> dict[str, Any]:
    conn = get_conn()
    row = conn.execute(
        """
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN channel = 'permissionless' THEN 1 ELSE 0 END) AS community,
          SUM(CASE WHEN channel = 'curated_rwa' THEN 1 ELSE 0 END) AS rwa,
          SUM(CASE WHEN status = 'listed' THEN 1 ELSE 0 END) AS listed,
          SUM(CASE WHEN token_address <> '' THEN 1 ELSE 0 END) AS attached
        FROM listings
        """
    ).fetchone()
    conn.close()
    return {
        "totalListings": row["total"] or 0,
        "communityListings": row["community"] or 0,
        "curatedRwaListings": row["rwa"] or 0,
        "listedListings": row["listed"] or 0,
        "contractAttachedListings": row["attached"] or 0,
    }


@app.get("/api/assets")
def list_assets(
    channel: Optional[Literal["permissionless", "curated_rwa"]] = Query(default=None),
    status: Optional[str] = Query(default=None),
    admin_key: Optional[str] = Header(default=None, alias="X-Admin-Key"),
) -> list[dict[str, Any]]:
    if status not in (None, "listed"):
        require_admin_key(admin_key)
    conn = get_conn()
    clauses: list[str] = ["status = 'listed'"] if status is None else []
    values: list[Any] = []
    if channel:
        clauses.append("channel = ?")
        values.append(channel)
    if status is not None:
        clauses.append("status = ?")
        values.append(status)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    rows = conn.execute(
        f"""
        SELECT * FROM listings
        {where}
        ORDER BY featured DESC,
          CASE status WHEN 'listed' THEN 0 WHEN 'approved' THEN 1 WHEN 'review' THEN 2 ELSE 3 END,
          id DESC
        """,
        values,
    ).fetchall()
    conn.close()
    return [serialize_listing(row) for row in rows]


@app.get("/api/assets/{listing_id}")
def asset(
    listing_id: int,
    admin_key: Optional[str] = Header(default=None, alias="X-Admin-Key"),
) -> dict[str, Any]:
    conn = get_conn()
    row = get_listing(conn, listing_id)
    if row["status"] != "listed":
        require_admin_key(admin_key)
    result = serialize_listing(row)
    conn.close()
    return result


@app.post("/api/launch/permissionless", status_code=201)
def submit_permissionless(payload: PermissionlessLaunchRequest) -> dict[str, Any]:
    conn = get_conn()
    result = insert_listing(
        conn,
        "permissionless",
        payload,
        status="listed",
        risk_note="Community listing. Custos does not verify the token contract, issuer, value or liquidity.",
    )
    conn.close()
    return {
        "listing": result,
        "contractStatus": "not_configured" if not CONTRACT_ADAPTER_CONFIGURED else "adapter_available",
        "message": "Listing created. No token was minted by Custos.",
    }


@app.post("/api/launch/curated-rwa", status_code=201)
def submit_curated_rwa(payload: CuratedRwaLaunchRequest) -> dict[str, Any]:
    conn = get_conn()
    result = insert_listing(
        conn,
        "curated_rwa",
        payload,
        status="review",
        risk_note="Submitted RWA information is under review. Review is not legal, custody or investment approval.",
    )
    conn.close()
    return {
        "listing": result,
        "contractStatus": "not_configured" if not CONTRACT_ADAPTER_CONFIGURED else "adapter_available",
        "message": "RWA submission received for review. No token was minted by Custos.",
    }


@app.post("/api/assets/{listing_id}/chain")
def attach_chain_data(
    listing_id: int,
    attachment: ChainAttachment,
    admin_key: Optional[str] = Header(default=None, alias="X-Admin-Key"),
) -> dict[str, Any]:
    require_admin_key(admin_key)
    if not attachment.token_address and not attachment.pool_address and not attachment.metadata_uri:
        raise HTTPException(status_code=400, detail="At least one chain or metadata reference is required")
    conn = get_conn()
    get_listing(conn, listing_id)
    conn.execute(
        """
        UPDATE listings
        SET token_address = CASE WHEN ? <> '' THEN ? ELSE token_address END,
            pool_address = CASE WHEN ? <> '' THEN ? ELSE pool_address END,
            metadata_uri = CASE WHEN ? <> '' THEN ? ELSE metadata_uri END,
            updated_at = ?
        WHERE id = ?
        """,
        (
            attachment.token_address,
            attachment.token_address,
            attachment.pool_address,
            attachment.pool_address,
            attachment.metadata_uri,
            attachment.metadata_uri,
            now_iso(),
            listing_id,
        ),
    )
    conn.commit()
    result = serialize_listing(get_listing(conn, listing_id))
    conn.close()
    return result


@app.post("/api/assets/{listing_id}/review")
def review_asset(
    listing_id: int,
    request: ReviewRequest,
    admin_key: Optional[str] = Header(default=None, alias="X-Admin-Key"),
) -> dict[str, Any]:
    require_admin_key(admin_key)
    conn = get_conn()
    current = get_listing(conn, listing_id)
    allowed_transitions: dict[str, set[str]] = {
        "submitted": {"review", "rejected"},
        "review": {"approved", "rejected", "paused"},
        "approved": {"listed", "rejected", "paused"},
        "listed": {"paused"},
        "paused": {"review", "listed"},
        "rejected": {"review"},
    }
    if request.status != current["status"] and request.status not in allowed_transitions.get(current["status"], set()):
        raise HTTPException(
            status_code=409,
            detail=f"Invalid status transition: {current['status']} -> {request.status}",
        )
    if current["channel"] == "curated_rwa" and request.status == "listed" and current["status"] not in {"approved", "listed"}:
        raise HTTPException(status_code=409, detail="Curated RWA listings must be approved before they can be listed")
    if request.featured and (current["channel"] != "curated_rwa" or request.status != "listed"):
        raise HTTPException(status_code=400, detail="Only a listed curated RWA asset can be featured")
    featured = int(request.featured)
    conn.execute(
        "UPDATE listings SET status = ?, featured = ?, reviewer = ?, updated_at = ? WHERE id = ?",
        (request.status, featured, request.reviewer, now_iso(), listing_id),
    )
    conn.commit()
    result = serialize_listing(get_listing(conn, listing_id))
    conn.close()
    return result


@app.post("/api/hash")
def make_hash(request: HashRequest) -> dict[str, Any]:
    return {"hash": sha256_text(request.text), "sourceLength": len(request.text)}
