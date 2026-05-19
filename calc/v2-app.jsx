// Damage Calculator v2 — compact, checklist-driven
// Sword of Justice · 剑侠情缘
const { useState, useMemo, useRef } = React;

// ─── defaults (match screenshot numbers) ───────────────────────────────
const DEFAULT_ENEMY = {
  armor: 4294,
  shield: 2584,
  schDef: 2838,
  elemRes: 680,
  dodge: 773,
  dmgRed: 2,
  critRes: 894,
};
const DEFAULT_ME = {
  atk: 4825,
  armorPen: 838,
  shieldBk: 912,
  schPress: 780,
  elemAtk: 1653,
  acc: 780,
  crit: 1518,
  critDmg: 175,
};

// ─── field definitions ────────────────────────────────────────────────
const ME_FIELDS = [
  { key: 'atk',      label: 'โจมตี (ATK)',  targetFn: () => null },
  { key: 'armorPen', label: 'เจาะเกราะ',     targetFn: (e) => `พอดีที่ ${idealArmorPen(+e.armor).toLocaleString()}` },
  { key: 'shieldBk', label: 'ทำลายโล่',     targetFn: (e) => `⅓+1=${shieldHalf1(+e.shield).toLocaleString()} / ½=${shieldHalf2(+e.shield).toLocaleString()}` },
  { key: 'schPress', label: 'ข่มสำนัก',       targetFn: () => null },
  { key: 'elemAtk',  label: 'โจมตีธาตุ',      targetFn: (e) => `พอดีที่ ${idealElement(+e.elemRes).toLocaleString()}` },
  { key: 'acc',      label: 'แม่นยำ',        targetFn: (e) => `cap ${accuracyCap(+e.dodge).toLocaleString()}` },
  { key: 'crit',     label: 'คริติคอล',      targetFn: () => null },
  { key: 'critDmg',  label: 'ดาเมจเมื่อคริ%', targetFn: () => null },
];

const ENEMY_FIELDS = [
  { key: 'armor',   label: 'เกราะ' },
  { key: 'shield',  label: 'โล่' },
  { key: 'schDef',  label: 'ป้องกันสำนัก' },
  { key: 'elemRes', label: 'ต้านธาตุ' },
  { key: 'dodge',   label: 'หลบ' },
  { key: 'dmgRed',  label: 'ลดดาเมจ %' },
  { key: 'critRes', label: 'ต้านคริ' },
];

// ─── OCR upload ───────────────────────────────────────────────────────
function OcrButton({ side, onParsed }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [msg, setMsg] = useState('');

  async function handleFile(file) {
    if (!file) return;
    setStatus('reading');
    setMsg('กำลังอ่าน...');
    try {
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const base64 = dataUrl.split(',')[1];
      const fields = side === 'me' ? ME_FIELDS : ENEMY_FIELDS;
      const lines = fields.map(f => `${f.key}: ${f.label}`).join('\n');
      const prompt =
        `อ่าน stat ของตัวละครจากภาพนี้ (Sword of Justice / 剑侠情缘).\n` +
        `ฝั่ง: ${side === 'me' ? 'ผู้โจมตี (DPS)' : 'ศัตรู Tank'}\n` +
        `Key ที่ต้องการ:\n${lines}\n` +
        `ตอบเป็น JSON object เท่านั้น ตัวเลขไม่มี % หรือ comma, ค่าที่หาไม่เจอใส่ null.`;

      const reply = await window.claude.complete({
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: file.type || 'image/png', data: base64 } },
            { type: 'text', text: prompt },
          ],
        }],
      });
      const cleaned = reply.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const out = {};
      fields.forEach(f => {
        if (parsed[f.key] != null && !isNaN(parsed[f.key])) out[f.key] = +parsed[f.key];
      });
      if (!Object.keys(out).length) throw new Error('ไม่พบ stat');
      onParsed(out);
      setStatus('idle');
      setMsg(`อ่านได้ ${Object.keys(out).length} ค่า`);
      setTimeout(() => setMsg(''), 2400);
    } catch (e) {
      setStatus('error');
      setMsg('อ่านภาพไม่สำเร็จ');
      setTimeout(() => { setStatus('idle'); setMsg(''); }, 2400);
    }
  }
  return (
    <>
      <button
        type="button"
        className="ocr-btn"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'reading'}
      >
        📷 {status === 'reading' ? 'กำลังอ่าน...' : 'อ่าน stat จากภาพ'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {msg && <span className={`ocr-msg ${status}`}>{msg}</span>}
    </>
  );
}

// ─── Enemy compact bar ────────────────────────────────────────────────
function EnemyBar({ enemy, onChange }) {
  const [open, setOpen] = useState(false);
  const update = (k, v) => onChange({ ...enemy, [k]: v });

  return (
    <div className="card enemy-wrap">
      <div className="enemy">
        <div className="enemy-l">
          <div className="enemy-title">ศัตรู</div>
          <div className="enemy-stats">
            <div className="enemy-stat"><span className="l">เกราะ</span><span className="v">{(+enemy.armor).toLocaleString()}</span></div>
            <div className="enemy-stat"><span className="l">โล่</span><span className="v">{(+enemy.shield).toLocaleString()}</span></div>
            <div className="enemy-stat"><span className="l">ป้องกันสำนัก</span><span className="v">{(+enemy.schDef).toLocaleString()}</span></div>
            <div className="enemy-stat"><span className="l">ต้านธาตุ</span><span className="v">{(+enemy.elemRes).toLocaleString()}</span></div>
            <div className="enemy-stat"><span className="l">หลบ</span><span className="v">{(+enemy.dodge).toLocaleString()}</span></div>
            <div className="enemy-stat"><span className="l">ลดดาเมจ</span><span className="v">{enemy.dmgRed}%</span></div>
            <div className="enemy-stat"><span className="l">ต้านคริ</span><span className="v">{(+enemy.critRes).toLocaleString()}</span></div>
          </div>
        </div>
        <button className="enemy-edit-btn" onClick={() => setOpen(o => !o)}>
          แก้ไข <span className="caret">{open ? '▴' : '▾'}</span>
        </button>
      </div>
      {open && (
        <div className="enemy-edit-panel">
          {ENEMY_FIELDS.map(f => (
            <Field
              key={f.key}
              label={f.label}
              value={enemy[f.key]}
              onChange={(v) => update(f.key, v)}
              compact
            />
          ))}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <OcrButton side="enemy" onParsed={(patch) => onChange({ ...enemy, ...patch })} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── compact field (for enemy editor) ────────────────────────────────
function Field({ label, value, onChange, compact }) {
  return (
    <div className="field">
      <div className="field-h">
        <span className="field-name">{label}</span>
      </div>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        min="0"
        style={compact ? { fontSize: 15, padding: '6px 10px' } : undefined}
      />
    </div>
  );
}

// ─── My-stats grid with rich hints ───────────────────────────────────
function MyStats({ me, enemy, onChange, onReset }) {
  const update = (k, v) => onChange({ ...me, [k]: v });
  return (
    <div className="card">
      <div className="card-h">
        <div className="card-h-l">
          <span className="card-h-ico">劍</span>
          <span className="card-h-title">STAT ของเรา</span>
        </div>
        <div className="me-actions">
          <OcrButton side="me" onParsed={(patch) => onChange({ ...me, ...patch })} />
          <button className="me-reset" onClick={onReset} title="คืนค่าเริ่มต้น">⟳ reset</button>
        </div>
      </div>

      <div className="me-lock">เพิ่มเลเวลต้านทานธาตุ = 100 (fixed)</div>

      <div className="me-grid">
        {ME_FIELDS.map(f => {
          const hint = hintFor(f.key, me, enemy);
          const target = f.targetFn(enemy);
          return (
            <div key={f.key} className="field">
              <div className="field-h">
                <span className="field-name">{f.label}</span>
                {target && <span className="field-target">({target})</span>}
              </div>
              {hint.pill && (
                <span className={`field-pill ${hint.tone}`}>{hint.pill}</span>
              )}
              <input
                type="number"
                value={me[f.key] ?? ''}
                onChange={(e) => update(f.key, e.target.value)}
                min="0"
              />
              {hint.hint && (
                <div className={`field-hint ${hint.tone}`}>{hint.hint}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Result strip ────────────────────────────────────────────────────
function ResultStrip({ r }) {
  const pure = 100 + (+r.me.critDmg || 0) * 0.243;
  return (
    <div className="result">
      <div className="result-cell">
        <div className="rc-lbl">ดาเมจ/ตี</div>
        <div className="rc-val dmg">{Math.round(r.normal).toLocaleString()}</div>
      </div>
      <div className="result-cell">
        <div className="rc-lbl">คริ/ตี</div>
        <div className="rc-val gold">{Math.round(r.crit).toLocaleString()}</div>
      </div>
      <div className="result-cell">
        <div className="rc-lbl">เฉลี่ย/ตี</div>
        <div className="rc-val ok">{Math.round(r.expected).toLocaleString()}</div>
      </div>
      <div className="result-cell">
        <div className="rc-lbl">Hit Rate</div>
        <div className="rc-val blue">{(r.hitRate * 100).toFixed(1)}%</div>
        <div className="rc-sub">{r.hitRate >= 1 ? '✓ ติดทุกตี' : 'ไม่ติด 100%'}</div>
      </div>
      <div className="result-cell">
        <div className="rc-lbl">โอกาสคริ</div>
        <div className="rc-val gold">{(r.critChance * 100).toFixed(1)}%</div>
        <div className="rc-sub">สุทธิ {pure.toFixed(0)}%</div>
      </div>
    </div>
  );
}

// ─── DPS Checklist ───────────────────────────────────────────────────
function Checklist({ checks }) {
  return (
    <div className="check-list">
      {checks.map((c, i) => (
        <div key={c.id} className={`check-row ${c.tone}`}>
          <div className={`check-ico ${c.tone}`}>
            {c.tone === 'good' ? '✓' : c.tone === 'under' ? '!' : '·'}
          </div>
          <div className="check-body">
            <div className="step">
              <span className="step-no">{i + 1}.</span>
              {c.title}
            </div>
            <div className="desc">{c.desc}</div>
          </div>
          <div className={`check-value ${c.tone}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Journey ────────────────────────────────────────────────────
function Journey({ rows }) {
  return (
    <div className="journey-list">
      {rows.map(r => {
        const pos = Math.min(100, (r.cur / r.max) * 100);
        return (
          <div key={r.key} className="j-row" style={{ '--mc': r.color }}>
            <div className="j-head">
              <span className="j-name">{r.label}</span>
              <span className="j-cur" style={{ color: r.color }}>{r.cur.toLocaleString()}</span>
            </div>
            <div className="j-track">
              <div className="j-fill" style={{ width: `${pos}%` }} />
              <div className="j-cursor" style={{ left: `${pos}%` }} />
            </div>
            <div className="j-milestones">
              {r.milestones.map((m, i) => {
                const p = Math.min(100, (m.at / r.max) * 100);
                return (
                  <div key={i} className={`j-milestone ${m.cleared ? 'cleared' : ''}`}
                       style={{ left: `${p}%` }}>
                    <div className="j-tick" />
                    <div className="j-mlabel">{m.label}</div>
                    <div className="j-mvalue">{m.at.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Priority list ───────────────────────────────────────────────────
function Priority({ rows }) {
  const max = Math.max(...rows.map(r => Math.max(0, r.delta)), 1);
  return (
    <div className="prio-list">
      {rows.map((r, i) => {
        const pos = r.delta > 0;
        const w = pos ? (r.delta / max) * 100 : 0;
        return (
          <div key={r.key} className={`prio-row ${i === 0 ? 'prio-top' : ''}`}>
            <div className="prio-rank">{i + 1}</div>
            <div className="prio-name">
              <span className="prio-label">{r.label}</span>
              <span className="prio-plus">+{r.plus}{r.pct ? '%' : ''}</span>
            </div>
            <div className="prio-bar">
              <div className="prio-bar-fill" style={{ width: `${w}%` }} />
            </div>
            <div className={`prio-delta ${pos ? 'pos' : 'zero'}`}>
              {pos ? '+' : ''}{Math.round(r.delta)}
              <span className="prio-deltapct">
                {r.deltaPct > 0 ? '+' : ''}{r.deltaPct.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── App root ────────────────────────────────────────────────────────
function App() {
  const [enemy, setEnemy] = useState(DEFAULT_ENEMY);
  const [me, setMe] = useState(DEFAULT_ME);
  const [tab, setTab] = useState('checklist');

  const result    = useMemo(() => calcDamage(me, enemy), [me, enemy]);
  const checks    = useMemo(() => runChecklist(me, enemy, result), [me, enemy, result]);
  const journey   = useMemo(() => statJourney(me, enemy), [me, enemy]);
  const priority  = useMemo(() => marginalValue(me, enemy, result), [me, enemy, result]);
  const passes    = checks.filter(c => c.tone === 'good').length;
  const total     = checks.length;

  return (
    <div className="app">
      <EnemyBar enemy={enemy} onChange={setEnemy} />
      <MyStats
        me={me}
        enemy={enemy}
        onChange={setMe}
        onReset={() => setMe(DEFAULT_ME)}
      />
      <ResultStrip r={result} />

      <div>
        <div className="tabs">
          <button className={`tab ${tab === 'checklist' ? 'on' : ''}`} onClick={() => setTab('checklist')}>
            <span className="tab-ico">✅</span><span>DPS Checklist</span>
          </button>
          <button className={`tab ${tab === 'journey' ? 'on' : ''}`} onClick={() => setTab('journey')}>
            <span className="tab-ico">🏯</span><span>Stat Journey</span>
          </button>
          <button className={`tab ${tab === 'priority' ? 'on' : ''}`} onClick={() => setTab('priority')}>
            <span className="tab-ico">📊</span><span>Priority</span>
          </button>
        </div>
        <div className="tab-body">
          {tab === 'checklist' && <Checklist checks={checks} />}
          {tab === 'journey'   && <Journey rows={journey} />}
          {tab === 'priority'  && <Priority rows={priority} />}
        </div>
      </div>

      <div className="summary">
        <span className="summary-count">ผ่าน {passes}/{total}</span>
        <span className={`summary-state ${passes === total ? 'full' : 'partial'}`}>
          {passes === total ? '✅ ครบแล้ว' : `เหลืออีก ${total - passes} ข้อ`}
        </span>
      </div>
    </div>
  );
}

window.DmgAppV2 = App;
