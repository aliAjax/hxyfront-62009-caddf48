import { useState } from "react";
import "./styles.css";

const project = {
  "sourceNo": 2,
  "id": "hxyfront-62009",
  "port": 62009,
  "title": "地毯修复纹样档案",
  "domain": "手工地毯修复",
  "prompt": "做一个给手工地毯修复工作室使用的纹样与修复档案前端项目，可以记录地毯产地、年代、结密度、材质、染色类型、破损区域、补线颜色和修复工序。页面需要有纹样局部标记图、修复前后记录、材料色卡、工序进度和按产地筛选的档案列表。",
  "palette": [
    "#7c2d12",
    "#b45309",
    "#0f766e"
  ],
  "metrics": [
    "待修复",
    "纹样档案",
    "色卡数量",
    "完工率"
  ],
  "filters": [
    "波斯",
    "安纳托利亚",
    "高加索",
    "藏毯"
  ],
  "fields": [
    "地毯产地",
    "年代",
    "结密度",
    "材质",
    "染色类型",
    "破损区域"
  ],
  "records": [
    ["CAR-092", "波斯", "羊毛，约1960s", "边缘磨损待补线"],
    ["CAR-117", "安纳托利亚", "植物染，结密度42", "中心纹样缺口"],
    ["CAR-138", "藏毯", "局部褪色", "需匹配靛蓝色卡"],
    ["CAR-145", "波斯", "丝毛混纺，约1940s", "边角破损需重织"],
    ["CAR-156", "高加索", "纯羊毛，约1970s", "几何纹样磨损"],
    ["CAR-172", "安纳托利亚", "羊毛，约1950s", "边框纹样断裂"],
    ["CAR-188", "藏毯", "纯羊毛，手工纺线", "龙纹图案补线"],
    ["CAR-203", "高加索", "植物染，结密度38", "中央菱形纹残缺"],
    ["CAR-215", "波斯", "真丝，约1930s", "金葱线氧化褪色"]
  ]
};

interface ColorCard {
  id: string;
  colorName: string;
  colorHex: string;
  dyeType: string;
  origin: string;
  remark: string;
}

const initialCards: ColorCard[] = [
  { id: "cc-001", colorName: "靛蓝", colorHex: "#1e3a5f", dyeType: "植物染", origin: "波斯", remark: "用于深蓝底色修复" },
  { id: "cc-002", colorName: "赭石", colorHex: "#a0522d", dyeType: "矿物染", origin: "安纳托利亚", remark: "边缘纹样补线" },
  { id: "cc-003", colorName: "藏红", colorHex: "#8b1a1a", dyeType: "植物染", origin: "藏毯", remark: "中心图案常用" },
  { id: "cc-004", colorName: "苔绿", colorHex: "#4a7c59", dyeType: "植物染", origin: "高加索", remark: "叶纹补线配色" }
];

const emptyForm: Omit<ColorCard, "id"> = {
  colorName: "",
  colorHex: "#7c2d12",
  dyeType: "",
  origin: "",
  remark: ""
};

function App() {
  const [cards, setCards] = useState<ColorCard[]>(initialCards);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ColorCard, "id">>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeOrigin, setActiveOrigin] = useState<string>("全部");

  const cardCount = cards.length;

  const originFilters = ["全部", ...project.filters];

  const filteredRecords = activeOrigin === "全部"
    ? project.records
    : project.records.filter((record: string[]) => record[1] === activeOrigin);

  const recordCount = filteredRecords.length;

  const metricValues = [28, project.records.length, cardCount, 91];

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (card: ColorCard) => {
    setEditingId(card.id);
    setForm({
      colorName: card.colorName,
      colorHex: card.colorHex,
      dyeType: card.dyeType,
      origin: card.origin,
      remark: card.remark
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = () => {
    if (!form.colorName.trim() || !form.dyeType.trim() || !form.origin.trim()) return;
    if (editingId) {
      setCards(prev =>
        prev.map(c => (c.id === editingId ? { ...c, ...form } : c))
      );
    } else {
      const newCard: ColorCard = {
        id: "cc-" + Date.now().toString(36),
        ...form
      };
      setCards(prev => [...prev, newCard]);
    }
    closeForm();
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const executeDelete = () => {
    if (deletingId) {
      setCards(prev => prev.filter(c => c.id !== deletingId));
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const updateForm = (field: keyof Omit<ColorCard, "id">, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <main className="app">
      <section className="hero">
        <p>{project.id} · 源提示词{project.sourceNo} · Port {project.port}</p>
        <h1>{project.title}</h1>
        <span>{project.prompt}</span>
      </section>

      <section className="metrics">
        {project.metrics.map((metric: string, index: number) => (
          <article key={metric}>
            <small>{metric}</small>
            <strong>{metricValues[index]}</strong>
          </article>
        ))}
      </section>

      <section className="workspace">
        <aside className="panel">
          <h2>{project.domain}分类</h2>
          <div className="chips">
            {project.filters.map((item: string) => (
              <button key={item}>{item}</button>
            ))}
          </div>
        </aside>

        <section className="panel form-panel">
          <div className="heading">
            <div>
              <p>专业字段</p>
              <h2>新增记录</h2>
            </div>
            <button className="primary">保存记录</button>
          </div>
          <div className="field-grid">
            {project.fields.map((field: string) => (
              <label key={field}>
                <span>{field}</span>
                <input placeholder={"填写" + field} />
              </label>
            ))}
          </div>
        </section>
      </section>

      <section className="panel">
        <div className="heading">
          <div>
            <p>近期记录</p>
            <h2>工作台摘要</h2>
          </div>
          <button>导出CSV</button>
        </div>
        <div className="records">
          {project.records.map((record: string[], index: number) => (
            <article key={record.join("-")}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <div>
                <h3>{record[0]}</h3>
                <p>{record.slice(1).join(" · ")}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel archive-section">
        <div className="heading">
          <div>
            <p>产地分类</p>
            <h2>按产地浏览档案</h2>
          </div>
          <span className="record-count">共 {recordCount} 条记录</span>
        </div>

        <div className="origin-filters">
          {originFilters.map((origin: string) => (
            <button
              key={origin}
              className={`origin-filter-btn ${activeOrigin === origin ? "active" : ""}`}
              onClick={() => setActiveOrigin(origin)}
            >
              {origin}
            </button>
          ))}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="archive-empty">
            <div className="empty-icon">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="8" width="40" height="40" rx="8" stroke="#d9e2ef" strokeWidth="2" fill="none" />
                <path d="M18 22h20M18 30h20M18 38h12" stroke="#d9e2ef" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p>暂无该产地的档案记录</p>
            <span>切换其他产地查看更多档案</span>
          </div>
        ) : (
          <div className="archive-list">
            {filteredRecords.map((record: string[], index: number) => (
              <article key={record.join("-")} className="archive-item">
                <div className="archive-index">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="archive-content">
                  <div className="archive-header">
                    <h3>{record[0]}</h3>
                    <span className="archive-origin-tag">{record[1]}</span>
                  </div>
                  <p className="archive-desc">{record[2]}</p>
                  <p className="archive-status">{record[3]}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel colorcard-section">
        <div className="heading">
          <div>
            <p>补线与染料</p>
            <h2>材料色卡管理</h2>
          </div>
          <button className="primary" onClick={openAdd}>新增色卡</button>
        </div>

        {cards.length === 0 ? (
          <div className="colorcard-empty">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="36" height="36" rx="6" stroke="#d9e2ef" strokeWidth="2" fill="none" />
                <circle cx="24" cy="24" r="8" stroke="#d9e2ef" strokeWidth="2" fill="none" />
                <line x1="24" y1="14" x2="24" y2="34" stroke="#d9e2ef" strokeWidth="2" />
                <line x1="14" y1="24" x2="34" y2="24" stroke="#d9e2ef" strokeWidth="2" />
              </svg>
            </div>
            <p>暂无色卡记录</p>
            <span>点击「新增色卡」添加补线颜色与染料信息</span>
          </div>
        ) : (
          <div className="colorcard-grid">
            {cards.map(card => (
              <article key={card.id} className="colorcard-item">
                <div className="colorcard-swatch" style={{ background: card.colorHex }}>
                  <span className="colorcard-hex">{card.colorHex}</span>
                </div>
                <div className="colorcard-body">
                  <div className="colorcard-header">
                    <h3>{card.colorName}</h3>
                    <div className="colorcard-actions">
                      <button className="action-btn edit-btn" onClick={() => openEdit(card)} title="编辑">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                      </button>
                      <button className="action-btn delete-btn" onClick={() => confirmDelete(card.id)} title="删除">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                  <div className="colorcard-tags">
                    <span className="tag tag-dye">{card.dyeType}</span>
                    <span className="tag tag-origin">{card.origin}</span>
                  </div>
                  {card.remark && <p className="colorcard-remark">{card.remark}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? "编辑色卡" : "新增色卡"}</h2>
              <button className="close-btn" onClick={closeForm}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <label>
                <span>补线颜色名称</span>
                <input
                  placeholder="如：靛蓝、赭石"
                  value={form.colorName}
                  onChange={e => updateForm("colorName", e.target.value)}
                />
              </label>
              <label>
                <span>补线颜色色值</span>
                <div className="color-input-row">
                  <input
                    type="color"
                    value={form.colorHex}
                    onChange={e => updateForm("colorHex", e.target.value)}
                    className="color-picker"
                  />
                  <input
                    placeholder="#000000"
                    value={form.colorHex}
                    onChange={e => updateForm("colorHex", e.target.value)}
                  />
                </div>
              </label>
              <label>
                <span>染料类型</span>
                <input
                  placeholder="如：植物染、矿物染、化学染"
                  value={form.dyeType}
                  onChange={e => updateForm("dyeType", e.target.value)}
                />
              </label>
              <label>
                <span>适用产地</span>
                <input
                  placeholder="如：波斯、藏毯"
                  value={form.origin}
                  onChange={e => updateForm("origin", e.target.value)}
                />
              </label>
              <label>
                <span>备注</span>
                <input
                  placeholder="补充说明（选填）"
                  value={form.remark}
                  onChange={e => updateForm("remark", e.target.value)}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button onClick={closeForm}>取消</button>
              <button className="primary" onClick={handleSubmit}>
                {editingId ? "保存修改" : "确认新增"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>确认删除</h2>
            </div>
            <div className="modal-body">
              <p>删除后无法恢复，是否确认删除该色卡？</p>
            </div>
            <div className="modal-footer">
              <button onClick={cancelDelete}>取消</button>
              <button className="danger-btn" onClick={executeDelete}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
