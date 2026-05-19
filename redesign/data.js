// Shared data + class system for War Board redesigns

const CLASSES = {
  Iron: { name: 'Ironclad',     short: 'Iron', role: 'Tank',     color: '#c8a84b', tc: '#e8c96a' },
  Nigh: { name: 'Nightwaker',   short: 'Nigh', role: 'DPS',      color: '#4a9eca', tc: '#90caf9' },
  Bloo: { name: 'Bloodstorm',   short: 'Bloo', role: 'Tank/DPS', color: '#c0392b', tc: '#ef9a9a' },
  Cele: { name: 'Celestune',    short: 'Cele', role: 'CC',       color: '#5b9bd5', tc: '#a8d3f0' },
  Sylp: { name: 'Sylph',        short: 'Sylp', role: 'Heal',     color: '#d4607a', tc: '#f1a7b8' },
  Numi: { name: 'Numina',       short: 'Numi', role: 'DPS',      color: '#8b5ecb', tc: '#ce93d8' },
  Drag: { name: 'Dragonsvelte', short: 'Drag', role: 'DPS',      color: '#7fb069', tc: '#c5e1a5' },
};

const ROLE_OF = c => CLASSES[c]?.role || 'DPS';

// Members from the CRIMINAL guild screenshot
const TEAMS = [
  { id: 'A1', tier: 'A', members: [
    { name: 'bbellobear', cls: 'Cele', cp: 95 },
    { name: 'LuU',        cls: 'Sylp', cp: 98 },
    { name: 'LhinLhin',   cls: 'Sylp', cp: 92 },
    { name: 'bbellobear', cls: 'Drag', cp: 97 },
    { name: 'คุณเย็นยังเซ', cls: 'Iron', cp: 93 },
    { name: 'T!ME',       cls: 'Bloo', cp: 98 },
  ]},
  { id: 'A2', tier: 'A', members: [
    { name: 'Mesmerize',  cls: 'Sylp', cp: 94 },
    { name: 'JELLYY',     cls: 'Sylp', cp: 95 },
    { name: 'MINTEU',     cls: 'Iron', cp: 97 },
    { name: 'SHUCREAMx',  cls: 'Nigh', cp: 90 },
    { name: 'IDPANDO',    cls: 'Bloo', cp: 98 },
    { name: 'bbellobear', cls: 'Numi', cp: 96 },
  ]},
  { id: 'A3', tier: 'A', warning: 'Heal ขาด 1', members: [
    { name: 'Fei ling',   cls: 'Numi', cp: 96 },
    { name: 'Fei long',   cls: 'Nigh', cp: 100 },
    { name: 'JURAN',      cls: 'Iron', cp: 97 },
    { name: 'Linbing',    cls: 'Bloo', cp: 96 },
    { name: 'เหลยเฟิงหลิน', cls: 'Sylp', cp: 100 },
    { name: 'LO4dingg',   cls: 'Drag', cp: 93 },
  ]},
  { id: 'A4', tier: 'A', members: [
    { name: 'junoo',      cls: 'Nigh', cp: 90 },
    { name: 'JACRAZY',    cls: 'Drag', cp: 94 },
    { name: 'Bakhorin',   cls: 'Sylp', cp: 95 },
    { name: 'LazLo',      cls: 'Iron', cp: 91 },
    { name: 'AKIRA',      cls: 'Numi', cp: 93 },
    { name: 'ห้วอมชมพู',   cls: 'Sylp', cp: 95 },
  ]},
  { id: 'B1', tier: 'B', members: [
    { name: 'จารย์สมแมว',  cls: 'Bloo', cp: 100 },
    { name: 'ไปอวมี',      cls: 'Iron', cp: 96 },
    { name: '蓝龄月',       cls: 'Sylp', cp: 93 },
    { name: 'Wxxn',       cls: 'Drag', cp: 95 },
    { name: '_Fanchan_',  cls: 'Sylp', cp: 93 },
    { name: 'Frenemy',    cls: 'Numi', cp: 98 },
  ]},
  { id: 'B2', tier: 'B', members: [
    { name: 'KHANOMM',    cls: 'Sylp', cp: 94 },
    { name: 'DaNear',     cls: 'Numi', cp: 93 },
    { name: 'Leaf',       cls: 'Drag', cp: 88 },
    { name: 'BEAR FRAME', cls: 'Iron', cp: 97 },
    { name: 'Saphire',    cls: 'Nigh', cp: 97 },
    { name: 'จุ๋ยซิงเซียน', cls: 'Sylp', cp: 93 },
  ]},
  { id: 'B3', tier: 'B', members: [
    { name: 'หยางอันน',     cls: 'Iron', cp: 86 },
    { name: 'Liu Zeping', cls: 'Sylp', cp: 95 },
    { name: 'แมวพระจันทร์', cls: 'Sylp', cp: 92 },
    { name: 'Zhun Luyue', cls: 'Bloo', cp: 94 },
    { name: 'lizjiejie',  cls: 'Numi', cp: 94 },
    { name: 'Pomjiejie',  cls: 'Cele', cp: 97 },
  ]},
  { id: 'C1', tier: 'C', members: [
    { name: 'ZehelZeal',  cls: 'Sylp', cp: 94 },
    { name: 'รอกจอมขมังเวทย์', cls: 'Numi', cp: 97 },
    { name: 'นิ่งหยวนโจว',  cls: 'Iron', cp: 96 },
    { name: 'Sistar',     cls: 'Sylp', cp: 97 },
    { name: 'ลำวเหวินเหริน', cls: 'Bloo', cp: 91 },
    { name: 'Rea Lil Black', cls: 'Cele', cp: 93 },
  ]},
  { id: 'C2', tier: 'C', members: [
    { name: 'มะเมขา',      cls: 'Sylp', cp: 95 },
    { name: 'bbunnybear', cls: 'Numi', cp: 97 },
    { name: 'Pipearl',    cls: 'Nigh', cp: 94 },
    { name: 'Ce cil',     cls: 'Iron', cp: 96 },
    { name: '一布布',       cls: 'Sylp', cp: 93 },
    { name: 'เขียวเปาเปา', cls: 'Sylp', cp: 87 },
  ]},
  { id: 'C3', tier: 'C', members: [
    { name: 'BabyDuck',   cls: 'Sylp', cp: 94 },
    { name: 'ผักกาดหอม',  cls: 'Nigh', cp: 93 },
    { name: 'ส้มจี๊ด',     cls: 'Sylp', cp: 96 },
    { name: 'Seere',      cls: 'Iron', cp: 86 },
    { name: 'ส้มโชกุน',    cls: 'Bloo', cp: 98 },
    { name: '陈Jiangran', cls: 'Numi', cp: 95 },
  ]},
];

// Helpers shared by all directions
const teamCP = t => t.members.reduce((s, m) => s + m.cp, 0);
const teamRoles = t => {
  const r = { Tank: 0, Heal: 0, DPS: 0, CC: 0 };
  t.members.forEach(m => {
    const role = ROLE_OF(m.cls);
    if (role === 'Tank/DPS') { r.Tank += 1; }
    else r[role] = (r[role] || 0) + 1;
  });
  return r;
};
const fmtCP = n => n >= 1000 ? (n / 1000).toFixed(2) + 'M' : n + 'K';

const TOP_CP = Math.max(...TEAMS.map(teamCP));
const BOT_CP = Math.min(...TEAMS.map(teamCP));

Object.assign(window, { CLASSES, ROLE_OF, TEAMS, teamCP, teamRoles, fmtCP, TOP_CP, BOT_CP });
