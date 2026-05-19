// ── Cooking Guide app ─────────────────────────────────────────────
const { useState, useMemo, useEffect } = React;

// ── Method glyphs (line-art, original) ───────────────────────────
const MethodGlyph = ({ glyph, className = "m-glyph" }) => {
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

const PlusIcon  = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>;
const CheckIcon = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>;
const SearchIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>;
const BookIcon = () => <svg className="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v17H6a2 2 0 0 0-2 2zM4 5v15"/><path d="M9 7h7M9 11h7"/></svg>;
const BasketIcon = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6h12l-1.2 7.2a1 1 0 0 1-1 .8H4.2a1 1 0 0 1-1-.8z"/><path d="M5 6 7 2M11 6 9 2"/></svg>;

// ── Ingredient helpers ────────────────────────────────────────────
function IngDot({ catKey }) {
  return <span className={`ing-dot cat-${catKey}`} />;
}

function methodColor(method) {
  const h = METHODS[method]?.hue ?? 60;
  return `oklch(0.78 0.10 ${h})`;
}

// ── Recipe Card ───────────────────────────────────────────────────
function RecipeCard({ r, qty, onAdd }) {
  const m = METHODS[r.method];
  const inBasket = qty > 0;
  return (
    <div className={`card ${inBasket ? "in-basket" : ""}`}
         style={{ "--m-color": methodColor(r.method) }}>
      <div className="card-top">
        <div className="card-name">
          <div className="card-title-row">
            <span className="card-num">{String(r.id).padStart(2, "0")}</span>
            <span className="card-title">{r.name}</span>
          </div>
          <div className="card-meta-row">
            <span className={`tier-pill t-${r.lvl}`}>Lv·{r.lvl}</span>
            <span className="method-pill" style={{ "--m-color": methodColor(r.method) }}>
              <MethodGlyph glyph={m.glyph} />
              {m.name}
            </span>
          </div>
        </div>
        <div className="card-side">
          {r.batch > 1 && <span className="batch-badge">×{r.batch}</span>}
        </div>
      </div>

      <div className="ing-list">
        {r.ing.map(([id, q]) => {
          const ing = INGREDIENTS[id];
          return (
            <div key={id} className="ing-row">
              <IngDot catKey={ing.cat} />
              <span className="ing-name">{ing.name}</span>
              <span className="ing-qty"><b>{q}</b></span>
            </div>
          );
        })}
      </div>

      <div className="card-foot">
        <span className={`cost ${r.usesGathered ? "gathered" : ""}`}>
          <b>{r.cost}</b>
          <span className="unit">เงิน</span>
        </span>
        <span className="foot-spacer" />
        <button
          className={`add-btn ${inBasket ? "added" : ""}`}
          onClick={() => onAdd(r.id)}>
          {inBasket
            ? <><CheckIcon /> ×{qty}</>
            : <><PlusIcon /> เพิ่ม</>}
        </button>
      </div>
    </div>
  );
}

// ── Compact row ──────────────────────────────────────────────────
function CompactRow({ r, qty, onAdd }) {
  const m = METHODS[r.method];
  return (
    <div className="compact-row" style={{ "--m-color": methodColor(r.method) }}>
      <span className="cm-n">{String(r.id).padStart(2, "0")}</span>
      <span className="cm-name">{r.name}</span>
      <span className="cm-tier"><span className={`tier-pill t-${r.lvl}`}>Lv·{r.lvl}</span></span>
      <span className="cm-method method-pill" style={{ "--m-color": methodColor(r.method) }}>
        <MethodGlyph glyph={m.glyph} /> {m.name}
      </span>
      <span className="cm-ings">
        {r.ing.map(([id, q]) => {
          const ing = INGREDIENTS[id];
          return (
            <span key={id} className="cm-ing">
              <IngDot catKey={ing.cat} />
              {ing.name.length > 14 ? ing.name.slice(0, 13) + "…" : ing.name}
              <b>×{q}</b>
            </span>
          );
        })}
      </span>
      <span className="cm-cost">{r.cost}</span>
      <span className="cm-add">
        <button className={qty > 0 ? "on" : ""} onClick={() => onAdd(r.id)} title={qty > 0 ? `ในตะกร้า ×${qty}` : "เพิ่มเข้าตะกร้า"}>
          {qty > 0 ? <CheckIcon /> : <PlusIcon />}
        </button>
      </span>
    </div>
  );
}

// ── Table view ───────────────────────────────────────────────────
function TableView({ recipes, basket, onAdd }) {
  if (!recipes.length) return <div className="empty">ไม่พบเมนูที่ตรงกับเงื่อนไข</div>;
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>#</th>
            <th>เมนู</th>
            <th>Lv</th>
            <th>วิธีปรุง</th>
            <th>วัตถุดิบ</th>
            <th className="r">Batch</th>
            <th className="r">เงิน</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {recipes.map(r => {
            const m = METHODS[r.method];
            const qty = basket[r.id] || 0;
            return (
              <tr key={r.id} style={{ "--m-color": methodColor(r.method) }}>
                <td className="n">{String(r.id).padStart(2, "0")}</td>
                <td className="name">{r.name}</td>
                <td><span className={`tier-pill t-${r.lvl}`}>Lv·{r.lvl}</span></td>
                <td>
                  <span className="method-pill" style={{ "--m-color": methodColor(r.method) }}>
                    <MethodGlyph glyph={m.glyph} /> {m.name}
                  </span>
                </td>
                <td className="ings">
                  <div className="cm-ings">
                    {r.ing.map(([id, q]) => {
                      const ing = INGREDIENTS[id];
                      return (
                        <span key={id} className="cm-ing">
                          <IngDot catKey={ing.cat} />
                          {ing.name}<b>×{q}</b>
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="batch">×{r.batch}</td>
                <td className="cost">{r.cost}</td>
                <td className="add">
                  <span className="cm-add">
                    <button className={qty > 0 ? "on" : ""} onClick={() => onAdd(r.id)}>
                      {qty > 0 ? <CheckIcon /> : <PlusIcon />}
                    </button>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Planner Basket ───────────────────────────────────────────────
function Basket({ basket, setBasket }) {
  const entries = Object.entries(basket).filter(([, q]) => q > 0);
  const clear = () => setBasket({});
  const setQty = (id, q) => setBasket(prev => {
    const n = { ...prev };
    if (q <= 0) delete n[id];
    else n[id] = Math.min(999, q);
    return n;
  });

  // Aggregate ingredients
  const totals = useMemo(() => {
    const ing = {};
    let cost = 0;
    let totalServings = 0;
    entries.forEach(([rid, q]) => {
      const r = RECIPES.find(x => x.id === +rid);
      if (!r) return;
      cost += r.cost * q;
      totalServings += r.batch * q;
      r.ing.forEach(([iid, iq]) => {
        ing[iid] = (ing[iid] || 0) + iq * q;
      });
    });
    return { ing, cost, totalServings };
  }, [basket]);

  const ingList = useMemo(() => {
    return Object.entries(totals.ing)
      .map(([id, q]) => ({ ing: INGREDIENTS[+id], qty: q }))
      .sort((a, b) => {
        // Sort: gathered first, then by cat, then by id
        const ag = a.ing.price === 0 ? 0 : 1;
        const bg = b.ing.price === 0 ? 0 : 1;
        if (ag !== bg) return ag - bg;
        return a.ing.cat.localeCompare(b.ing.cat) || a.ing.id - b.ing.id;
      });
  }, [totals]);

  const purchased = ingList.filter(x => x.ing.price > 0);
  const gathered  = ingList.filter(x => x.ing.price === 0);

  return (
    <aside className="basket">
      <div className="bk-head">
        <h3><BasketIcon /> ตะกร้าวางแผน</h3>
        <button className="clear" onClick={clear} disabled={!entries.length}>เคลียร์</button>
      </div>

      {!entries.length && (
        <div className="bk-empty">
          ยังไม่มีเมนูในตะกร้า
          <div className="hint">กด <b>+ เพิ่ม</b> ที่เมนูเพื่อรวมวัตถุดิบ</div>
        </div>
      )}

      {entries.length > 0 && (
        <>
          <div className="bk-body">
            <div className="bk-section-label">เมนู ({entries.length})</div>
            <div className="bk-recipes">
              {entries.map(([rid, q]) => {
                const r = RECIPES.find(x => x.id === +rid);
                if (!r) return null;
                return (
                  <div key={rid} className="bk-row">
                    <div className="bk-name">
                      <span className="lvl">Lv·{r.lvl}</span>
                      {r.name}
                    </div>
                    <div className="bk-qty">
                      <button className="rm" onClick={() => setQty(+rid, q - 1)} aria-label="ลด">−</button>
                      <input
                        type="number" min="0" max="999"
                        value={q}
                        onChange={e => setQty(+rid, parseInt(e.target.value) || 0)} />
                      <button onClick={() => setQty(+rid, q + 1)} aria-label="เพิ่ม">+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {purchased.length > 0 && (
              <div className="bk-tot-section">
                <div className="bk-tot-label">ต้องซื้อจากร้านค้า</div>
                <div className="bk-tot-list">
                  {purchased.map(({ ing, qty }) => (
                    <div key={ing.id} className="bk-tot-row">
                      <div className="name">
                        <IngDot catKey={ing.cat} />
                        <span>{ing.name}</span>
                      </div>
                      <div className="qty">{qty}</div>
                      <div className="sub">{ing.price * qty}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gathered.length > 0 && (
              <div className="bk-tot-section">
                <div className="bk-tot-label">เก็บเอง / ตกปลา</div>
                <div className="bk-tot-list">
                  {gathered.map(({ ing, qty }) => (
                    <div key={ing.id} className="bk-tot-row gathered">
                      <div className="name">
                        <IngDot catKey={ing.cat} />
                        <span>{ing.name}</span>
                      </div>
                      <div className="qty">{qty}</div>
                      <div className="sub">—</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bk-totals">
            <div className="bk-summary">
              <div className="bk-stat">
                <div className="bk-stat-lbl">ต้นทุนรวม</div>
                <div className="bk-stat-val accent">{totals.cost.toLocaleString()}</div>
                <div className="bk-stat-sub">เงิน · ร้านค้า</div>
              </div>
              <div className="bk-stat">
                <div className="bk-stat-lbl">ผลผลิต</div>
                <div className="bk-stat-val">{totals.totalServings.toLocaleString()}</div>
                <div className="bk-stat-sub">จาน / ถ้วย</div>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

// ── Main App ─────────────────────────────────────────────────────
function CookingApp() {
  const [view,    setView]   = useState("cards");      // cards | compact | table
  const [query,   setQuery]  = useState("");
  const [lvl,     setLvl]    = useState("all");        // all | 1 | 6 | 11
  const [method,  setMethod] = useState(new Set());    // set of method-th names
  const [cats,    setCats]   = useState(new Set());    // set of cat keys
  const [sort,    setSort]   = useState("default");
  const [basket,  setBasket] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cooking_basket") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem("cooking_basket", JSON.stringify(basket));
  }, [basket]);

  const toggle = (setter, val) => setter(prev => {
    const n = new Set(prev);
    if (n.has(val)) n.delete(val); else n.add(val);
    return n;
  });

  const filtered = useMemo(() => {
    let list = RECIPES.slice();
    if (lvl !== "all") list = list.filter(r => r.lvl === +lvl);
    if (method.size) list = list.filter(r => method.has(r.method));
    if (cats.size) list = list.filter(r => r.ing.some(([id]) => cats.has(INGREDIENTS[id].cat)));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.ing.some(([id]) => INGREDIENTS[id].name.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case "name":     list.sort((a, b) => a.name.localeCompare(b.name, "th")); break;
      case "cost-asc": list.sort((a, b) => a.cost - b.cost); break;
      case "cost-desc":list.sort((a, b) => b.cost - a.cost); break;
      case "lvl":      list.sort((a, b) => a.lvl - b.lvl || a.id - b.id); break;
      case "method":   list.sort((a, b) => a.method.localeCompare(b.method, "th") || a.id - b.id); break;
      default: break;
    }
    return list;
  }, [query, lvl, method, cats, sort]);

  const addToBasket = (id) => setBasket(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  // Method counts (post-other-filters but include all methods)
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
    <div className="app">
      <header className="head">
        <a className="back" href="app.html">←</a>
        <div className="h-title">
          <h1>
            <BookIcon />
            สูตรอาหารและการปรุง
          </h1>
          <span className="sub">cooking · {RECIPES.length} recipes · {Object.keys(INGREDIENTS).length} ingredients</span>
        </div>
        <div className="view-seg">
          <button className={view === "cards" ? "on" : ""} onClick={() => setView("cards")}><span>การ์ด</span></button>
          <button className={view === "compact" ? "on" : ""} onClick={() => setView("compact")}><span>กระชับ</span></button>
          <button className={view === "table" ? "on" : ""} onClick={() => setView("table")}><span>ตาราง</span></button>
        </div>
      </header>

      <div className="main">
        {/* Filters row 1: search + level */}
        <div className="filters">
          <div className="search">
            <span className="ic"><SearchIcon /></span>
            <input
              placeholder="ค้นหาเมนูหรือวัตถุดิบ…"
              value={query}
              onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="seg">
            {["all", "1", "6", "11"].map(v => (
              <button key={v} className={lvl === v ? "on" : ""} onClick={() => setLvl(v)}>
                {v === "all" ? "ทุกระดับ" : `Lv·${v}`}
              </button>
            ))}
          </div>
        </div>

        {/* Method chip row */}
        <div className="method-row">
          <span className="hl-label">วิธีปรุง</span>
          {Object.entries(METHODS).map(([key, m]) => (
            <button
              key={key}
              className={`m-chip ${method.has(key) ? "on" : ""}`}
              style={{ "--m-color": methodColor(key) }}
              onClick={() => toggle(setMethod, key)}>
              <MethodGlyph glyph={m.glyph} />
              {m.name}
              <span className="m-count">{methodCounts[key]}</span>
            </button>
          ))}
        </div>

        {/* Category chip row */}
        <div className="method-row">
          <span className="hl-label">วัตถุดิบ</span>
          {Object.entries(CAT_LABEL).map(([key, label]) => (
            <button
              key={key}
              className={`m-chip ${cats.has(key) ? "on" : ""}`}
              onClick={() => toggle(setCats, key)}>
              <span className={`ing-dot cat-${key}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <span className="count"><b>{filtered.length}</b> เมนู</span>
          <span className="spacer" />
          <select className="sort-sel" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">เรียง: ลำดับเริ่มต้น</option>
            <option value="lvl">เรียง: ระดับ</option>
            <option value="method">เรียง: วิธีปรุง</option>
            <option value="name">เรียง: ชื่อ</option>
            <option value="cost-asc">เรียง: ราคา ↑</option>
            <option value="cost-desc">เรียง: ราคา ↓</option>
          </select>
        </div>

        {/* List */}
        {view === "cards" && (
          filtered.length
            ? <div className="grid">
                {filtered.map(r => (
                  <RecipeCard key={r.id} r={r} qty={basket[r.id] || 0} onAdd={addToBasket} />
                ))}
              </div>
            : <div className="empty">ไม่พบเมนูที่ตรงกับเงื่อนไข</div>
        )}
        {view === "compact" && (
          filtered.length
            ? <div className="compact">
                {filtered.map(r => (
                  <CompactRow key={r.id} r={r} qty={basket[r.id] || 0} onAdd={addToBasket} />
                ))}
              </div>
            : <div className="empty">ไม่พบเมนูที่ตรงกับเงื่อนไข</div>
        )}
        {view === "table" && (
          <TableView recipes={filtered} basket={basket} onAdd={addToBasket} />
        )}
      </div>

      <Basket basket={basket} setBasket={setBasket} />
    </div>
  );
}
