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

type StepStatus = "pending" | "in-progress" | "done";

interface ProcessStep {
  key: string;
  name: string;
  description: string;
  status: StepStatus;
  owner: string;
  remark: string;
  estimateDate: string;
  doneDate: string;
}

interface ArchiveProcess {
  archiveId: string;
  archiveNo: string;
  origin: string;
  description: string;
  steps: ProcessStep[];
}

const STEP_DEFINITIONS = [
  { key: "clean", name: "清洗", description: "使用专用清洁剂去除地毯表面灰尘与污渍，自然阴干" },
  { key: "colorfix", name: "定色", description: "检查染料牢固度，使用固色剂处理褪色区域，匹配色卡" },
  { key: "repair", name: "补线", description: "按照原始纹样结法，使用匹配纱线进行破损区域手工补织" },
  { key: "flatten", name: "压平", description: "通过专业压板与蒸汽处理，修复地毯平整度与边缘卷曲" },
  { key: "archive", name: "归档", description: "拍摄修复前后对比照，填写修复报告，入库登记归档" }
];

function createDefaultSteps(): ProcessStep[] {
  return STEP_DEFINITIONS.map((s, i) => ({
    ...s,
    status: i === 0 ? "in-progress" : ("pending" as StepStatus),
    owner: "",
    remark: "",
    estimateDate: "",
    doneDate: ""
  }));
}

const initialProcesses: ArchiveProcess[] = project.records.map((record) => ({
  archiveId: record[0],
  archiveNo: record[0],
  origin: record[1],
  description: record[2] + " · " + record[3],
  steps: createDefaultSteps()
}));

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
  const [processes, setProcesses] = useState<ArchiveProcess[]>(initialProcesses);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(
    initialProcesses.length > 0 ? initialProcesses[0].archiveId : null
  );
  const [processFilterOrigin, setProcessFilterOrigin] = useState<string>("全部");
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const cardCount = cards.length;

  const originFilters = ["全部", ...project.filters];

  const filteredRecords = activeOrigin === "全部"
    ? project.records
    : project.records.filter((record: string[]) => record[1] === activeOrigin);

  const recordCount = filteredRecords.length;

  const inProgressCount = processes.filter(p =>
    p.steps.some(s => s.status === "in-progress")
  ).length;
  const allDoneCount = processes.filter(p =>
    p.steps.every(s => s.status === "done")
  ).length;

  const metricValues = [
    processes.length - inProgressCount - allDoneCount,
    project.records.length,
    cardCount,
    processes.length > 0
      ? Math.round((allDoneCount / processes.length) * 100)
      : 0
  ];

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

  const filteredProcesses = processFilterOrigin === "全部"
    ? processes
    : processes.filter(p => p.origin === processFilterOrigin);

  const selectedProcess = processes.find(p => p.archiveId === selectedProcessId) || null;

  const processOriginFilters = ["全部", ...project.filters];

  const toggleStepExpand = (stepKey: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  const updateStepField = (
    archiveId: string,
    stepKey: string,
    field: keyof Omit<ProcessStep, "key" | "name" | "description" | "status">,
    value: string
  ) => {
    setProcesses(prev => prev.map(p => {
      if (p.archiveId !== archiveId) return p;
      return {
        ...p,
        steps: p.steps.map(s =>
          s.key === stepKey ? { ...s, [field]: value } : s
        )
      };
    }));
  };

  const setStepStatus = (
    archiveId: string,
    stepKey: string,
    newStatus: StepStatus
  ) => {
    setProcesses(prev => prev.map(p => {
      if (p.archiveId !== archiveId) return p;
      const stepIndex = p.steps.findIndex(s => s.key === stepKey);
      if (stepIndex === -1) return p;
      const newSteps = p.steps.map((s, i) => {
        if (i !== stepIndex) return s;
        const today = new Date().toISOString().split("T")[0];
        return {
          ...s,
          status: newStatus,
          doneDate: newStatus === "done" ? today : s.doneDate
        };
      });
      if (newStatus === "in-progress") {
        for (let i = 0; i < stepIndex; i++) {
          if (newSteps[i].status === "pending") {
            newSteps[i] = { ...newSteps[i], status: "done" };
          }
        }
      }
      if (newStatus === "done") {
        for (let i = 0; i < stepIndex; i++) {
          if (newSteps[i].status !== "done") {
            newSteps[i] = { ...newSteps[i], status: "done", doneDate: newSteps[i].doneDate || new Date().toISOString().split("T")[0] };
          }
        }
        const next = stepIndex + 1;
        if (next < newSteps.length && newSteps[next].status === "pending") {
          newSteps[next] = { ...newSteps[next], status: "in-progress" };
        }
      }
      return { ...p, steps: newSteps };
    }));
  };

  const resetProcessSteps = (archiveId: string) => {
    setProcesses(prev => prev.map(p => {
      if (p.archiveId !== archiveId) return p;
      return { ...p, steps: createDefaultSteps() };
    }));
    setExpandedSteps({});
  };

  const calculateProgress = (steps: ProcessStep[]): number => {
    if (steps.length === 0) return 0;
    const done = steps.filter(s => s.status === "done").length;
    return Math.round((done / steps.length) * 100);
  };

  const getCurrentStep = (steps: ProcessStep[]): ProcessStep | null => {
    const inProgress = steps.find(s => s.status === "in-progress");
    if (inProgress) return inProgress;
    const pending = steps.find(s => s.status === "pending");
    if (pending) return pending;
    return steps.length > 0 ? steps[steps.length - 1] : null;
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

      <section className="panel process-section">
        <div className="heading">
          <div>
            <p>修复流水线</p>
            <h2>工序进度追踪</h2>
          </div>
          <div className="process-header-actions">
            <span className="process-stats">
              进行中 <b>{inProgressCount}</b> · 已完成 <b>{allDoneCount}</b>
            </span>
          </div>
        </div>

        <div className="process-filters">
          {processOriginFilters.map((origin) => (
            <button
              key={origin}
              className={`origin-filter-btn ${processFilterOrigin === origin ? "active" : ""}`}
              onClick={() => {
                setProcessFilterOrigin(origin);
                const firstMatch = origin === "全部"
                  ? processes[0]
                  : processes.find(p => p.origin === origin);
                if (firstMatch) setSelectedProcessId(firstMatch.archiveId);
              }}
            >
              {origin}
            </button>
          ))}
        </div>

        <div className="process-layout">
          <aside className="process-sidebar">
            <div className="process-sidebar-title">档案列表</div>
            <div className="process-sidebar-list">
              {filteredProcesses.length === 0 ? (
                <div className="process-sidebar-empty">暂无该产地档案</div>
              ) : (
                filteredProcesses.map((proc) => {
                  const progress = calculateProgress(proc.steps);
                  const currentStep = getCurrentStep(proc.steps);
                  return (
                    <div
                      key={proc.archiveId}
                      className={`process-sidebar-item ${selectedProcessId === proc.archiveId ? "active" : ""}`}
                      onClick={() => setSelectedProcessId(proc.archiveId)}
                    >
                      <div className="process-sidebar-head">
                        <span className="process-sidebar-no">{proc.archiveNo}</span>
                        <span className={`process-sidebar-badge status-${currentStep?.status || "pending"}`}>
                          {currentStep?.status === "done" ? "已完工" : currentStep?.name || "待开始"}
                        </span>
                      </div>
                      <p className="process-sidebar-desc">{proc.description}</p>
                      <div className="process-sidebar-progress">
                        <div className="process-progress-bar">
                          <div
                            className="process-progress-fill"
                            style={{ width: progress + "%" }}
                          />
                        </div>
                        <span>{progress}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          <section className="process-detail">
            {selectedProcess ? (
              <>
                <div className="process-detail-header">
                  <div>
                    <h3 className="process-detail-no">{selectedProcess.archiveNo}</h3>
                    <div className="process-detail-meta">
                      <span className="process-detail-origin">{selectedProcess.origin}</span>
                      <span className="process-detail-desc">{selectedProcess.description}</span>
                    </div>
                  </div>
                  <div className="process-detail-actions">
                    <div className="process-detail-progress">
                      <span className="process-detail-progress-label">总体进度</span>
                      <div className="process-progress-bar large">
                        <div
                          className="process-progress-fill"
                          style={{ width: calculateProgress(selectedProcess.steps) + "%" }}
                        />
                      </div>
                      <span className="process-detail-progress-value">
                        {calculateProgress(selectedProcess.steps)}%
                      </span>
                    </div>
                    <button
                      className="process-reset-btn"
                      onClick={() => resetProcessSteps(selectedProcess.archiveId)}
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1 1 2 4.47M2 10V5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      重置工序
                    </button>
                  </div>
                </div>

                <div className="stepper">
                  {selectedProcess.steps.map((step, index) => {
                    const isExpanded = expandedSteps[step.key];
                    const isLast = index === selectedProcess.steps.length - 1;
                    return (
                      <div
                        key={step.key}
                        className={`step-item status-${step.status} ${isExpanded ? "expanded" : ""}`}
                      >
                        <div
                          className="step-node-row"
                          onClick={() => toggleStepExpand(step.key)}
                        >
                          <div className="step-connector-wrap">
                            <div className={`step-node status-${step.status}`}>
                              {step.status === "done" ? (
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              ) : (
                                <span>{index + 1}</span>
                              )}
                            </div>
                            {!isLast && <div className={`step-connector status-${step.status}`} />}
                          </div>
                          <div className="step-main">
                            <div className="step-head">
                              <h4 className="step-name">{step.name}</h4>
                              <div className="step-head-right">
                                {step.owner && <span className="step-owner-chip">👤 {step.owner}</span>}
                                <span className={`step-status-tag status-${step.status}`}>
                                  {step.status === "done" ? "已完成" : step.status === "in-progress" ? "进行中" : "待开始"}
                                </span>
                                <span className="step-expand-icon">
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </span>
                              </div>
                            </div>
                            <p className="step-desc">{step.description}</p>
                            <div className="step-meta-row">
                              {step.estimateDate && (
                                <span className="step-meta">
                                  📅 预计：{step.estimateDate}
                                </span>
                              )}
                              {step.status === "done" && step.doneDate && (
                                <span className="step-meta done">
                                  ✅ 完成：{step.doneDate}
                                </span>
                              )}
                              {step.status === "in-progress" && (
                                <span className="step-meta in-progress">
                                  ⏳ 正在处理中
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="step-expand-panel">
                            <div className="step-action-row">
                              <div className="step-action-label">切换状态：</div>
                              <div className="step-action-buttons">
                                <button
                                  className={`status-btn pending ${step.status === "pending" ? "active" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStepStatus(selectedProcess.archiveId, step.key, "pending");
                                  }}
                                >
                                  待开始
                                </button>
                                <button
                                  className={`status-btn in-progress ${step.status === "in-progress" ? "active" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStepStatus(selectedProcess.archiveId, step.key, "in-progress");
                                  }}
                                >
                                  进行中
                                </button>
                                <button
                                  className={`status-btn done ${step.status === "done" ? "active" : ""}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStepStatus(selectedProcess.archiveId, step.key, "done");
                                  }}
                                >
                                  已完成
                                </button>
                              </div>
                            </div>
                            <div className="step-form-grid">
                              <label>
                                <span>负责人</span>
                                <input
                                  placeholder="填写负责人姓名"
                                  value={step.owner}
                                  onChange={(e) => updateStepField(
                                    selectedProcess.archiveId, step.key, "owner", e.target.value
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </label>
                              <label>
                                <span>预计完成时间</span>
                                <input
                                  type="date"
                                  value={step.estimateDate}
                                  onChange={(e) => updateStepField(
                                    selectedProcess.archiveId, step.key, "estimateDate", e.target.value
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </label>
                              <label className="step-form-full">
                                <span>备注</span>
                                <input
                                  placeholder="填写本工序的特殊说明、注意事项等"
                                  value={step.remark}
                                  onChange={(e) => updateStepField(
                                    selectedProcess.archiveId, step.key, "remark", e.target.value
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </label>
                            </div>
                            {step.remark && (
                              <div className="step-remark-display">
                                <span>📝 备注：</span>
                                <p>{step.remark}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="process-detail-empty">
                <div className="empty-icon">
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <circle cx="28" cy="28" r="22" stroke="#d9e2ef" strokeWidth="2" />
                    <path d="M28 14v14l9 5" stroke="#d9e2ef" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p>请从左侧选择一条档案查看工序进度</p>
              </div>
            )}
          </section>
        </div>
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
