// v2 logic — calibrated formulas + thresholds + DPS checklist
// Calibrated so the default values match the screenshot numbers closely.

// ─── tuneables ──────────────────────────────────────────────────────────
const K_DEF = 6000;       // diminishing-returns K for armor / shield / school
const K_ELEM = 1500;      // element K (smaller — element is more decisive)
const ACC_PAD = 3;        // accuracy "cap" sits this far above enemy dodge

// "ideal" caps for each stat — derived from enemy values
function idealArmorPen(armor)   { return Math.round(armor * 0.27); }      // 4294 → 1164
function idealElement(res)      { return Math.round(res * 3.01); }         // 680  → 2049
function shieldHalf1(shield)    { return Math.round(shield / 3) + 1; }    // ⅓+1
function shieldHalf2(shield)    { return Math.round(shield / 2); }        // ½
function accuracyCap(dodge)     { return dodge + ACC_PAD; }
function critToChance(crit, critRes) {
  // approximate: crit stat / 22 gives % chance, capped at 90%
  // base chance reduced by enemy's critRes / 4830 (% of crit)
  const baseChance = Math.min(90, crit / 22);     // 1518/22 ≈ 69%
  const reductionPct = (critRes / 4830) * 100;     // 894/4830 ≈ 18.5%
  const effective = baseChance * (1 - reductionPct / 100);
  return { effective: Math.max(0, effective), baseChance, reductionPct };
}

// ─── core damage calc ──────────────────────────────────────────────────
function calcDamage(me, enemy) {
  const atk      = +me.atk      || 0;
  const armorPen = +me.armorPen || 0;
  const shieldBk = +me.shieldBk || 0;
  const schPress = +me.schPress || 0;
  const elemAtk  = +me.elemAtk  || 0;
  const accuracy = +me.acc      || 0;
  const crit     = +me.crit     || 0;
  const critDmg  = +me.critDmg  || 0;

  const armor    = +enemy.armor   || 0;
  const shield   = +enemy.shield  || 0;
  const schDef   = +enemy.schDef  || 0;
  const elemRes  = +enemy.elemRes || 0;
  const dodge    = +enemy.dodge   || 0;
  const dmgRed   = +enemy.dmgRed  || 0;
  const critRes  = +enemy.critRes || 0;

  const effArmor   = Math.max(0, armor  - armorPen);
  const effShield  = Math.max(0, shield - shieldBk);
  const effSchool  = Math.max(0, schDef - schPress);
  const effElem    = Math.max(0, elemRes - elemAtk);

  const fArmor   = K_DEF  / (K_DEF  + effArmor);
  const fShield  = K_DEF  / (K_DEF  + effShield);
  const fSchool  = K_DEF  / (K_DEF  + effSchool);
  const fElem    = K_ELEM / (K_ELEM + effElem);
  const fDmgRed  = Math.max(0, 1 - dmgRed / 100);

  const base = atk;
  const afterShield = base * fShield;
  const afterArmor  = afterShield * fArmor;
  const afterElem   = afterArmor  * fElem;
  const afterSchool = afterElem   * fSchool;
  const normal      = afterSchool * fDmgRed;

  const cutShield   = base        - afterShield;
  const cutArmor    = afterShield - afterArmor;
  const cutElement  = afterArmor  - afterElem;
  const cutSchool   = afterElem   - afterSchool;
  const cutDmgRed   = afterSchool - normal;

  // accuracy → hit %. If acc >= dodge → 100%; below: 95% baseline scaling
  let hitRate;
  if (accuracy >= dodge) hitRate = 1;
  else {
    const deficit = dodge - accuracy;
    hitRate = Math.max(0.05, 1 - deficit / (deficit + 1000) * 0.6);
  }

  const critInfo = critToChance(crit, critRes);
  const critChance = critInfo.effective / 100;
  // crit multiplier: 1 + critDmg% (already a % over normal)
  const critMult = 1 + Math.max(0, critDmg) / 100;
  const critHit = normal * critMult;

  const expected = hitRate * (critChance * critHit + (1 - critChance) * normal);

  return {
    me, enemy,
    hitRate,
    critChance,
    critInfo,
    critMult,
    normal,
    crit: critHit,
    expected,
    breakdown: {
      base,
      cutShield, cutArmor, cutElement, cutSchool, cutDmgRed,
      delivered: normal,
    },
  };
}

// ─── per-input contextual hint ─────────────────────────────────────────
// returns { tone: 'good'|'over'|'under'|'info', pill, hint, target }
function hintFor(key, me, enemy) {
  switch (key) {
    case 'atk': {
      return { tone: 'info', pill: null, hint: 'ไม่มี cap · เพิ่มได้เรื่อยๆ', target: null };
    }
    case 'armorPen': {
      const ideal = idealArmorPen(+enemy.armor || 0);
      const cur = +me.armorPen || 0;
      const gap = ideal - cur;
      if (cur >= ideal) {
        return { tone: 'good', pill: '✅ ดี', hint: `เกิน +${cur - ideal} หน่วย`, target: ideal };
      }
      return { tone: 'under', pill: null, hint: `ยังขาด ${gap} หน่วย`, target: ideal };
    }
    case 'shieldBk': {
      const shield = +enemy.shield || 0;
      const h1 = shieldHalf1(shield);
      const h2 = shieldHalf2(shield);
      const cur = +me.shieldBk || 0;
      if (cur >= h2) {
        return { tone: 'good', pill: '✅ ดี (½–½)', hint: `เกิน ½ แล้ว +${cur - h2}`, target: h2 };
      }
      if (cur >= h1) {
        return { tone: 'good', pill: '✅ ดี (½)', hint: `✅ ข้าม ⅓ แล้ว (เพิ่มได้ถึง ½ อีก ${h2 - cur} หน่วย)`, target: h2 };
      }
      return { tone: 'under', pill: null, hint: `ยังไม่ข้าม ⅓ · ขาด ${h1 - cur} หน่วย`, target: h1 };
    }
    case 'schPress': {
      const schDef = +enemy.schDef || 0;
      const cur = +me.schPress || 0;
      // school is "soft" — 300–800 is enough for most matchups
      if (schDef > 2500 && cur < 800) {
        return { tone: 'info', pill: null, hint: `ศัตรูป้องกัน ${schDef.toLocaleString()} · แพ้ขาด`, target: null };
      }
      if (cur >= 300) {
        return { tone: 'good', pill: '✅ ดี', hint: `อยู่ในช่วง 300–800 พอใช้`, target: null };
      }
      return { tone: 'under', pill: null, hint: `ต่ำกว่า 300 · เพิ่มอีก ${300 - cur}`, target: 300 };
    }
    case 'elemAtk': {
      const ideal = idealElement(+enemy.elemRes || 0);
      const cur = +me.elemAtk || 0;
      const gap = ideal - cur;
      if (cur >= ideal) {
        return { tone: 'good', pill: '✅ ดี', hint: `เกิน +${cur - ideal} หน่วย`, target: ideal };
      }
      return { tone: 'under', pill: null, hint: `ยังน้อยอยู่ ${gap} หน่วย`, target: ideal };
    }
    case 'acc': {
      const cap = accuracyCap(+enemy.dodge || 0);
      const cur = +me.acc || 0;
      const diff = cur - cap;
      if (diff >= 0) {
        return { tone: 'good', pill: `↑ เกิน ${diff}`, hint: `เกินพอ ${diff} หน่วย — ย้ายได้`, target: cap };
      }
      return { tone: 'under', pill: `↓ ขาด ${-diff}`, hint: `ขาด ${-diff} หน่วยจะติด 100%`, target: cap };
    }
    case 'crit': {
      const ci = critToChance(+me.crit || 0, +enemy.critRes || 0);
      const ok = ci.effective >= 60 && (+me.crit || 0) >= 1500;
      if (ok) {
        return { tone: 'good', pill: '✅ ดี', hint: `คริ ${ci.effective.toFixed(1)}% | ศัตรูลดคริ ${ci.reductionPct.toFixed(1)}%`, target: null };
      }
      if ((+me.crit || 0) < 1500) {
        return { tone: 'under', pill: null, hint: `ตำกว่า 1,500 · คริ ${ci.effective.toFixed(1)}% เท่านั้น`, target: 1500 };
      }
      return { tone: 'info', pill: null, hint: `คริ ${ci.effective.toFixed(1)}% | ศัตรูลดคริ ${ci.reductionPct.toFixed(1)}%`, target: null };
    }
    case 'critDmg': {
      const cur = +me.critDmg || 0;
      const pure = 100 + cur * 0.243; // 175 → 142.6% (175 * 0.243 ≈ 42.5)
      return { tone: 'info', pill: null, hint: `คริสุทธิ์ ${pure.toFixed(1)}%`, target: null };
    }
    default:
      return { tone: 'info', pill: null, hint: '', target: null };
  }
}

// ─── DPS checklist — the 5 rules from screenshot ───────────────────────
function runChecklist(me, enemy, result) {
  const armor = +enemy.armor || 0;
  const shield = +enemy.shield || 0;
  const schDef = +enemy.schDef || 0;
  const dodge = +enemy.dodge || 0;

  const cur = {
    atk: +me.atk || 0,
    armorPen: +me.armorPen || 0,
    shieldBk: +me.shieldBk || 0,
    schPress: +me.schPress || 0,
    elemAtk: +me.elemAtk || 0,
    acc: +me.acc || 0,
    crit: +me.crit || 0,
    critDmg: +me.critDmg || 0,
  };

  const checks = [
    {
      id: 'atk',
      title: 'โจมตี (ATK) — เพิ่มได้เรื่อยๆ',
      desc: `ปัจจุบัน ${cur.atk.toLocaleString()} · ไม่มี cap`,
      pass: true,
      value: cur.atk.toLocaleString(),
      tone: 'info',
    },
    {
      id: 'shield',
      title: 'ทำลายโล่ — ข้าม ½ โล่ศัตรู',
      desc: `⅓+1 = ${shieldHalf1(shield).toLocaleString()} | ½ = ${shieldHalf2(shield).toLocaleString()} | ปัจจุบัน ${cur.shieldBk.toLocaleString()}`,
      pass: cur.shieldBk >= shieldHalf1(shield),
      value: cur.shieldBk >= shieldHalf1(shield)
        ? `✓ ${cur.shieldBk.toLocaleString()} (ดี)`
        : `ขาด ${(shieldHalf1(shield) - cur.shieldBk).toLocaleString()}`,
      tone: cur.shieldBk >= shieldHalf1(shield) ? 'good' : 'under',
    },
    {
      id: 'crit',
      title: 'คริ 1,500–2,500 + ดาเมจคริสูง',
      desc: `คริ ${cur.crit.toLocaleString()} → โอกาส ${(result.critChance * 100).toFixed(1)}% | สุทธิ ${(100 + cur.critDmg * 0.243).toFixed(0)}%`,
      pass: cur.crit >= 1500 && result.critChance >= 0.6,
      value: cur.crit >= 1500 ? `✓ ${cur.crit.toLocaleString()}` : `ขาด ${(1500 - cur.crit).toLocaleString()}`,
      tone: cur.crit >= 1500 && result.critChance >= 0.6 ? 'good' : 'under',
    },
    {
      id: 'acc',
      title: 'แม่นยำ — ติดตี 100%',
      desc: `cap ${accuracyCap(dodge).toLocaleString()} | ปัจจุบัน ${cur.acc.toLocaleString()}`,
      pass: cur.acc >= accuracyCap(dodge),
      value: cur.acc >= accuracyCap(dodge)
        ? `✓ 100%`
        : `${(result.hitRate * 100).toFixed(0)}%`,
      tone: cur.acc >= accuracyCap(dodge) ? 'good' : 'under',
    },
    {
      id: 'school',
      title: 'ข่มสำนัก 300–800',
      desc: `ปัจจุบัน ${cur.schPress.toLocaleString()} | ศัตรูป้องกัน ${schDef.toLocaleString()}${schDef > 2500 ? ' → แพ้ขาด' : ''}`,
      pass: cur.schPress >= 300 && cur.schPress <= 800 && schDef <= 2500,
      value: schDef > 2500
        ? `ขาด ${(schDef - cur.schPress).toLocaleString()}`
        : (cur.schPress >= 300
          ? `✓ ${cur.schPress.toLocaleString()}`
          : `ขาด ${300 - cur.schPress}`),
      tone: (cur.schPress >= 300 && cur.schPress <= 800 && schDef <= 2500) ? 'good' : 'under',
    },
  ];
  return checks;
}

// ─── stat journey — milestones per stat ────────────────────────────────
// returns an array of journey rows; each has milestones [{at, label, cleared}]
function statJourney(me, enemy) {
  const ap = +me.armorPen || 0, armor = +enemy.armor || 0;
  const sb = +me.shieldBk || 0, shield = +enemy.shield || 0;
  const ea = +me.elemAtk || 0, res = +enemy.elemRes || 0;
  const ac = +me.acc || 0, dodge = +enemy.dodge || 0;
  const sp = +me.schPress || 0;
  const cr = +me.crit || 0;

  const m = (at, label, cur) => ({ at, label, cleared: cur >= at });

  return [
    {
      key: 'armorPen', label: 'เจาะเกราะ', cur: ap, color: 'var(--gold)',
      milestones: [
        m(Math.round(armor * 0.15), 'เริ่มได้', ap),
        m(idealArmorPen(armor), 'พอดี', ap),
        m(Math.round(armor * 0.45), 'เกินพอ', ap),
      ],
      max: Math.round(armor * 0.5),
    },
    {
      key: 'shieldBk', label: 'ทำลายโล่', cur: sb, color: 'oklch(0.65 0.16 245)',
      milestones: [
        m(shieldHalf1(shield), '⅓ + 1', sb),
        m(shieldHalf2(shield), '½', sb),
      ],
      max: shield,
    },
    {
      key: 'elemAtk', label: 'โจมตีธาตุ', cur: ea, color: 'oklch(0.70 0.18 300)',
      milestones: [
        m(res, 'ล้างต้านธาตุ', ea),
        m(res * 2, 'โบนัส 1x', ea),
        m(idealElement(res), 'พอดี', ea),
      ],
      max: idealElement(res) + 500,
    },
    {
      key: 'acc', label: 'แม่นยำ', cur: ac, color: 'oklch(0.78 0.10 220)',
      milestones: [
        m(dodge, 'เริ่มติด', ac),
        m(accuracyCap(dodge), 'ติด 100%', ac),
      ],
      max: accuracyCap(dodge) + 200,
    },
    {
      key: 'schPress', label: 'ข่มสำนัก', cur: sp, color: 'oklch(0.62 0.14 200)',
      milestones: [
        m(300, 'ขั้นต่ำ', sp),
        m(500, 'พอใช้', sp),
        m(800, 'เพดาน', sp),
      ],
      max: 1200,
    },
    {
      key: 'crit', label: 'คริติคอล', cur: cr, color: 'var(--gold)',
      milestones: [
        m(1500, 'ขั้นต่ำ', cr),
        m(2000, 'ดี', cr),
        m(2500, 'เพดาน', cr),
      ],
      max: 3000,
    },
  ];
}

// ─── priority — marginal +Δ per stat ───────────────────────────────────
function marginalValue(me, enemy, base) {
  const stats = [
    { key: 'atk',      label: 'ATK',         plus: 100 },
    { key: 'armorPen', label: 'เจาะเกราะ',    plus: 100 },
    { key: 'shieldBk', label: 'ทำลายโล่',     plus: 100 },
    { key: 'schPress', label: 'ข่มสำนัก',      plus: 100 },
    { key: 'elemAtk',  label: 'โจมตีธาตุ',     plus: 100 },
    { key: 'acc',      label: 'แม่นยำ',       plus: 100 },
    { key: 'crit',     label: 'คริติคอล',     plus: 100 },
    { key: 'critDmg',  label: 'ดาเมจคริ %',   plus: 5, pct: true },
  ];
  return stats.map(s => {
    const next = { ...me, [s.key]: (+me[s.key] || 0) + s.plus };
    const r = calcDamage(next, enemy);
    const d = r.expected - base.expected;
    return { ...s, delta: d, deltaPct: base.expected ? d / base.expected * 100 : 0 };
  }).sort((a, b) => b.delta - a.delta);
}

window.calcDamage  = calcDamage;
window.hintFor     = hintFor;
window.runChecklist = runChecklist;
window.statJourney = statJourney;
window.marginalValue = marginalValue;
window.idealArmorPen = idealArmorPen;
window.idealElement = idealElement;
window.shieldHalf1 = shieldHalf1;
window.shieldHalf2 = shieldHalf2;
window.accuracyCap = accuracyCap;
window.critToChance = critToChance;
