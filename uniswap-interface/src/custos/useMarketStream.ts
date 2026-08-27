import { useEffect, useMemo, useRef, useState } from 'react';

export type Quote = {
  symbol: string;
  name: string;
  assetType: string;
  price: number;
  session: string;
  streamTimestampUs: number;
  feedUpdateTimestampUs: number;
  fresh: boolean;
  source: string;
};

export type Market = {
  symbol: string;
  name: string;
  asset_type: string;
  core_feed_id: string;
  pro_feed_id: number;
  max_leverage: number;
  quote?: Quote | null;
};

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');

function wsUrl() {
  const u = new URL(API_BASE);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.pathname = '/ws/markets';
  u.search = '';
  return u.toString();
}

export function useMarketStream() {
  const [map, setMap] = useState<Record<string, Market>>({});
  const [connected, setConnected] = useState(false);
  const retry = useRef<number | null>(null);

  useEffect(() => {
    let stopped = false;

    const connect = () => {
      if (stopped) return;

      const ws = new WebSocket(wsUrl());

      ws.onopen = () => {
        setConnected(true);
        ws.send('ping');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'snapshot') {
            setMap(
              Object.fromEntries(
                (msg.markets || []).map((m: Market) => [m.symbol, m]),
              ),
            );
          }

          if (msg.type === 'quote') {
            const q = msg.quote as Quote;
            setMap((current) => {
              const old = current[q.symbol];
              if (!old) return current;
              return {
                ...current,
                [q.symbol]: {
                  ...old,
                  quote: q,
                },
              };
            });
          }
        } catch {
          // ignore malformed frame
        }
      };

      ws.onclose = () => {
        if (stopped) return;
        setConnected(false);
        retry.current = window.setTimeout(connect, 3000);
      };

      ws.onerror = () => setConnected(false);
    };

    fetch(`${API_BASE}/api/markets`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((msg) => {
        setMap(
          Object.fromEntries(
            (msg.markets || []).map((m: Market) => [m.symbol, m]),
          ),
        );
      })
      .catch(() => undefined)
      .finally(connect);

    return () => {
      stopped = true;
      if (retry.current !== null) window.clearTimeout(retry.current);
    };
  }, []);

  const markets = useMemo(
    () =>
      ['BTC', 'ETH', 'SOL', 'AAPL', 'NVDA', 'XAU']
        .map((s) => map[s])
        .filter(Boolean),
    [map],
  );

  return { markets, bySymbol: map, connected, apiBase: API_BASE };
}
