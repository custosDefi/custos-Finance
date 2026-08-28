#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRANDING_CONFIG="scripts/branding.config.json"
START_FRONTEND=1
INSTALL_FRONTEND=1
START_BACKEND=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branding-config)
      BRANDING_CONFIG="$2"
      shift 2
      ;;
    --no-start-frontend)
      START_FRONTEND=0
      shift
      ;;
    --no-start-backend)
      START_BACKEND=0
      shift
      ;;
    --skip-install)
      INSTALL_FRONTEND=0
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

wait_for_rpc() {
  local retries=40
  local ok=0
  for _ in $(seq 1 "$retries"); do
    if curl -s -X POST http://127.0.0.1:7545 \
      -H 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' >/dev/null 2>&1; then
      ok=1
      break
    fi
    sleep 1
  done

  if [[ "$ok" -ne 1 ]]; then
    echo "RPC not ready at http://127.0.0.1:7545"
    exit 1
  fi
}

echo "[1/9] Apply branding config: $BRANDING_CONFIG"
cd "$ROOT_DIR"
node scripts/apply-branding.js "$BRANDING_CONFIG"

echo "[2/9] Ensure local hardhat node is running"
if ! lsof -iTCP:7545 -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  cd "$ROOT_DIR/uniswapContract"
  nohup npx hardhat node --hostname 127.0.0.1 --port 7545 >/tmp/custoswap-hardhat.log 2>&1 &
  echo $! >/tmp/custoswap-hardhat.pid
  echo "Started hardhat node, pid=$(cat /tmp/custoswap-hardhat.pid), log=/tmp/custoswap-hardhat.log"
else
  echo "Port 7545 is already in use, reuse existing node"
fi
wait_for_rpc

if [[ "$START_BACKEND" -eq 1 ]]; then
  echo "[3/9] Ensure Custos API is running"
  if lsof -iTCP:8001 -sTCP:LISTEN -n -P >/dev/null 2>&1; then
    echo "Port 8001 is already in use, reuse existing API"
  else
    if [[ ! -x "$ROOT_DIR/backend/.venv/bin/python" ]]; then
      echo "Missing backend virtualenv at $ROOT_DIR/backend/.venv"
      echo "Create it with: python3 -m venv backend/.venv && backend/.venv/bin/pip install -r backend/requirements.txt"
      exit 1
    fi
    cd "$ROOT_DIR/backend"
    nohup .venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8001 >/tmp/custos-api.log 2>&1 &
    echo $! >/tmp/custos-api.pid
    echo "Started Custos API, pid=$(cat /tmp/custos-api.pid), log=/tmp/custos-api.log"
  fi

  for _ in $(seq 1 30); do
    if curl -sf http://127.0.0.1:8001/api/health >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
else
  echo "[3/9] Skip API startup"
fi

echo "[4/9] Deploy local contracts"
cd "$ROOT_DIR/uniswapContract"
npx hardhat run --network local scripts/deploy-local-uniswap.js

echo "[5/9] Sync addresses/config to SDK + interface"
cd "$ROOT_DIR"
node scripts/sync-local-config.js \
  --branding-config "$BRANDING_CONFIG" \
  --rpc-url http://127.0.0.1:7545 \
  --frontend-url http://127.0.0.1:3001

echo "[6/9] Build local SDK"
cd "$ROOT_DIR/v2-sdk"
npm run build

if [[ "$INSTALL_FRONTEND" -eq 1 ]]; then
  echo "[7/9] Install interface dependencies"
  cd "$ROOT_DIR/uniswap-interface"
  npm install --legacy-peer-deps
else
  echo "[7/9] Skip interface install"
fi

echo "[8/9] Verify on-chain interaction (swap test)"
cd "$ROOT_DIR/uniswapContract"
npx hardhat run --network local scripts/verify-local-interactions.js

if [[ "$START_FRONTEND" -eq 1 ]]; then
  echo "[9/9] Start interface"
  if lsof -iTCP:3001 -sTCP:LISTEN -n -P >/dev/null 2>&1; then
    echo "Port 3001 is already in use, reuse existing frontend"
  else
    cd "$ROOT_DIR/uniswap-interface"
    nohup npm run start >/tmp/custoswap-frontend.log 2>&1 &
    echo $! >/tmp/custoswap-frontend.pid
  fi

  for _ in $(seq 1 30); do
    if curl -s -I http://127.0.0.1:3001 >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  echo "Frontend pid=$(cat /tmp/custoswap-frontend.pid), url=http://127.0.0.1:3001, log=/tmp/custoswap-frontend.log"
else
  echo "[9/9] Skip frontend startup"
fi

echo "Done."
