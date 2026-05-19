// Damage Calculator — UI components & main app
// Theme: dark wuxia. Vermillion + ink + gold. Restrained ornament.

const { useState, useMemo, useRef, useEffect } = React;

// ── default values inspired by typical Sword of Justice numbers ───────────
const DEFAULT_ME = {
  atk: 8500,
  armorPen: 1200,
  shieldBk: 800,
  schPress: 600,
  elemAtk: 1500,
  acc: 2200,
  crit: 45,
  critDmg: 180,
};
const DEFAULT_ENEMY = {
  armor: 1800,
  shield: 1400,
  schDef: 1200,
  elemRes: 2000,
  dodge: 1600,
  dmgRed: 12,
  critRes: 15,
};

// ── attacker / defender stat definitions ──────────────────────────────────
const ATK_STATS = [
  { key: 'atk',      label: 'ATK',          sub: 'พลังโจมตีดิบ',     hint: 'damage base' },
  { key: 'armorPen', label: 'เจาะเกราะ',     sub: 'Armor Pen',       hint: 'vs Armor' },
  { key: 'shieldBk', label: 'ทำลายโล่',      sub: 'Shield Break',    hint: 'vs HP Shield' },
  { key: 'schPress', label: 'ข่มสำนัก',       sub: 'School Pressure', hint: 'vs School Def' },
  { key: 'elemAtk',  label: 'โจมตีธาตุ',      sub: 'Element ATK',     hint: 'vs Element Res' },
  { key: 'acc',      label: 'แม่นยำ',        sub: 'Accuracy',        hint: 'vs Dodge' },
  { key: 'crit',     label: 'คริติคอล',      sub: 'Crit Rate %',     hint: '%', pct: true, max: 100 },
  { key: 'critDmg',  label: 'ดาเมจคริ',      sub: 'Crit Damage %',   hint: '%', pct: true, max: 500 },
];
const DEF_STATS = [
  { key: 'armor',   label: 'เกราะ',          sub: 'Armor' },
  { key: 'shield',  label: 'โล่พลังชี',       sub: 'HP Shield' },
  { key: 'schDef',  label: 'ป้องกันสำนัก',     sub: 'School Defense' },
  { key: 'elemRes', label: 'ต้านทานธาตุ',     sub: 'Element Resist' },
  { key: 'dodge',   label: 'หลบ',           sub: 'Dodge' },
  { key: 'dmgRed',  label: 'ลดดาเมจ %',     sub: 'Damage Reduction', hint: '%', pct: true, max: 95 },
  { key: 'critRes', label: 'ต้านคริ',         sub: 'Crit Resist %',   hint: '%', pct: true, max: 100 },
];

// ── theme colors (also defined as CSS vars in styles) ─────────────────────
const THEME = {
  dmg:    'oklch(0.65 0.21 25)',     // vermillion red
  crit:   'oklch(0.82 0.14 80)',     // gold
  ok:     'oklch(0.72 0.16 145)',    // jade green
  over:   'oklch(0.80 0.15 75)',     // amber yellow
  under:  'oklch(0.72 0.18 18)',     // soft red
};

// ───────────────────────────────────────────────────────────
// Atomic UI
// ───────────────────────────────────────────────────────────
function StatInput({ stat, value, onChange, accent }) {
  const max = stat.max ?? 999999;
  return (
    <label className="stat-input">
      <div className="si-head">
        <span className="si-label">{stat.label}</span>
        {stat.pct && <span className="si-pct">%</span>}
      </div>
      <input
        type="number"
        value={value}
        min="0"
        max={max}
        onChange={(e) => onChange(stat.key, e.target.value)}
        style={{ '--accent': accent }}
      />
      <div className="si-sub">{stat.sub}</div>
    </label>
  );
}

function StatusPill({ status, children }) {
  return <span className={`pill pill-${status}`}>{children}</span>;
}

function IdealCard({ title, sub, myVal, enemyVal, result, unit = '' }) {
  const { ideal, delta, status } = result;
  const statusText = status === 'perfect' ? 'พอดี' : status === 'over' ? 'มากเกิน' : 'น้อยเกิน';
  const deltaText = (delta >= 0 ? '+' : '') + Math.round(delta) + unit;
  return (
    <div className={`ideal-card ideal-${status}`}>
      <div className="ic-head">
        <div className="ic-title">{title}</div>
        <StatusPill status={status}>{statusText}</StatusPill>
      </div>
      <div className="ic-sub">{sub}</div>
      <div className="ic-main">
        <div className="ic-now">
          <span className="ic-now-v">{Math.round(myVal)}{unit}</span>
          <span className="ic-now-l">ของเรา</span>
        </div>
        <div className="ic-arrow">→</div>
        <div className="ic-target">
          <span className="ic-target-v">{Math.round(ideal)}{unit}</span>
          <span className="ic-target-l">เป้าหมาย</span>
        </div>
      </div>
      <div className="ic-delta">
        <span className="ic-delta-l">ส่วนต่าง</span>
        <span className="ic-delta-v">{deltaText}</span>
      </div>
    </div>
  );
}

function BreakdownBar({ breakdown }) {
  const total = breakdown.base || 1;
  const segs = [
    { key: 'cutShield',  label: 'โล่',     color: 'oklch(0.65 0.16 245)' },
    { key: 'cutArmor',   label: 'เกราะ',   color: 'oklch(0.65 0.13 60)' },
    { key: 'cutElement', label: 'ธาตุ',    color: 'oklch(0.70 0.18 300)' },
    { key: 'cutSchool',  label: 'สำนัก',   color: 'oklch(0.62 0.14 200)' },
    { key: 'cutDmgRed',  label: 'ลด.DMG', color: 'oklch(0.55 0.06 280)' },
    { key: 'delivered',  label: 'เข้าจริง', color: THEME.dmg, hero: true },
  ];

  return (
    <div className="bd">
      <div className="bd-bar">
        {segs.map(s => {
          const v = breakdown[s.key] || 0;
          const pct = (v / total) * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={s.key}
              className={`bd-seg ${s.hero ? 'bd-hero' : ''}`}
              style={{ width: `${pct}%`, background: s.color }}
              title={`${s.label} ${pct.toFixed(1)}%`}
            >
              {pct > 6 && <span className="bd-seg-l">{s.label}</span>}
            </div>
          );
        })}
      </div>
      <div className="bd-legend">
        {segs.map(s => {
          const v = breakdown[s.key] || 0;
          const pct = (v / total) * 100;
          return (
            <div key={s.key} className="bd-l">
              <span className="bd-l-sw" style={{ background: s.color }} />
              <span className="bd-l-n">{s.label}</span>
              <span className="bd-l-v">{Math.round(v)}</span>
              <span className="bd-l-pct">({pct.toFixed(1)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriorityList({ rows }) {
  const max = Math.max(...rows.map(r => Math.max(0, r.delta)), 1);
  return (
    <div className="prio-list">
      {rows.map((r, i) => {
        const pos = r.delta > 0;
        const w = pos ? (r.delta / max) * 100 : 0;
        return (
          <div className={`prio-row ${i === 0 ? 'prio-top' : ''}`} key={r.key}>
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

// ───────────────────────────────────────────────────────────
// Image upload — sends to Claude to OCR stats
// ───────────────────────────────────────────────────────────
function ImageUpload({ onParsed, side }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | reading | error
  const [msg, setMsg] = useState('');

  async function handleFile(file) {
    if (!file) return;
    setStatus('reading');
    setMsg('กำลังอ่านค่าจากภาพ...');
    try {
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const base64 = dataUrl.split(',')[1];
      const mediaType = file.type || 'image/png';

      const fields = side === 'attacker'
        ? ATK_STATS.map(s => s.key)
        : DEF_STATS.map(s => s.key);
      const labels = side === 'attacker'
        ? ATK_STATS.map(s => `${s.key}: ${s.label} (${s.sub})`)
        : DEF_STATS.map(s => `${s.key}: ${s.label} (${s.sub})`);

      const prompt =
        `อ่าน stat ของตัวละครจากภาพนี้ ตอบเป็น JSON เท่านั้น ไม่ต้องอธิบาย\n` +
        `ฝั่ง: ${side === 'attacker' ? 'ผู้โจมตี (DPS)' : 'ศัตรู Tank'}\n` +
        `Key ที่ต้องการ:\n${labels.join('\n')}\n` +
        `ตอบเป็น object เช่น {"${fields[0]}": 1234, "${fields[1]}": 567, ...}\n` +
        `ถ้าหาค่าไม่เจอ ให้ใช้ null. ตัวเลขเท่านั้น ห้ามมีเครื่องหมาย %.`;

      const reply = await window.claude.complete({
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: prompt },
          ],
        }],
      });

      // strip ```json fences if present
      const cleaned = reply.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      const filtered = {};
      fields.forEach(f => {
        if (parsed[f] != null && !isNaN(parsed[f])) filtered[f] = +parsed[f];
      });
      if (!Object.keys(filtered).length) throw new Error('ไม่พบ stat ในภาพ');
      onParsed(filtered);
      setStatus('idle');
      setMsg(`อ่านได้ ${Object.keys(filtered).length} ค่า`);
      setTimeout(() => setMsg(''), 2400);
    } catch (e) {
      setStatus('error');
      setMsg('อ่านภาพไม่สำเร็จ — กรอกค่าด้วยมือได้');
      setTimeout(() => { setStatus('idle'); setMsg(''); }, 3000);
    }
  }

  return (
    <div className="ocr">
      <button
        type="button"
        className="ocr-btn"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'reading'}
      >
        <span className="ocr-ico">📷</span>
        {status === 'reading' ? 'กำลังอ่าน...' : 'อัปโหลดภาพ stat'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {msg && <span className={`ocr-msg ${status}`}>{msg}</span>}
    </div>
  );
}

function StatPanel({ side, title, subtitle, stats, values, onChange, accent }) {
  const setMany = (patch) => {
    Object.entries(patch).forEach(([k, v]) => onChange(k, v));
  };
  return (
    <section className={`panel panel-${side}`} style={{ '--accent': accent }}>
      <header className="panel-h">
        <div className="panel-h-l">
          <span className="panel-tag">{side === 'me' ? '攻' : '守'}</span>
          <div>
            <h2 className="panel-title">{title}</h2>
            <div className="panel-sub">{subtitle}</div>
          </div>
        </div>
        <ImageUpload side={side === 'me' ? 'attacker' : 'defender'} onParsed={setMany} />
      </header>
      <div className="stat-grid">
        {stats.map(s => (
          <StatInput
            key={s.key}
            stat={s}
            value={values[s.key] ?? ''}
            onChange={onChange}
            accent={accent}
          />
        ))}
      </div>
    </section>
  );
}

// ───────────────────────────────────────────────────────────
// Main App
// ───────────────────────────────────────────────────────────
function App() {
  const [me, setMe] = useState(DEFAULT_ME);
  const [enemy, setEnemy] = useState(DEFAULT_ENEMY);

  const updateMe = (k, v) => setMe(s => ({ ...s, [k]: v }));
  const updateEnemy = (k, v) => setEnemy(s => ({ ...s, [k]: v }));

  const result = useMemo(() => calcDamage(me, enemy), [me, enemy]);
  const ideals = useMemo(() => ({
    elemAtk:  idealFor(+me.elemAtk  || 0, +enemy.elemRes || 0),
    armorPen: idealFor(+me.armorPen || 0, +enemy.armor   || 0),
    shieldBk: idealFor(+me.shieldBk || 0, +enemy.shield  || 0),
    acc:      idealAccuracy(+me.acc || 0, +enemy.dodge   || 0),
  }), [me, enemy]);
  const priority = useMemo(() => marginalValue(me, enemy, result), [me, enemy, result]);

  // crit insight numbers
  const critChancePct = (result.critChance * 100);
  const critReducedBy = Math.max(0, +enemy.critRes || 0);
  const realCritMult = result.critMult;

  return (
    <div className="app">
      <header className="masthead">
        <div className="mh-l">
          <div className="seal">劍</div>
          <div>
            <h1 className="mh-title">Damage Calculator <span className="mh-sub-cn">伤害计算</span></h1>
            <div className="mh-sub">Sword of Justice · ตัวช่วยคำนวณดาเมจ DPS → Tank</div>
          </div>
        </div>
        <div className="mh-summary">
          <div className="mh-stat">
            <div className="mh-stat-l">เฉลี่ยต่อตี</div>
            <div className="mh-stat-v dmg">{Math.round(result.expected).toLocaleString()}</div>
          </div>
          <div className="mh-stat">
            <div className="mh-stat-l">Hit</div>
            <div className="mh-stat-v">{(result.hitRate * 100).toFixed(1)}%</div>
          </div>
          <div className="mh-stat">
            <div className="mh-stat-l">Crit</div>
            <div className="mh-stat-v crit">{critChancePct.toFixed(1)}%</div>
          </div>
        </div>
      </header>

      {/* — Section 1: inputs — */}
      <div className="cols">
        <StatPanel
          side="me"
          title="ฝั่งเรา (DPS)"
          subtitle="Attacker · 攻击方"
          stats={ATK_STATS}
          values={me}
          onChange={updateMe}
          accent={THEME.dmg}
        />
        <StatPanel
          side="en"
          title="ฝั่งศัตรู (Tank)"
          subtitle="Defender · 防御方"
          stats={DEF_STATS}
          values={enemy}
          onChange={updateEnemy}
          accent="oklch(0.60 0.12 250)"
        />
      </div>

      {/* — Section 2: ideal stats — */}
      <section className="section">
        <SectionHead chinese="目标值" thai="เป้าหมาย stat ที่พอดี" hint="ค่าที่ทำให้ป้องกันของศัตรู = 0" />
        <div className="ideals">
          <IdealCard title="โจมตีธาตุ"  sub="vs ต้านทานธาตุ"   myVal={+me.elemAtk}  enemyVal={+enemy.elemRes} result={ideals.elemAtk} />
          <IdealCard title="เจาะเกราะ"   sub="vs เกราะ"        myVal={+me.armorPen} enemyVal={+enemy.armor}   result={ideals.armorPen} />
          <IdealCard title="ทำลายโล่"    sub="vs โล่พลังชี"      myVal={+me.shieldBk} enemyVal={+enemy.shield}  result={ideals.shieldBk} />
          <IdealCard title="แม่นยำ"      sub="vs หลบ (+200)"   myVal={+me.acc}      enemyVal={+enemy.dodge}   result={ideals.acc} />
        </div>
      </section>

      {/* — Section 3: results — */}
      <section className="section">
        <SectionHead chinese="伤害结果" thai="ผลลัพธ์ดาเมจ" hint="หลังหักทุกการป้องกัน" />
        <div className="result-grid">
          <div className="rcard rcard-normal">
            <div className="rc-lbl">ดาเมจปกติ / ตี</div>
            <div className="rc-val">{Math.round(result.normal).toLocaleString()}</div>
            <div className="rc-sub">หลังหักโล่ + เกราะ + ธาตุ + สำนัก + ลดดาเมจ</div>
          </div>
          <div className="rcard rcard-crit">
            <div className="rc-lbl">ดาเมจคริ / ตี</div>
            <div className="rc-val">{Math.round(result.crit).toLocaleString()}</div>
            <div className="rc-sub">× {result.critMult.toFixed(2)} ครั้ง</div>
          </div>
          <div className="rcard rcard-hit">
            <div className="rc-lbl">Hit Rate</div>
            <div className="rc-val">{(result.hitRate * 100).toFixed(1)}%</div>
            <div className="rc-sub">แม่น {+me.acc} vs หลบ {+enemy.dodge}</div>
          </div>
          <div className="rcard rcard-avg">
            <div className="rc-lbl">เฉลี่ยรวมทุกกรณี</div>
            <div className="rc-val">{Math.round(result.expected).toLocaleString()}</div>
            <div className="rc-sub">รวม miss + normal + crit</div>
          </div>
        </div>

        <div className="bd-wrap">
          <div className="bd-head">
            <span className="bd-title">เส้นทางดาเมจ — ATK {Math.round(result.breakdown.base).toLocaleString()} → เข้าจริง {Math.round(result.breakdown.delivered).toLocaleString()}</span>
            <span className="bd-pct">รอด {((result.breakdown.delivered / result.breakdown.base) * 100).toFixed(1)}%</span>
          </div>
          <BreakdownBar breakdown={result.breakdown} />
        </div>
      </section>

      {/* — Section 4: crit + priority — */}
      <div className="cols">
        <section className="section section-fill">
          <SectionHead chinese="暴击分析" thai="วิเคราะห์คริ" hint="" />
          <div className="crit-grid">
            <div className="crit-cell">
              <div className="cc-lbl">โอกาสคริ</div>
              <div className="cc-val crit">{critChancePct.toFixed(1)}%</div>
              <div className="cc-bar"><span style={{ width: `${critChancePct}%` }} /></div>
            </div>
            <div className="crit-cell">
              <div className="cc-lbl">ต้านคริของศัตรู</div>
              <div className="cc-val under">−{critReducedBy}%</div>
              <div className="cc-sub">หักโอกาสคริ {+me.crit}% → {critChancePct.toFixed(1)}%</div>
            </div>
            <div className="crit-cell">
              <div className="cc-lbl">ดาเมจคริที่เข้าจริง</div>
              <div className="cc-val dmg">{Math.round(result.crit).toLocaleString()}</div>
              <div className="cc-sub">×{realCritMult.toFixed(2)} จาก {Math.round(result.normal).toLocaleString()}</div>
            </div>
          </div>
        </section>

        <section className="section section-fill">
          <SectionHead chinese="性价比" thai="ลำดับ stat ที่คุ้มเพิ่มที่สุด" hint="ผลลัพธ์เมื่อเพิ่ม +หน่วยที่ระบุ" />
          <PriorityList rows={priority} />
        </section>
      </div>

      <footer className="foot">
        ค่าทดสอบเริ่มต้นถูกใส่ไว้ให้แล้ว · แก้ตัวเลขเพื่อดูผลทันที · กดอัปโหลดภาพให้ AI อ่าน stat แทนการพิมพ์
      </footer>
    </div>
  );
}

function SectionHead({ chinese, thai, hint }) {
  return (
    <div className="sec-h">
      <span className="sec-h-cn">{chinese}</span>
      <span className="sec-h-th">{thai}</span>
      {hint && <span className="sec-h-hint">{hint}</span>}
    </div>
  );
}

window.DmgApp = App;
