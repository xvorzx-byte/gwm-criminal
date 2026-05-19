// Damage Calculator — formulas & ideal-stat helpers
// All values are integers from the game UI.
// Formula style: defenses use diminishing returns (stat / (stat + K))
// "Ideal" = where the attacker's offensive stat just cancels the defender's
// matching defense (i.e. effective defense = 0). Anything below is a deficit,
// anything above is wasted.

const K_ARMOR    = 1000; // diminishing-returns constant
const K_SHIELD   = 1000;
const K_ELEMENT  = 1000;
const HIT_K      = 1000; // accuracy diminishing constant
const SCHOOL_K   = 8000;

// ───────────────────────────────────────────────────────────
// Single-shot calculation
// ───────────────────────────────────────────────────────────
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

  // — defense layers, each returns fraction surviving
  const effArmor   = Math.max(0, armor  - armorPen);
  const effShield  = Math.max(0, shield - shieldBk);
  const effSchool  = Math.max(0, schDef - schPress);
  const effElem    = Math.max(0, elemRes - elemAtk);

  const fArmor   = K_ARMOR   / (K_ARMOR   + effArmor);
  const fShield  = K_SHIELD  / (K_SHIELD  + effShield);
  const fElem    = K_ELEMENT / (K_ELEMENT + effElem);
  const fSchool  = SCHOOL_K  / (SCHOOL_K  + effSchool);
  const fDmgRed  = Math.max(0, 1 - dmgRed / 100);

  // — surviving %
  const survArmor  = fArmor;
  const survShield = fShield;
  const survElem   = fElem;
  const survSchool = fSchool;
  const survDR     = fDmgRed;

  // — apply in order: shield → armor → element → school → flat DR
  const base = atk;
  const afterShield = base * survShield;
  const afterArmor  = afterShield * survArmor;
  const afterElem   = afterArmor  * survElem;
  const afterSchool = afterElem   * survSchool;
  const normal      = afterSchool * survDR;

  // — per-layer damage absorbed (for the breakdown bar)
  const cutShield   = base        - afterShield;
  const cutArmor    = afterShield - afterArmor;
  const cutElement  = afterArmor  - afterElem;
  const cutSchool   = afterElem   - afterSchool;
  const cutDmgRed   = afterSchool - normal;

  // — hit rate (diminishing). Effective miss when accuracy << dodge.
  const effHit = accuracy - dodge;
  let hitRate;
  if (effHit >= 0) {
    hitRate = 0.95 + 0.05 * (effHit / (effHit + HIT_K)); // caps near 100%
  } else {
    hitRate = Math.max(0.05, 0.95 + effHit / (Math.abs(effHit) + HIT_K) * 0.9);
  }
  hitRate = Math.max(0.05, Math.min(1, hitRate));

  // — crit: chance is %-based, defender's critRes subtracts
  const effCritChance = Math.max(0, Math.min(100, crit - critRes)) / 100;
  // — defender dmgRed already applied. critDmg multiplier on top.
  const critMult = 1 + Math.max(0, critDmg) / 100;
  const critHit  = normal * critMult;

  // — expected damage per attack attempt (accounting for miss + crit + normal)
  const perCritHit   = critHit;
  const perNormalHit = normal;
  const expected = hitRate * (effCritChance * critHit + (1 - effCritChance) * normal);

  return {
    inputs: { me, enemy },
    effective: { armor: effArmor, shield: effShield, school: effSchool, element: effElem },
    hitRate,
    critChance: effCritChance,
    critMult,
    normal: perNormalHit,
    crit: perCritHit,
    expected,
    breakdown: {
      base,
      cutShield, cutArmor, cutElement, cutSchool, cutDmgRed,
      delivered: normal,
    },
  };
}

// ───────────────────────────────────────────────────────────
// "Ideal stat" — value of attacker stat that fully cancels matching defense
// Returns { ideal, status: 'under'|'perfect'|'over', delta }
// "perfect" band = within ±5% of ideal (or absolute 50 units, whichever is larger)
// ───────────────────────────────────────────────────────────
function idealFor(myVal, enemyVal) {
  const ideal = enemyVal;
  const delta = myVal - ideal;
  const band  = Math.max(50, ideal * 0.05);
  let status;
  if (Math.abs(delta) <= band) status = 'perfect';
  else if (delta < 0)          status = 'under';
  else                         status = 'over';
  return { ideal, delta, status, band };
}

function idealAccuracy(myAcc, enemyDodge) {
  // need enough accuracy to hit reliably; 95% threshold
  const target = enemyDodge + 200; // pad so we sit comfortably above
  const delta = myAcc - target;
  const band  = Math.max(50, target * 0.05);
  let status;
  if (Math.abs(delta) <= band) status = 'perfect';
  else if (delta < 0)          status = 'under';
  else                         status = 'over';
  return { ideal: target, delta, status, band };
}

// ───────────────────────────────────────────────────────────
// Marginal value: simulate +100 on each attacker stat and rank by ΔExpected
// ───────────────────────────────────────────────────────────
function marginalValue(me, enemy, baseRes) {
  const stats = [
    { key: 'atk',      label: 'ATK',        plus: 100 },
    { key: 'armorPen', label: 'เจาะเกราะ',    plus: 100 },
    { key: 'shieldBk', label: 'ทำลายโล่',     plus: 100 },
    { key: 'schPress', label: 'ข่มสำนัก',      plus: 100 },
    { key: 'elemAtk',  label: 'โจมตีธาตุ',     plus: 100 },
    { key: 'acc',      label: 'แม่นยำ',       plus: 100 },
    { key: 'crit',     label: 'คริติคอล',     plus: 1 },   // crit is %, +1%
    { key: 'critDmg',  label: 'ดาเมจคริ',     plus: 5 },   // +5%
  ];
  return stats.map(s => {
    const next = { ...me, [s.key]: (+me[s.key] || 0) + s.plus };
    const r = calcDamage(next, enemy);
    const delta = r.expected - baseRes.expected;
    return { ...s, delta, deltaPct: baseRes.expected ? delta / baseRes.expected * 100 : 0 };
  }).sort((a, b) => b.delta - a.delta);
}

window.calcDamage = calcDamage;
window.idealFor = idealFor;
window.idealAccuracy = idealAccuracy;
window.marginalValue = marginalValue;
