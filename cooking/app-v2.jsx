// ── Cooking Guide v2 — Master/Detail layout ──────────────────────
const { useState, useMemo, useEffect } = React;

// ── Method glyphs ────────────────────────────────────────────────
const MethodGlyphV2 = ({ glyph, className = "m-glyph" }) => {
  const props = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (glyph) {
    case "fire":     return <svg {...props}><path d="M12 3c2 3 4 5 4 8a4 4 0 1 1-8 0c0-1.4.6-2.5 1.5-3.5"/><path d="M11 13c.5 1 1.6 1.6 2.5 1.5"/></svg>;
    case "wind":     return <svg {...props}><path d="M4 9h10a3 3 0 1 0-3-3"/><path d="M3 14h14a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3 19h7"/></svg>;
    case "ice":      return <svg {...props}><path d="M12 3v18M5 7l14 10M5 17l14-10"/><path d="M12 6l-2-2M12 6l2-2M12 18l-2 2M12 18l2 2"/></svg>;
    case "steam":    return <svg {...props}><path d="M6 19h12"/><path d="M7 16h10l-1 3H8z"/><path d="M9 13c0-1 1-1.5 1-2.5S9 9 9 8m3 5c0-1 1-1.5 1-2.5S12 9 12 8m3 5c0-1 1-1.5 1-2.5S15 9 15 8"/></svg>;
    case "lightning":return <svg {...props}><path d="M13 3 6 14h5l-1 7 7-11h-5z"/></svg>;
    case "stone":    return <svg {...props}><rect x="4" y="10" width="16" height="9" rx="1.5"/><path d="M4 13h16M9 10v9M15 10v9M7 7h10l1 3H6z"/></svg>;
    default: return null;
  }
};

const PlusIconV2  = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>;
const MinusIconV2 = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10"/></svg>;
const CheckIconV2 = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>;
const SearchIconV2 = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>;
const BookIconV2 = () => <svg className="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2zM4 5v15"/><path d="M9 7h7M9 11h7"/></svg>;
const ChevronIconV2 = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m6 4 4 4-4 4"/></svg>;

function methodColorV2(method) {
  const h = METHODS[method]?.hue ?? 60;
  return `oklch(0.78 0.10 ${h})`;
}

function IngDotV2({ catKey }) {
  return <span className={`ing-dot cat-${catKey}`} />;
}

// ── Left rail: recipe list row ──────────────────────────────────
function ListRow({ r, selected, qty, onClick }) {
  const m = METHODS[r.method];
  return (
    <button
      className={`lr-row ${selected ? "is-active" : ""} ${qty > 0 ? "has-basket" : ""}`}
      style={{ "--m-color": methodColorV2(r.method) }}
      onClick={onClick}>
      <span className="lr-num">{String(r.id).padStart(2, "0")}</span>
      <span className="lr-body">
        <span className="lr-name">{r.name}</span>
        <span className="lr-meta">
          <span className={`tier-pill t-${r.lvl}`}>Lv·{r.lvl}</span>
          <span className="lr-method" style={{ "--m-color": methodColorV2(r.method) }}>
            <MethodGlyphV2 glyph={m.glyph} /> {m.name}
          </span>
          {r.batch > 1 && <span className="lr-batch">×{r.batch}</span>}
        </span>
      </span>
      <span className="lr-tail">
        {qty > 0 && <span className="lr-qty">×{qty}</span>}
        <span className="lr-chev"><ChevronIconV2 /></span>
      </span>
    </button>
  );
}

// ── Detail panel ─────────────────────────────────────────────────
function Detail({ r, qty, setQty, basket, onSelect }) {
  if (!r) {
    return (
      <div className="detail empty-detail">
        <div className="ed-mark"><BookIconV2 /></div>
        <div className="ed-title">เลือกเมนูจากรายการด้านซ้าย</div>
        <div className="ed-sub">คลิกชื่อเมนูเพื่อดูวัตถุดิบ ราคา และจัดการตะกร้า</div>
      </div>
    );
  }

  const m = METHODS[r.method];
  const ingTotal = r.ing.reduce((s, [, q]) => s + q, 0);
  const purchased = r.ing.filter(([id]) => INGREDIENTS[id].price > 0);
  const gathered  = r.ing.filter(([id]) => INGREDIENTS[id].price === 0);

  // Related: same method, ≠ this one
  const related = RECIPES
    .filter(x => x.method === r.method && x.id !== r.id && x.lvl === r.lvl)
    .slice(0, 5);

  // Shared-ingredient recipes
  const sharedIngs = RECIPES
    .filter(x => x.id !== r.id && x.ing.some(([id]) => r.ing.some(([id2]) => id === id2)))
    .slice(0, 6);

  return (
    <div className="detail">
      <div className="dt-head">
        <div className="dt-head-left">
          <div className="dt-id">เมนูที่ {String(r.id).padStart(2, "0")}</div>
          <h2 className="dt-title">{r.name}</h2>
          <div className="dt-meta">
            <span className={`tier-pill t-${r.lvl}`}>Lv·{r.lvl}</span>
            <span className="method-pill" style={{ "--m-color": methodColorV2(r.method) }}>
              <MethodGlyphV2 glyph={m.glyph} /> {m.name}
            </span>
            {r.batch > 1 && (
              <span className="dt-batch-badge">รอบละ ×{r.batch}</span>
            )}
          </div>
        </div>
        <div className="dt-actions">
          <div className="dt-add">
            <div className="dt-add-lbl">ในตะกร้า</div>
            <div className="bk-qty big">
              <button className="rm" onClick={() => setQty(r.id, qty - 1)} disabled={qty === 0}><MinusIconV2 /></button>
              <input
                type="number" min="0" max="999"
                value={qty}
                onChange={e => setQty(r.id, parseInt(e.target.value) || 0)} />
              <button onClick={() => setQty(r.id, qty + 1)}><PlusIconV2 /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="dt-stats">
        <div className="dt-stat">
          <div className="dt-stat-lbl">ต้นทุนต่อรอบ</div>
          <div className="dt-stat-val">{r.cost}<span className="unit">เงิน</span></div>
          {r.usesGathered && <div className="dt-stat-sub">+ วัตถุดิบเก็บเอง</div>}
        </div>
        <div className="dt-stat">
          <div className="dt-stat-lbl">วัตถุดิบ</div>
          <div className="dt-stat-val">{ingTotal}<span className="unit">ชิ้น</span></div>
          <div className="dt-stat-sub">{r.ing.length} ประเภท</div>
        </div>
        <div className="dt-stat">
          <div className="dt-stat-lbl">ผลผลิต</div>
          <div className="dt-stat-val">{r.batch}<span className="unit">จาน</span></div>
          <div className="dt-stat-sub">ต่อการปรุง 1 รอบ</div>
        </div>
        <div className="dt-stat">
          <div className="dt-stat-lbl">ต่อจาน</div>
          <div className="dt-stat-val">{Math.round(r.cost / r.batch)}<span className="unit">เงิน</span></div>
          <div className="dt-stat-sub">เฉลี่ย</div>
        </div>
      </div>

      {/* Ingredient table */}
      <div className="dt-section">
        <div className="dt-section-head">
          <span className="dt-section-title">วัตถุดิบที่ต้องใช้</span>
          <span className="dt-section-sub">รอบเดียว · {ingTotal} ชิ้น</span>
        </div>
        <div className="dt-ing-table">
          {r.ing.map(([id, q]) => {
            const ing = INGREDIENTS[id];
            return (
              <div key={id} className="dt-ing-row">
                <span className="dt-ing-dot"><IngDotV2 catKey={ing.cat} /></span>
                <span className="dt-ing-name">
                  <span className="n">{ing.name}</span>
                  <span className="c">{ing.catLabel}</span>
                </span>
                <span className="dt-ing-qty"><b>{q}</b><span>ชิ้น</span></span>
                <span className="dt-ing-src">
                  {ing.price > 0
                    ? <span className="src-shop">ร้านค้า · {ing.price}</span>
                    : <span className="src-gather">{ing.src}</span>}
                </span>
                <span className="dt-ing-cost">
                  {ing.price > 0 ? `${ing.price * q}` : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cost breakdown */}
        <div className="dt-cost-strip">
          {purchased.length > 0 && (
            <div className="dt-cost-cell">
              <div className="lbl">ต้องซื้อ</div>
              <div className="val">{r.cost.toLocaleString()} เงิน</div>
              <div className="sub">{purchased.length} วัตถุดิบ</div>
            </div>
          )}
          {gathered.length > 0 && (
            <div className="dt-cost-cell accent">
              <div className="lbl">เก็บ / ตกปลา</div>
              <div className="val">{gathered.reduce((s, [, q]) => s + q, 0)} ชิ้น</div>
              <div className="sub">{gathered.length} วัตถุดิบ</div>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="dt-section">
          <div className="dt-section-head">
            <span className="dt-section-title">เมนู{m.name}อื่น (Lv·{r.lvl})</span>
            <span className="dt-section-sub">{related.length} เมนู</span>
          </div>
          <div className="dt-related">
            {related.map(x => (
              <button key={x.id} className="rel-card" onClick={() => onSelect(x.id)}
                      style={{ "--m-color": methodColorV2(x.method) }}>
                <span className="rel-num">{String(x.id).padStart(2, "0")}</span>
                <span className="rel-name">{x.name}</span>
                <span className="rel-cost">{x.cost}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {sharedIngs.length > 0 && (
        <div className="dt-section">
          <div className="dt-section-head">
            <span className="dt-section-title">ใช้วัตถุดิบร่วมกัน</span>
            <span className="dt-section-sub">{sharedIngs.length} เมนู</span>
          </div>
          <div className="dt-related">
            {sharedIngs.map(x => (
              <button key={x.id} className="rel-card" onClick={() => onSelect(x.id)}
                      style={{ "--m-color": methodColorV2(x.method) }}>
                <span className="rel-num">{String(x.id).padStart(2, "0")}</span>
                <span className="rel-name">{x.name}</span>
                <span className="rel-meta">
                  <span className={`tier-pill t-${x.lvl}`}>Lv·{x.lvl}</span>
                  <MethodGlyphV2 glyph={METHODS[x.method].glyph} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Basket footer (collapsible) ───────────────────────────────────
function BasketBar({ basket, setBasket, onSelect }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(basket).filter(([, q]) => q > 0);

  const totals = useMemo(() => {
    const ing = {};
    let cost = 0, servings = 0;
    entries.forEach(([rid, q]) => {
      const r = RECIPES.find(x => x.id === +rid);
      if (!r) return;
      cost += r.cost * q;
      servings += r.batch * q;
      r.ing.forEach(([iid, iq]) => { ing[iid] = (ing[iid] || 0) + iq * q; });
    });
    return { ing, cost, servings };
  }, [basket]);

  const setQty = (id, q) => setBasket(prev => {
    const n = { ...prev };
    if (q <= 0) delete n[id]; else n[id] = Math.min(999, q);
    return n;
  });

  const ingList = Object.entries(totals.ing)
    .map(([id, q]) => ({ ing: INGREDIENTS[+id], qty: q }))
    .sort((a, b) => (a.ing.price === 0 ? 0 : 1) - (b.ing.price === 0 ? 0 : 1) || a.ing.id - b.ing.id);

  const purchased = ingList.filter(x => x.ing.price > 0);
  const gathered  = ingList.filter(x => x.ing.price === 0);

  return (
    <div className={`bkbar ${open ? "is-open" : ""} ${entries.length ? "" : "is-empty"}`}>
      <button className="bkbar-handle" onClick={() => setOpen(o => !o)}>
        <span className="bkbar-icon">▴</span>
        <span className="bkbar-label">ตะกร้าวางแผน</span>
        <span className="bkbar-pill">{entries.length}</span>
        <span className="bkbar-stat"><b>{totals.cost.toLocaleString()}</b> เงิน</span>
        <span className="bkbar-stat"><b>{totals.servings}</b> จาน</span>
        <span className="bkbar-spacer" />
        <span className="bkbar-toggle">{open ? "ปิด" : "ดูทั้งหมด"}</span>
      </button>

      {open && (
        <div className="bkbar-body">
          <div className="bkbar-grid">
            <div className="bkbar-col">
              <div className="bkbar-col-head">
                <span className="bkbar-col-title">เมนูที่เลือก</span>
                <button className="bkbar-clear" onClick={() => setBasket({})}>เคลียร์</button>
              </div>
              <div className="bkbar-recipes">
                {entries.length === 0 && (
                  <div className="bkbar-empty">ยังไม่มีเมนู — กด <b>+</b> ที่เมนูเพื่อเพิ่ม</div>
                )}
                {entries.map(([rid, q]) => {
                  const r = RECIPES.find(x => x.id === +rid);
                  if (!r) return null;
                  return (
                    <div key={rid} className="bkbar-recipe">
                      <button className="bkbar-recipe-name" onClick={() => onSelect(+rid)}>
                        <span className="lvl">Lv·{r.lvl}</span>
                        {r.name}
                      </button>
                      <div className="bk-qty">
                        <button className="rm" onClick={() => setQty(+rid, q - 1)}>−</button>
                        <input
                          type="number" min="0" max="999"
                          value={q}
                          onChange={e => setQty(+rid, parseInt(e.target.value) || 0)} />
                        <button onClick={() => setQty(+rid, q + 1)}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bkbar-col">
              <div className="bkbar-col-head">
                <span className="bkbar-col-title">รวมต้องซื้อ</span>
                <span className="bkbar-col-sub">{purchased.length} วัตถุดิบ</span>
              </div>
              <div className="bkbar-totals">
                {purchased.map(({ ing, qty }) => (
                  <div key={ing.id} className="bk-tot-row">
                    <div className="name"><IngDotV2 catKey={ing.cat} /><span>{ing.name}</span></div>
                    <div className="qty">{qty}</div>
                    <div className="sub">{ing.price * qty}</div>
                  </div>
                ))}
                {purchased.length === 0 && <div className="bkbar-empty">—</div>}
              </div>
            </div>

            <div className="bkbar-col">
              <div className="bkbar-col-head">
                <span className="bkbar-col-title">เก็บเอง / ตกปลา</span>
                <span className="bkbar-col-sub">{gathered.length} วัตถุดิบ</span>
              </div>
              <div className="bkbar-totals">
                {gathered.map(({ ing, qty }) => (
                  <div key={ing.id} className="bk-tot-row gathered">
                    <div className="name"><IngDotV2 catKey={ing.cat} /><span>{ing.name}</span></div>
                    <div className="qty">{qty}</div>
                    <div className="sub">—</div>
                  </div>
                ))}
                {gathered.length === 0 && <div className="bkbar-empty">—</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
function CookingAppV2() {
  const [query,    setQuery]    = useState("");
  const [lvl,      setLvl]      = useState("all");
  const [method,   setMethod]   = useState(new Set());
  const [selected, setSelected] = useState(() => {
    const fromHash = parseInt(location.hash.replace("#r", ""));
    return Number.isFinite(fromHash) ? fromHash : RECIPES[0].id;
  });
  const [basket,   setBasket]   = useState(() => {
    try { return JSON.parse(localStorage.getItem("cooking_basket") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem("cooking_basket", JSON.stringify(basket));
  }, [basket]);

  useEffect(() => {
    if (selected) history.replaceState(null, "", `#r${selected}`);
  }, [selected]);

  const toggle = (setter, val) => setter(prev => {
    const n = new Set(prev);
    if (n.has(val)) n.delete(val); else n.add(val);
    return n;
  });

  const filtered = useMemo(() => {
    let list = RECIPES.slice();
    if (lvl !== "all") list = list.filter(r => r.lvl === +lvl);
    if (method.size) list = list.filter(r => method.has(r.method));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.ing.some(([id]) => INGREDIENTS[id].name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [query, lvl, method]);

  // Group filtered by tier for sectioned list
  const grouped = useMemo(() => {
    const g = { 1: [], 6: [], 11: [] };
    filtered.forEach(r => g[r.lvl]?.push(r));
    return g;
  }, [filtered]);

  const setQty = (id, q) => setBasket(prev => {
    const n = { ...prev };
    if (q <= 0) delete n[id]; else n[id] = Math.min(999, q);
    return n;
  });
  const currentRecipe = RECIPES.find(r => r.id === selected);

  const methodCounts = useMemo(() => {
    const counts = {};
    Object.keys(METHODS).forEach(k => counts[k] = 0);
    RECIPES.forEach(r => {
      if (lvl !== "all" && r.lvl !== +lvl) return;
      counts[r.method]++;
    });
    return counts;
  }, [lvl]);

  return (
    <div className="app-v2">
      <header className="head">
        <a className="back" href="app.html">←</a>
        <div className="h-title">
          <h1>
            <BookIconV2 />
            สูตรอาหารและการปรุง
          </h1>
          <span className="sub">cooking · {RECIPES.length} recipes · {Object.keys(INGREDIENTS).length} ingredients</span>
        </div>
        <a className="alt-view" href="cooking-guide-grid.html">↗ มุมมองตาราง</a>
      </header>

      <div className="layout">
        {/* LEFT RAIL */}
        <aside className="rail">
          <div className="rail-filters">
            <div className="search">
              <span className="ic"><SearchIconV2 /></span>
              <input
                placeholder="ค้นหาเมนู / วัตถุดิบ"
                value={query}
                onChange={e => setQuery(e.target.value)} />
            </div>
            <div className="seg">
              {["all", "1", "6", "11"].map(v => (
                <button key={v} className={lvl === v ? "on" : ""} onClick={() => setLvl(v)}>
                  {v === "all" ? "ทั้งหมด" : `Lv·${v}`}
                </button>
              ))}
            </div>
            <div className="rail-methods">
              {Object.entries(METHODS).map(([key, m]) => (
                <button
                  key={key}
                  title={`${m.name} (${methodCounts[key]})`}
                  className={`m-chip mini ${method.has(key) ? "on" : ""}`}
                  style={{ "--m-color": methodColorV2(key) }}
                  onClick={() => toggle(setMethod, key)}>
                  <MethodGlyphV2 glyph={m.glyph} />
                </button>
              ))}
            </div>
          </div>

          <div className="rail-count">
            <b>{filtered.length}</b> / {RECIPES.length} เมนู
          </div>

          <div className="rail-list">
            {filtered.length === 0 && (
              <div className="empty">ไม่พบเมนูที่ตรงกับเงื่อนไข</div>
            )}
            {[1, 6, 11].map(tier => {
              const items = grouped[tier];
              if (!items || !items.length) return null;
              return (
                <div key={tier} className="rail-group">
                  <div className="rail-group-head">
                    <span className={`tier-pill t-${tier}`}>Lv·{tier}</span>
                    <span className="rail-group-count">{items.length}</span>
                  </div>
                  {items.map(r => (
                    <ListRow
                      key={r.id}
                      r={r}
                      selected={selected === r.id}
                      qty={basket[r.id] || 0}
                      onClick={() => setSelected(r.id)} />
                  ))}
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT PANE */}
        <main className="pane">
          <Detail
            r={currentRecipe}
            qty={basket[currentRecipe?.id] || 0}
            setQty={setQty}
            basket={basket}
            onSelect={setSelected} />
        </main>
      </div>

      <BasketBar basket={basket} setBasket={setBasket} onSelect={setSelected} />
    </div>
  );
}
