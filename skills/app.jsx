// Skill Guide v2 — 3 view modes
const { useState, useMemo } = React;

// ─── shared atoms ────────────────────────────────────────────────────
function Tag({ name }) {
  const cat = TAG_CATEGORY[name] || 'utility';
  return <span className={`tag cat-${cat}`}>{name}</span>;
}

function Rec({ rec }) {
  if (rec === 1)      return <span className="rec top">#1</span>;
  if (rec === 'good') return <span className="rec good">ดี</span>;
  return null;
}

function recClass(rec) {
  if (rec === 1) return 'has-rec rec-top';
  if (rec === 'good') return 'has-rec rec-good';
  return '';
}

// ─── Card view (default) ────────────────────────────────────────────
function CardView({ skills }) {
  if (!skills.length) return <div className="empty">ไม่พบสกิลที่ตรงกับการค้นหา</div>;
  return (
    <div className="grid">
      {skills.map(s => (
        <div key={s.n + s.name} className={`card ${recClass(s.rec)}`}>
          <div className="card-top">
            <div className="card-name">
              <span className="card-num">{String(s.n).padStart(2, '0')}</span>
              <span className="card-title">{s.name}</span>
            </div>
            <div className="card-meta">
              <Rec rec={s.rec} />
              <span className="cd">{s.cd}s</span>
            </div>
          </div>
          <div className="tags">
            {s.tags.map(t => <Tag key={t} name={t} />)}
          </div>
          {s.hint && <div className="hint">{s.hint}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Compact view ───────────────────────────────────────────────────
function CompactView({ skills }) {
  if (!skills.length) return <div className="empty">ไม่พบสกิลที่ตรงกับการค้นหา</div>;
  return (
    <div className="compact">
      {skills.map(s => (
        <div key={s.n + s.name} className={`compact-row ${recClass(s.rec)}`}>
          <span className="cm-n">{String(s.n).padStart(2, '0')}</span>
          <span className="cm-name">{s.name}</span>
          <span className="cm-tags">
            {s.tags.slice(0, 3).map(t => <Tag key={t} name={t} />)}
          </span>
          <span className="cm-hint">{s.hint}</span>
          <span className="cm-cd">{s.cd}s</span>
          <span className="cm-rec"><Rec rec={s.rec} /></span>
        </div>
      ))}
    </div>
  );
}

// ─── Table view (densest) ───────────────────────────────────────────
function TableView({ skills }) {
  if (!skills.length) return <div className="empty">ไม่พบสกิลที่ตรงกับการค้นหา</div>;
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>#</th>
            <th>Skill</th>
            <th>Role</th>
            <th>Tags</th>
            <th>Hint</th>
            <th className="r">CD</th>
            <th className="r">Rec</th>
          </tr>
        </thead>
        <tbody>
          {skills.map(s => (
            <tr key={s.n + s.name}>
              <td className="n">{String(s.n).padStart(2, '0')}</td>
              <td className="name">{s.name}</td>
              <td className={`role role-${s.role}`}>{s.role}</td>
              <td className="tags">
                <span className="tags">
                  {s.tags.map(t => <Tag key={t} name={t} />)}
                </span>
              </td>
              <td className="hint">{s.hint || '—'}</td>
              <td className="cd">{s.cd}s</td>
              <td className="rec"><Rec rec={s.rec} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────
function App() {
  const [view,     setView]     = useState('cards');     // cards | compact | table
  const [role,     setRole]     = useState('ทั้งหมด');
  const [query,    setQuery]    = useState('');
  const [hl,       setHl]       = useState(new Set());   // highlight tags multi-select
  const [sort,     setSort]     = useState('default');   // default | name | cd-asc | cd-desc | rec

  const filtered = useMemo(() => {
    let list = SKILLS.slice();
    if (role !== 'ทั้งหมด') list = list.filter(s => s.role === role);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (hl.size) {
      list = list.filter(s => s.tags.some(t => hl.has(t)));
    }
    switch (sort) {
      case 'name':    list.sort((a, b) => a.name.localeCompare(b.name, 'th')); break;
      case 'cd-asc':  list.sort((a, b) => a.cd - b.cd); break;
      case 'cd-desc': list.sort((a, b) => b.cd - a.cd); break;
      case 'rec':     list.sort((a, b) => {
        const v = (x) => x.rec === 1 ? 0 : x.rec === 'good' ? 1 : 2;
        return v(a) - v(b);
      }); break;
      default: break;
    }
    return list;
  }, [role, query, hl, sort]);

  const toggleHl = (t) => {
    setHl(prev => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t); else n.add(t);
      return n;
    });
  };

  return (
    <div className="app">
      <div className="head">
        <a className="back" href="damage-calc-v2.html">← Calculator</a>
        <div className="h-title">
          <h1>Skill Guide</h1>
          <span className="sub">หมวดร้อยสำนัก · {SKILLS.length} สกิล · เลือกได้ 1 ต่อสนาม</span>
        </div>
        <div className="view-seg">
          <button className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')}>
            <span>Cards</span>
          </button>
          <button className={view === 'compact' ? 'on' : ''} onClick={() => setView('compact')}>
            <span>Compact</span>
          </button>
          <button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>
            <span>Table</span>
          </button>
        </div>
        <div className="h-actions">
          <button className="h-btn gold">Recommend</button>
        </div>
      </div>

      <div className="filters">
        <div className="search">
          <span className="ic">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาสกิล..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="roles">
          {ROLES.map(r => (
            <button
              key={r}
              className={`role-btn ${r} ${role === r ? 'on' : ''}`}
              onClick={() => setRole(r)}
            >
              {r === 'DPS' && <span className="ico">⚔</span>}
              {r === 'Tank' && <span className="ico">🛡</span>}
              {r === 'Heal' && <span className="ico">♥</span>}
              {r === 'Support' && <span className="ico">✦</span>}
              <span>{r}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="highlight-row">
        <span className="hl-label">Highlight</span>
        {HIGHLIGHT_TAGS.map(t => (
          <button
            key={t}
            className={`hl-chip ${hl.has(t) ? 'on' : ''}`}
            onClick={() => toggleHl(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <span className="count">แสดง <b>{filtered.length}</b> / {SKILLS.length}</span>
        <span className="spacer" />
        <select className="sort-sel" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">เรียง: ค่าเริ่มต้น</option>
          <option value="rec">เรียง: แนะนำก่อน</option>
          <option value="cd-asc">เรียง: CD น้อย → มาก</option>
          <option value="cd-desc">เรียง: CD มาก → น้อย</option>
          <option value="name">เรียง: ชื่อ A→Z</option>
        </select>
      </div>

      {view === 'cards'   && <CardView skills={filtered} />}
      {view === 'compact' && <CompactView skills={filtered} />}
      {view === 'table'   && <TableView skills={filtered} />}
    </div>
  );
}

window.SkillApp = App;
