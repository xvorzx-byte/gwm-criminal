// Direction A — Refined Dark
// Polish of the current War Board: stronger hierarchy, role-mix bars,
// CP heatmap on team headers, problem callouts, tighter density.

const A_CSS = `
.dirA { 
  width: 1440px; 
  background: oklch(0.155 0.012 250); 
  color: oklch(0.97 0.005 250); 
  font: 14px/1.45 "Geist", system-ui, sans-serif; 
  letter-spacing: -0.005em;
  padding: 22px 26px 32px;
  --accent: oklch(0.80 0.13 75);
  --line: oklch(0.32 0.014 250 / 0.55);
  --line-strong: oklch(0.40 0.018 250 / 0.85);
  --bg-1: oklch(0.205 0.014 250);
  --bg-2: oklch(0.245 0.014 250);
  --fg-2: oklch(0.62 0.012 250);
  --fg-3: oklch(0.46 0.012 250);
  --ok: oklch(0.78 0.13 155);
  --warn: oklch(0.80 0.14 70);
  --err: oklch(0.70 0.18 22);
  --mono: "JetBrains Mono", ui-monospace, monospace;
}
.dirA .summary {
  display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr 1fr; gap: 1px;
  background: var(--line); border: 1px solid var(--line-strong);
  border-radius: 12px; overflow: hidden; margin-bottom: 18px;
}
.dirA .sum-cell { background: oklch(0.18 0.012 250); padding: 14px 18px; }
.dirA .sum-lbl { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-3); margin-bottom: 6px; font-weight: 600; }
.dirA .sum-val { font: 600 28px/1 var(--mono); color: oklch(0.97 0.005 250); }
.dirA .sum-sub { font-size: 11px; color: var(--fg-2); margin-top: 4px; font-family: var(--mono); }
.dirA .role-bar { display: flex; height: 6px; border-radius: 3px; overflow: hidden; margin-top: 10px; gap: 1px; }
.dirA .role-bar > span { display: block; }
.dirA .role-legend { display: flex; gap: 10px; margin-top: 6px; font-size: 10px; color: var(--fg-2); font-family: var(--mono); }
.dirA .role-legend i { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 4px; vertical-align: middle; }

.dirA .toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.dirA .tabs { display: flex; gap: 2px; background: oklch(0.18 0.012 250); border: 1px solid var(--line); border-radius: 8px; padding: 3px; }
.dirA .tab { padding: 6px 12px; border-radius: 5px; font-size: 12px; color: var(--fg-2); cursor: pointer; transition: .12s; font-weight: 500; }
.dirA .tab.active { background: var(--bg-2); color: oklch(0.97 0.005 250); }
.dirA .controls { display: flex; gap: 8px; align-items: center; }
.dirA .ctrl-btn { padding: 7px 12px; background: oklch(0.18 0.012 250); border: 1px solid var(--line); border-radius: 7px; color: var(--fg-2); font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
.dirA .ctrl-btn.primary { background: var(--accent); color: oklch(0.18 0.012 250); border-color: var(--accent); font-weight: 600; }

.dirA .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.dirA .team {
  background: oklch(0.18 0.012 250); border: 1px solid var(--line);
  border-radius: 12px; overflow: hidden; position: relative;
  transition: border-color .15s, transform .15s;
}
.dirA .team:hover { border-color: var(--line-strong); }
.dirA .team.warn { border-color: oklch(0.80 0.14 70 / 0.5); }
.dirA .team.top { border-color: oklch(0.80 0.13 75 / 0.55); }

.dirA .t-head { padding: 11px 13px 9px; position: relative; }
.dirA .t-head::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; 
  background: var(--accent);
}
.dirA .team.tierA .t-head::before { background: var(--accent); }
.dirA .team.tierB .t-head::before { background: oklch(0.65 0.10 250); }
.dirA .team.tierC .t-head::before { background: oklch(0.55 0.08 250); }

.dirA .t-row1 { display: flex; align-items: baseline; justify-content: space-between; }
.dirA .t-name { font-size: 14px; font-weight: 700; letter-spacing: 0.04em; }
.dirA .t-tier { font: 600 9.5px/1 var(--mono); padding: 3px 6px; border-radius: 4px; background: var(--bg-2); color: var(--fg-2); margin-right: 6px; letter-spacing: 0.1em; }
.dirA .t-cp { font: 600 18px/1 var(--mono); }
.dirA .t-cp.hot { color: var(--accent); }
.dirA .t-cp.cold { color: oklch(0.62 0.10 250); }
.dirA .t-row2 { display: flex; align-items: center; gap: 8px; margin-top: 7px; font-size: 10.5px; color: var(--fg-3); font-family: var(--mono); }
.dirA .t-delta { color: var(--fg-2); }
.dirA .t-delta.pos { color: var(--ok); }
.dirA .t-delta.neg { color: var(--err); }

.dirA .role-strip { display: flex; gap: 2px; height: 4px; margin-top: 9px; border-radius: 2px; overflow: hidden; }

.dirA .t-warn {
  margin: 8px 13px 0; padding: 6px 10px; border-radius: 6px;
  background: oklch(0.80 0.14 70 / 0.12); border: 1px solid oklch(0.80 0.14 70 / 0.32);
  font-size: 11px; color: var(--warn); display: flex; align-items: center; gap: 6px;
  font-family: var(--mono);
}

.dirA .members { padding: 6px 6px 6px; }
.dirA .m {
  display: grid; grid-template-columns: 16px 1fr auto auto; gap: 8px;
  align-items: center; padding: 5px 8px; border-radius: 6px; cursor: pointer;
  transition: background .1s;
}
.dirA .m:hover { background: oklch(0.22 0.014 250); }
.dirA .m-cls-bar { width: 3px; height: 16px; border-radius: 2px; justify-self: center; }
.dirA .m-name { font-size: 12.5px; color: oklch(0.92 0.005 250); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dirA .m-cls { font: 600 9.5px/1 var(--mono); padding: 3px 5px; border-radius: 3px; letter-spacing: 0.04em; }
.dirA .m-cp { font: 500 11px/1 var(--mono); color: var(--fg-2); min-width: 32px; text-align: right; }
.dirA .m-cp.elite { color: var(--accent); }
.dirA .m-cp.weak { color: var(--fg-3); }

.dirA .add-slot {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin: 6px 8px 10px; padding: 7px; border-radius: 6px;
  border: 1px dashed var(--line-strong); color: var(--fg-3);
  font-size: 11px; cursor: pointer; transition: .12s;
}
.dirA .add-slot:hover { color: var(--accent); border-color: oklch(0.80 0.13 75 / 0.5); }

.dirA .strength-bar {
  height: 2px; background: var(--bg-2);
  position: relative; overflow: hidden;
}
.dirA .strength-bar > span {
  position: absolute; left: 0; top: 0; bottom: 0; 
  background: linear-gradient(90deg, transparent, var(--accent));
  opacity: 0.7;
}
`;

const ROLE_COLORS = {
  Tank: '#c8a84b',
  Heal: '#d4607a',
  DPS:  '#90caf9',
  CC:   '#5b9bd5',
};

function RoleBar({ roles, total }) {
  const items = ['Tank','Heal','DPS','CC'].filter(r => roles[r]);
  return (
    <div className="role-strip">
      {items.map(r => (
        <div key={r} style={{ flex: roles[r], background: ROLE_COLORS[r] }} title={`${r}: ${roles[r]}`} />
      ))}
    </div>
  );
}

function TeamCardA({ team }) {
  const cp = teamCP(team);
  const roles = teamRoles(team);
  const range = TOP_CP - BOT_CP || 1;
  const heat = (cp - BOT_CP) / range; // 0..1
  const isHot = heat > 0.7;
  const isCold = heat < 0.25;
  const avgCP = TEAMS.reduce((s,t)=>s+teamCP(t),0) / TEAMS.length;
  const delta = cp - avgCP;
  const warning = team.warning;

  return (
    <div className={`team tier${team.tier}${warning?' warn':''}${isHot?' top':''}`}>
      <div className="t-head">
        <div className="t-row1">
          <div style={{display:'flex',alignItems:'center'}}>
            <span className="t-tier">{team.tier}</span>
            <span className="t-name">{team.id}</span>
          </div>
          <div className={`t-cp ${isHot?'hot':isCold?'cold':''}`}>{fmtCP(cp)}</div>
        </div>
        <div className="t-row2">
          <span>{team.members.length}/6 SLOTS</span>
          <span style={{color:'var(--fg-3)'}}>·</span>
          <span className={`t-delta ${delta>5?'pos':delta<-5?'neg':''}`}>
            {delta>0?'+':''}{Math.round(delta)}K vs avg
          </span>
        </div>
        <RoleBar roles={roles} total={team.members.length} />
      </div>
      {warning && (
        <div className="t-warn">
          <span>⚠</span>
          <span>{warning}</span>
        </div>
      )}
      <div className="members">
        {team.members.map((m, i) => {
          const c = CLASSES[m.cls];
          const elite = m.cp >= 98;
          const weak = m.cp < 90;
          return (
            <div className="m" key={i}>
              <div className="m-cls-bar" style={{background:c.color}} />
              <div className="m-name">{m.name}</div>
              <div className="m-cls" style={{background:c.color+'22',color:c.tc,border:`1px solid ${c.color}55`}}>{c.short}</div>
              <div className={`m-cp ${elite?'elite':weak?'weak':''}`}>{m.cp}K</div>
            </div>
          );
        })}
        {team.members.length < 6 && (
          <div className="add-slot">+ assign member</div>
        )}
      </div>
      <div className="strength-bar"><span style={{width:`${heat*100}%`}} /></div>
    </div>
  );
}

function DirectionA() {
  const totalCP = TEAMS.reduce((s,t)=>s+teamCP(t),0);
  const totalMembers = TEAMS.reduce((s,t)=>s+t.members.length,0);
  const totalSlots = TEAMS.length * 6;
  const filled = totalMembers;
  const allRoles = TEAMS.reduce((acc,t) => {
    const r = teamRoles(t);
    Object.keys(r).forEach(k => acc[k] = (acc[k]||0) + r[k]);
    return acc;
  }, {});
  const warnings = TEAMS.filter(t=>t.warning).length;

  return (
    <>
      <style>{A_CSS}</style>
      <div className="dirA">
        <div className="summary">
          <div className="sum-cell">
            <div className="sum-lbl">Direction A · Refined</div>
            <div className="sum-val" style={{color:'var(--accent)'}}>WAR BOARD</div>
            <div className="sum-sub">CRIMINAL · Season 1 · 2026-05-16</div>
          </div>
          <div className="sum-cell">
            <div className="sum-lbl">Total CP</div>
            <div className="sum-val">{(totalCP/1000).toFixed(2)}M</div>
            <div className="sum-sub">avg {Math.round(totalCP/TEAMS.length)}K / team</div>
          </div>
          <div className="sum-cell">
            <div className="sum-lbl">Roster</div>
            <div className="sum-val">{filled}<span style={{color:'var(--fg-3)',fontSize:18}}>/{totalSlots}</span></div>
            <div className="sum-sub">{TEAMS.length} teams · 6 slots ea.</div>
          </div>
          <div className="sum-cell">
            <div className="sum-lbl">Role Mix</div>
            <div className="role-bar">
              {['Tank','Heal','DPS','CC'].map(r => allRoles[r] ? (
                <span key={r} style={{flex: allRoles[r], background: ROLE_COLORS[r]}} />
              ) : null)}
            </div>
            <div className="role-legend">
              {['Tank','Heal','DPS','CC'].map(r => allRoles[r] ? (
                <span key={r}><i style={{background: ROLE_COLORS[r]}}/>{r} {allRoles[r]}</span>
              ) : null)}
            </div>
          </div>
          <div className="sum-cell">
            <div className="sum-lbl">Issues</div>
            <div className="sum-val" style={{color: warnings ? 'var(--warn)' : 'var(--ok)'}}>{warnings}</div>
            <div className="sum-sub">{warnings ? 'team needs attention' : 'all teams balanced'}</div>
          </div>
        </div>

        <div className="toolbar">
          <div className="tabs">
            <div className="tab active">Grid</div>
            <div className="tab">By Tier</div>
            <div className="tab">Issues only</div>
            <div className="tab">Compare</div>
          </div>
          <div className="controls">
            <div className="ctrl-btn">⇅ Sort: CP desc</div>
            <div className="ctrl-btn">▦ Zone Assignments</div>
            <div className="ctrl-btn primary">+ Capture Board</div>
          </div>
        </div>

        <div className="grid">
          {TEAMS.map(t => <TeamCardA key={t.id} team={t} />)}
        </div>
      </div>
    </>
  );
}

window.DirectionA = DirectionA;
