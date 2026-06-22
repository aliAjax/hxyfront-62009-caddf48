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

type DamageType =
  | "边缘磨损"
  | "中心纹样缺口"
  | "局部褪色"
  | "边角破损"
  | "纹样断裂"
  | "污渍腐蚀";

type RepairPriority = "urgent" | "high" | "normal" | "low";

interface DamageMark {
  id: string;
  x: number;
  y: number;
  damageType: DamageType;
  areaDesc: string;
  threadColor: string;
  priority: RepairPriority;
}

const DAMAGE_TYPES: DamageType[] = [
  "边缘磨损",
  "中心纹样缺口",
  "局部褪色",
  "边角破损",
  "纹样断裂",
  "污渍腐蚀"
];

const PRIORITY_OPTIONS: { value: RepairPriority; label: string; color: string }[] = [
  { value: "urgent", label: "紧急", color: "#dc2626" },
  { value: "high", label: "高", color: "#b45309" },
  { value: "normal", label: "中", color: "#0f766e" },
  { value: "low", label: "低", color: "#64748b" }
];

type RepairStage = "before" | "during" | "after";

const REPAIR_STAGE_LABEL: Record<RepairStage, string> = {
  before: "修复前",
  during: "修复中",
  after: "修复后"
};

const REPAIR_STAGE_COLOR: Record<RepairStage, string> = {
  before: "#dc2626",
  during: "#b45309",
  after: "#0f766e"
};

const REPAIR_STAGE_PLACEHOLDER: Record<RepairStage, string> = {
  before: "#fecaca",
  during: "#fed7aa",
  after: "#99f6e4"
};

interface RepairImageItem {
  id: string;
  placeholderColor: string;
  label: string;
}

interface RepairRecordItem {
  id: string;
  images: RepairImageItem[];
  shootDate: string;
  damageDesc: string;
  repairNote: string;
  materialRemark: string;
}

interface ArchiveRepairRecords {
  archiveId: string;
  before: RepairRecordItem;
  during: RepairRecordItem;
  after: RepairRecordItem;
}

const createEmptyRepairRecord = (stage: RepairStage): RepairRecordItem => ({
  id: "rr-" + stage + "-" + Date.now().toString(36),
  images: [
    { id: "img-1", placeholderColor: REPAIR_STAGE_PLACEHOLDER[stage], label: "主视图" },
    { id: "img-2", placeholderColor: REPAIR_STAGE_PLACEHOLDER[stage], label: "局部特写" }
  ],
  shootDate: "",
  damageDesc: "",
  repairNote: "",
  materialRemark: ""
});

const createInitialRepairRecords = (archiveId: string): ArchiveRepairRecords => ({
  archiveId,
  before: {
    ...createEmptyRepairRecord("before"),
    shootDate: "2026-03-15",
    damageDesc: "左边缘经线断裂约3cm，右侧纬线松脱，表面有轻微污渍",
    repairNote: "待清洗后评估破损程度，确认补线方案",
    materialRemark: "初步匹配赭石色羊毛纱线，需进一步比对色卡"
  },
  during: {
    ...createEmptyRepairRecord("during"),
    shootDate: "2026-04-02",
    damageDesc: "清洗后破损区域清晰显现，边缘磨损延伸约5cm",
    repairNote: "已完成定色工序，正在进行左边缘手工补织，采用原结法复刻",
    materialRemark: "使用色卡 cc-002 赭石羊毛线，每厘米约42结"
  },
  after: {
    ...createEmptyRepairRecord("after"),
    id: "rr-after-empty",
    images: [
      { id: "img-1", placeholderColor: REPAIR_STAGE_PLACEHOLDER.after, label: "待上传" }
    ],
    shootDate: "",
    damageDesc: "",
    repairNote: "",
    materialRemark: ""
  }
});

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

const initialRepairRecordsByArchive: Record<string, ArchiveRepairRecords> = {
  "CAR-092": createInitialRepairRecords("CAR-092"),
  "CAR-117": {
    archiveId: "CAR-117",
    before: {
      id: "rr-before-117",
      images: [
        { id: "img-1", placeholderColor: REPAIR_STAGE_PLACEHOLDER.before, label: "中心区域" },
        { id: "img-2", placeholderColor: REPAIR_STAGE_PLACEHOLDER.before, label: "缺口特写" }
      ],
      shootDate: "2026-02-28",
      damageDesc: "中央花卉纹样缺失约2x2cm，周围纬线松散",
      repairNote: "需要重建纹样结构，先固定周围纱线再补织",
      materialRemark: "匹配藏红色羊毛线与植物染工艺"
    },
    during: {
      id: "rr-during-117",
      images: [
        { id: "img-1", placeholderColor: REPAIR_STAGE_PLACEHOLDER.during, label: "补织进度" }
      ],
      shootDate: "2026-03-20",
      damageDesc: "",
      repairNote: "已完成底层经纱固定，正在进行纹样逐层补织",
      materialRemark: "使用色卡 cc-003 藏红，按原纹样品对结"
    },
    after: createEmptyRepairRecord("after")
  }
};

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

  const initialMarksByArchive: Record<string, DamageMark[]> = {
    "CAR-092": [
      { id: "m1", x: 12, y: 50, damageType: "边缘磨损", areaDesc: "左边缘经线断裂约3cm", threadColor: "#a0522d", priority: "high" },
      { id: "m2", x: 88, y: 52, damageType: "边缘磨损", areaDesc: "右边缘纬线松脱", threadColor: "#7c2d12", priority: "normal" }
    ],
    "CAR-117": [
      { id: "m3", x: 50, y: 48, damageType: "中心纹样缺口", areaDesc: "中央花卉纹缺失约2x2cm", threadColor: "#8b1a1a", priority: "urgent" }
    ],
    "CAR-138": [
      { id: "m4", x: 30, y: 30, damageType: "局部褪色", areaDesc: "左上角靛蓝色区域褪色", threadColor: "#1e3a5f", priority: "low" }
    ]
  };

  const [marksByArchive, setMarksByArchive] = useState<Record<string, DamageMark[]>>(initialMarksByArchive);
  const [selectedMarkId, setSelectedMarkId] = useState<string | null>(null);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [pendingMarkPos, setPendingMarkPos] = useState<{ x: number; y: number } | null>(null);
  const [markForm, setMarkForm] = useState<Omit<DamageMark, "id">>({
    x: 50,
    y: 50,
    damageType: "边缘磨损",
    areaDesc: "",
    threadColor: "#7c2d12",
    priority: "normal"
  });
  const [deletingMarkId, setDeletingMarkId] = useState<string | null>(null);

  const [repairRecordsByArchive, setRepairRecordsByArchive] = useState<Record<string, ArchiveRepairRecords>>(initialRepairRecordsByArchive);
  const [repairViewMode, setRepairViewMode] = useState<"manage" | "compare">("manage");
  const [repairEditingStage, setRepairEditingStage] = useState<RepairStage | null>(null);
  const [repairForm, setRepairForm] = useState<RepairRecordItem | null>(null);

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

  const currentMarks = selectedProcessId ? (marksByArchive[selectedProcessId] || []) : [];

  const handlePatternClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingMarkPos({ x, y });
    setEditingMarkId(null);
    setMarkForm({
      x,
      y,
      damageType: "边缘磨损",
      areaDesc: "",
      threadColor: "#7c2d12",
      priority: "normal"
    });
    setShowMarkForm(true);
  };

  const openMarkEdit = (mark: DamageMark) => {
    setEditingMarkId(mark.id);
    setPendingMarkPos(null);
    setMarkForm({
      x: mark.x,
      y: mark.y,
      damageType: mark.damageType,
      areaDesc: mark.areaDesc,
      threadColor: mark.threadColor,
      priority: mark.priority
    });
    setShowMarkForm(true);
  };

  const closeMarkForm = () => {
    setShowMarkForm(false);
    setEditingMarkId(null);
    setPendingMarkPos(null);
  };

  const updateMarkForm = (field: keyof Omit<DamageMark, "id">, value: string) => {
    setMarkForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMarkSubmit = () => {
    if (!selectedProcessId || !markForm.areaDesc.trim()) return;
    if (editingMarkId) {
      setMarksByArchive(prev => ({
        ...prev,
        [selectedProcessId]: (prev[selectedProcessId] || []).map(m =>
          m.id === editingMarkId ? { ...m, ...markForm, id: m.id } : m
        )
      }));
    } else {
      const newMark: DamageMark = {
        id: "mk-" + Date.now().toString(36),
        ...markForm
      };
      setMarksByArchive(prev => ({
        ...prev,
        [selectedProcessId]: [...(prev[selectedProcessId] || []), newMark]
      }));
    }
    closeMarkForm();
  };

  const confirmDeleteMark = (id: string) => {
    setDeletingMarkId(id);
  };

  const executeDeleteMark = () => {
    if (!selectedProcessId || !deletingMarkId) return;
    setMarksByArchive(prev => ({
      ...prev,
      [selectedProcessId]: (prev[selectedProcessId] || []).filter(m => m.id !== deletingMarkId)
    }));
    if (selectedMarkId === deletingMarkId) setSelectedMarkId(null);
    setDeletingMarkId(null);
  };

  const cancelDeleteMark = () => {
    setDeletingMarkId(null);
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

  const getOrCreateRepairRecords = (archiveId: string): ArchiveRepairRecords => {
    return repairRecordsByArchive[archiveId] || {
      archiveId,
      before: createEmptyRepairRecord("before"),
      during: createEmptyRepairRecord("during"),
      after: createEmptyRepairRecord("after")
    };
  };

  const openRepairEdit = (stage: RepairStage) => {
    if (!selectedProcessId) return;
    const records = getOrCreateRepairRecords(selectedProcessId);
    const record = records[stage];
    setRepairEditingStage(stage);
    setRepairForm(JSON.parse(JSON.stringify(record)));
  };

  const closeRepairEdit = () => {
    setRepairEditingStage(null);
    setRepairForm(null);
  };

  const updateRepairForm = (field: keyof RepairRecordItem, value: string) => {
    if (!repairForm) return;
    setRepairForm({ ...repairForm, [field]: value });
  };

  const addRepairImage = () => {
    if (!repairForm || !repairEditingStage) return;
    const newImage: RepairImageItem = {
      id: "img-" + Date.now().toString(36),
      placeholderColor: REPAIR_STAGE_PLACEHOLDER[repairEditingStage],
      label: `图片 ${repairForm.images.length + 1}`
    };
    setRepairForm({ ...repairForm, images: [...repairForm.images, newImage] });
  };

  const removeRepairImage = (imageId: string) => {
    if (!repairForm) return;
    if (repairForm.images.length <= 1) return;
    setRepairForm({ ...repairForm, images: repairForm.images.filter(img => img.id !== imageId) });
  };

  const updateRepairImageLabel = (imageId: string, label: string) => {
    if (!repairForm) return;
    setRepairForm({
      ...repairForm,
      images: repairForm.images.map(img => img.id === imageId ? { ...img, label } : img)
    });
  };

  const handleRepairSubmit = () => {
    if (!selectedProcessId || !repairForm || !repairEditingStage) return;
    setRepairRecordsByArchive(prev => {
      const existing = prev[selectedProcessId] || {
        archiveId: selectedProcessId,
        before: createEmptyRepairRecord("before"),
        during: createEmptyRepairRecord("during"),
        after: createEmptyRepairRecord("after")
      };
      return {
        ...prev,
        [selectedProcessId]: {
          ...existing,
          [repairEditingStage]: repairForm
        }
      };
    });
    closeRepairEdit();
  };

  const resetRepairStage = (stage: RepairStage) => {
    if (!selectedProcessId) return;
    setRepairRecordsByArchive(prev => {
      const existing = prev[selectedProcessId] || {
        archiveId: selectedProcessId,
        before: createEmptyRepairRecord("before"),
        during: createEmptyRepairRecord("during"),
        after: createEmptyRepairRecord("after")
      };
      return {
        ...prev,
        [selectedProcessId]: {
          ...existing,
          [stage]: createEmptyRepairRecord(stage)
        }
      };
    });
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

      <section className="panel patternmark-section">
        <div className="heading">
          <div>
            <p>档案详情</p>
            <h2>纹样局部标记图</h2>
          </div>
          <div className="patternmark-header-actions">
            <span className="process-stats">
              当前标记 <b>{currentMarks.length}</b> 处
            </span>
          </div>
        </div>

        {selectedProcess ? (
          <div className="patternmark-layout">
            <div className="patternmark-canvas-wrap">
              <div className="patternmark-canvas-hint">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                点击纹样示意图任意位置添加破损标记
              </div>
              <div className="patternmark-canvas" onClick={handlePatternClick}>
                <svg className="patternmark-svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <pattern id="carpet-bg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <rect width="40" height="40" fill="#f5efe4"/>
                      <path d="M0 20 L40 20 M20 0 L20 40" stroke="#d9c9a8" strokeWidth="0.5"/>
                    </pattern>
                    <linearGradient id="carpet-border" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7c2d12"/>
                      <stop offset="100%" stopColor="#b45309"/>
                    </linearGradient>
                  </defs>
                  <rect x="4" y="4" width="592" height="392" rx="8" fill="url(#carpet-bg)" stroke="url(#carpet-border)" strokeWidth="4"/>
                  <rect x="30" y="30" width="540" height="340" rx="4" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="6 4" opacity="0.6"/>
                  <rect x="60" y="60" width="480" height="280" rx="2" fill="none" stroke="#b45309" strokeWidth="1.5" opacity="0.5"/>
                  <g opacity="0.7">
                    <circle cx="150" cy="120" r="28" fill="none" stroke="#7c2d12" strokeWidth="1.5"/>
                    <circle cx="150" cy="120" r="14" fill="none" stroke="#0f766e" strokeWidth="1"/>
                    <polygon points="150,90 162,120 150,150 138,120" fill="none" stroke="#b45309" strokeWidth="1"/>
                    <circle cx="450" cy="120" r="28" fill="none" stroke="#7c2d12" strokeWidth="1.5"/>
                    <circle cx="450" cy="120" r="14" fill="none" stroke="#0f766e" strokeWidth="1"/>
                    <polygon points="450,90 462,120 450,150 438,120" fill="none" stroke="#b45309" strokeWidth="1"/>
                    <circle cx="150" cy="280" r="28" fill="none" stroke="#7c2d12" strokeWidth="1.5"/>
                    <circle cx="150" cy="280" r="14" fill="none" stroke="#0f766e" strokeWidth="1"/>
                    <polygon points="150,250 162,280 150,310 138,280" fill="none" stroke="#b45309" strokeWidth="1"/>
                    <circle cx="450" cy="280" r="28" fill="none" stroke="#7c2d12" strokeWidth="1.5"/>
                    <circle cx="450" cy="280" r="14" fill="none" stroke="#0f766e" strokeWidth="1"/>
                    <polygon points="450,250 462,280 450,310 438,280" fill="none" stroke="#b45309" strokeWidth="1"/>
                    <g transform="translate(300 200)">
                      <circle cx="0" cy="0" r="60" fill="none" stroke="#7c2d12" strokeWidth="2"/>
                      <circle cx="0" cy="0" r="38" fill="none" stroke="#b45309" strokeWidth="1.5"/>
                      <circle cx="0" cy="0" r="18" fill="none" stroke="#0f766e" strokeWidth="1.5"/>
                      <path d="M0,-60 L0,60 M-60,0 L60,0 M-42,-42 L42,42 M42,-42 L-42,42" stroke="#7c2d12" strokeWidth="1" opacity="0.6"/>
                    </g>
                    <g opacity="0.4">
                      {[80, 160, 240, 320, 400, 480, 560].map((x, i) => (
                        <line key={"v"+i} x1={x} y1="70" x2={x} y2="330" stroke="#7c2d12" strokeWidth="0.6"/>
                      ))}
                      {[90, 170, 250, 330].map((y, i) => (
                        <line key={"h"+i} x1="70" y1={y} x2="530" y2={y} stroke="#b45309" strokeWidth="0.6"/>
                      ))}
                    </g>
                  </g>
                </svg>

                {currentMarks.map((mark, index) => {
                  const priority = PRIORITY_OPTIONS.find(p => p.value === mark.priority);
                  const isSelected = selectedMarkId === mark.id;
                  return (
                    <div
                      key={mark.id}
                      className={`patternmark-pin ${isSelected ? "selected" : ""}`}
                      style={{
                        left: mark.x + "%",
                        top: mark.y + "%",
                        borderColor: priority?.color || "#64748b",
                        background: priority?.color || "#64748b"
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMarkId(isSelected ? null : mark.id);
                      }}
                      title={`标记 ${index + 1}：${mark.damageType}`}
                    >
                      <span>{index + 1}</span>
                      {isSelected && (
                        <div className="patternmark-pin-tooltip">
                          <b>标记 {index + 1}</b>
                          <span>{mark.damageType}</span>
                          <small>{mark.areaDesc}</small>
                        </div>
                      )}
                    </div>
                  );
                })}

                {pendingMarkPos && (
                  <div
                    className="patternmark-pin pending"
                    style={{ left: pendingMarkPos.x + "%", top: pendingMarkPos.y + "%" }}
                  >
                    <span>?</span>
                  </div>
                )}
              </div>
            </div>

            <div className="patternmark-sidebar">
              <div className="patternmark-sidebar-title">
                <span>破损标记列表</span>
                <span className="patternmark-count">{currentMarks.length}</span>
              </div>
              {currentMarks.length === 0 ? (
                <div className="patternmark-empty">
                  <div className="empty-icon">
                    <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="18" stroke="#d9e2ef" strokeWidth="2" strokeDasharray="4 3"/>
                      <path d="M24 14v20M14 24h20" stroke="#d9e2ef" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p>暂无标记</p>
                  <span>点击左侧纹样图添加破损标记</span>
                </div>
              ) : (
                <div className="patternmark-list">
                  {currentMarks.map((mark, index) => {
                    const priority = PRIORITY_OPTIONS.find(p => p.value === mark.priority);
                    const isSelected = selectedMarkId === mark.id;
                    return (
                      <div
                        key={mark.id}
                        className={`patternmark-item ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedMarkId(isSelected ? null : mark.id)}
                      >
                        <div className="patternmark-item-index" style={{ background: priority?.color || "#64748b" }}>
                          {index + 1}
                        </div>
                        <div className="patternmark-item-body">
                          <div className="patternmark-item-head">
                            <h4>{mark.damageType}</h4>
                            <span className="patternmark-priority" style={{ color: priority?.color, borderColor: priority?.color }}>
                              {priority?.label}
                            </span>
                          </div>
                          <p className="patternmark-item-desc">{mark.areaDesc}</p>
                          <div className="patternmark-item-meta">
                            <span className="patternmark-color-chip" style={{ background: mark.threadColor }} title={mark.threadColor}/>
                            <span className="patternmark-color-hex">{mark.threadColor}</span>
                          </div>
                        </div>
                        <div className="patternmark-item-actions">
                          <button className="action-btn edit-btn" title="编辑" onClick={(e) => { e.stopPropagation(); openMarkEdit(mark); }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                          </button>
                          <button className="action-btn delete-btn" title="删除" onClick={(e) => { e.stopPropagation(); confirmDeleteMark(mark.id); }}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="patternmark-empty large">
            <div className="empty-icon">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect x="8" y="8" width="40" height="40" rx="8" stroke="#d9e2ef" strokeWidth="2" fill="none"/>
                <circle cx="20" cy="22" r="4" stroke="#d9e2ef" strokeWidth="1.5"/>
                <circle cx="36" cy="34" r="4" stroke="#d9e2ef" strokeWidth="1.5"/>
                <path d="M20 22 L36 34" stroke="#d9e2ef" strokeWidth="1.5" strokeDasharray="3 3"/>
              </svg>
            </div>
            <p>请从左侧工序进度列表选择一条档案</p>
            <span>选中后可在纹样示意图上添加与管理破损标记</span>
          </div>
        )}
      </section>

      {showMarkForm && (
        <div className="modal-overlay" onClick={closeMarkForm}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMarkId ? "编辑破损标记" : "新增破损标记"}</h2>
              <button className="close-btn" onClick={closeMarkForm}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <label>
                <span>破损类型</span>
                <select
                  value={markForm.damageType}
                  onChange={e => updateMarkForm("damageType", e.target.value)}
                >
                  {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>
                <span>区域说明</span>
                <input
                  placeholder="如：左边缘经线断裂约3cm"
                  value={markForm.areaDesc}
                  onChange={e => updateMarkForm("areaDesc", e.target.value)}
                />
              </label>
              <label>
                <span>补线颜色</span>
                <div className="color-input-row">
                  <input
                    type="color"
                    value={markForm.threadColor}
                    onChange={e => updateMarkForm("threadColor", e.target.value)}
                    className="color-picker"
                  />
                  <input
                    placeholder="#000000"
                    value={markForm.threadColor}
                    onChange={e => updateMarkForm("threadColor", e.target.value)}
                  />
                </div>
              </label>
              <label>
                <span>修复优先级</span>
                <div className="priority-radio-row">
                  {PRIORITY_OPTIONS.map(opt => (
                    <label key={opt.value} className={`priority-radio ${markForm.priority === opt.value ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="priority"
                        value={opt.value}
                        checked={markForm.priority === opt.value}
                        onChange={() => updateMarkForm("priority", opt.value)}
                      />
                      <span style={{ borderColor: opt.color, color: opt.color }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </label>
              <div className="patternmark-pos-preview">
                <span>📍 标记位置：X {markForm.x.toFixed(1)}% · Y {markForm.y.toFixed(1)}%</span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeMarkForm}>取消</button>
              <button className="primary" onClick={handleMarkSubmit}>
                {editingMarkId ? "保存修改" : "确认添加"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingMarkId && (
        <div className="modal-overlay" onClick={cancelDeleteMark}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>确认删除标记</h2>
            </div>
            <div className="modal-body">
              <p>删除后该标记将从图上移除，编号会自动重新整理，是否确认？</p>
            </div>
            <div className="modal-footer">
              <button onClick={cancelDeleteMark}>取消</button>
              <button className="danger-btn" onClick={executeDeleteMark}>确认删除</button>
            </div>
          </div>
        </div>
      )}

      <section className="panel repair-section">
        <div className="heading">
          <div>
            <p>修复档案</p>
            <h2>修复前后记录</h2>
          </div>
          <div className="repair-header-actions">
            <div className="repair-view-toggle">
              <button
                className={repairViewMode === "manage" ? "active" : ""}
                onClick={() => setRepairViewMode("manage")}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                管理视图
              </button>
              <button
                className={repairViewMode === "compare" ? "active" : ""}
                onClick={() => setRepairViewMode("compare")}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M7 6h2M7 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                对比视图
              </button>
            </div>
          </div>
        </div>

        {selectedProcess ? (
          repairViewMode === "manage" ? (
            <div className="repair-manage-grid">
              {(["before", "during", "after"] as RepairStage[]).map((stage) => {
                const records = getOrCreateRepairRecords(selectedProcess.archiveId);
                const record = records[stage];
                const hasContent = record.shootDate || record.damageDesc || record.repairNote || record.materialRemark;
                const stageColor = REPAIR_STAGE_COLOR[stage];
                return (
                  <article key={stage} className={`repair-card stage-${stage}`}>
                    <div className="repair-card-header" style={{ borderColor: stageColor }}>
                      <div className="repair-card-title">
                        <span className="repair-stage-badge" style={{ background: stageColor }}>
                          {REPAIR_STAGE_LABEL[stage]}
                        </span>
                        {hasContent && record.shootDate && (
                          <span className="repair-card-date">📅 {record.shootDate}</span>
                        )}
                      </div>
                      <div className="repair-card-actions">
                        <button
                          className="action-btn edit-btn"
                          title="编辑记录"
                          onClick={() => openRepairEdit(stage)}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="清空记录"
                          onClick={() => resetRepairStage(stage)}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </div>

                    <div className="repair-card-body">
                      <div className="repair-image-gallery">
                        {record.images.map((img, idx) => (
                          <div key={img.id} className="repair-image-placeholder" title={img.label}>
                            <div className="repair-image-block" style={{ background: img.placeholderColor }}>
                              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M5 24l6-6 5 5 3-3 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span className="repair-image-label">{img.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="repair-fields-list">
                        {record.damageDesc && (
                          <div className="repair-field">
                            <span className="repair-field-label">破损描述</span>
                            <p className="repair-field-value">{record.damageDesc}</p>
                          </div>
                        )}
                        {record.repairNote && (
                          <div className="repair-field">
                            <span className="repair-field-label">修复说明</span>
                            <p className="repair-field-value">{record.repairNote}</p>
                          </div>
                        )}
                        {record.materialRemark && (
                          <div className="repair-field">
                            <span className="repair-field-label">材料备注</span>
                            <p className="repair-field-value">{record.materialRemark}</p>
                          </div>
                        )}
                        {!record.damageDesc && !record.repairNote && !record.materialRemark && (
                          <div className="repair-empty-hint">
                            <span>暂无记录内容</span>
                            <button className="repair-add-inline" onClick={() => openRepairEdit(stage)}>
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                              添加记录
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="repair-compare-layout">
              <div className="repair-compare-header">
                <div className="repair-compare-col-header repair-compare-field-label">
                  阶段对比
                </div>
                {(["before", "during", "after"] as RepairStage[]).map((stage) => (
                  <div key={stage} className="repair-compare-col-header">
                    <span className="repair-stage-badge" style={{ background: REPAIR_STAGE_COLOR[stage] }}>
                      {REPAIR_STAGE_LABEL[stage]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="repair-compare-row repair-compare-images-row">
                <div className="repair-compare-field-label">
                  图片记录
                </div>
                {(["before", "during", "after"] as RepairStage[]).map((stage) => {
                  const records = getOrCreateRepairRecords(selectedProcess.archiveId);
                  const record = records[stage];
                  return (
                    <div key={stage} className="repair-compare-col">
                      <div className="repair-compare-images">
                        {record.images.map((img) => (
                          <div key={img.id} className="repair-image-placeholder large" title={img.label}>
                            <div className="repair-image-block" style={{ background: img.placeholderColor }}>
                              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                                <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M5 24l6-6 5 5 3-3 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span className="repair-image-label">{img.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {["shootDate", "damageDesc", "repairNote", "materialRemark"].map((fieldKey) => {
                const labelMap: Record<string, string> = {
                  shootDate: "拍摄日期",
                  damageDesc: "破损描述",
                  repairNote: "修复说明",
                  materialRemark: "材料备注"
                };
                return (
                  <div key={fieldKey} className="repair-compare-row">
                    <div className="repair-compare-field-label">{labelMap[fieldKey]}</div>
                    {(["before", "during", "after"] as RepairStage[]).map((stage) => {
                      const records = getOrCreateRepairRecords(selectedProcess.archiveId);
                      const record = records[stage];
                      const value = record[fieldKey as keyof RepairRecordItem];
                      return (
                        <div key={stage} className="repair-compare-col">
                          {value ? (
                            <p className="repair-compare-value">{String(value)}</p>
                          ) : (
                            <span className="repair-compare-empty">—</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="repair-empty">
            <div className="empty-icon">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <rect x="6" y="10" width="20" height="36" rx="3" stroke="#d9e2ef" strokeWidth="2"/>
                <rect x="30" y="10" width="20" height="36" rx="3" stroke="#d9e2ef" strokeWidth="2"/>
                <path d="M26 20h4M26 36h4" stroke="#d9e2ef" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p>请从工序进度列表选择一条档案</p>
            <span>选中后可维护修复前、修复中、修复后的三组记录</span>
          </div>
        )}
      </section>

      {repairEditingStage && repairForm && (
        <div className="modal-overlay" onClick={closeRepairEdit}>
          <div className="modal modal-repair" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="repair-stage-badge" style={{ background: REPAIR_STAGE_COLOR[repairEditingStage] }}>
                  {REPAIR_STAGE_LABEL[repairEditingStage]}
                </span>
                编辑修复记录
              </h2>
              <button className="close-btn" onClick={closeRepairEdit}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="repair-form-images">
                <div className="repair-form-images-header">
                  <span>图片占位（点击色块可编辑标签，可新增/删除）</span>
                  <button className="repair-add-image-btn" onClick={addRepairImage}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    新增图片
                  </button>
                </div>
                <div className="repair-form-images-grid">
                  {repairForm.images.map((img) => (
                    <div key={img.id} className="repair-form-image-item">
                      <div
                        className="repair-image-block form"
                        style={{ background: img.placeholderColor }}
                      >
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                          <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                          <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M5 24l6-6 5 5 3-3 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <input
                        className="repair-form-image-label"
                        placeholder="图片标签"
                        value={img.label}
                        onChange={(e) => updateRepairImageLabel(img.id, e.target.value)}
                      />
                      {repairForm.images.length > 1 && (
                        <button
                          className="repair-form-image-remove"
                          onClick={() => removeRepairImage(img.id)}
                          title="移除图片"
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <label>
                <span>拍摄日期</span>
                <input
                  type="date"
                  value={repairForm.shootDate}
                  onChange={(e) => updateRepairForm("shootDate", e.target.value)}
                />
              </label>
              <label>
                <span>破损描述</span>
                <textarea
                  className="repair-textarea"
                  placeholder="描述该阶段的破损情况、位置、面积等"
                  value={repairForm.damageDesc}
                  onChange={(e) => updateRepairForm("damageDesc", e.target.value)}
                  rows={3}
                />
              </label>
              <label>
                <span>修复说明</span>
                <textarea
                  className="repair-textarea"
                  placeholder="记录修复方案、工序、工艺要点等"
                  value={repairForm.repairNote}
                  onChange={(e) => updateRepairForm("repairNote", e.target.value)}
                  rows={3}
                />
              </label>
              <label>
                <span>材料备注</span>
                <textarea
                  className="repair-textarea"
                  placeholder="记录使用的纱线、染料、色卡编号等材料信息"
                  value={repairForm.materialRemark}
                  onChange={(e) => updateRepairForm("materialRemark", e.target.value)}
                  rows={3}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button onClick={closeRepairEdit}>取消</button>
              <button className="primary" onClick={handleRepairSubmit}>保存记录</button>
            </div>
          </div>
        </div>
      )}

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
