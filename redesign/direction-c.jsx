// Direction C — Battle Constellation
// Teams as squad insignias on a tactical map. Class composition rendered
// as a 6-segment ring around each shield. Selected team detail in side panel.

const C_CSS = `
.dirC {
  width: 1440px;
  background:
    radial-gradient(circle at 30% 20%, oklch(0.20 0.018 250) 0%, transparent 45%),
    radial-gradient(circle at 75% 65%, oklch(0.18 0.022 280) 0%, transparent 50%),
    oklch(0.13 0.012 250);
  color: oklch(0.96 0.005 250);
  font: 14px/1.45 "Geist", system-ui, sans-serif;
  letter-spacing: -0.005em;
  padding: 22px 24px 28px;
  --accent: oklch(0.80 0.13 75);
  --gold: oklch(0.78 0.13 80);
  --line: oklch(0.32 0.014 250 / 0.5);
  --line-strong: oklch(0.42 0.018 250 / 0.8);
  --bg-1: oklch(0.18 0.012 250);
  --bg-2: oklch(0.22 0.014 250);
  --fg-2: oklch(0.62 0.012 250);
  --fg-3: oklch(0.46 0.012 250);
  --warn: oklch(0.80 0.14 70);
  --ok: oklch(0.78 0.13 155);
  --mono: "JetBrains Mono", ui-monospace, monospace;
  position: relative;
  overflow: hidden;
}
.dirC::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(oklch(1 0 0 / 0.025) 1px, transparent 1px),
    linear-gradient(90deg, oklch(1 0 0 / 0.025) 1px, transparent 1px);
  background-size: 56px 56px;
  pointer-events: none;
  mask: radial-gradient(ellipse 80% 60% at 50% 45%, #000 30%, transparent 90%);
}
.dirC > * { position: relative; }

.dirC .top-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 18px;
}
.dirC .crest { display: flex; align-items: center; gap: 14px; }
.dirC .crest-mark {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, var(--gold), oklch(0.55 0.10 60));
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-weight: 700; font-size: 18px;
  color: oklch(0.13 0.012 250);
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
}
.dirC .crest-info h1 { 
  margin:0; font-size: 22px; font-weight: 600; letter-spacing: 0.18em; 
  color: oklch(0.97 0.005 250);
}
.dirC .crest-info .sub { font-size: 11px; color: var(--fg-3); letter-spacing: 0.12em; margin-top: 2px; font-family: var(--mono); }
.dirC .top-r { display: flex; gap: 8px; align-items: center; }
.dirC .stat-chip { 
  background: var(--bg-1); border: 1px solid var(--line); border-radius: 10px;
  padding: 8px 14px; min-width: 90px;
}
.dirC .stat-chip .l { font-size: 9px; letter-spacing: 0.18em; color: var(--fg-3); }
.dirC .stat-chip .v { font-size: 16px; font-family: var(--mono); color: oklch(0.97 0.005 250); margin-top: 2px; }
.dirC .stat-chip.acc .v { color: var(--accent); }
.dirC .stat-chip.warn .v { color: var(--warn); }

.dirC .layout {
  display: grid; grid-template-columns: 1fr 380px; gap: 18px;
}

.dirC .map {
  background: oklch(0.13 0.012 250 / 0.6);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 24px 18px 28px;
  position: relative;
}
.dirC .tier {
  margin-bottom: 22px;
}
.dirC .tier:last-child { margin-bottom: 0; }
.dirC .tier-hd { 
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
}
.dirC .tier-mark { 
  width: 28px; height: 28px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-weight: 700; font-size: 14px;
  border: 1px solid;
}
.dirC .tier-mark.A { color: var(--gold); border-color: var(--gold); background: oklch(0.78 0.13 80 / 0.12); }
.dirC .tier-mark.B { color: oklch(0.75 0.10 245); border-color: oklch(0.55 0.10 245); background: oklch(0.55 0.10 245 / 0.10); }
.dirC .tier-mark.C { color: var(--fg-2); border-color: var(--fg-3); background: oklch(0.30 0.012 250 / 0.5); }
.dirC .tier-name { font-size: 13px; letter-spacing: 0.18em; color: oklch(0.92 0.005 250); }
.dirC .tier-count { font-size: 11px; color: var(--fg-3); font-family: var(--mono); margin-left: 6px; }
.dirC .tier-rule { flex: 1; height: 1px; background: linear-gradient(90deg, var(--line), transparent); }

.dirC .squads { display: flex; gap: 14px; flex-wrap: wrap; }
.dirC .squad {
  position: relative; width: 152px; height: 178px;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center;
  padding-top: 6px;
}
.dirC .ring {
  position: relative;
  width: 116px; height: 116px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 2;
}
.dirC .ring svg { position: absolute; inset: 0; transform: rotate(-90deg); }
.dirC .ring .core {
  width: 84px; height: 84px; border-radius: 50%;
  background: oklch(0.16 0.012 250); 
  border: 1px solid var(--line-strong);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative; z-index: 1;
}
.dirC .squad.sel .ring .core { 
  background: oklch(0.22 0.018 250); 
  border-color: var(--accent);
  box-shadow: 0 0 0 4px oklch(0.80 0.13 75 / 0.15);
}
.dirC .squad.warn .ring .core { 
  border-color: oklch(0.80 0.14 70 / 0.6);
}
.dirC .core .id { font: 700 18px/1 "Geist", sans-serif; letter-spacing: 0.06em; color: oklch(0.97 0.005 250); }
.dirC .core .cp { font: 600 13px/1 var(--mono); color: var(--accent); margin-top: 5px; }

.dirC .squad-foot {
  margin-top: 8px; text-align: center;
}
.dirC .sf-label { font-size: 9.5px; color: var(--fg-3); letter-spacing: 0.18em; font-family: var(--mono); }
.dirC .sf-roles { display: flex; gap: 3px; justify-content: center; margin-top: 4px; }
.dirC .sf-roles span {
  width: 6px; height: 6px; border-radius: 50%;
}
.dirC .squad.warn .ring::before {
  content: ''; position: absolute; inset: -6px; border-radius: 50%;
  background: radial-gradient(circle, transparent 60%, oklch(0.80 0.14 70 / 0.18) 70%, transparent 90%);
  animation: pulseC 2.4s ease-in-out infinite;
}
@keyframes pulseC { 50% { opacity: 0.5; } }

.dirC .warn-flag {
  position: absolute; top: -2px; right: 12px;
  background: var(--warn); color: oklch(0.13 0.012 250);
  font-size: 9px; padding: 2px 6px; border-radius: 3px;
  font-family: var(--mono); font-weight: 700; letter-spacing: 0.12em;
  z-index: 3;
}
.dirC .top-flag {
  position: absolute; top: -2px; right: 12px;
  background: var(--gold); color: oklch(0.13 0.012 250);
  font-size: 9px; padding: 2px 6px; border-radius: 3px;
  font-family: var(--mono); font-weight: 700; letter-spacing: 0.12em;
  z-index: 3;
}

/* === Side panel === */
.dirC .panel {
  background: oklch(0.16 0.012 250);
  border: 1px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  display: flex; flex-direction: column;
  align-self: start;
}
.dirC .pn-head {
  padding: 16px 18px;
  background: linear-gradient(180deg, oklch(0.22 0.018 250) 0%, oklch(0.16 0.012 250) 100%);
  border-bottom: 1px solid var(--line);
}
.dirC .pn-tag { font-size: 10px; letter-spacing: 0.18em; color: var(--fg-3); font-family: var(--mono); }
.dirC .pn-row { display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px; }
.dirC .pn-id { font: 700 28px/1 "Geist", sans-serif; letter-spacing: 0.04em; color: oklch(0.97 0.005 250); }
.dirC .pn-cp { font: 600 22px/1 var(--mono); color: var(--accent); }
.dirC .pn-meta { font-size: 11px; color: var(--fg-2); margin-top: 8px; font-family: var(--mono); display: flex; gap: 12px; }
.dirC .pn-meta b { color: oklch(0.97 0.005 250); font-weight: 500; }
.dirC .pn-warn {
  margin: 12px 18px 0; padding: 8px 12px;
  background: oklch(0.80 0.14 70 / 0.10);
  border: 1px solid oklch(0.80 0.14 70 / 0.35);
  border-radius: 6px;
  font-size: 11.5px; color: var(--warn);
  font-family: var(--mono);
  display: flex; align-items: center; gap: 8px;
}

.dirC .pn-section { padding: 14px 18px 0; }
.dirC .pn-h { 
  font-size: 10px; letter-spacing: 0.2em; color: var(--fg-3);
  font-family: var(--mono); margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px;
}
.dirC .pn-h::after { content: ''; flex: 1; height: 1px; background: var(--line); }

.dirC .pn-roles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
.dirC .pn-role-cell { 
  background: oklch(0.20 0.014 250); border: 1px solid var(--line);
  border-radius: 6px; padding: 8px 10px; text-align: center;
}
.dirC .pn-role-cell .lbl { font-size: 9px; letter-spacing: 0.15em; color: var(--fg-3); font-family: var(--mono); }
.dirC .pn-role-cell .v { font: 600 18px/1 var(--mono); margin-top: 4px; }
.dirC .pn-role-cell.miss .v { color: var(--warn); }
.dirC .pn-role-cell.miss { border-color: oklch(0.80 0.14 70 / 0.4); }

.dirC .pn-mems { padding: 0 12px; }
.dirC .pn-m {
  display: grid; grid-template-columns: 28px 1fr auto auto;
  gap: 10px; align-items: center;
  padding: 8px 6px;
  border-radius: 6px;
  cursor: pointer;
}
.dirC .pn-m:hover { background: oklch(0.20 0.014 250); }
.dirC .pn-m + .pn-m { border-top: 1px solid var(--line); }
.dirC .pn-m-av {
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 10px; font-weight: 700;
  color: oklch(0.97 0.005 250);
}
.dirC .pn-m-name { font-size: 13px; color: oklch(0.95 0.005 250); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dirC .pn-m-cls { font: 600 9px/1 var(--mono); padding: 3px 5px; border-radius: 3px; letter-spacing: 0.04em; }
.dirC .pn-m-cp { font: 500 12px/1 var(--mono); color: var(--fg-2); min-width: 36px; text-align: right; }

.dirC .pn-actions { padding: 14px 18px 18px; display: flex; gap: 8px; }
.dirC .pn-btn {
  flex: 1; padding: 9px 12px; border-radius: 7px;
  font-size: 11.5px; cursor: pointer; text-align: center;
  letter-spacing: 0.06em;
}
.dirC .pn-btn.primary { background: var(--accent); color: oklch(0.13 0.012 250); border: 1px solid var(--accent); font-weight: 600; }
.dirC .pn-btn.ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--line); }

/* legend */
.dirC .legend {
  margin-top: 14px;
  padding: 12px 16px; 
  background: oklch(0.13 0.012 250 / 0.5);
  border: 1px solid var(--line);
  border-radius: 10px;
  display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
}
.dirC .legend-ttl { font-size: 10px; letter-spacing: 0.18em; color: var(--fg-3); font-family: var(--mono); }
.dirC .legend-i { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--fg-2); font-family: var(--mono); }
.dirC .legend-i .sw { width: 10px; height: 10px; border-radius: 3px; }
`;

const ROLE_PIE = {
  Tank: '#c8a84b',
  Heal: '#d4607a',
  DPS:  '#90caf9',
  CC:   '#5b9bd5',
};

// Render the 6-segment ring around a squad shield
function SquadRing({ team, selected }) {
  const R = 56; // outer radius
  const r = 44; // inner radius
  const cx = 58, cy = 58;
  const segs = 6;
  const segAngle = (Math.PI * 2) / segs;
  const gap = 0.04; // radians

  const arcPath = (i, color) => {
    const a0 = -Math.PI/2 + i * segAngle + gap/2;
    const a1 = -Math.PI/2 + (i+1) * segAngle - gap/2;
    const x0o = cx + R * Math.cos(a0);
    const y0o = cy + R * Math.sin(a0);
    const x1o = cx + R * Math.cos(a1);
    const y1o = cy + R * Math.sin(a1);
    const x0i = cx + r * Math.cos(a1);
    const y0i = cy + r * Math.sin(a1);
    const x1i = cx + r * Math.cos(a0);
    const y1i = cy + r * Math.sin(a0);
    const large = 0;
    return `M ${x0o} ${y0o} A ${R} ${R} 0 ${large} 1 ${x1o} ${y1o} L ${x0i} ${y0i} A ${r} ${r} 0 ${large} 0 ${x1i} ${y1i} Z`;
  };

  return (
    <svg viewBox="0 0 116 116" width={116} height={116}>
      {Array.from({length: segs}).map((_, i) => {
        const m = team.members[i];
        const fill = m ? CLASSES[m.cls].color : 'oklch(0.30 0.012 250)';
        const opacity = m ? (selected ? 0.95 : 0.78) : 0.25;
        return (
          <path 
            key={i} 
            d={arcPath(i)} 
            fill={fill}
            opacity={opacity}
            stroke={m ? CLASSES[m.cls].color : 'oklch(0.30 0.012 250)'} 
            strokeWidth={selected ? 1 : 0.6}
          />
        );
      })}
    </svg>
  );
}

function Squad({ team, selected, onSelect }) {
  const cp = teamCP(team);
  const isPeak = cp === TOP_CP;
  const roles = teamRoles(team);
  return (
    <div 
      className={`squad ${selected?'sel':''} ${team.warning?'warn':''}`}
      onClick={() => onSelect(team.id)}
    >
      {team.warning && <div className="warn-flag">!</div>}
      {!team.warning && isPeak && <div className="top-flag">★ TOP</div>}
      <div className="ring">
        <SquadRing team={team} selected={selected} />
        <div className="core">
          <div className="id">{team.id}</div>
          <div className="cp">{fmtCP(cp)}</div>
        </div>
      </div>
      <div className="squad-foot">
        <div className="sf-label">{team.members.length}/6 · T{roles.Tank||0} H{roles.Heal||0} D{roles.DPS||0}{roles.CC?' C'+roles.CC:''}</div>
        <div className="sf-roles">
          {team.members.map((m,i) => (
            <span key={i} style={{background: CLASSES[m.cls].color}} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DirectionC() {
  const [selectedId, setSelectedId] = React.useState('A3');
  const sel = TEAMS.find(t => t.id === selectedId) || TEAMS[0];

  const tiers = ['A','B','C'];
  const totalCP = TEAMS.reduce((s,t)=>s+teamCP(t),0);
  const issues = TEAMS.filter(t=>t.warning).length;
  const totalMembers = TEAMS.reduce((s,t)=>s+t.members.length,0);

  const selRoles = teamRoles(sel);
  const selCP = teamCP(sel);
  const avgCP = totalCP / TEAMS.length;
  const selDelta = selCP - avgCP;

  return (
    <>
      <style>{C_CSS}</style>
      <div className="dirC">
        <div className="top-bar">
          <div className="crest">
            <div className="crest-mark">C</div>
            <div className="crest-info">
              <h1>CRIMINAL</h1>
              <div className="sub">SEASON 1 · 2026.05.16 · DIR C — BATTLE CONSTELLATION</div>
            </div>
          </div>
          <div className="top-r">
            <div className="stat-chip"><div className="l">TEAMS</div><div className="v">{TEAMS.length}</div></div>
            <div className="stat-chip acc"><div className="l">FLEET CP</div><div className="v">{(totalCP/1000).toFixed(2)}M</div></div>
            <div className="stat-chip"><div className="l">MEMBERS</div><div className="v">{totalMembers}/{TEAMS.length*6}</div></div>
            <div className={`stat-chip ${issues?'warn':''}`}><div className="l">ALERTS</div><div className="v">{issues}</div></div>
          </div>
        </div>

        <div className="layout">
          <div className="map">
            {tiers.map(tier => {
              const teams = TEAMS.filter(t => t.tier === tier);
              const tierCP = teams.reduce((s,t)=>s+teamCP(t),0);
              return (
                <div className="tier" key={tier}>
                  <div className="tier-hd">
                    <div className={`tier-mark ${tier}`}>{tier}</div>
                    <div className="tier-name">TIER {tier}</div>
                    <div className="tier-count">{teams.length} units · {fmtCP(tierCP)}</div>
                    <div className="tier-rule" />
                  </div>
                  <div className="squads">
                    {teams.map(t => (
                      <Squad 
                        key={t.id} 
                        team={t} 
                        selected={t.id === selectedId}
                        onSelect={setSelectedId}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="legend">
              <div className="legend-ttl">CLASS RING</div>
              {Object.values(CLASSES).map(c => (
                <div className="legend-i" key={c.short}>
                  <span className="sw" style={{background: c.color}} />
                  <span>{c.name}</span>
                  <span style={{color:'var(--fg-3)'}}>· {c.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="pn-head">
              <div className="pn-tag">▣ SQUAD READOUT</div>
              <div className="pn-row">
                <div className="pn-id">{sel.id}</div>
                <div className="pn-cp">{fmtCP(selCP)}</div>
              </div>
              <div className="pn-meta">
                <span>TIER <b>{sel.tier}</b></span>
                <span>SLOTS <b>{sel.members.length}/6</b></span>
                <span style={{color: selDelta>=0?'var(--ok)':'var(--warn)'}}>
                  {selDelta>=0?'+':''}{Math.round(selDelta)}K vs avg
                </span>
              </div>
            </div>
            {sel.warning && (
              <div className="pn-warn">⚠ {sel.warning}</div>
            )}

            <div className="pn-section">
              <div className="pn-h">ROLE COMPOSITION</div>
              <div className="pn-roles">
                {['Tank','Heal','DPS','CC'].map(r => {
                  const n = selRoles[r] || 0;
                  const miss = (r === 'Heal' && n === 0) || (r === 'Tank' && n === 0);
                  return (
                    <div className={`pn-role-cell ${miss?'miss':''}`} key={r}>
                      <div className="lbl">{r.toUpperCase()}</div>
                      <div className="v" style={{color: miss?'var(--warn)':ROLE_PIE[r]}}>{n}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pn-section">
              <div className="pn-h">ROSTER · SORTED BY CP</div>
              <div className="pn-mems">
                {[...sel.members].sort((a,b)=>b.cp-a.cp).map((m,i) => {
                  const c = CLASSES[m.cls];
                  const initials = m.name.replace(/[^A-Za-z0-9\u0E00-\u0E7F]/g,'').slice(0,2).toUpperCase();
                  return (
                    <div className="pn-m" key={i}>
                      <div className="pn-m-av" style={{background: c.color+'40', border: `1px solid ${c.color}`, color: c.tc}}>
                        {initials}
                      </div>
                      <div className="pn-m-name">{m.name}</div>
                      <div className="pn-m-cls" style={{background: c.color+'22', color: c.tc, border: `1px solid ${c.color}55`}}>
                        {c.short}
                      </div>
                      <div className="pn-m-cp">{m.cp}K</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pn-actions">
              <button className="pn-btn ghost">⇄ SWAP MEMBER</button>
              <button className="pn-btn primary">+ ASSIGN ZONE</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.DirectionC = DirectionC;
