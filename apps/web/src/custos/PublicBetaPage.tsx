import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  CheckCircle2,
  Copy,
  Share2,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import {api,snapshotReality,ensureGiwa,setCredential} from './realityClient';

type Profile = {
  wallet: string;
  referralCode: string;
  points: number;
  stakeCompleted?: boolean;
  verifiedTransactions: number;
  qualifiedReferrals: number;
  rank: number;
  qualified: boolean;
  season: string;
  xStatus: string;
  xHandle: string;
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
  authenticated=false,
}: {
  wallet: string;
  authenticated?: boolean;
  onConnect: () => Promise<void> | void;
  setToast: (value: string) => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entry[]>(()=>snapshotReality('/season/leaderboard')?.entries||[]);
  const [originalEntries, setOriginalEntries] = useState<Entry[]>(()=>snapshotReality('/season/original-leaderboard')?.entries||[]);
  const [board, setBoard] = useState<'original'|'reality'>('reality');
  const [boardLoading, setBoardLoading] = useState(true);
  const [originalError, setOriginalError] = useState('');
  const [stats, setStats] = useState<Stats>({
    participants: 0,
    verifiedTransactions: 0,
    pointsIssued: 0,
    qualifiedReferrals: 0,
  });
  const [verificationReady, setVerificationReady] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [xUrl,setXUrl]=useState('https://x.com/custosfinance');
  useEffect(()=>{api('/season/x/config').then(c=>setXUrl(c.url)).catch(()=>{})},[]);
  const [busy,setBusy]=useState(false);
  async function joinSeason(){
    if(authenticated){const p=await api<Profile>('/season/register',{ref_code:refCode});setProfile(p);return p;}
    const config=await api('/config'), provider=await ensureGiwa(config),signer=provider.getSigner(),address=await signer.getAddress();
    if(wallet && address.toLowerCase()!==wallet.toLowerCase())throw new Error('Use the connected wallet');
    const challenge=await api('/auth/challenge',{wallet:address});
    const signature=await signer.signMessage(challenge.message),result=await api('/auth/login',{id:challenge.id,signature});
    setCredential(result.token);const p=await api<Profile>('/season/register',{ref_code:refCode});setProfile(p);return p;
  }
  async function visitX(){if(profile?.xStatus==='visited')return;setBusy(true);try{await joinSeason();const p=await api<Profile>('/season/x-visit',{});setProfile(p);setToast('X visit recorded: 10 points, once per wallet')}catch(e:any){setToast(e.message||'Could not record points. Connect your wallet and retry.')}finally{setBusy(false)}}

  useEffect(() => {
    setRefCode(captureReferral());
  }, []);

  async function refreshPublic() {
    try {
      await Promise.allSettled([
        api('/season/stats').then(setStats),
        api('/season/leaderboard').then(body=>setEntries(body.entries||[])),
        api('/config').then(body=>setVerificationReady(Boolean(body.launchpad))),
      ]);
    } catch {
      // Keep the public page usable while the backend restarts.
    }
  }

  async function refreshOriginal() {
    try {
      const body=await api('/season/original-leaderboard');
      setOriginalError(body.stale?'The original site is temporarily unavailable. Showing the last successful update.':'');
      setOriginalEntries(body.entries || []);
    } catch (error: any) {
      setOriginalError(error.message || 'Could not load the original leaderboard.');
    } finally {setBoardLoading(false);}
  }

  async function refreshProfile() {
    if (!wallet) {
      setProfile(null);
      return;
    }
    try {
      const response = await fetch(`/api/reality/season/profile/${wallet}`, { cache: 'no-store' });
      if (response.ok) setProfile(await response.json());
    } catch {
      // Wallet profile will appear after backend is reachable.
    }
  }

  useEffect(() => {
    void refreshPublic();
    void refreshOriginal();
    const timer = window.setInterval(()=>{void refreshPublic();void refreshOriginal();}, 5_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void refreshProfile();
    const timer = window.setInterval(refreshProfile, 5_000);
    return () => window.clearInterval(timer);
  }, [wallet]);

  const inviteUrl = useMemo(() => {
    if (!profile?.referralCode) return '';
    return `${window.location.origin}/#/reality/season?ref=${profile.referralCode}`;
  }, [profile?.referralCode]);

  async function copyInvite() {
    try {
      const p=inviteUrl?profile:await joinSeason();
      if(!p?.referralCode)return;
      await navigator.clipboard.writeText(`${window.location.origin}/#/reality/season?ref=${p.referralCode}`);
    }catch(e:any){setToast(e.message||'Could not create an invite link');return;}
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
                {verificationReady ? 'ONCHAIN VERIFICATION READY' : 'WAITING FOR LAUNCHPAD DEPLOYMENT'}
              </span>
            </div>
            <h1 className="mt-5 max-w-[850px] text-[clamp(42px,5vw,70px)] font-semibold leading-[.96] tracking-[-.07em]">
              Create something real. Grow with Custos.
            </h1>
            <p className="mt-5 max-w-3xl text-[14px] leading-relaxed text-white/55">
              Follow Custos on X, launch your first token on GIWA and invite friends. Opening our X profile earns 10 points; launches and referrals are verified onchain.
            </p>
            {refCode && (
              <p className="mt-4 text-[11px] text-emerald-200/75">
                Referral captured: <span className="font-mono">{refCode}</span>. Referrals bind on joining Season 1 and count after the friend’s first token launch.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <p className="col-span-2 text-[10px] font-semibold tracking-[.12em] text-emerald-300">REALITY TASK ACTIVITY</p>
            <Metric icon={<Users size={16} />} label="Participants" value={number(stats.participants)} />
            <Metric icon={<Activity size={16} />} label="Tokens launched" value={number(stats.verifiedTransactions)} />
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
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-.05em]">Reality task profile</h2>
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
                <ProfileStat label="Tokens launched" value={number(profile?.verifiedTransactions || 0)} />
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
                  <code className="min-w-0 flex-1 truncate text-[13px] text-emerald-200">{profile?.referralCode || 'Sign in to generate an invite link'}</code>
                  <button type="button" onClick={copyInvite} disabled={busy} className="secondary-button grid size-9 place-items-center rounded-lg disabled:opacity-40" title="Copy unique invite link">
                    <Copy size={14} />
                  </button>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-white/34">
                  Every wallet has a unique invite code. Earn 100 points when a referred friend joins Season 1 and launches their first token. Each friend counts once.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="giwa-panel rounded-[24px] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[.15em] text-emerald-300">LEADERBOARD</p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-.05em]">Season 1 leaderboard</h2>
            </div>
            <ShieldCheck size={21} className="text-emerald-300" />
          </div>

          <div className="rl-tabs" aria-label="Season leaderboard source" style={{marginTop:16}}>
            <button className={board==='reality'?'active':''} aria-pressed={board==='reality'} onClick={()=>setBoard('reality')}>Reality tasks</button>
            <button className={board==='original'?'active':''} aria-pressed={board==='original'} onClick={()=>setBoard('original')}>Original Season 1</button>
          </div>
          <p className="rl-footnote">{board==='original'?'Live leaderboard from the original Custos Season 1: historical points, transactions and referrals. Reality task points are tracked separately.':'Points from X visits, token launches, staking and qualified invitations.'}</p>
          {board==='original'&&originalError?<div className="rl-alert" role="alert">{originalError}<button onClick={()=>void refreshOriginal()}>Retry</button></div>:null}
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/[.08]">
            <div className="grid grid-cols-[58px_1fr_90px_80px] bg-white/[.035] px-4 py-3 text-[9px] font-semibold tracking-[.1em] text-white/35 md:grid-cols-[70px_1fr_120px_110px_100px]">
              <span>RANK</span><span>WALLET</span><span className="text-right">POINTS</span><span className="hidden text-right md:block">TXS</span><span className="text-right">REFS</span>
            </div>
            {(board==='original'?originalEntries:entries).length ? (board==='original'?originalEntries:entries).map((entry) => (
              <div key={entry.wallet} className="grid grid-cols-[58px_1fr_90px_80px] items-center border-t border-white/[.06] px-4 py-3 text-[11px] md:grid-cols-[70px_1fr_120px_110px_100px]">
                <span className="font-semibold text-emerald-200">#{entry.rank}</span>
                <span className="font-mono text-white/64" title={entry.wallet}>{short(entry.wallet)}{wallet.toLowerCase()===entry.wallet.toLowerCase()?<small> · You</small>:null}</span>
                <span className="text-right font-semibold">{number(entry.points)}</span>
                <span className="hidden text-right text-white/42 md:block">{number(entry.verifiedTransactions)}</span>
                <span className="text-right text-white/42">{number(entry.qualifiedReferrals)}</span>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-[12px] text-white/35">{board==='original'?(boardLoading?'Loading original Season 1…':originalError?'Leaderboard unavailable. Please retry.':'No recorded participants in the original Season 1.'):'No qualifying participants yet. Complete a task to join the leaderboard.'}</div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="giwa-panel rounded-[22px] p-5">
          <div className="flex justify-between text-emerald-200"><Users size={17}/><span>+10 · once</span></div>
          <h3 className="mt-5 text-[19px] font-semibold">Follow Custos on X</h3>
          <p className="mt-2 text-[11px] text-white/42">Follow our official X account. Open the profile to earn 10 points. Once per wallet.</p>
          <a href={xUrl} target="_blank" rel="noopener noreferrer" onClick={()=>{if(!busy)void visitX()}} className="primary-button mt-5 flex w-full items-center justify-center rounded-lg py-3">{profile?.xStatus==='visited'?'Completed · Open X again ↗':busy?'Recording points…':'Follow Custos on X · +10 ↗'}</a>
          <p className="mt-4 text-[11px] text-white/42">{profile?.xStatus==='visited'?'10 points earned':wallet?'Follow our official X account':'Connect your wallet to record task points'}</p>
        </div>
        <Quest icon={<ShieldCheck size={17}/>} title="Stake ETH" points="+100 · once" href="#/reality/stake" text="Deposit native GIWA ETH to receive CFI. Your first confirmed stake earns 100 points." status={profile?.stakeCompleted?'Completed · 100 points earned':'Stake ETH to complete'}/>
        <Quest icon={<Activity size={17}/>} title="Launch a token" points="+100 · once" href="#/reality/create" text="Create a project and issue its token on GIWA. Points are awarded after the transaction is verified." status={profile?.verifiedTransactions?'Completed':'Complete after onchain verification'}/>
        <div className="giwa-panel rounded-[22px] p-5">
          <div className="flex justify-between text-emerald-200"><Share2 size={17}/><span>+100 / qualified friend</span></div>
          <h3 className="mt-5 text-[19px] font-semibold">Invite friends</h3>
          <p className="mt-2 text-[11px] text-white/42">Friends must sign in through your link and launch their first token. Self-referrals and duplicates do not count.</p>
          <button className="primary-button mt-5 w-full rounded-lg py-3" disabled={busy} onClick={()=>void copyInvite()}>Sign and copy invite link</button>
          <p className="mt-4 text-[11px] text-emerald-200">Completed {profile?.qualifiedReferrals||0} qualified referrals</p>
        </div>
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

function Quest({ icon, title, points, text, href, status='Points after qualification', external = false }: { icon: ReactNode; title: string; points: string; text: string; href: string; status?: string; external?: boolean }) {
  return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="giwa-panel group rounded-[22px] p-5 transition hover:-translate-y-1 hover:border-emerald-300/25"><div className="flex items-center justify-between"><span className="text-emerald-300">{icon}</span><span className="rounded-full border border-emerald-300/18 bg-emerald-300/[.06] px-2.5 py-1 text-[10px] font-semibold text-emerald-200">{points}</span></div><h3 className="mt-5 text-[19px] font-semibold">{title}</h3><p className="mt-2 text-[11px] leading-relaxed text-white/42">{text}</p><div className="mt-5 flex items-center gap-2 text-[10px] font-semibold text-emerald-200"><CheckCircle2 size={13} /> {status}</div></a>;
}
