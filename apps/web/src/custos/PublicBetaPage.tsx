import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowLeftRight,
  CheckCircle2,
  Copy,
  Droplets,
  Gift,
  Share2,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import { CUSTOS_API_BASE } from './marketNetwork';

const API_BASE =
  CUSTOS_API_BASE;

type Profile = {
  wallet: string;
  referralCode: string;
  points: number;
  verifiedTransactions: number;
  qualifiedReferrals: number;
  rank: number;
  qualified: boolean;
  season: string;
};

type Entry = {
  rank: number;
  wallet: string;
  points: number;
  verifiedTransactions: number;
  qualifiedReferrals: number;
};

type Stats = {
  participants: number;
  verifiedTransactions: number;
  pointsIssued: number;
  qualifiedReferrals: number;
};

function short(address: string) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '—';
}

function number(value: number) {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

function captureReferral() {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const incoming = (params.get('ref') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);
  if (incoming) localStorage.setItem('custos_ref', incoming);
  return incoming || localStorage.getItem('custos_ref') || '';
}

export default function PublicBetaPage({
  wallet,
  onConnect,
  setToast,
}: {
  wallet: string;
  onConnect: () => Promise<void> | void;
  setToast: (value: string) => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<Stats>({
    participants: 0,
    verifiedTransactions: 0,
    pointsIssued: 0,
    qualifiedReferrals: 0,
  });
  const [verificationReady, setVerificationReady] = useState(false);
  const [refCode, setRefCode] = useState('');

  useEffect(() => {
    setRefCode(captureReferral());
  }, []);

  async function refreshPublic() {
    try {
      const [statsResponse, boardResponse, configResponse] = await Promise.all([
        fetch(`${API_BASE}/api/beta/stats`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/beta/leaderboard?limit=25`, { cache: 'no-store' }),
        fetch(`${API_BASE}/api/beta/config`, { cache: 'no-store' }),
      ]);
      if (statsResponse.ok) setStats(await statsResponse.json());
      if (boardResponse.ok) {
        const body = await boardResponse.json();
        setEntries(body.entries || []);
      }
      if (configResponse.ok) {
        const body = await configResponse.json();
        setVerificationReady(Boolean(body.verificationReady));
      }
    } catch {
      // Keep the public page usable while the backend restarts.
    }
  }

  async function refreshProfile() {
    if (!wallet) {
      setProfile(null);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/beta/profile/${wallet}`, { cache: 'no-store' });
      if (response.ok) setProfile(await response.json());
    } catch {
      // Wallet profile will appear after backend is reachable.
    }
  }

  useEffect(() => {
    void refreshPublic();
    const timer = window.setInterval(refreshPublic, 5_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void refreshProfile();
    const timer = window.setInterval(refreshProfile, 5_000);
    return () => window.clearInterval(timer);
  }, [wallet]);

  const inviteUrl = useMemo(() => {
    if (!profile?.referralCode) return '';
    return `${window.location.origin}/#/defi?tab=season&ref=${profile.referralCode}`;
  }, [profile?.referralCode]);

  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setToast('Custos Finance invite link copied.');
  }

  return (
    <div className="fade-up space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-300/15 bg-[radial-gradient(circle_at_78%_25%,rgba(121,255,167,.15),transparent_24%),linear-gradient(135deg,#071923,#06110d)] p-6 md:p-9">
        <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_420px] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[.07] px-3 py-1.5 text-[10px] font-semibold tracking-[.16em] text-emerald-200">
                CUSTOS FINANCE · PUBLIC BETA · SEASON 1
              </span>
              <span className={`rounded-full border px-3 py-1.5 text-[10px] ${verificationReady ? 'border-emerald-300/20 text-emerald-200' : 'border-amber-300/20 text-amber-200'}`}>
                {verificationReady ? 'ONCHAIN VERIFICATION READY' : 'WAITING FOR V3 DEPLOYMENT'}
              </span>
            </div>
            <h1 className="mt-5 max-w-[850px] text-[clamp(42px,5vw,70px)] font-semibold leading-[.96] tracking-[-.07em]">
              Trade real markets. Build your onchain testnet record.
            </h1>
            <p className="mt-5 max-w-3xl text-[14px] leading-relaxed text-white/55">
              Use one tUSDC balance across Gold, Silver and WTI Spot, liquidity pools and Custos Finance Perpetuals. Season points are granted only after the backend verifies the transaction on GIWA Sepolia.
            </p>
            {refCode && (
              <p className="mt-4 text-[11px] text-emerald-200/75">
                Referral captured: <span className="font-mono">{refCode}</span>. It is bound after your first verified Custos Finance transaction.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric icon={<Users size={16} />} label="Participants" value={number(stats.participants)} />
            <Metric icon={<Activity size={16} />} label="Verified txs" value={number(stats.verifiedTransactions)} />
            <Metric icon={<Trophy size={16} />} label="Points issued" value={number(stats.pointsIssued)} />
            <Metric icon={<Share2 size={16} />} label="Referrals" value={number(stats.qualifiedReferrals)} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <div className="giwa-panel rounded-[24px] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[.15em] text-emerald-300">YOUR SEASON</p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-.05em]">Season 1 profile</h2>
            </div>
            <Trophy size={22} className="text-emerald-300" />
          </div>

          {!wallet ? (
            <div className="mt-6 rounded-2xl border border-white/[.08] bg-black/15 p-5">
              <p className="text-[13px] text-white/55">Connect your wallet to see points, rank and your referral link.</p>
              <button onClick={() => void onConnect()} className="primary-button mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[12px] font-semibold">
                <Wallet size={15} /> Connect Wallet
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <ProfileStat label="Points" value={number(profile?.points || 0)} />
                <ProfileStat label="Rank" value={profile?.qualified ? `#${profile.rank}` : '—'} />
                <ProfileStat label="Verified txs" value={number(profile?.verifiedTransactions || 0)} />
                <ProfileStat label="Referrals" value={number(profile?.qualifiedReferrals || 0)} />
              </div>

              <div className="mt-4 rounded-2xl border border-white/[.08] bg-black/15 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[9px] font-semibold tracking-[.13em] text-white/36">YOUR UNIQUE INVITE CODE</p>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[.07] px-2.5 py-1 text-[9px] font-semibold text-emerald-200">
                    +100 / INVITE
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate text-[13px] text-emerald-200">{profile?.referralCode || 'Loading…'}</code>
                  <button type="button" onClick={copyInvite} disabled={!inviteUrl} className="secondary-button grid size-9 place-items-center rounded-lg disabled:opacity-40" title="Copy unique invite link">
                    <Copy size={14} />
                  </button>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-white/34">
                  Every wallet gets a unique invite code. When an invited wallet completes its first verified GIWA transaction, you receive +100 Season Points. Each invited wallet can qualify only once.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="giwa-panel rounded-[24px] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[.15em] text-emerald-300">LEADERBOARD</p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-.05em]">Verified participation</h2>
            </div>
            <ShieldCheck size={21} className="text-emerald-300" />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/[.08]">
            <div className="grid grid-cols-[58px_1fr_90px_80px] bg-white/[.035] px-4 py-3 text-[9px] font-semibold tracking-[.1em] text-white/35 md:grid-cols-[70px_1fr_120px_110px_100px]">
              <span>RANK</span><span>WALLET</span><span className="text-right">POINTS</span><span className="hidden text-right md:block">TXS</span><span className="text-right">REFS</span>
            </div>
            {entries.length ? entries.map((entry) => (
              <div key={entry.wallet} className="grid grid-cols-[58px_1fr_90px_80px] items-center border-t border-white/[.06] px-4 py-3 text-[11px] md:grid-cols-[70px_1fr_120px_110px_100px]">
                <span className="font-semibold text-emerald-200">#{entry.rank}</span>
                <span className="font-mono text-white/64">{short(entry.wallet)}</span>
                <span className="text-right font-semibold">{number(entry.points)}</span>
                <span className="hidden text-right text-white/42 md:block">{number(entry.verifiedTransactions)}</span>
                <span className="text-right text-white/42">{number(entry.qualifiedReferrals)}</span>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-[12px] text-white/35">No verified Season 1 transactions yet. The first participant takes #1.</div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Quest icon={<Gift size={17} />} title="Claim tUSDC" points="+10" href="#/defi?tab=spot" text="Claim the shared test settlement token." />
        <Quest icon={<ArrowLeftRight size={17} />} title="Trade Spot" points="+50" href="#/defi?tab=spot" text="Trade rXAU, rXAG or rWTI against tUSDC." />
        <Quest icon={<Droplets size={17} />} title="Provide Liquidity" points="+100" href="#/defi?tab=liquidity" text="Seed or add to a real-price synthetic pool." />
        <Quest icon={<TrendingUp size={17} />} title="Open a Perp" points="+75" href="#/defi?tab=perpetuals" text="Open a GIWA Perpetuals position." />
        <Quest icon={<Share2 size={17} />} title="Invite a User" points="+100" href="#/defi?tab=season" text="Share your unique code. Earn when the invited wallet qualifies." />
      </section>

      <section className="rounded-2xl border border-amber-200/10 bg-amber-200/[.025] px-5 py-4 text-[10px] leading-relaxed text-white/42">
        <strong className="text-white/72">Season disclosure:</strong> points are testnet participation metrics only. They do not guarantee a token, airdrop, reward, allocation, financial value or future eligibility. Custos Finance synthetic assets and tUSDC are testnet-only.
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/[.09] bg-black/20 p-4"><div className="flex items-center gap-2 text-emerald-300">{icon}<span className="text-[9px] tracking-[.1em] text-white/36">{label}</span></div><p className="mt-3 text-[25px] font-semibold tracking-[-.05em]">{value}</p></div>;
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/[.08] bg-white/[.025] p-4"><p className="text-[9px] text-white/34">{label}</p><p className="mt-2 text-[22px] font-semibold tracking-[-.04em]">{value}</p></div>;
}

function Quest({ icon, title, points, text, href, external = false }: { icon: ReactNode; title: string; points: string; text: string; href: string; external?: boolean }) {
  return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="giwa-panel group rounded-[22px] p-5 transition hover:-translate-y-1 hover:border-emerald-300/25"><div className="flex items-center justify-between"><span className="text-emerald-300">{icon}</span><span className="rounded-full border border-emerald-300/18 bg-emerald-300/[.06] px-2.5 py-1 text-[10px] font-semibold text-emerald-200">{points}</span></div><h3 className="mt-5 text-[19px] font-semibold">{title}</h3><p className="mt-2 text-[11px] leading-relaxed text-white/42">{text}</p><div className="mt-5 flex items-center gap-2 text-[10px] font-semibold text-emerald-200"><CheckCircle2 size={13} /> Verified onchain</div></a>;
}
