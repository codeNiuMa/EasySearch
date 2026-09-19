const DEFAULT_ENGINES = [
  {
    id: "google",
    name: "Google",
    mark: "G",
    category: "通用",
    color: "#4285f4",
    template: "https://www.google.com/search?q={query}",
  },
  {
    id: "baidu",
    name: "百度",
    mark: "百",
    category: "通用",
    color: "#315efb",
    template: "https://www.baidu.com/s?wd={query}",
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    mark: "D",
    category: "通用",
    color: "#de5833",
    template: "https://duckduckgo.com/?q={query}",
  },
  {
    id: "yandex",
    name: "Yandex",
    mark: "Y",
    category: "通用",
    color: "#ed1c24",
    template: "https://yandex.com/search/?text={query}",
  },
  {
    id: "bilibili",
    name: "哔哩哔哩",
    mark: "B",
    category: "视频",
    color: "#00aeec",
    template: "https://search.bilibili.com/all?keyword={query}",
  },
  {
    id: "youtube",
    name: "YouTube",
    mark: "▶",
    category: "视频",
    color: "#ff0033",
    template: "https://www.youtube.com/results?search_query={query}",
  },
  {
    id: "xiaohongshu",
    name: "小红书",
    mark: "小",
    category: "生活",
    color: "#ff2442",
    template: "https://www.xiaohongshu.com/search_result?keyword={query}",
  },
  {
    id: "smzdm",
    name: "什么值得买",
    mark: "值",
    category: "生活",
    color: "#e62828",
    template: "https://search.smzdm.com/?s={query}",
  },
  {
    id: "amap",
    name: "高德地图",
    mark: "图",
    category: "地图",
    color: "#3478f6",
    template: "https://ditu.amap.com/search?query={query}",
  },
];

const STORAGE = {
  theme: "easysearch.theme",
  selected: "easysearch.selected-engine",
  custom: "easysearch.custom-engines",
};

const CATEGORY_ORDER = ["全部", "通用", "视频", "生活", "地图", "自定义"];
const state = {
  category: "全部",
  selectedId: localStorage.getItem(STORAGE.selected) || "google",
  customEngines: readCustomEngines(),
};

const elements = {
  root: document.documentElement,
  themeMeta: document.querySelector('meta[name="theme-color"]'),
  themeToggle: document.querySelector("#theme-toggle"),
  dateLine: document.querySelector("#date-line"),
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  searchHint: document.querySelector("#search-hint"),
  selectedEngine: document.querySelector("#selected-engine"),
  engineGrid: document.querySelector("#engine-grid"),
  emptyState: document.querySelector("#empty-state"),
  categoryTabs: document.querySelector("#category-tabs"),
  manageEngines: document.querySelector("#manage-engines"),
  engineDialog: document.querySelector("#engine-dialog"),
  engineForm: document.querySelector("#engine-form"),
  customName: document.querySelector("#custom-name"),
  customUrl: document.querySelector("#custom-url"),
  formError: document.querySelector("#form-error"),
  customListSection: document.querySelector("#custom-list-section"),
  customList: document.querySelector("#custom-list"),
};

function readCustomEngines() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE.custom) || "[]");
    return Array.isArray(value) ? value.filter(isValidStoredEngine) : [];
  } catch {
    return [];
  }
}

function isValidStoredEngine(engine) {
  return (
    engine &&
    typeof engine.id === "string" &&
    typeof engine.name === "string" &&
    typeof engine.template === "string" &&
    engine.template.includes("{query}")
  );
}

function getEngines() {
  return [...DEFAULT_ENGINES, ...state.customEngines];
}

function getSelectedEngine() {
  const engines = getEngines();
  return engines.find((engine) => engine.id === state.selectedId) || engines[0];
}

function getDomain(template) {
  try {
    return new URL(template.replace("{query}", "keyword")).hostname.replace(/^www\./, "");
  } catch {
    return "自定义入口";
  }
}

function escapeMarkup(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setTheme(theme) {
  elements.root.dataset.theme = theme;
  elements.themeToggle.setAttribute("aria-label", theme === "dark" ? "切换浅色模式" : "切换深色模式");
  elements.themeMeta.setAttribute("content", theme === "dark" ? "#0b1019" : "#f4f7fb");
  localStorage.setItem(STORAGE.theme, theme);
}

function initializeTheme() {
  const saved = localStorage.getItem(STORAGE.theme);
  const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(saved || preferred);
}

function renderDate() {
  elements.dateLine.textContent = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

function renderCategories() {
  const available = new Set(getEngines().map((engine) => engine.category));
  const categories = CATEGORY_ORDER.filter((category) => category === "全部" || available.has(category));

  elements.categoryTabs.innerHTML = categories
    .map(
      (category) => `
        <button
          class="category-tab"
          type="button"
          data-category="${escapeMarkup(category)}"
          aria-pressed="${category === state.category}"
        >${escapeMarkup(category)}</button>
      `,
    )
    .join("");
}

function renderEngines() {
  const engines = getEngines();
  if (!engines.some((engine) => engine.id === state.selectedId)) {
    state.selectedId = engines[0].id;
  }

  const filtered = engines.filter((engine) => state.category === "全部" || engine.category === state.category);
  elements.engineGrid.innerHTML = filtered
    .map((engine) => {
      const shortcutIndex = engines.indexOf(engine) + 1;
      const shortcut = shortcutIndex <= 9 ? `Alt+${shortcutIndex}` : "";
      return `
        <button
          class="engine-card"
          type="button"
          role="radio"
          aria-checked="${engine.id === state.selectedId}"
          data-engine-id="${escapeMarkup(engine.id)}"
          style="--engine-color: ${escapeMarkup(engine.color)}"
        >
          <span class="engine-badge" aria-hidden="true">${escapeMarkup(engine.mark)}</span>
          <span class="engine-copy">
            <span class="engine-name">${escapeMarkup(engine.name)}</span>
            <span class="engine-domain">${escapeMarkup(getDomain(engine.template))}</span>
          </span>
          <span class="engine-shortcut" aria-hidden="true">${shortcut}</span>
        </button>
      `;
    })
    .join("");

  elements.emptyState.hidden = filtered.length > 0;
  updateSelectedDisplay();
}

function updateSelectedDisplay() {
  const engine = getSelectedEngine();
  elements.selectedEngine.textContent = engine.mark;
  elements.selectedEngine.style.setProperty("--engine-color", engine.color);
  elements.searchInput.setAttribute("aria-label", `使用${engine.name}搜索`);
}

function selectEngine(id, focusSearch = true) {
  if (!getEngines().some((engine) => engine.id === id)) return;
  state.selectedId = id;
  localStorage.setItem(STORAGE.selected, id);
  renderEngines();
  if (focusSearch) elements.searchInput.focus();
}

function setCategory(category) {
  state.category = category;
  renderCategories();
  renderEngines();
}

function showSearchMessage(message, isError = false) {
  elements.searchHint.textContent = message;
  elements.searchHint.classList.toggle("is-error", isError);
}

function performSearch() {
  const query = elements.searchInput.value.trim();
  if (!query) {
    showSearchMessage("先输入想要查找的内容。", true);
    elements.searchInput.focus();
    return;
  }

  const engine = getSelectedEngine();
  const target = engine.template.replace("{query}", encodeURIComponent(query));
  showSearchMessage(`正在通过 ${engine.name} 打开搜索结果…`);

  const newWindow = window.open(target, "_blank", "noopener,noreferrer");
  if (!newWindow) {
    showSearchMessage("浏览器阻止了新标签页，请允许弹出窗口后重试。", true);
  }
}

function renderCustomList() {
  elements.customListSection.hidden = state.customEngines.length === 0;
  elements.customList.innerHTML = state.customEngines
    .map(
      (engine) => `
        <div class="custom-list-item">
          <span>${escapeMarkup(engine.name)} · ${escapeMarkup(getDomain(engine.template))}</span>
          <button type="button" data-delete-engine="${escapeMarkup(engine.id)}">删除</button>
        </div>
      `,
    )
    .join("");
}

function openEngineDialog() {
  elements.formError.textContent = "";
  renderCustomList();
  elements.engineDialog.showModal();
  window.setTimeout(() => elements.customName.focus(), 40);
}

function saveCustomEngine() {
  const name = elements.customName.value.trim();
  const template = elements.customUrl.value.trim();

  if (!name) {
    elements.formError.textContent = "请输入入口名称。";
    elements.customName.focus();
    return false;
  }

  if (!template.includes("{query}")) {
    elements.formError.textContent = "地址模板中需要包含 {query}。";
    elements.customUrl.focus();
    return false;
  }

  try {
    const parsed = new URL(template.replace("{query}", "keyword"));
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Unsupported protocol");
  } catch {
    elements.formError.textContent = "请输入有效的 http 或 https 搜索地址。";
    elements.customUrl.focus();
    return false;
  }

  const id = `custom-${Date.now()}`;
  state.customEngines.push({
    id,
    name,
    mark: name.slice(0, 1).toUpperCase(),
    category: "自定义",
    color: "#7357d8",
    template,
  });
  localStorage.setItem(STORAGE.custom, JSON.stringify(state.customEngines));
  elements.engineForm.reset();
  state.selectedId = id;
  state.category = "全部";
  renderCategories();
  renderEngines();
  renderCustomList();
  elements.engineDialog.close();
  elements.searchInput.focus();
  return true;
}

function deleteCustomEngine(id) {
  state.customEngines = state.customEngines.filter((engine) => engine.id !== id);
  localStorage.setItem(STORAGE.custom, JSON.stringify(state.customEngines));
  if (state.selectedId === id) state.selectedId = "google";
  if (state.category === "自定义" && state.customEngines.length === 0) state.category = "全部";
  renderCategories();
  renderEngines();
  renderCustomList();
}

function registerAgentTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;

  const reportRegistrationError = (error) => {
    console.warn("EasySearch agent tool registration failed", error);
  };

  const registrations = [
    context.registerTool({
      name: "list_search_engines",
      title: "列出搜索入口",
      description: "读取 EasySearch 当前可用的搜索入口及其标识，不会打开网页。",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        return {
          engines: getEngines().map(({ id, name, category }) => ({ id, name, category })),
          selectedEngineId: state.selectedId,
        };
      },
    }),
    context.registerTool({
      name: "prepare_search",
      title: "准备搜索",
      description: "在 EasySearch 中选择入口并填入关键词，但不提交搜索或打开外部网站。",
      inputSchema: {
        type: "object",
        properties: {
          engineId: {
            type: "string",
            description: "来自 list_search_engines 的入口标识。",
          },
          query: {
            type: "string",
            minLength: 1,
            maxLength: 500,
            description: "准备填入搜索框的关键词。",
          },
        },
        required: ["engineId", "query"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const engineId = typeof input?.engineId === "string" ? input.engineId : "";
        const query = typeof input?.query === "string" ? input.query.trim() : "";
        const engine = getEngines().find((item) => item.id === engineId);

        if (!engine) throw new Error("未知的搜索入口标识。请先调用 list_search_engines。");
        if (!query) throw new Error("搜索关键词不能为空。");
        if (query.length > 500) throw new Error("搜索关键词不能超过 500 个字符。");

        selectEngine(engineId, false);
        elements.searchInput.value = query;
        showSearchMessage(`已准备通过 ${engine.name} 搜索；确认后可手动提交。`);
        elements.searchInput.focus();
        return { prepared: true, engineId, engineName: engine.name, query };
      },
    }),
  ];

  registrations.forEach((registration) => {
    void Promise.resolve(registration).catch(reportRegistrationError);
  });
}

elements.themeToggle.addEventListener("click", () => {
  setTheme(elements.root.dataset.theme === "dark" ? "light" : "dark");
});

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  performSearch();
});

elements.searchInput.addEventListener("input", () => {
  if (elements.searchHint.classList.contains("is-error")) {
    showSearchMessage("关键词仅用于生成目标网址，不会上传到 EasySearch。");
  }
});

elements.categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) setCategory(button.dataset.category);
});

elements.engineGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-engine-id]");
  if (button) selectEngine(button.dataset.engineId);
});

elements.manageEngines.addEventListener("click", openEngineDialog);

elements.engineForm.addEventListener("submit", (event) => {
  const submitter = event.submitter;
  if (submitter?.value === "cancel") return;
  event.preventDefault();
  saveCustomEngine();
});

elements.customList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-engine]");
  if (button) deleteCustomEngine(button.dataset.deleteEngine);
});

document.addEventListener("keydown", (event) => {
  const isTyping = ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName);
  if (event.key === "/" && !isTyping && !elements.engineDialog.open) {
    event.preventDefault();
    elements.searchInput.focus();
  }

  if (event.altKey && /^[1-9]$/.test(event.key)) {
    const engine = getEngines()[Number(event.key) - 1];
    if (engine) {
      event.preventDefault();
      selectEngine(engine.id);
    }
  }
});

initializeTheme();
renderDate();
renderCategories();
renderEngines();
registerAgentTools();
elements.searchInput.focus();
