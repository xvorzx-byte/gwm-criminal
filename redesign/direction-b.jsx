// Direction B — Tactical Command Center
// HUD-style. Mono everywhere. Teams as fleet readouts in rows.
// Optimized for at-a-glance comparison + status scanning.

const B_CSS = `
.dirB {
  width: 1440px;
  background: oklch(0.10 0.012 240);
  color: oklch(0.92 0.005 240);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.01em;
  padding: 22px 26px 32px;
  --hud: oklch(0.78 0.13 155);          /* terminal green */
  --hud-dim: oklch(0.78 0.13 155 / 0.5);
  --amber: oklch(0.80 0.14 70);
  --red: oklch(0.70 0.18 22);
  --line: oklch(0.30 0.014 240 / 0.7);
  --line-dim: oklch(0.22 0.014 240 / 0.7);
  --bg-1: oklch(0.13 0.012 240);
  --bg-2: oklch(0.16 0.012 240);
  --fg-2: oklch(0.62 0.012 240);
  --fg-3: oklch(0.42 0.012 240);
  position: relative;
}
.dirB::before {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(
    0deg,
    oklch(1 0 0 / 0.012) 0px,
    oklch(1 0 0 / 0.012) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none; z-index: 0;
}
.dirB > * { position: relative; z-index: 1; }

.dirB .hd { 
  display: flex; align-items: stretch; justify-content: space-between;
  border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  padding: 14px 0; margin-bottom: 18px;
}
.dirB .hd-l { display: flex; gap: 28px; }
.dirB .hd-stat { padding-right: 28px; border-right: 1px solid var(--line-dim); }
.dirB .hd-stat:last-child { border-right: none; padding-right: 0; }
.dirB .hd-lbl { font-size: 9.5px; color: var(--fg-3); letter-spacing: 0.18em; margin-bottom: 6px; }
.dirB .hd-val { font-size: 26px; font-weight: 600; color: oklch(0.97 0.005 240); line-height: 1; }
.dirB .hd-val.acc { color: var(--hud); }
.dirB .hd-val.warn { color: var(--amber); }
.dirB .hd-sub { font-size: 10px; color: var(--fg-2); margin-top: 6px; }

.dirB .hd-r { display: flex; align-items: flex-start; gap: 10px; }
.dirB .hd-time {
  text-align: right; padding: 4px 12px; border: 1px solid var(--line);
  background: var(--bg-1); border-radius: 3px;
}
.dirB .hd-time .t { font-size: 18px; color: oklch(0.97 0.005 240); }
.dirB .hd-time .d { font-size: 9.5px; color: var(--fg-3); letter-spacing: 0.15em; margin-top: 3px; }
.dirB .blink { animation: blnk 1.4s infinite; }
@keyframes blnk { 50% { opacity: 0.25; } }

.dirB .pulse {
  background: var(--bg-1); border: 1px solid var(--line);
  padding: 14px 16px; margin-bottom: 16px; border-radius: 4px;
}
.dirB .pulse-hd { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
.dirB .pulse-ttl { font-size: 10px; color: var(--fg-3); letter-spacing: 0.18em; }
.dirB .pulse-bars { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; align-items: end; height: 60px; }
.dirB .pulse-col { display: flex; flex-direction: column; align-items: stretch; gap: 4px; }
.dirB .pulse-bar { background: var(--hud-dim); border: 1px solid var(--hud); position: relative; }
.dirB .pulse-bar.warn { background: oklch(0.80 0.14 70 / 0.4); border-color: var(--amber); }
.dirB .pulse-bar.peak { background: var(--hud); }
.dirB .pulse-lbl { text-align: center; font-size: 9px; color: var(--fg-3); letter-spacing: 0.1em; }
.dirB .pulse-cp { text-align: center; font-size: 9.5px; color: var(--fg-2); }

.dirB .ctrls {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.dirB .ctrl-grp { display: flex; gap: 1px; background: var(--line); }
.dirB .ctrl { padding: 6px 12px; background: var(--bg-1); color: var(--fg-2); cursor: pointer; font-size: 10.5px; letter-spacing: 0.1em; }
.dirB .ctrl.on { background: var(--hud); color: oklch(0.10 0.012 240); }
.dirB .ctrl-act { padding: 6px 12px; border: 1px solid var(--hud); color: var(--hud); cursor: pointer; font-size: 10.5px; letter-spacing: 0.1em; background: transparent; }
.dirB .ctrl-act:hover { background: var(--hud-dim); }

.dirB .fleet { 
  border: 1px solid var(--line); 
}
.dirB .fleet-row {
  display: grid;
  grid-template-columns: 60px 100px 200px 1fr 320px 90px;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--line-dim);
  position: relative;
  transition: background .12s;
}
.dirB .fleet-row:last-child { border-bottom: none; }
.dirB .fleet-row:hover { background: var(--bg-1); }
.dirB .fleet-hdr { 
  font-size: 9.5px; color: var(--fg-3); letter-spacing: 0.18em; 
  background: var(--bg-2); padding: 8px 14px;
}
.dirB .fleet-row.warn::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
  background: var(--amber);
}

.dirB .fl-id { font-size: 16px; color: oklch(0.97 0.005 240); font-weight: 600; }
.dirB .fl-tier { 
  display: inline-block; padding: 2px 8px; font-size: 10px; 
  border: 1px solid var(--line); color: var(--fg-2); letter-spacing: 0.15em;
}
.dirB .fl-tier.A { color: var(--hud); border-color: var(--hud); }
.dirB .fl-tier.B { color: oklch(0.75 0.10 240); border-color: oklch(0.55 0.08 240); }
.dirB .fl-tier.C { color: var(--fg-2); }

.dirB .fl-cp { display: flex; align-items: baseline; gap: 6px; }
.dirB .fl-cp-num { font-size: 22px; color: oklch(0.97 0.005 240); font-weight: 600; }
.dirB .fl-cp-num.peak { color: var(--hud); }
.dirB .fl-cp-num.low { color: var(--amber); }
.dirB .fl-cp-delta { font-size: 10px; color: var(--fg-3); }

.dirB .fl-roles { display: flex; gap: 6px; align-items: center; }
.dirB .fl-role { display: flex; align-items: center; gap: 5px; padding: 2px 8px; border: 1px solid var(--line); }
.dirB .fl-role .dot { width: 6px; height: 6px; border-radius: 50%; }
.dirB .fl-role .lbl { font-size: 9.5px; color: var(--fg-2); letter-spacing: 0.1em; }
.dirB .fl-role .num { font-size: 11px; color: oklch(0.97 0.005 240); }
.dirB .fl-role.miss { border-color: var(--amber); }
.dirB .fl-role.miss .lbl { color: var(--amber); }

.dirB .fl-members { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; }
.dirB .fl-mem { 
  display: flex; align-items: center; gap: 5px; padding: 4px 6px; 
  background: var(--bg-2); border: 1px solid transparent;
  font-size: 10px; cursor: pointer;
  position: relative;
}
.dirB .fl-mem:hover { border-color: var(--line); }
.dirB .fl-mem .m-bar { width: 2px; height: 12px; }
.dirB .fl-mem .m-cp { color: oklch(0.97 0.005 240); margin-left: auto; font-size: 10px; }
.dirB .fl-mem .m-cp.peak { color: var(--hud); }
.dirB .fl-mem .m-cp.low { color: var(--amber); }
.dirB .fl-mem .m-name { color: var(--fg-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50px; font-size: 9.5px; }
.dirB .fl-mem.empty { background: transparent; border: 1px dashed var(--line); color: var(--fg-3); justify-content: center; }

.dirB .fl-status { text-align: right; }
.dirB .fl-stat-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; padding: 3px 8px; border: 1px solid; letter-spacing: 0.12em; }
.dirB .fl-stat-pill.ready { color: var(--hud); border-color: var(--hud); }
.dirB .fl-stat-pill.review { color: var(--amber); border-color: var(--amber); }
.dirB .fl-stat-pill.low { color: var(--fg-2); border-color: var(--fg-3); }
.dirB .fl-stat-pill::before { content: ''; width: 5px; height: 5px; background: currentColor; border-radius: 50%; }
.dirB .fl-stat-pill.ready::before { animation: blnk 1.4s infinite; }
`;

const ROLE_DOT = {
  Tank: '#c8a84b',
  Heal: '#d4607a',
  DPS:  '#90caf9',
  CC:   '#5b9bd5',
};

function FleetRow({ team, totalAvg }) {
  const cp = teamCP(team);
  const roles = teamRoles(team);
  const isPeak = cp === TOP_CP;
  const isLow = cp === BOT_CP;
  const delta = cp - totalAvg;
  const hasHealMiss = (roles.Heal || 0) === 0 || team.warning;
  const status = team.warning ? 'review' : (cp >= totalAvg ? 'ready' : 'low');
  const statusLabel = team.warning ? 'NEEDS REVIEW' : (cp >= totalAvg ? 'COMBAT READY' : 'BELOW AVG');

  return (
    <div className={`fleet-row ${team.warning?'warn':''}`}>
      <div>
        <div className="fl-id">{team.id}</div>
        <div className="fl-tier" style={{marginTop:4}}>
          <span className={`fl-tier ${team.tier}`} style={{border:'none',padding:0}}>TIER {team.tier}</span>
        </div>
      </div>
      <div className="fl-cp">
        <div className={`fl-cp-num ${isPeak?'peak':isLow?'low':''}`}>{fmtCP(cp)}</div>
        <div className="fl-cp-delta">
          {delta>0?'▲':'▼'}{Math.abs(Math.round(delta))}K
        </div>
      </div>
      <div className="fl-roles">
        {['Tank','Heal','DPS','CC'].map(r => {
          const n = roles[r] || 0;
          const isMiss = (r==='Heal' && n===0) || (r==='Tank' && n===0);
          return (
            <div className={`fl-role ${isMiss?'miss':''}`} key={r}>
              <span className="dot" style={{background: ROLE_DOT[r]}} />
              <span className="lbl">{r.toUpperCase()}</span>
              <span className="num">{n}</span>
            </div>
          );
        })}
      </div>
      <div className="fl-members">
        {Array.from({length: 6}).map((_, i) => {
          const m = team.members[i];
          if (!m) return <div className="fl-mem empty" key={i}>+ EMPTY</div>;
          const c = CLASSES[m.cls];
          const peak = m.cp >= 98;
          const low = m.cp < 90;
          return (
            <div className="fl-mem" key={i} title={`${m.name} · ${c.name} · ${m.cp}K`}>
              <div className="m-bar" style={{background: c.color}} />
              <div className="m-name">{m.name}</div>
              <div className={`m-cp ${peak?'peak':low?'low':''}`}>{m.cp}</div>
            </div>
          );
        })}
      </div>
      <div className="fl-status">
        <span className={`fl-stat-pill ${status}`}>{statusLabel}</span>
      </div>
    </div>
  );
}

function DirectionB() {
  const totalCP = TEAMS.reduce((s,t)=>s+teamCP(t),0);
  const avg = totalCP / TEAMS.length;
  const totalMembers = TEAMS.reduce((s,t)=>s+t.members.length,0);
  const allRoles = TEAMS.reduce((acc,t) => {
    const r = teamRoles(t);
    Object.keys(r).forEach(k => acc[k] = (acc[k]||0) + r[k]);
    return acc;
  }, {});
  const issues = TEAMS.filter(t=>t.warning).length;

  // sort teams by CP for pulse
  const ranked = [...TEAMS].map(t => ({ id: t.id, cp: teamCP(t), warn: !!t.warning }))
    .sort((a,b) => b.cp - a.cp);

  return (
    <>
      <style>{B_CSS}</style>
      <div className="dirB">
        <div className="hd">
          <div className="hd-l">
            <div className="hd-stat">
              <div className="hd-lbl">▣ COMMAND CENTER</div>
              <div className="hd-val acc">CRIMINAL // S01</div>
              <div className="hd-sub">DIRECTION B · TACTICAL HUD</div>
            </div>
            <div className="hd-stat">
              <div className="hd-lbl">FLEET CP</div>
              <div className="hd-val">{(totalCP/1000).toFixed(2)}M</div>
              <div className="hd-sub">AVG {Math.round(avg)}K · {TEAMS.length} UNITS</div>
            </div>
            <div className="hd-stat">
              <div className="hd-lbl">PERSONNEL</div>
              <div className="hd-val">{totalMembers}<span style={{color:'var(--fg-3)',fontSize:14}}>/{TEAMS.length*6}</span></div>
              <div className="hd-sub">ROSTER FILL {Math.round(totalMembers/(TEAMS.length*6)*100)}%</div>
            </div>
            <div className="hd-stat">
              <div className="hd-lbl">ROLES</div>
              <div className="hd-val" style={{fontSize:14, lineHeight:1.4}}>
                T<span style={{color:'var(--fg-2)'}}>{allRoles.Tank||0}</span>{' '}
                H<span style={{color:'var(--fg-2)'}}>{allRoles.Heal||0}</span>{' '}
                D<span style={{color:'var(--fg-2)'}}>{allRoles.DPS||0}</span>{' '}
                C<span style={{color:'var(--fg-2)'}}>{allRoles.CC||0}</span>
              </div>
              <div className="hd-sub">TANK / HEAL / DPS / CC</div>
            </div>
            <div className="hd-stat">
              <div className="hd-lbl">ALERTS</div>
              <div className={`hd-val ${issues?'warn':'acc'}`}>{String(issues).padStart(2,'0')}</div>
              <div className="hd-sub">{issues?'ATTN REQUIRED':'ALL SYSTEMS NOMINAL'}</div>
            </div>
          </div>
          <div className="hd-r">
            <div className="hd-time">
              <div className="t blink">14:32:08</div>
              <div className="d">2026.05.16 · UTC+7</div>
            </div>
          </div>
        </div>

        <div className="pulse">
          <div className="pulse-hd">
            <div className="pulse-ttl">▢ FLEET PULSE — CP RANKING (DESC)</div>
            <div style={{fontSize:9.5,color:'var(--fg-3)',letterSpacing:'0.15em'}}>
              SPREAD {fmtCP(TOP_CP - BOT_CP)} · σ {Math.round(Math.sqrt(TEAMS.map(t=>(teamCP(t)-avg)**2).reduce((a,b)=>a+b,0)/TEAMS.length))}K
            </div>
          </div>
          <div className="pulse-bars">
            {ranked.map((t, i) => {
              const h = ((t.cp - BOT_CP) / (TOP_CP - BOT_CP || 1)) * 100;
              const isPeak = t.cp === TOP_CP;
              return (
                <div className="pulse-col" key={t.id}>
                  <div className="pulse-cp" style={{color: isPeak ? 'var(--hud)' : ''}}>{fmtCP(t.cp)}</div>
                  <div className={`pulse-bar ${t.warn?'warn':isPeak?'peak':''}`} 
                       style={{height: `${Math.max(h,10)}%`}} />
                  <div className="pulse-lbl">{t.id}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ctrls">
          <div className="ctrl-grp">
            <div className="ctrl on">▦ MATRIX</div>
            <div className="ctrl">≡ EXPANDED</div>
            <div className="ctrl">▼ TIER GROUP</div>
            <div className="ctrl">⚠ ALERTS</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="ctrl-act">⇅ SORT BY CP</button>
            <button className="ctrl-act">▣ ZONE ASSIGNMENTS</button>
            <button className="ctrl-act" style={{background:'var(--hud)',color:'oklch(0.10 0.012 240)'}}>+ CAPTURE BOARD</button>
          </div>
        </div>

        <div className="fleet">
          <div className="fleet-row fleet-hdr" style={{display:'grid',gridTemplateColumns:'60px 100px 200px 1fr 320px 90px'}}>
            <div>UNIT</div>
            <div>COMBAT PWR</div>
            <div>ROLE COMP</div>
            <div>ROSTER</div>
            <div></div>
            <div style={{textAlign:'right'}}>STATUS</div>
          </div>
          {TEAMS.map(t => <FleetRow key={t.id} team={t} totalAvg={avg} />)}
        </div>
      </div>
    </>
  );
}

window.DirectionB = DirectionB;
