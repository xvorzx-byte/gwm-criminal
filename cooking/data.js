// ── Cooking Guide data ───────────────────────────────────────────────
// Source: gwm-cooking-data.json (Thai). All display labels kept as-is.

const INGREDIENTS = {
  6:  { id: 6,  name: "ปลาสดระดับหนึ่ง",            cat: "fish",      catLabel: "ปลา",        price: 0,  limit: 0,   src: "ตกปลา / ซื้อขาย",         tier: 1 },
  8:  { id: 8,  name: "ข้าวน้ำ",                    cat: "grain",     catLabel: "ธัญพืช",     price: 38, limit: 300, src: "ร้านค้า",                tier: 0 },
  10: { id: 10, name: "อาหารสดจากแม่น้ำระดับสอง",   cat: "fish",      catLabel: "ปลา",        price: 0,  limit: 0,   src: "ตกปลา / ซื้อขาย",         tier: 2, stationLevel: 6 },
  18: { id: 18, name: "อาหารสดจากแม่น้ำระดับสาม",   cat: "fish",      catLabel: "ปลา",        price: 0,  limit: 0,   src: "ตกปลา / ซื้อขาย",         tier: 3, stationLevel: 11 },
  20: { id: 20, name: "ดอกไม้แห่งสี่ฤดู",           cat: "flower",    catLabel: "ดอกไม้",     price: 38, limit: 300, src: "ร้านค้า",                tier: 0 },
  23: { id: 23, name: "เนื้อสัตว์ปีก",              cat: "meat",      catLabel: "เนื้อสัตว์", price: 38, limit: 300, src: "ร้านค้า",                tier: 0 },
  27: { id: 27, name: "ข้าวสาลี",                   cat: "grain",     catLabel: "ธัญพืช",     price: 38, limit: 300, src: "ร้านค้า",                tier: 0 },
  33: { id: 33, name: "ใบอ่อนและยอดใหม่",           cat: "veg",       catLabel: "ผัก",        price: 38, limit: 300, src: "ร้านค้า",                tier: 0 },
  36: { id: 36, name: "ผักและผลไม้",                cat: "veg",       catLabel: "ผัก",        price: 38, limit: 300, src: "ร้านค้า",                tier: 0 },
  37: { id: 37, name: "เครื่องปรุง",                cat: "spice",     catLabel: "เครื่องปรุง",price: 38, limit: 500, src: "ร้านค้า",                tier: 0 },
  40: { id: 40, name: "เนื้อสัตว์",                 cat: "meat",      catLabel: "เนื้อสัตว์", price: 38, limit: 300, src: "ร้านค้า",                tier: 0 },
};

const CAT_LABEL = {
  fish:   "ปลา",
  grain:  "ธัญพืช",
  meat:   "เนื้อสัตว์",
  veg:    "ผัก",
  flower: "ดอกไม้",
  spice:  "เครื่องปรุง",
};

const METHODS = {
  "ผัด":     { id: "stir_fry", name: "ผัด",     hue: 25,  glyph: "fire"    },
  "ตากลม":   { id: "air_dry",  name: "ตากลม",   hue: 200, glyph: "wind"    },
  "แช่แข็ง": { id: "freeze",   name: "แช่แข็ง", hue: 240, glyph: "ice"     },
  "นึ่ง":    { id: "steam",    name: "นึ่ง",    hue: 165, glyph: "steam"   },
  "การทอด":  { id: "fry",      name: "การทอด",  hue: 75,  glyph: "lightning" },
  "การอบ":   { id: "bake",     name: "การอบ",   hue: 45,  glyph: "stone"   },
};

const RECIPES = [
  { id: 1,  name: "ปลาราดซอสเปรี้ยวหวานซีหู",      lvl: 1,  method: "ผัด",     ing: [[37,2],[6,2]],          batch: 1  },
  { id: 2,  name: "ปลาย่างฝออิ้น",                lvl: 1,  method: "ผัด",     ing: [[6,3],[37,1]],          batch: 1  },
  { id: 3,  name: "ซุปไขกระดูก",                  lvl: 1,  method: "ผัด",     ing: [[37,1],[27,3]],         batch: 1  },
  { id: 4,  name: "นกขมิ้นทอด",                   lvl: 1,  method: "ตากลม",   ing: [[23,2],[37,1],[27,1]],  batch: 1  },
  { id: 5,  name: "ปลาเงินแล่สด",                 lvl: 1,  method: "แช่แข็ง", ing: [[37,3],[6,1]],          batch: 1  },
  { id: 6,  name: "ขนมปิ้งถาง",                   lvl: 1,  method: "นึ่ง",    ing: [[37,2],[27,2]],         batch: 1  },
  { id: 7,  name: "ซุปปลาหญ้าสี่รส",              lvl: 1,  method: "ผัด",     ing: [[37,3],[6,1]],          batch: 10 },
  { id: 8,  name: "ซุปกุ้งห้าสุข",                lvl: 6,  method: "ผัด",     ing: [[37,3],[10,1]],         batch: 10 },
  { id: 9,  name: "บะหมี่หลิงอิ้น",               lvl: 1,  method: "ผัด",     ing: [[37,1],[8,3]],          batch: 1  },
  { id: 10, name: "ปลาโระพา",                     lvl: 1,  method: "ผัด",     ing: [[37,2],[8,2]],          batch: 1  },
  { id: 11, name: "น้ำแข็งใสเกล็ดหิมะ",           lvl: 1,  method: "แช่แข็ง", ing: [[37,3],[27,1]],         batch: 1  },
  { id: 12, name: "ปลาดองเหล้า",                  lvl: 1,  method: "ตากลม",   ing: [[6,2],[37,1],[27,1]],   batch: 1  },
  { id: 13, name: "ไก่ตัมสับชิ้น",                lvl: 1,  method: "แช่แข็ง", ing: [[37,1],[23,3]],         batch: 1  },
  { id: 14, name: "เป็ดย่าง",                     lvl: 1,  method: "ตากลม",   ing: [[37,2],[23,2]],         batch: 1  },
  { id: 15, name: "ขนมหูปึ้ง",                    lvl: 1,  method: "การทอด",  ing: [[37,3],[8,1]],          batch: 1  },
  { id: 16, name: "ไก่อบ",                        lvl: 1,  method: "การอบ",   ing: [[37,3],[23,1]],         batch: 1  },
  { id: 17, name: "เส้นบะหมี่เปลือกต้นทง",        lvl: 6,  method: "ผัด",     ing: [[40,1],[23,1],[8,1],[37,1]], batch: 1 },
  { id: 18, name: "บะหมี่แดง",                    lvl: 6,  method: "ผัด",     ing: [[10,1],[8,2],[37,1]],   batch: 1  },
  { id: 19, name: "หม้อไฟแสงอรุณ",                lvl: 6,  method: "ผัด",     ing: [[37,3],[40,1]],         batch: 1  },
  { id: 20, name: "ของสดจากป่า",                  lvl: 6,  method: "ผัด",     ing: [[37,1],[36,3]],         batch: 1  },
  { id: 21, name: "ผักดองแตง",                    lvl: 6,  method: "ผัด",     ing: [[10,1],[23,1],[36,1],[37,1]], batch: 1 },
  { id: 22, name: "หน่อไม้ตุ๋นเหล้า",             lvl: 6,  method: "ผัด",     ing: [[27,1],[36,2],[37,1]],  batch: 1  },
  { id: 23, name: "บะหมี่หน่อไม้ฤดูใบไม้ผลิ",     lvl: 6,  method: "ผัด",     ing: [[40,1],[8,1],[36,1],[37,1]], batch: 1 },
  { id: 24, name: "หน่อไม้เปรี้ยวสูตรร้านหลี่",   lvl: 6,  method: "ตากลม",   ing: [[37,3],[36,1]],         batch: 1  },
  { id: 25, name: "ห่อภูเขาทะเล",                 lvl: 6,  method: "นึ่ง",    ing: [[10,1],[6,1],[36,1],[37,1]], batch: 1 },
  { id: 26, name: "บะหมี่เม้นจ่อแห่งฉือโจว",      lvl: 6,  method: "นึ่ง",    ing: [[40,1],[8,2],[37,1]],   batch: 1  },
  { id: 27, name: "ขนมอบกรอบสีเหลือง",            lvl: 6,  method: "การอบ",   ing: [[8,2],[36,1],[37,1]],   batch: 1  },
  { id: 28, name: "ทองคำตุ๋นหยก",                 lvl: 6,  method: "การทอด",  ing: [[8,1],[27,1],[36,1],[37,1]], batch: 1 },
  { id: 29, name: "ซี่โครงหมูอบกระเทียม",         lvl: 6,  method: "การทอด",  ing: [[37,2],[40,2]],         batch: 1  },
  { id: 30, name: "ซุปปลาปักเป้าหน่ออ้อ",         lvl: 11, method: "ผัด",     ing: [[6,1],[33,1],[37,2]],   batch: 1  },
  { id: 31, name: "ซุปกุ้งและผักชุน",             lvl: 11, method: "ผัด",     ing: [[10,1],[33,2],[37,1]],  batch: 1  },
  { id: 32, name: "ซุปตงโพ",                      lvl: 11, method: "ผัด",     ing: [[33,2],[36,1],[37,1]],  batch: 1  },
  { id: 33, name: "กุ้งผัดหลงจิ้ง",               lvl: 1,  method: "ผัด",     ing: [[10,2],[33,1],[37,1]],  batch: 1  },
  { id: 34, name: "บะหมี่เย็นใบสน",               lvl: 11, method: "แช่แข็ง", ing: [[8,2],[33,1],[37,1]],   batch: 1  },
  { id: 35, name: "ปูสด",                         lvl: 11, method: "แช่แข็ง", ing: [[37,2],[18,2]],         batch: 1  },
  { id: 36, name: "ถุงจอหงวน",                    lvl: 11, method: "นึ่ง",    ing: [[40,1],[8,1],[20,1],[37,1]], batch: 1 },
  { id: 37, name: "ซาลาเปาไส้ไข่ปู",              lvl: 11, method: "นึ่ง",    ing: [[18,1],[8,1],[20,1],[37,1]], batch: 1 },
  { id: 38, name: "ปลาห่อเม็ดบัว",                lvl: 11, method: "นึ่ง",    ing: [[6,1],[8,1],[20,1],[37,1]],  batch: 1 },
  { id: 39, name: "ขนมไหว้พระจันทร์",             lvl: 11, method: "การอบ",   ing: [[8,2],[20,1],[37,1]],   batch: 1  },
  { id: 40, name: "ใบหยกกรอบ",                    lvl: 11, method: "การอบ",   ing: [[8,1],[20,1],[37,2]],   batch: 1  },
  { id: 41, name: "เป็ดย่างคู่",                  lvl: 11, method: "การทอด",  ing: [[23,2],[20,1],[37,1]],  batch: 1  },
  { id: 42, name: "ขนมดอกบัวสามเซียน",            lvl: 11, method: "การทอด",  ing: [[8,1],[20,2],[37,1]],   batch: 1  },
  { id: 43, name: "ซุปมันปูหกอย่าง",              lvl: 11, method: "ผัด",     ing: [[37,3],[18,1]],         batch: 10 },
];

// Derived: per-recipe total cost (sum price × qty)
RECIPES.forEach(r => {
  r.cost = r.ing.reduce((s, [id, q]) => s + (INGREDIENTS[id].price || 0) * q, 0);
  r.totalUnits = r.ing.reduce((s, [, q]) => s + q, 0);
  // Has any gathered (price 0) ingredient?
  r.usesGathered = r.ing.some(([id]) => INGREDIENTS[id].price === 0);
});
