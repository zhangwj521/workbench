// =================== 存储工具 ===================
const STORE_KEY = "xqx_workbench_v1";
const STORE = {
  load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  },
  save(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  },
  get(key, def = []) {
    const data = this.load();
    return data[key] !== undefined ? data[key] : def;
  },
  set(key, val) {
    const data = this.load();
    data[key] = val;
    this.save(data);
  }
};

// =================== 工具函数 ===================
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

// =================== 彩色圆底图标（与图片同款） ===================
const ICONS = {
  home: { emoji: "🏠", bg: "#E8D5F2" },
  calendar: { emoji: "📅", bg: "#E0E7FF" },
  cpu: { emoji: "🤖", bg: "#F3E8FF" },
  brain: { emoji: "🧠", bg: "#EDE4FF" },
  apple: { emoji: "🥗", bg: "#EDE4FF" },
  activity: { emoji: "🏃", bg: "#FFF0E0" },
  wallet: { emoji: "💰", bg: "#FFF9C4" },
  notebook: { emoji: "📝", bg: "#E3F2FD" },
  newspaper: { emoji: "📰", bg: "#FCE4EC" },
  bar: { emoji: "📊", bg: "#E8F5E9" },
  droplet: { emoji: "💆", bg: "#F3E5F5" },
  bookOpen: { emoji: "📖", bg: "#E0F7FA" },
  star: { emoji: "⭐", bg: "#FFF9C4" },
  flame: { emoji: "🔥", bg: "#FFEEE0" },
  rocket: { emoji: "🚀", bg: "#F3E8FF" },
  clipboard: { emoji: "📋", bg: "#F5F5F5" },
  utensils: { emoji: "🍽️", bg: "#FFE0B2" },
  list: { emoji: "📋", bg: "#F5F5F5" },
  scale: { emoji: "⚖️", bg: "#E1F5FE" },
  plus: { emoji: "➕", bg: "#E8D5F2" },
  scroll: { emoji: "📜", bg: "#FFF8E1" },
  book: { emoji: "📚", bg: "#E0F7FA" },
  sunrise: { emoji: "🌅", bg: "#FFF3E0" },
  sun: { emoji: "☀️", bg: "#FFF9C4" },
  moon: { emoji: "🌙", bg: "#ECEFF1" },
  edit: { emoji: "✏️", bg: "#E3F2FD" },
  check: { emoji: "✅", bg: "#E0F2E9" },
  dollar: { emoji: "💵", bg: "#FFF9C4" },
  trendDown: { emoji: "📉", bg: "#FFCDD2" },
  clock: { emoji: "⏰", bg: "#F3E5F5" },
  volume: { emoji: "🔊", bg: "#E0F7FA" },
  chat: { emoji: "💬", bg: "#E3F2FD" },
  speaker: { emoji: "🗣️", bg: "#E3F2FD" },
  globe: { emoji: "🌐", bg: "#E0F7FA" }
};
function ic(name, size = "sm") {
  const item = ICONS[name] || { emoji: "✨", bg: "#E8D5F2" };
  return `<span class="ico-circle ico-${size}" style="background:${item.bg}" aria-hidden="true">${item.emoji}</span>`;
}

// 侧边导航（动态渲染，保证图标风格统一）
const NAV = [
  { page: "dashboard", label: "工作台", icon: "home" },
  { page: "daily", label: "每日计划", icon: "calendar" },
  { page: "ai", label: "AI学习", icon: "brain" },
  { page: "news", label: "时政热点", icon: "newspaper" },
  { page: "word", label: "学英语", icon: "bookOpen" },
  { page: "diet", label: "减肥计划", icon: "apple" },
  { page: "sport", label: "运动", icon: "activity" },
  { page: "money", label: "记账", icon: "wallet" },
  { page: "skincare", label: "护肤记录", icon: "droplet" },
  { page: "weekly", label: "周总结", icon: "bar" },
  { page: "memo", label: "备忘录", icon: "notebook" }
];
function renderNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  nav.innerHTML = NAV.map(n =>
    `<a class="nav-item" data-page="${n.page}">${ic(n.icon, "md")}<span>${n.label}</span></a>`
  ).join("");
}
renderNav();

// 一次性数据迁移：体重单位随下方 TARGET_UNIT 转换（当前目标 kg —— 之前是斤则 ÷2 转回）
(function migrateWeightUnit() {
  const TARGET_UNIT = "kg";
  const data = STORE.load();
  if (data.__weightUnit !== TARGET_UNIT) {
    if (data.__weightUnit === "jin" && Array.isArray(data.weight) && data.weight.length) {
      data.weight = data.weight.map(w => ({ ...w, value: +(w.value / 2).toFixed(1) }));
    }
    data.__weightUnit = TARGET_UNIT;
    STORE.save(data);
  }
})();

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};
const now = () => new Date().toLocaleString("zh-CN", { hour12: false });
const fmtDate = (d) => {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};
const weekDay = (d = new Date()) => ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
const genId = () => "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// =================== 美化弹窗（替代原生 alert/confirm） ===================
let _modalEl = null;
let _modalResolve = null;

function _removeModal() {
  if (_modalEl) {
    _modalEl.remove();
    _modalEl = null;
    _modalResolve = null;
  }
}

function _showModal(title, body, buttons) {
  _removeModal();
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true">
      <div class="modal-title">${escapeHtml(title)}</div>
      <div class="modal-body">${escapeHtml(body)}</div>
      <div class="modal-actions">
        ${buttons.map(b => `<button class="modal-btn ${b.primary ? "primary" : "secondary"}" data-value="${b.value}">${escapeHtml(b.text)}</button>`).join("")}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  _modalEl = overlay;

  return new Promise(resolve => {
    _modalResolve = resolve;
    overlay.querySelectorAll(".modal-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-value") === "true";
        _removeModal();
        resolve(val);
      });
    });
    overlay.addEventListener("click", e => {
      if (e.target === overlay) {
        const cancelVal = buttons.find(b => !b.primary);
        _removeModal();
        resolve(cancelVal ? cancelVal.value : false);
      }
    });
  });
}

function appAlert(msg, title = "提示") {
  return _showModal(title, msg, [{ text: "确定", value: true, primary: true }]);
}

function appConfirm(msg, title = "确认") {
  return _showModal(title, msg, [{ text: "取消", value: false }, { text: "确定", value: true, primary: true }]);
}

window.appAlert = appAlert;
window.appConfirm = appConfirm;
window.alert = appAlert;

// =================== 数据默认值 ===================
const DEFAULT_TASKS = [
  { time: "07:00", text: "起床 + 敲胆经（站立，左右各5-10分钟）→ 喝温开水" },
  { time: "08:00", text: "闲鱼虚拟资料：自动生成今日可上架的虚拟资料" },
  { time: "08:30", text: "每日热点推送：自动展示今日热点，并给出选题建议" },
  { time: "09:00", text: "喝水，适量活动" },
  { time: "09:30", text: "公众号：自动生成今日公众号文章" }
];

const DEFAULT_WORDS = [
  { en: "new", phonetic: "/nju:/", cn: "新的", example: "Out with the old, in with the new." },
  { en: "home", phonetic: "/hәum/", cn: "家", example: "the home of the pine" },
  { en: "page", phonetic: "/peidʒ/", cn: "页", example: "the page of history" },
  { en: "search", phonetic: "/sә:tʃ/", cn: "搜寻", example: "With only five minutes until we were meant to leave, the search for the keys started in earnest." },
  { en: "free", phonetic: "/fri:/", cn: "自由的", example: "He was given free rein to do whatever he wanted." },
  { en: "one", phonetic: "/wʌn/", cn: "一", example: "I knew as soon I met him that John was the one for me and we were married within a month." },
  { en: "information", phonetic: "/.infә'meiʃәn/", cn: "消息", example: "I need some more information about this issue." },
  { en: "time", phonetic: "/taim/", cn: "时间", example: "Time stops for nobody.   the ebb and flow of time" },
  { en: "site", phonetic: "/sait/", cn: "位置", example: "the site of a city or of a house" },
  { en: "news", phonetic: "/nju:z/", cn: "新闻", example: "Is there any news about the storm?" },
  { en: "use", phonetic: "/ju:s/", cn: "使用", example: "The use of torture has been condemned by the United Nations." },
  { en: "see", phonetic: "/si:/", cn: "看见", example: "1999 saw the release of many great films." },
  { en: "contact", phonetic: "/'kɒntækt/", cn: "联系", example: "I haven't been in contact with her for years." },
  { en: "business", phonetic: "/'biznis/", cn: "生意", example: "I was left my father's business." },
  { en: "web", phonetic: "/web/", cn: "网", example: "Some of that content is now only available on the Web." },
  { en: "help", phonetic: "/help/", cn: "帮忙", example: "I need some help with my homework." },
  { en: "get", phonetic: "/get/", cn: "得到", example: "I'm going to get a computer tomorrow from the discount store." },
  { en: "pm", phonetic: "", cn: "出纳员", example: "Where is the pm?" },
  { en: "view", phonetic: "/vju:/", cn: "视野", example: "a fine view of Lake George" },
  { en: "online", phonetic: "/ɒnˈlaɪn/", cn: "[计]联机", example: "I prefer to read online newspapers." },
  { en: "c", phonetic: "/si:/", cn: "[计]调用", example: "The document was written in the Middle Ages, c. 1250." },
  { en: "e", phonetic: "/i:/", cn: "[计]元件", example: "This is my e." },
  { en: "first", phonetic: "/fә:st/", cn: "首先", example: "He was the first to complete the course." },
  { en: "am", phonetic: "/æm/", cn: "的单数第一人称\\[计]存取管理程序", example: "I like this am." },
  { en: "been", phonetic: "/bi:n/", cn: "的过去分词", example: "Do you need a been?" },
  { en: "s", phonetic: "/es/", cn: "[计]标量", example: "mating season" },
  { en: "services", phonetic: "/ˈsɜːvɪsɪz/", cn: "服务", example: "This is my services." },
  { en: "these", phonetic: "/ði:z/", cn: "这些", example: "Where is the these?" },
  { en: "click", phonetic: "/klik/", cn: "咔哒声", example: "I like this click." },
  { en: "its", phonetic: "/its/", cn: "它的", example: "Do you need an its?" },
  { en: "like", phonetic: "/laik/", cn: "相似的", example: "I have a like." },
  { en: "service", phonetic: "/'sә:vis/", cn: "服务", example: "This is my service." },
  { en: "x", phonetic: "/eks/", cn: "未知数\\[计]交换", example: "Where is the x?" },
  { en: "find", phonetic: "/faind/", cn: "发现", example: "I like this find." },
  { en: "price", phonetic: "/prais/", cn: "价格", example: "Do you need a price?" },
  { en: "date", phonetic: "/deit/", cn: "日期", example: "I have a date." },
  { en: "back", phonetic: "/bæk/", cn: "后面的\\.使后退", example: "This is my back." },
  { en: "top", phonetic: "/tɒp/", cn: "顶部", example: "Where is the top?" },
  { en: "people", phonetic: "/'pi:pl/", cn: "人", example: "I like this people." },
  { en: "list", phonetic: "/list/", cn: "目录", example: "Do you need a list?" },
  { en: "name", phonetic: "/neim/", cn: "名字", example: "I have a name." },
  { en: "state", phonetic: "/steit/", cn: "州", example: "This is my state." },
  { en: "year", phonetic: "/jiә/", cn: "年", example: "Where is the year?" },
  { en: "day", phonetic: "/dei/", cn: "天", example: "I like this day." },
  { en: "email", phonetic: "/'i:'meil/", cn: "电子信函", example: "Do you need an email?" },
  { en: "two", phonetic: "/tu:/", cn: "二", example: "I have a two." },
  { en: "health", phonetic: "/'helθ/", cn: "健康", example: "This is my health." },
  { en: "n", phonetic: "/en/", cn: "[计]负的", example: "Where is the n?" },
  { en: "world", phonetic: "/wә:ld/", cn: "世界", example: "I like this world." },
  { en: "re", phonetic: "/ri:/", cn: "关于\\.不动产", example: "Do you need a re?" },
  { en: "next", phonetic: "/'nekst/", cn: "下一个\\.下一个的", example: "I have a next." },
  { en: "used", phonetic: "/'ju:st/", cn: "使用过的", example: "This is my used." },
  { en: "go", phonetic: "/gou/", cn: "去", example: "Where is the go?" },
  { en: "b", phonetic: "/bi:/", cn: "[计]基地址", example: "I like this b." },
  { en: "work", phonetic: "/wә:k/", cn: "工作", example: "Do you need a work?" },
  { en: "last", phonetic: "/lɑ:st/", cn: "最后的", example: "I have a last." },
  { en: "products", phonetic: "/ˈpɹɒd.əkts/", cn: "产品", example: "This is my products." },
  { en: "music", phonetic: "/'mju:zik/", cn: "音乐", example: "Where is the music?" },
  { en: "buy", phonetic: "/bai/", cn: "买", example: "I like this buy." },
  { en: "data", phonetic: "/'deitә/", cn: "资料", example: "Do you need a data?" },
  { en: "make", phonetic: "/meik/", cn: "制造", example: "I have a make." },
  { en: "product", phonetic: "/'prɒdʌkt/", cn: "产品", example: "This is my product." },
  { en: "system", phonetic: "/'sistәm/", cn: "系统", example: "Where is the system?" },
  { en: "post", phonetic: "/pәust/", cn: "柱", example: "I like this post." },
  { en: "city", phonetic: "/'siti/", cn: "城市", example: "Do you need a city?" },
  { en: "t", phonetic: "/ti:/", cn: "[计]表", example: "I have a t." },
  { en: "add", phonetic: "/æd/", cn: "增加", example: "This is my add." },
  { en: "policy", phonetic: "/'pɒlisi/", cn: "政策", example: "Where is the policy?" },
  { en: "number", phonetic: "/'nʌmbә/", cn: "数", example: "I like this number." },
  { en: "please", phonetic: "/pli:z/", cn: "请\\.使高兴", example: "Do you need a please?" },
  { en: "available", phonetic: "/ә'veilәbl/", cn: "可利用的", example: "I have an available." },
  { en: "copyright", phonetic: "/'kɒpirait/", cn: "版权", example: "This is my copyright." },
  { en: "support", phonetic: "/sә'pɒ:t/", cn: "支持", example: "Where is the support?" },
  { en: "message", phonetic: "/'mesidʒ/", cn: "消息", example: "I like this message." },
  { en: "best", phonetic: "/best/", cn: "最好的\\.最好地\\.最好的人", example: "Do you need a best?" },
  { en: "software", phonetic: "/'sɒftwєә/", cn: "软件\\[计]软设备", example: "I have a software." },
  { en: "jan", phonetic: "/dʒæn/", cn: "一月", example: "This is my jan." },
  { en: "good", phonetic: "/gud/", cn: "善行", example: "The soup is good and hot." },
  { en: "video", phonetic: "/'vidiәu/", cn: "影像", example: "I like this video." },
  { en: "well", phonetic: "/wel/", cn: "井", example: "I had been sick, but now I'm well." },
  { en: "d", phonetic: "/di:/", cn: "[计]数据", example: "The cat jumped down from the table." },
  { en: "info", phonetic: "/'infәu/", cn: "信息\\[计]信息", example: "This is my info." },
  { en: "rights", phonetic: "/ɹaɪts/", cn: "正当权利\\[计]权限", example: "We're on the side of right in this contest." },
  { en: "public", phonetic: "/'pʌblik/", cn: "公众", example: "Members of the public may not proceed beyond this point." },
  { en: "books", phonetic: "/bʊks/", cn: "书评", example: "He was frustrated because he couldn't find anything about dinosaurs in the book." },
  { en: "high", phonetic: "/hai/", cn: "高度", example: "It was one of the highs of his career." },
  { en: "school", phonetic: "/sku:l/", cn: "学校", example: "The divers encountered a huge school of mackerel." },
  { en: "m", phonetic: "/em/", cn: "[计]尾数", example: "“John”, “Paul” and “Jake” are masculine names." },
  { en: "links", phonetic: "/liŋks/", cn: "高尔夫球场", example: "Click the hyperlink to go to the next page." },
  { en: "review", phonetic: "/ri'vju:/", cn: "检讨", example: "I need to make a review of the book before I can understand it." },
  { en: "years", phonetic: "/ji.ə(ɹ)z/", cn: "年代", example: "we moved to this town a year ago;  I quit smoking exactly one year ago" },
  { en: "order", phonetic: "/'ɒ:dә/", cn: "次序", example: "The house is in order; the machinery is out of order." },
  { en: "privacy", phonetic: "/'praivәsi/", cn: "隐私", example: "I need my privacy, so please stay out of my room." },
  { en: "book", phonetic: "/buk/", cn: "书", example: "He was frustrated because he couldn't find anything about dinosaurs in the book." },
  { en: "items", phonetic: "/ˈaɪtəmz/", cn: "项目", example: "Tweezers are great for manipulating small items." },
  { en: "company", phonetic: "/'kʌmpәni/", cn: "公司", example: "Keep the house clean; I have company coming." },
  { en: "r", phonetic: "/ɑ:(r)/", cn: "[计]半径", example: "This is my r." },
  { en: "read", phonetic: "/ri:d/", cn: "读", example: "His thrillers are always a gripping read." },
  { en: "group", phonetic: "/gru:p/", cn: "团体", example: "I like this group." },
  { en: "need", phonetic: "/ni:d/", cn: "需要", example: "Do you need a need?" },
  { en: "many", phonetic: "/'meni/", cn: "多数", example: "I have a many." },
  { en: "user", phonetic: "/'ju:zә/", cn: "使用者\\[计]用户", example: "This is my user." },
  { en: "said", phonetic: "/sed/", cn: "上述的\\的过去式和过去分词", example: "Where is the said?" },
  { en: "de", phonetic: "/di:/", cn: "[化]非对映体过量\\[医]铥", example: "I like this de." },
  { en: "set", phonetic: "/set/", cn: "日落", example: "Do you need a set?" },
  { en: "general", phonetic: "/'dʒenәrәl/", cn: "一般", example: "I have a general." },
  { en: "research", phonetic: "/ri'sә:tʃ/", cn: "研究", example: "This is my research." },
  { en: "university", phonetic: "/.ju:ni'vә:siti/", cn: "大学", example: "Where is the university?" },
  { en: "january", phonetic: "/'dʒænjuәri/", cn: "一月", example: "I like this january." },
  { en: "mail", phonetic: "/meil/", cn: "邮件", example: "Do you need a mail?" },
  { en: "full", phonetic: "/ful/", cn: "全部", example: "I have a full." },
  { en: "map", phonetic: "/mæp/", cn: "地图", example: "This is my map." },
  { en: "reviews", phonetic: "", cn: "评论", example: "Where is the reviews?" },
  { en: "program", phonetic: "/'prәugræm/", cn: "节目", example: "I like this program." },
  { en: "life", phonetic: "/laif/", cn: "生活", example: "Do you need a life?" },
  { en: "know", phonetic: "/nәu/", cn: "知道", example: "I have a know." },
  { en: "way", phonetic: "/wei/", cn: "路", example: "This is my way." },
  { en: "days", phonetic: "/deiz/", cn: "一生", example: "Where is the days?" },
  { en: "management", phonetic: "/'mænidʒmәnt/", cn: "经营", example: "I like this management." },
  { en: "p", phonetic: "/pi:/", cn: "便士\\[计]页", example: "Do you need a p?" },
  { en: "part", phonetic: "/pɑ:t/", cn: "部分", example: "I have a part." },
  { en: "great", phonetic: "/greit/", cn: "大的", example: "This is my great." },
  { en: "united", phonetic: "/ju:'naitid/", cn: "联合的", example: "Where is the united?" },
  { en: "hotel", phonetic: "/hәu'tel/", cn: "旅馆", example: "I like this hotel." },
  { en: "real", phonetic: "/'riәl/", cn: "真的", example: "Do you need a real?" },
  { en: "f", phonetic: "/ef/", cn: "[计]故障", example: "I have a f." },
  { en: "item", phonetic: "/'aitәm/", cn: "项目", example: "This is my item." },
  { en: "international", phonetic: "/.intә'næʃәnәl/", cn: "国际的\\.国别设定\\[计]国别设定", example: "Where is the international?" },
  { en: "center", phonetic: "/'sentә/", cn: "中心", example: "I like this center." },
  { en: "ebay", phonetic: "", cn: "电子港湾", example: "Do you need an ebay?" },
  { en: "store", phonetic: "/stɒ:/", cn: "商店", example: "I have a store." },
  { en: "travel", phonetic: "/'trævl/", cn: "旅行", example: "This is my travel." },
  { en: "comments", phonetic: "/ˈkɒmɛnts/", cn: "注解", example: "Where is the comments?" },
  { en: "made", phonetic: "/meid/", cn: "人工制成的", example: "I like this made." },
  { en: "development", phonetic: "/di'velәpmәnt/", cn: "发展\\[化]展开", example: "Do you need a development?" },
  { en: "report", phonetic: "/ri'pɒ:t/", cn: "报告", example: "I have a report." },
  { en: "member", phonetic: "/'membә/", cn: "成员", example: "This is my member." },
  { en: "details", phonetic: "/dɪˈteɪlz/", cn: "详细资料", example: "Where is the details?" },
  { en: "line", phonetic: "/lain/", cn: "列", example: "I like this line." },
  { en: "terms", phonetic: "/tɜːmz/", cn: "条件", example: "Do you need a terms?" },
  { en: "hotels", phonetic: "", cn: "酒店", example: "I have a hotels." },
  { en: "send", phonetic: "/send/", cn: "发送", example: "This is my send." },
  { en: "right", phonetic: "/rait/", cn: "权利", example: "Where is the right?" },
  { en: "type", phonetic: "/taip/", cn: "类型", example: "I like this type." },
  { en: "because", phonetic: "/bi'kɒ:z/", cn: "因为", example: "Do you need a because?" },
  { en: "local", phonetic: "/'lәukәl/", cn: "地方性的", example: "I have a local." },
  { en: "those", phonetic: "/ðәuz/", cn: "那些", example: "This is my those." },
  { en: "using", phonetic: "/ˈjuːzɪŋ/", cn: "[计]使用", example: "Where is the using?" },
  { en: "results", phonetic: "/ɹɪˈzʌlts/", cn: "结果", example: "I like this results." },
  { en: "office", phonetic: "/'ɒfis/", cn: "办公室", example: "Do you need an office?" },
  { en: "education", phonetic: "/.edju'keiʃәn/", cn: "教育", example: "I have an education." },
  { en: "national", phonetic: "/'næʃәnәl/", cn: "国家的", example: "This is my national." },
  { en: "car", phonetic: "/kɑ:/", cn: "汽车", example: "Where is the car?" },
  { en: "design", phonetic: "/di'zain/", cn: "设计", example: "To be hateful of the truth by design." },
  { en: "take", phonetic: "/teik/", cn: "拿", example: "What's your take on this issue, Fred?" },
  { en: "posted", phonetic: "/pəʊstɪd/", cn: "贴出", example: "Post no bills." },
  { en: "internet", phonetic: "/'intәnet/", cn: "[计]因特网", example: "Do you have internet at your place?  My internet is down and I want to check my email." },
  { en: "address", phonetic: "/ә'dres/", cn: "住址", example: "He addressed some portions of his remarks to his supporters, some to his opponents." },
  { en: "community", phonetic: "/kә'mju:niti/", cn: "社区", example: "a community of goods" },
  { en: "states", phonetic: "/steɪts/", cn: "美国", example: "He stated that he was willing to help." },
  { en: "area", phonetic: "/'єәriә/", cn: "区域", example: "The photo is a little dark in that area." },
  { en: "want", phonetic: "/wɒnt/", cn: "需要的东西", example: "What do you want to eat?  I want you to leave.  I never wanted to go back to live with my mother." },
  { en: "phone", phonetic: "/fәun/", cn: "电话", example: "Where is the phone?" },
  { en: "dvd", phonetic: "", cn: "数字化视频光盘", example: "I like this dvd." },
  { en: "shipping", phonetic: "/'ʃipiŋ/", cn: "装运", example: "The shipping' is included in the quoted price." },
  { en: "reserved", phonetic: "/ri'zә:vd/", cn: "保留的", example: "We reserve the right to make modifications." },
  { en: "subject", phonetic: "/'sʌbdʒekt/", cn: "科目", example: "He's subject to sneezing fits." },
  { en: "forum", phonetic: "/'fɒ:rәm/", cn: "论坛", example: "Trish was an admin on three forums, and had no trouble at all when it came to moderating them." },
  { en: "family", phonetic: "/'fæmәli/", cn: "家庭", example: "Our family lives in town." },
  { en: "l", phonetic: "/el/", cn: "见习驾驶员\\[计]电感", example: "Do you need a l?" },
  { en: "long", phonetic: "/lɒŋ/", cn: "长的", example: "Every uptick made the longs cheer." },
  { en: "based", phonetic: "/beist/", cn: "立基于", example: "That was a soundly based argument." },
  { en: "w", phonetic: "/'dʌb(ә)lju:/", cn: "[计]等待", example: "Where is the w?" },
  { en: "code", phonetic: "/kәud/", cn: "代码", example: "This flavour of soup has been assigned the code WRT-9." },
  { en: "show", phonetic: "/ʃәu/", cn: "显示", example: "art show;  dog show" },
  { en: "o", phonetic: "/әu/", cn: "啊", example: "It is currently two-o-five in the afternoon (2:05 PM)." },
  { en: "even", phonetic: "/'i:vәn/", cn: "平坦的", example: "So let's see. There are two evens here and three odds." },
  { en: "black", phonetic: "/blæk/", cn: "黑色", example: "Where is the black?" },
  { en: "check", phonetic: "/tʃek/", cn: "检查", example: "I like this check." },
  { en: "special", phonetic: "/'speʃәl/", cn: "专辑", example: "Do you need a special?" },
  { en: "prices", phonetic: "/ˈpɹaɪsɪz/", cn: "价格", example: "I have a prices." },
  { en: "website", phonetic: "/ˈwɛbˌsaɪt/", cn: "网站", example: "This is my website." },
  { en: "index", phonetic: "/'indeks/", cn: "索引", example: "Where is the index?" },
  { en: "being", phonetic: "/'bi:iŋ/", cn: "存在", example: "I like this being." },
  { en: "women", phonetic: "/'wimin/", cn: "女人", example: "Do you need a women?" },
  { en: "much", phonetic: "/mʌtʃ/", cn: "大量", example: "I have a much." },
  { en: "sign", phonetic: "/sain/", cn: "符号", example: "This is my sign." },
  { en: "file", phonetic: "/fail/", cn: "档案", example: "Where is the file?" },
  { en: "link", phonetic: "/liŋk/", cn: "环", example: "I like this link." },
  { en: "open", phonetic: "/'әupәn/", cn: "公开", example: "Do you need an open?" },
  { en: "today", phonetic: "/tә'dei/", cn: "今天", example: "I have a today." },
  { en: "technology", phonetic: "/tek'nɒlәdʒi/", cn: "技术", example: "This is my technology." },
  { en: "south", phonetic: "/sauθ/", cn: "南方", example: "Where is the south?" },
  { en: "case", phonetic: "/keis/", cn: "情形", example: "I like this case." },
  { en: "project", phonetic: "/'prɒdʒekt/", cn: "计划", example: "Do you need a project?" },
  { en: "pages", phonetic: "/ˈpeɪdʒɪz/", cn: "页数", example: "I have a pages." },
  { en: "uk", phonetic: "/ju: 'kei/", cn: "联合王国", example: "This is my uk." },
  { en: "version", phonetic: "/'vә:ʒәn/", cn: "一种描述", example: "Where is the version?" },
  { en: "section", phonetic: "/'sekʃәn/", cn: "区段", example: "I like this section." },
  { en: "found", phonetic: "/faund/", cn: "建立", example: "Do you need a found?" },
  { en: "house", phonetic: "/haus/", cn: "房子", example: "I have a house." },
  { en: "related", phonetic: "/ri'leitid/", cn: "讲述的", example: "This is my related." },
  { en: "security", phonetic: "/si'kjuriti/", cn: "安全", example: "Where is the security?" },
  { en: "g", phonetic: "/dʒi:/", cn: "[计]千兆", example: "I like this g." },
  { en: "county", phonetic: "/'kaunti/", cn: "县", example: "Do you need a county?" },
  { en: "american", phonetic: "/ә'merikәn/", cn: "美国人\\.美国的", example: "I have an american." },
  { en: "photo", phonetic: "/'fәutәu/", cn: "相片", example: "This is my photo." },
  { en: "game", phonetic: "/geim/", cn: "比赛", example: "Where is the game?" },
  { en: "members", phonetic: "/ˈmɛmbəz/", cn: "成员", example: "I like this members." },
  { en: "power", phonetic: "/'pauә/", cn: "力", example: "Do you need a power?" },
  { en: "while", phonetic: "/hwail/", cn: "一会儿", example: "I have a while." },
  { en: "care", phonetic: "/kєә/", cn: "小心", example: "This is my care." },
  { en: "network", phonetic: "/'netwә:k/", cn: "网络", example: "Where is the network?" },
  { en: "computer", phonetic: "/kәm'pju:tә/", cn: "电脑", example: "I like this computer." },
  { en: "systems", phonetic: "/ˈsɪstəmz/", cn: "体制", example: "Do you need a systems?" },
  { en: "three", phonetic: "/θri:/", cn: "三", example: "I have a three." },
  { en: "total", phonetic: "/'tәutl/", cn: "全体的", example: "This is my total." },
  { en: "place", phonetic: "/pleis/", cn: "地方", example: "Where is the place?" },
  { en: "end", phonetic: "/end/", cn: "结束", example: "I like this end." },
  { en: "following", phonetic: "/'fɒlәuiŋ/", cn: "下列各项", example: "Do you need a following?" },
  { en: "download", phonetic: "/ˈdaʊnˌləʊd/", cn: "[计]卸载", example: "I have a download." },
  { en: "h", phonetic: "/eitʃ/", cn: "[计]硬件", example: "This is my h." },
  { en: "him", phonetic: "/him/", cn: "他", example: "Where is the him?" },
  { en: "access", phonetic: "/'ækses/", cn: "通路", example: "I like this access." },
  { en: "think", phonetic: "/θiŋk/", cn: "想", example: "Do you need a think?" },
  { en: "north", phonetic: "/nɒ:θ/", cn: "北方", example: "I have a north." },
  { en: "resources", phonetic: "/ɹɨˈzɔɹsɨz/", cn: "资源", example: "This is my resources." },
  { en: "current", phonetic: "/'kʌrәnt/", cn: "涌流", example: "Where is the current?" },
  { en: "posts", phonetic: "/pəʊsts/", cn: "标杆", example: "I like this posts." },
  { en: "big", phonetic: "/big/", cn: "大的", example: "Elephants are big animals, and they eat a lot." },
  { en: "media", phonetic: "/'mi:diә/", cn: "媒体\\[计]媒质", example: "As a result of the rise of, first, television news and entertainment media and, second, web-based media, traditional print-based media has declined in popularity." },
  { en: "law", phonetic: "/lɒ:/", cn: "法律", example: "entrapment is against the law" },
  { en: "control", phonetic: "/kәn'trәul/", cn: "控制", example: "Where is the control?" },
  { en: "water", phonetic: "/'wɒ:tә/", cn: "水", example: "I like this water." },
  { en: "history", phonetic: "/'histәri/", cn: "历史", example: "Do you need a history?" },
  { en: "pictures", phonetic: "/ˈpɪktʃɚz/", cn: "电影院", example: "I have a pictures." },
  { en: "size", phonetic: "/saiz/", cn: "大小", example: "This is my size." },
  { en: "art", phonetic: "/ɑ:t/", cn: "艺术", example: "Where is the art?" },
  { en: "personal", phonetic: "/'pә:snl/", cn: "私人的", example: "I like this personal." },
  { en: "since", phonetic: "/sins/", cn: "自...以后", example: "Do you need a since?" },
  { en: "including", phonetic: "/ɪnˈkluːdɪŋ/", cn: "包含", example: "I have an including." },
  { en: "guide", phonetic: "/gaid/", cn: "引导者", example: "This is my guide." },
  { en: "shop", phonetic: "/ʃɒp/", cn: "商店", example: "Where is the shop?" },
  { en: "directory", phonetic: "/di'rektәri/", cn: "目录", example: "I like this directory." },
  { en: "board", phonetic: "/bɒ:d/", cn: "木板", example: "Do you need a board?" },
  { en: "location", phonetic: "/lәu'keiʃәn/", cn: "位置", example: "I have a location." },
  { en: "change", phonetic: "/tʃeindʒ/", cn: "变化", example: "This is my change." },
  { en: "white", phonetic: "/hwait/", cn: "白色", example: "Where is the white?" },
  { en: "text", phonetic: "/tekst/", cn: "文本", example: "I like this text." },
  { en: "small", phonetic: "/smɒ:l/", cn: "小的", example: "Do you need a small?" },
  { en: "rating", phonetic: "/'reitiŋ/", cn: "等级", example: "I have a rating." },
  { en: "rate", phonetic: "/reit/", cn: "比率", example: "This is my rate." },
  { en: "government", phonetic: "/'gʌvәnmәnt/", cn: "政府", example: "Where is the government?" },
  { en: "children", phonetic: "/'tʃildrәn/", cn: "孩子", example: "I like this children." },
  { en: "usa", phonetic: "/ju: es 'ei/", cn: "美国", example: "Do you need an usa?" },
  { en: "return", phonetic: "/ri'tә:n/", cn: "回来", example: "I have a return." },
  { en: "v", phonetic: "/vi:/", cn: "[计]溢出", example: "This is my v." },
  { en: "shopping", phonetic: "/'ʃɒpiŋ/", cn: "买东西", example: "Where is the shopping?" },
  { en: "account", phonetic: "/ә'kaunt/", cn: "报告", example: "I like this account." },
  { en: "times", phonetic: "/taimz/", cn: "时代", example: "Do you need a times?" },
  { en: "sites", phonetic: "/saɪts/", cn: "遗址", example: "I have a sites." },
  { en: "level", phonetic: "/'levl/", cn: "水平", example: "This is my level." },
  { en: "digital", phonetic: "/'didʒitәl/", cn: "数字显示的", example: "Where is the digital?" },
  { en: "profile", phonetic: "/'prәufail/", cn: "侧面", example: "I like this profile." },
  { en: "previous", phonetic: "/'pri:viәs/", cn: "早先的", example: "Do you need a previous?" },
  { en: "form", phonetic: "/fɒ:m/", cn: "形状", example: "I have a form." },
  { en: "events", phonetic: "/ɪˈvɛnts/", cn: "事件", example: "This is my events." },
  { en: "love", phonetic: "/lʌv/", cn: "爱", example: "Where is the love?" },
  { en: "old", phonetic: "/әuld/", cn: "以前", example: "I like this old." },
  { en: "john", phonetic: "/dʒɔn/", cn: "盥洗室", example: "Do you need a john?" },
  { en: "main", phonetic: "/mein/", cn: "主要部分", example: "I have a main." },
  { en: "call", phonetic: "/kɒ:l/", cn: "呼叫", example: "This is my call." },
  { en: "hours", phonetic: "/ˈaʊɚz/", cn: "小时", example: "Where is the hours?" },
  { en: "image", phonetic: "/'imidʒ/", cn: "影像", example: "I like this image." },
  { en: "department", phonetic: "/di'pɑ:tmәnt/", cn: "部门", example: "Do you need a department?" },
  { en: "title", phonetic: "/'taitl/", cn: "头衔", example: "I have a title." },
  { en: "description", phonetic: "/di'skripʃәn/", cn: "描述", example: "This is my description." },
  { en: "non", phonetic: "/nɔn/", cn: "非", example: "Where is the non?" },
  { en: "k", phonetic: "/kei/", cn: "[计]键", example: "I like this k." },
  { en: "y", phonetic: "/wai/", cn: "[计]原型\\[医]钇", example: "Do you need a y?" },
  { en: "insurance", phonetic: "/in'ʃurәns/", cn: "保险", example: "I have an insurance." },
  { en: "another", phonetic: "/ә'nʌðә/", cn: "另外的", example: "This is my another." },
  { en: "shall", phonetic: "/ʃæl/", cn: "将", example: "Where is the shall?" },
  { en: "property", phonetic: "/'prɒpәti/", cn: "财产", example: "I like this property." },
  { en: "class", phonetic: "/klɑ:s/", cn: "班级", example: "Do you need a class?" },
  { en: "cd", phonetic: "", cn: "镭射碟", example: "I have a cd." },
  { en: "still", phonetic: "/stil/", cn: "蒸馏室", example: "This is my still." },
  { en: "money", phonetic: "/'mʌni/", cn: "金钱", example: "Where is the money?" },
  { en: "quality", phonetic: "/'kwɒlәti/", cn: "品质", example: "Quality of life is usually determined by health, education, and income." },
  { en: "every", phonetic: "/'evri/", cn: "每一", example: "Do you need an every?" },
  { en: "listing", phonetic: "/'listiŋ/", cn: "[计]列表", example: "to list a door" },
  { en: "content", phonetic: "/kәn'tent/", cn: "内容", example: "You can't have any more - you'll have to content yourself with what you already have." },
  { en: "country", phonetic: "/'kʌntri/", cn: "国家", example: "Where is the country?" },
  { en: "private", phonetic: "/'praivit/", cn: "私人的", example: "If you want to learn ballet, consider taking privates." },
  { en: "little", phonetic: "/'litl/", cn: "一点点", example: "Can I try a little of that sauce?" },
  { en: "visit", phonetic: "/'vizit/", cn: "拜访", example: "I have a visit." },
  { en: "save", phonetic: "/seiv/", cn: "救球\\.解救", example: "The goaltender made a great save." },
  { en: "tools", phonetic: "/tu:lz/", cn: "工具", example: "Hand me that tool, would you?   I don't have the right tools to start fiddling around with the engine." },
  { en: "low", phonetic: "/lәu/", cn: "低点", example: "Economic growth has hit a new low." },
  { en: "reply", phonetic: "/ri'plai/", cn: "答复", example: "Joanne replied to Pete's insult with a slap to his face." },
  { en: "customer", phonetic: "/'kʌstәmә/", cn: "消费者\\[化]顾客", example: "Every person who passes by is a potential customer." },
  { en: "december", phonetic: "/di'sembә/", cn: "十二月", example: "This is my december." },
  { en: "compare", phonetic: "/kәm'pєә/", cn: "比较", example: "Where is the compare?" },
  { en: "movies", phonetic: "/'mu:vis/", cn: "电影", example: "Let's go to the movies." },
  { en: "include", phonetic: "/in'klu:d/", cn: "包括", example: "I will purchase the vacation package if you will include car rental." },
  { en: "college", phonetic: "/'kɒlidʒ/", cn: "学院", example: "College of Cardinals, College of Surgeons" },
  { en: "value", phonetic: "/'vælju:/", cn: "价值", example: "The Shakespearean Shylock is of dubious value in the modern world." },
  { en: "article", phonetic: "/'ɑ:tikl/", cn: "文章", example: "a sales article" },
  { en: "york", phonetic: "/jɔ:k/", cn: "约克郡", example: "I like this york." },
  { en: "man", phonetic: "/mæn/", cn: "男人", example: "The show is especially popular with middle-aged men." },
  { en: "card", phonetic: "/kɑ:d/", cn: "卡片", example: "He played cards with his friends." },
  { en: "jobs", phonetic: "/dʒɔbs/", cn: "工作", example: "This is my jobs." },
  { en: "provide", phonetic: "/prә'vaid/", cn: "提供", example: "Where is the provide?" },
  { en: "j", phonetic: "/dʒei/", cn: "字母", example: "I like this j." },
  { en: "food", phonetic: "/fu:d/", cn: "食物", example: "Do you need a food?" },
  { en: "source", phonetic: "/sɒ:s/", cn: "来源", example: "I have a source." },
  { en: "author", phonetic: "/'ɒ:θә/", cn: "作家", example: "This is my author." },
  { en: "different", phonetic: "/'difәrәnt/", cn: "不同的\\[机]差动", example: "Where is the different?" },
  { en: "press", phonetic: "/pres/", cn: "压", example: "I like this press." },
  { en: "u", phonetic: "/ju:/", cn: "适于各种年龄观众的\\.适合各种年龄的人观看的影片\\[计]装置", example: "Do you need an u?" },
  { en: "learn", phonetic: "/lә:n/", cn: "学习", example: "I have a learn." },
  { en: "sale", phonetic: "/seil/", cn: "出售", example: "This is my sale." },
  { en: "around", phonetic: "/ә'raund/", cn: "包围", example: "Where is the around?" },
  { en: "print", phonetic: "/print/", cn: "打印", example: "I like this print." },
  { en: "course", phonetic: "/kɒ:s/", cn: "课程", example: "Do you need a course?" },
  { en: "job", phonetic: "/dʒɒb/", cn: "工作", example: "I have a job." },
  { en: "canada", phonetic: "/'kænәdә/", cn: "加拿大", example: "This is my canada." },
  { en: "process", phonetic: "/'prɒses/", cn: "程序", example: "Where is the process?" },
  { en: "teen", phonetic: "/ti:n/", cn: "愤怒", example: "I like this teen." },
  { en: "room", phonetic: "/ru:m/", cn: "房间", example: "Do you need a room?" },
  { en: "stock", phonetic: "/stɒk/", cn: "树干", example: "I have a stock." },
  { en: "training", phonetic: "/'treiniŋ/", cn: "训练", example: "This is my training." },
  { en: "credit", phonetic: "/'kredit/", cn: "信用", example: "Where is the credit?" },
  { en: "point", phonetic: "/pɒint/", cn: "点", example: "I like this point." },
  { en: "join", phonetic: "/dʒɒin/", cn: "参加", example: "Do you need a join?" },
  { en: "science", phonetic: "/'saiәns/", cn: "科学", example: "I have a science." },
  { en: "men", phonetic: "/men/", cn: "的复数", example: "This is my men." },
  { en: "categories", phonetic: "/ˈkætɪɡ(ə)ɹiz/", cn: "分类", example: "Where is the categories?" },
  { en: "advanced", phonetic: "/әd'vɑ:nst/", cn: "在前的", example: "I like this advanced." },
  { en: "west", phonetic: "/west/", cn: "西方", example: "Do you need a west?" },
  { en: "sales", phonetic: "", cn: "销售的\\[计]销售", example: "I have a sales." },
  { en: "look", phonetic: "/luk/", cn: "一看", example: "This is my look." },
  { en: "english", phonetic: "/'iŋgliʃ/", cn: "英语\\.英文的", example: "Where is the english?" },
  { en: "left", phonetic: "/left/", cn: "左边的", example: "I like this left." },
  { en: "team", phonetic: "/ti:m/", cn: "队", example: "Do you need a team?" },
  { en: "estate", phonetic: "/i'steit/", cn: "不动产", example: "I have an estate." },
  { en: "box", phonetic: "/bɒks/", cn: "盒子", example: "This is my box." },
  { en: "conditions", phonetic: "", cn: "形势", example: "Where is the conditions?" },
  { en: "select", phonetic: "/si'lekt/", cn: "挑选出来的", example: "I like this select." },
  { en: "windows", phonetic: "/'windәjz/", cn: "微软公司生产的“视窗”操作系统", example: "Do you need a windows?" },
  { en: "photos", phonetic: "", cn: "照片", example: "I have a photos." },
  { en: "gay", phonetic: "/gei/", cn: "欢快的", example: "This is my gay." },
  { en: "thread", phonetic: "/θred/", cn: "线", example: "Where is the thread?" },
  { en: "week", phonetic: "/wi:k/", cn: "星期", example: "I like this week." },
  { en: "category", phonetic: "/'kætigәri/", cn: "种类", example: "Do you need a category?" },
  { en: "note", phonetic: "/nәut/", cn: "笔记", example: "I have a note." },
  { en: "live", phonetic: "/liv.laiv/", cn: "活的", example: "This is my live." },
  { en: "large", phonetic: "/lɑ:dʒ/", cn: "大的", example: "Where is the large?" },
  { en: "gallery", phonetic: "/'gælәri/", cn: "走廊", example: "I like this gallery." },
  { en: "table", phonetic: "/'teibl/", cn: "桌子", example: "Do you need a table?" },
  { en: "register", phonetic: "/'redʒistә/", cn: "寄存器", example: "I have a register." },
  { en: "however", phonetic: "/hau'evә/", cn: "然而", example: "This is my however." },
  { en: "june", phonetic: "/dʒu:n/", cn: "六月", example: "Where is the june?" },
  { en: "october", phonetic: "/ɒk'tәubә/", cn: "十月", example: "I like this october." },
  { en: "november", phonetic: "/nәu'vembә/", cn: "十一月", example: "Do you need a november?" },
  { en: "market", phonetic: "/'mɑ:kit/", cn: "市场", example: "I have a market." },
  { en: "library", phonetic: "/'laibrәri/", cn: "图书馆", example: "This is my library." },
  { en: "really", phonetic: "/'riәli/", cn: "实际上", example: "Where is the really?" },
  { en: "action", phonetic: "/'ækʃәn/", cn: "行动", example: "Knead bread with a rocking action." },
  { en: "start", phonetic: "/stɑ:t/", cn: "惊起", example: "The movie was entertaining from start to finish." },
  { en: "series", phonetic: "/'siәri:z/", cn: "串联", example: "A series of seemingly inconsequential events led cumulatively to the fall of the company." },
  { en: "model", phonetic: "/'mɒdәl/", cn: "模型", example: "The beautiful model had her face on the cover of almost every fashion magazine imaginable." },
  { en: "features", phonetic: "/ˈfiːtʃəz/", cn: "容貌", example: "one of the features of the landscape" },
  { en: "air", phonetic: "/єә/", cn: "空气", example: "I'm going outside to get some air." },
  { en: "industry", phonetic: "/'indәstri/", cn: "勤劳", example: "Over the years, their industry and business sense made them wealthy." },
  { en: "plan", phonetic: "/plæn/", cn: "计划", example: "The plans for many important buildings were once publicly available." },
  { en: "human", phonetic: "/'hju:mәn/", cn: "人", example: "Humans share common ancestors with other apes." },
  { en: "provided", phonetic: "/prә'vaidid/", cn: "倘若", example: "It is difficult to provide for my family working on minimum wage." },
  { en: "tv", phonetic: "/'ti:'vi:/", cn: "电视\\[计]电视", example: "It’s a good thing that television doesn’t transmit smell." },
  { en: "yes", phonetic: "/jes/", cn: "是\\.是", example: "Do you need a yes?" },
  { en: "required", phonetic: "/ri'kwaiәd/", cn: "必需的", example: "I have a required." },
  { en: "second", phonetic: "/'sekәnd/", cn: "秒", example: "This is my second." },
  { en: "hot", phonetic: "/hɒt/", cn: "热的", example: "Where is the hot?" },
  { en: "accessories", phonetic: "", cn: "辅助程序", example: "I like this accessories." },
  { en: "cost", phonetic: "/kɒst/", cn: "代价", example: "Do you need a cost?" },
  { en: "movie", phonetic: "/'mu:vi/", cn: "电影", example: "I have a movie." },
  { en: "forums", phonetic: "", cn: "论坛", example: "This is my forums." },
  { en: "march", phonetic: "/mɑ:tʃ/", cn: "三月", example: "Where is the march?" },
  { en: "la", phonetic: "/lɔ:, lɑ:/", cn: "[医]镧", example: "I like this la." },
  { en: "september", phonetic: "/sep'tembә/", cn: "九月", example: "Do you need a september?" },
  { en: "better", phonetic: "/'betә/", cn: "较好的\\.比较好", example: "I have a better." },
  { en: "say", phonetic: "/sei/", cn: "说", example: "This is my say." },
  { en: "questions", phonetic: "/ˈkwɛstʃənz/", cn: "问题", example: "Where is the questions?" },
  { en: "july", phonetic: "/dʒu:'lai/", cn: "七月", example: "I like this july." },
  { en: "yahoo", phonetic: "/jә'hu:/", cn: "人面兽心的人", example: "Do you need a yahoo?" },
  { en: "going", phonetic: "/'gәuiŋ/", cn: "去", example: "I have a going." },
  { en: "medical", phonetic: "/'medikl/", cn: "医生", example: "This is my medical." },
  { en: "test", phonetic: "/test/", cn: "测试", example: "Where is the test?" },
  { en: "friend", phonetic: "/frend/", cn: "朋友", example: "I like this friend." },
  { en: "come", phonetic: "/kʌm/", cn: "过来", example: "Do you need a come?" },
  { en: "dec", phonetic: "", cn: "美国数字电子公司\\[计]数字设备公司", example: "I have a dec." },
  { en: "server", phonetic: "/'sә:vә/", cn: "服伺者", example: "This is my server." },
  { en: "pc", phonetic: "", cn: "个人计算机\\[计]外部控制", example: "Where is the pc?" },
  { en: "study", phonetic: "/'stʌdi/", cn: "学习", example: "I like this study." },
  { en: "application", phonetic: "/.æpli'keiʃәn/", cn: "应用", example: "Do you need an application?" },
  { en: "cart", phonetic: "/kɑ:t/", cn: "二轮运货马车\\.驾运货马车\\.用车装载", example: "I have a cart." },
  { en: "staff", phonetic: "/stɑ:f/", cn: "全体人员", example: "This is my staff." },
  { en: "articles", phonetic: "/ˈɑːtɪkəlz/", cn: "文章", example: "Where is the articles?" },
  { en: "san", phonetic: "/sɑ:n/", cn: "存储区域网", example: "I like this san." },
  { en: "feedback", phonetic: "/'fi:dbæk/", cn: "反馈", example: "Do you need a feedback?" },
  { en: "again", phonetic: "/ә'gein/", cn: "再一次", example: "I have an again." },
  { en: "play", phonetic: "/plei/", cn: "游戏", example: "This is my play." },
  { en: "looking", phonetic: "/'lukiŋ/", cn: "有…相貌的", example: "Where is the looking?" },
  { en: "issues", phonetic: "", cn: "议题", example: "I like this issues." },
  { en: "april", phonetic: "/'eiprәl/", cn: "四月", example: "Do you need an april?" },
  { en: "never", phonetic: "/'nevә/", cn: "从不", example: "I have a never." },
  { en: "users", phonetic: "", cn: "使用者", example: "This is my users." },
  { en: "complete", phonetic: "/kәm'pli:t/", cn: "完全的", example: "Where is the complete?" },
  { en: "street", phonetic: "/stri:t/", cn: "街道", example: "I like this street." },
  { en: "topic", phonetic: "/'tɒpik/", cn: "主题", example: "Do you need a topic?" },
  { en: "comment", phonetic: "/'kɒment/", cn: "注解", example: "I have a comment." },
  { en: "financial", phonetic: "/fai'nænʃәl/", cn: "财政的", example: "This is my financial." },
  { en: "things", phonetic: "/θɪŋz/", cn: "所有物", example: "Where is the things?" },
  { en: "working", phonetic: "/'wә:kiŋ/", cn: "工作", example: "I like this working." },
  { en: "standard", phonetic: "/'stændәd/", cn: "标准", example: "Do you need a standard?" },
  { en: "tax", phonetic: "/tæks/", cn: "税", example: "I have a tax." },
  { en: "person", phonetic: "/'pә:sn/", cn: "人", example: "This is my person." },
  { en: "below", phonetic: "/bi'lәu/", cn: "在下面\\.在下面", example: "Where is the below?" },
  { en: "mobile", phonetic: "/'mәubil/", cn: "移动的", example: "I like this mobile." },
  { en: "less", phonetic: "/les/", cn: "较少", example: "Do you need a less?" },
  { en: "got", phonetic: "/gɒt/", cn: "的过去式和过去分词\\[化]谷草转氨酶", example: "I have a got." },
  { en: "blog", phonetic: "/blɑɡ/", cn: "博客", example: "This is my blog." },
  { en: "party", phonetic: "/'pɑ:ti/", cn: "宴会", example: "The contract requires that the party of the first part pay the fee." },
  { en: "payment", phonetic: "/'peimәnt/", cn: "付款", example: "I like this payment." },
  { en: "equipment", phonetic: "/i'kwipmәnt/", cn: "装备", example: "Do you need an equipment?" },
  { en: "login", phonetic: "/ˈlɒɡ.ɪn/", cn: "[计]注册", example: "I've forgotten my login again." },
  { en: "student", phonetic: "/'stju:dnt/", cn: "学生", example: "He is a student of life." },
  { en: "let", phonetic: "/let/", cn: "让", example: "After he knocked for hours, I decided to let him come in." },
  { en: "programs", phonetic: "/ˈpɹoʊɡɹæms/", cn: "程序", example: "Our program for today’s exercise class includes swimming and jogging." },
  { en: "offers", phonetic: "/ˈɑfɚz/", cn: "提议", example: "I decline your offer to contract." },
  { en: "legal", phonetic: "/'li:gәl/", cn: "法律的", example: "Legal wants this in writing." },
  { en: "above", phonetic: "/ә'bʌv/", cn: "在上方", example: "He's in a better place now, floating free as the clouds above." },
  { en: "recent", phonetic: "/'ri:snt/", cn: "最近的", example: "I met three recent graduates at the conference." },
  { en: "park", phonetic: "/pɑ:k/", cn: "公园", example: "A country's tank park or artillery park." },
  { en: "side", phonetic: "/said/", cn: "旁边", example: "A square has four sides." },
  { en: "act", phonetic: "/ækt/", cn: "行动", example: "an act of goodwill" },
  { en: "problem", phonetic: "/'prɒblәm/", cn: "问题", example: "She's leaving because she faced numerous problems to do with racism." },
  { en: "red", phonetic: "/red/", cn: "红的", example: "The girl wore a red skirt." },
  { en: "give", phonetic: "/giv/", cn: "弹性", example: "There is no give in his dogmatic religious beliefs." },
  { en: "memory", phonetic: "/'memәri/", cn: "记忆", example: "Memory is a facility common to all animals." },
  { en: "performance", phonetic: "/pә'fɒ:mәns/", cn: "施行", example: "the performance of an undertaking or a duty" },
  { en: "social", phonetic: "/'sәuʃәl/", cn: "社会的", example: "They organized a social at the dance club to get people to know each other." },
  { en: "q", phonetic: "/kju:/", cn: "[计]质量", example: "Where is the q?" },
  { en: "august", phonetic: "/ɒ:'gʌst. 'ɒ:gәst/", cn: "八月\\.威严的", example: "I like this august." },
  { en: "quote", phonetic: "/kwәut/", cn: "引用\\.引述", example: "Do you need a quote?" },
  { en: "language", phonetic: "/'læŋgwidʒ/", cn: "语言", example: "I have a language." },
  { en: "story", phonetic: "/'stɒ:ri/", cn: "故事", example: "This is my story." },
  { en: "sell", phonetic: "/sel/", cn: "卖", example: "Where is the sell?" },
  { en: "options", phonetic: "", cn: "选择", example: "I like this options." },
  { en: "experience", phonetic: "/ik'spiәriәns/", cn: "经历", example: "Do you need an experience?" },
  { en: "rates", phonetic: "/ɹeɪts/", cn: "比率", example: "I have a rates." },
  { en: "create", phonetic: "/kri:'eit/", cn: "创造", example: "This is my create." },
  { en: "key", phonetic: "/ki:/", cn: "钥匙", example: "Where is the key?" },
  { en: "body", phonetic: "/'bɒdi/", cn: "身体", example: "I like this body." },
  { en: "young", phonetic: "/jʌŋ/", cn: "年轻的", example: "Do you need a young?" },
  { en: "america", phonetic: "/ә'merikә/", cn: "美洲", example: "I have an america." },
  { en: "important", phonetic: "/im'pɒ:tәnt/", cn: "重要的", example: "This is my important." },
  { en: "field", phonetic: "/fi:ld/", cn: "领域", example: "Where is the field?" },
  { en: "east", phonetic: "/i:st/", cn: "东方", example: "I like this east." },
  { en: "paper", phonetic: "/'peipә/", cn: "纸", example: "Do you need a paper?" },
  { en: "single", phonetic: "/'siŋgl/", cn: "单身的", example: "I have a single." },
  { en: "ii", phonetic: "", cn: "微光", example: "This is my ii." },
  { en: "age", phonetic: "/eidʒ/", cn: "年龄", example: "Where is the age?" },
  { en: "club", phonetic: "/klʌb/", cn: "俱乐部", example: "I like this club." },
  { en: "example", phonetic: "/ig'zæmpl/", cn: "例子", example: "Do you need an example?" },
  { en: "girls", phonetic: "/ɡɜːlz/", cn: "女孩", example: "I have a girls." },
  { en: "additional", phonetic: "/ә'diʃәnәl/", cn: "附加的", example: "This is my additional." },
  { en: "password", phonetic: "/'pæswә:d/", cn: "密码", example: "Where is the password?" },
  { en: "z", phonetic: "/zed; (?@) zi:/", cn: "[计]阻抗", example: "I like this z." },
  { en: "latest", phonetic: "/'leitist/", cn: "最近的", example: "Do you need a latest?" },
  { en: "something", phonetic: "/'sʌmθiŋ/", cn: "某事", example: "I have a something." },
  { en: "road", phonetic: "/rәud/", cn: "路", example: "This is my road." },
  { en: "gift", phonetic: "/gift/", cn: "礼物", example: "Where is the gift?" },
  { en: "question", phonetic: "/'kwestʃәn/", cn: "问题", example: "I like this question." },
  { en: "changes", phonetic: "/ˈtʃeɪndʒɪz/", cn: "变化", example: "Do you need a changes?" },
  { en: "night", phonetic: "/nait/", cn: "夜", example: "I have a night." },
  { en: "ca", phonetic: "", cn: "[医]钙", example: "This is my ca." },
  { en: "hard", phonetic: "/hɑ:d/", cn: "坚硬的", example: "Where is the hard?" },
  { en: "texas", phonetic: "/'teksәs/", cn: "德克萨斯", example: "I like this texas." },
  { en: "oct", phonetic: "", cn: "十月", example: "Do you need an oct?" },
  { en: "pay", phonetic: "/pei/", cn: "薪资", example: "I have a pay." },
  { en: "four", phonetic: "/fɒ:/", cn: "四", example: "This is my four." },
  { en: "poker", phonetic: "/'pәukә/", cn: "戳的人", example: "Where is the poker?" },
  { en: "status", phonetic: "/'steitәs/", cn: "状态", example: "I like this status." },
  { en: "browse", phonetic: "/brauz/", cn: "浏览", example: "Do you need a browse?" },
  { en: "issue", phonetic: "/'isju/", cn: "发行", example: "I have an issue." },
  { en: "range", phonetic: "/'reindʒ/", cn: "排", example: "This is my range." },
  { en: "building", phonetic: "/'bildiŋ/", cn: "建筑物", example: "Where is the building?" },
  { en: "seller", phonetic: "/'selә/", cn: "销售者\\[化]卖方", example: "I like this seller." },
  { en: "court", phonetic: "/kɒ:t/", cn: "法院", example: "Do you need a court?" },
  { en: "february", phonetic: "/'februәri/", cn: "二月", example: "I have a february." },
  { en: "always", phonetic: "/'ɒ:lweiz/", cn: "总是", example: "This is my always." },
  { en: "result", phonetic: "/ri'zʌlt/", cn: "结果", example: "Where is the result?" },
  { en: "audio", phonetic: "/'ɒ:diou/", cn: "音频的", example: "I like this audio." },
  { en: "light", phonetic: "/lait/", cn: "光", example: "Do you need a light?" },
  { en: "write", phonetic: "/rait/", cn: "书写", example: "I have a write." },
  { en: "war", phonetic: "/wɒ:/", cn: "战争", example: "This is my war." },
  { en: "nov", phonetic: "", cn: "十一月", example: "Where is the nov?" },
  { en: "offer", phonetic: "/'ɒfә/", cn: "给予", example: "I like this offer." },
  { en: "blue", phonetic: "/blu:/", cn: "蓝色\\.蓝色的", example: "The boys in blue marched to the pipers." },
  { en: "groups", phonetic: "/ɡɹuːps/", cn: "群组", example: "A group of people gathered in front of the Parliament to demonstrate against the Prime Minister's proposals." },
  { en: "al", phonetic: "", cn: "[计]算法语言", example: "This is my al." },
  { en: "easy", phonetic: "/'i:zi/", cn: "容易的", example: "Now that I know it's taken care of, I can rest easy at night." },
  { en: "given", phonetic: "/'givәn/", cn: "赠予的", example: "I give it a 95% chance of success." },
  { en: "files", phonetic: "", cn: "文件", example: "I'm going to delete these unwanted files to free up some disk space." },
  { en: "event", phonetic: "/i'vent/", cn: "事件", example: "I went to an event in San Francisco last week." },
  { en: "release", phonetic: "/ri'li:s/", cn: "释放", example: "The video store advertised that it had all the latest releases." },
  { en: "analysis", phonetic: "/ә'nælәsis/", cn: "分析\\[计]分析机", example: "Where is the analysis?" },
  { en: "request", phonetic: "/ri'kwest/", cn: "请求", example: "I like this request." },
  { en: "fax", phonetic: "/fæks/", cn: "传真\\.发传真\\[计]传真系统", example: "Do you need a fax?" },
  { en: "china", phonetic: "/'tʃainә/", cn: "中国", example: "He set the table with china, cloth napkins, and crystal stemware." },
  { en: "making", phonetic: "/'meikiŋ/", cn: "制造", example: "As a child, he didn’t seem like a genius in the making." },
  { en: "picture", phonetic: "/'piktʃә/", cn: "图画", example: "There was a picture hanging above the fireplace." },
  { en: "possible", phonetic: "/'pɒsәbl/", cn: "可能的", example: "Jones is a possible for the new opening in sales." },
  { en: "professional", phonetic: "/prә'feʃәnl/", cn: "专业人才\\.专业的", example: "Do you need a professional?" },
  { en: "yet", phonetic: "/jet/", cn: "还", example: "He has never yet been late for an appointment;   I’m not yet wise enough to answer that;   Have you finished yet?" },
  { en: "month", phonetic: "/mʌnθ/", cn: "月\\[经]月", example: "July is my favourite month." },
  { en: "major", phonetic: "/'meidʒә/", cn: "主修课", example: "Where is the major?" },
  { en: "star", phonetic: "/stɑ:/", cn: "星", example: "I like this star." },
  { en: "areas", phonetic: "", cn: "区域", example: "Do you need an areas?" },
  { en: "future", phonetic: "/'fju:tʃә/", cn: "未来", example: "I have a future." },
  { en: "space", phonetic: "/speis/", cn: "位置", example: "This is my space." },
  { en: "committee", phonetic: "/kә'miti/", cn: "委员会\\[经]委员会", example: "Where is the committee?" },
  { en: "hand", phonetic: "/hænd/", cn: "手", example: "I like this hand." },
  { en: "sun", phonetic: "/sʌn/", cn: "太阳", example: "Do you need a sun?" },
  { en: "problems", phonetic: "/ˈpɹɒbləmz/", cn: "问题", example: "I have a problems." },
  { en: "london", phonetic: "/'lʌndәn/", cn: "伦敦", example: "This is my london." },
  { en: "washington", phonetic: "/'wɒʃiŋtn/", cn: "华盛顿", example: "Where is the washington?" },
  { en: "meeting", phonetic: "/'mi:tiŋ/", cn: "会议", example: "I like this meeting." },
  { en: "rss", phonetic: "", cn: "和的平方根", example: "Do you need a rss?" },
  { en: "become", phonetic: "/bi'kʌm/", cn: "变成", example: "I have a become." },
  { en: "interest", phonetic: "/'intrist/", cn: "兴趣", example: "This is my interest." },
  { en: "id", phonetic: "/id/", cn: "遗传素质", example: "Where is the id?" },
  { en: "child", phonetic: "/tʃaild/", cn: "孩子", example: "I like this child." },
  { en: "keep", phonetic: "/ki:p/", cn: "生计", example: "Do you need a keep?" },
  { en: "enter", phonetic: "/'entә/", cn: "进入", example: "I have an enter." },
  { en: "california", phonetic: "/.kæli'fɒ:njә/", cn: "加利福尼亚", example: "This is my california." },
  { en: "share", phonetic: "/ʃєә/", cn: "部分", example: "Where is the share?" },
  { en: "similar", phonetic: "/'similә/", cn: "相似的", example: "I like this similar." },
  { en: "garden", phonetic: "/'gɑ:dn/", cn: "花园", example: "Do you need a garden?" },
  { en: "schools", phonetic: "/skuːlz/", cn: "学校", example: "I have a schools." },
  { en: "million", phonetic: "/'miljәn/", cn: "百万", example: "This is my million." },
  { en: "added", phonetic: "/'ædid/", cn: "额外的", example: "Where is the added?" },
  { en: "reference", phonetic: "/'refәrәns/", cn: "参考", example: "I like this reference." },
  { en: "companies", phonetic: "/ˈkʌmp(ə)niz/", cn: "公司", example: "Do you need a companies?" },
  { en: "listed", phonetic: "/'listid/", cn: "列出的\\[经]上市的", example: "I have a listed." },
  { en: "baby", phonetic: "/'beibi/", cn: "婴孩\\[医]婴儿", example: "This is my baby." },
  { en: "learning", phonetic: "/'lә:niŋ/", cn: "学问", example: "Where is the learning?" },
  { en: "energy", phonetic: "/'enәdʒi/", cn: "精力", example: "I like this energy." },
  { en: "run", phonetic: "/rʌn/", cn: "跑", example: "Do you need a run?" },
  { en: "delivery", phonetic: "/di'livәri/", cn: "递送", example: "I have a delivery." },
  { en: "net", phonetic: "/net/", cn: "网", example: "This is my net." },
  { en: "popular", phonetic: "/'pɒpjulә/", cn: "通俗的", example: "Where is the popular?" },
  { en: "term", phonetic: "/tә:m/", cn: "术语", example: "I like this term." },
  { en: "film", phonetic: "/film/", cn: "软片", example: "Do you need a film?" },
  { en: "stories", phonetic: "", cn: "故事", example: "I have a stories." },
  { en: "put", phonetic: "/put/", cn: "放", example: "This is my put." },
  { en: "computers", phonetic: "/kəmˈpjuːtəs/", cn: "计算机", example: "Where is the computers?" },
  { en: "journal", phonetic: "/'dʒә:nәl/", cn: "日记", example: "I like this journal." },
  { en: "reports", phonetic: "/ɹɪˈpɔːts/", cn: "报表", example: "Do you need a reports?" },
  { en: "co", phonetic: "/koʊ/", cn: "[医]钴", example: "I have a co." },
  { en: "try", phonetic: "/trai/", cn: "尝试", example: "This is my try." },
  { en: "welcome", phonetic: "/'welkәm/", cn: "欢迎", example: "Where is the welcome?" },
  { en: "central", phonetic: "/'sentrәl/", cn: "中央的", example: "I like this central." },
  { en: "images", phonetic: "/ˈɪmɪd͡ʒɪz/", cn: "图片", example: "Do you need an images?" },
  { en: "president", phonetic: "/'prezidәnt/", cn: "总统", example: "I have a president." },
  { en: "notice", phonetic: "/'nәutis/", cn: "注意", example: "This is my notice." },
  { en: "original", phonetic: "/ә'ridʒәnl/", cn: "最初的", example: "Where is the original?" },
  { en: "head", phonetic: "/hed/", cn: "头", example: "I like this head." },
  { en: "radio", phonetic: "/'reidiәu/", cn: "无线电", example: "Do you need a radio?" },
  { en: "until", phonetic: "/әn'til/", cn: "直到", example: "I have an until." },
  { en: "cell", phonetic: "/sel/", cn: "单元", example: "Gregor Mendel must have spent a good amount of time outside of his cell." },
  { en: "color", phonetic: "/'kʌlә/", cn: "颜色", example: "Humans and birds can perceive color." },
  { en: "self", phonetic: "/self/", cn: "自己", example: "one's true self; one's better self; one's former self" },
  { en: "council", phonetic: "/'kaunsәl/", cn: "会议", example: "Do you need a council?" },
  { en: "away", phonetic: "/ә'wei/", cn: "离去", example: "At 9 o'clock sharp he awayed to bed." },
  { en: "includes", phonetic: "/ɪnˈkluːdz/", cn: "包含", example: "I will purchase the vacation package if you will include car rental." },
  { en: "track", phonetic: "/træk/", cn: "轨迹", example: "Can you see any tracks in the snow?" },
  { en: "australia", phonetic: "/ɒ'streiljә/", cn: "澳洲", example: "I like this australia." },
  { en: "discussion", phonetic: "/dis'kʌʃәn/", cn: "讨论", example: "My discussion with the professor was very enlightening." },
  { en: "archive", phonetic: "/'ɑ:kaiv/", cn: "把...存档\\.档案馆", example: "His archive of Old High German texts is the most extensive in Britain." },
  { en: "once", phonetic: "/wʌns/", cn: "一次", example: "This is my once." },
  { en: "others", phonetic: "/ˈʌðəz/", cn: "其他人", example: "I'm afraid little Robbie does not always play well with others." },
  { en: "entertainment", phonetic: "/.entә'teinmәnt/", cn: "娱乐", example: "I like this entertainment." },
  { en: "agreement", phonetic: "/ә'gri:mәnt/", cn: "同意", example: "to enter an agreement;  the UK and US negotiators nearing agreement;  he nodded his agreement." },
  { en: "format", phonetic: "/'fɒ:mæt/", cn: "开本", example: "The radio station changed the format of its evening program." },
  { en: "least", phonetic: "/li:st/", cn: "最少", example: "It was the least surprising thing." },
  { en: "society", phonetic: "/sә'saiәti/", cn: "社会", example: "This society has been known for centuries for its colorful clothing and tight-knit family structure." },
  { en: "months", phonetic: "/mʌnθs/", cn: "月份", example: "July is my favourite month." },
  { en: "log", phonetic: "/lɒg/", cn: "记录", example: "They walked across the stream on a fallen log." },
  { en: "safety", phonetic: "/'seifti/", cn: "安全", example: "If you push it to the limit, safety is not guaranteed." },
  { en: "friends", phonetic: "/fɹɛn(d)z/", cn: "老友记", example: "John and I have been friends ever since we were roommates at college.   Trust is important between friends.   I used to find it hard to make friends when I was shy." },
  { en: "sure", phonetic: "/ʃuә/", cn: "确信", example: "Where is the sure?" },
  { en: "faq", phonetic: "", cn: "中等品", example: "I like this faq." },
  { en: "trade", phonetic: "/treid/", cn: "贸易", example: "Do you need a trade?" },
  { en: "edition", phonetic: "/i'diʃәn/", cn: "版本", example: "I have an edition." },
  { en: "cars", phonetic: "/ˈkɑːz/", cn: "中美洲研究站", example: "This is my cars." },
  { en: "messages", phonetic: "/ˈmɛsɪd͡ʒɪz/", cn: "信息", example: "Where is the messages?" },
  { en: "marketing", phonetic: "/'mɑ:kitiŋ/", cn: "行销", example: "I like this marketing." },
  { en: "tell", phonetic: "/tel/", cn: "告诉", example: "Do you need a tell?" },
  { en: "further", phonetic: "/'fә:ðә/", cn: "更远的", example: "I have a further." },
  { en: "updated", phonetic: "/ʌp'deitid/", cn: "更新的", example: "This is my updated." },
  { en: "association", phonetic: "/ә.sәuʃә'eiʃәn/", cn: "协会\\[计]关联", example: "Where is the association?" },
  { en: "able", phonetic: "/'eibl/", cn: "能干的", example: "I like this able." },
  { en: "having", phonetic: "/'hæviŋ/", cn: "财产", example: "Do you need a having?" },
  { en: "provides", phonetic: "/prəˈvaidz/", cn: "提供", example: "I have a provides." },
  { en: "david", phonetic: "/'deivid/", cn: "大卫", example: "This is my david." },
  { en: "fun", phonetic: "/fʌn/", cn: "乐趣", example: "Where is the fun?" },
  { en: "already", phonetic: "/ɒ:l'redi/", cn: "已经", example: "I like this already." },
  { en: "green", phonetic: "/gri:n/", cn: "绿色", example: "Do you need a green?" },
  { en: "studies", phonetic: "/ˈstʌdiz/", cn: "研究", example: "I have a studies." },
  { en: "close", phonetic: "/klәuz/", cn: "结束", example: "This is my close." },
  { en: "common", phonetic: "/'kɒmәn/", cn: "通常的", example: "Where is the common?" },
  { en: "drive", phonetic: "/draiv/", cn: "驾车", example: "I like this drive." },
  { en: "specific", phonetic: "/spi'sifik/", cn: "特效药", example: "Do you need a specific?" },
  { en: "several", phonetic: "/'sevәrәl/", cn: "几个的", example: "I have a several." },
  { en: "gold", phonetic: "/gәuld/", cn: "黄金", example: "This is my gold." },
  { en: "feb", phonetic: "", cn: "二月", example: "Where is the feb?" },
  { en: "living", phonetic: "/'liviŋ/", cn: "生活", example: "I like this living." },
  { en: "sep", phonetic: "", cn: "九月", example: "Do you need a sep?" },
  { en: "collection", phonetic: "/kә'lekʃәn/", cn: "收集", example: "I have a collection." },
  { en: "called", phonetic: "[kɔld]", cn: "被呼叫的", example: "This is my called." },
  { en: "short", phonetic: "/ʃɒ:t/", cn: "短的", example: "Where is the short?" },
  { en: "arts", phonetic: "/ɑ:ts/", cn: "文科", example: "I like this arts." },
  { en: "lot", phonetic: "/lɒt/", cn: "运气", example: "Do you need a lot?" },
  { en: "ask", phonetic: "/ɑ:sk/", cn: "问", example: "I have an ask." },
  { en: "display", phonetic: "/dis'plei/", cn: "显示", example: "This is my display." },
  { en: "limited", phonetic: "/'limitid/", cn: "有限制的", example: "Where is the limited?" },
  { en: "powered", phonetic: "/'pauәd/", cn: "有动力装置的", example: "I like this powered." },
  { en: "solutions", phonetic: "", cn: "解决方案", example: "Do you need a solutions?" },
  { en: "means", phonetic: "/mi:nz/", cn: "方法", example: "I have a means." },
  { en: "director", phonetic: "/di'rektә/", cn: "主管", example: "This is my director." },
  { en: "daily", phonetic: "/'deili/", cn: "每日的", example: "Where is the daily?" },
  { en: "beach", phonetic: "/bi:tʃ/", cn: "海滩", example: "I like this beach." },
  { en: "past", phonetic: "/pɑ:st/", cn: "过去", example: "Do you need a past?" },
  { en: "natural", phonetic: "/'nætʃәrәl/", cn: "白痴\\.自然的", example: "I have a natural." },
  { en: "whether", phonetic: "/'hweðә/", cn: "是否", example: "This is my whether." },
  { en: "due", phonetic: "/dju:/", cn: "应得的东西", example: "Where is the due?" },
  { en: "et", phonetic: "/'i:ti:/", cn: "[化]乙基", example: "I like this et." },
  { en: "electronics", phonetic: "/.ilek'trɒniks/", cn: "电子学\\[计]电子学", example: "Do you need an electronics?" },
  { en: "five", phonetic: "/faiv/", cn: "五", example: "I have a five." },
  { en: "upon", phonetic: "/ә'pɒn/", cn: "在...之上", example: "This is my upon." },
  { en: "period", phonetic: "/'piәriәd/", cn: "时期", example: "Where is the period?" },
  { en: "planning", phonetic: "/ˈplænɪŋ/", cn: "计划的制订", example: "I like this planning." },
  { en: "database", phonetic: "/'deitәbeis/", cn: "数据库\\[计]数据库", example: "I have a database of all my contacts in my personal organizer." },
  { en: "says", phonetic: "/sez/", cn: "说", example: "Please say your name slowly and clearly." },
  { en: "official", phonetic: "/ә'fiʃәl/", cn: "官员", example: "David Barnes was the official charged with the running of the sports club." },
  { en: "weather", phonetic: "/'weðә/", cn: "天气", example: "Wooden garden furniture must be well oiled as it is continuously exposed to weather." },
  { en: "mar", phonetic: "/mɑ:/", cn: "损毁", example: "I like this mar." },
  { en: "land", phonetic: "/lænd/", cn: "陆地", example: "Most insects live on land." },
  { en: "average", phonetic: "/'ævәridʒ/", cn: "平均", example: "The average of 10, 20 and 24 is (10 + 20 + 24)/3 = 18." },
  { en: "done", phonetic: "/dʌn/", cn: "完成了的", example: "All you ever do is surf the Internet. What will you do this afternoon?" },
  { en: "technical", phonetic: "/'teknikl/", cn: "技术上的", example: "The performance showed technical virtuosity, but lacked inspiration." },
  { en: "window", phonetic: "/'windәu/", cn: "窗户", example: "To separate out the chaff, early cultures tossed baskets of grain into the air and let the wind blow away the lighter chaff." },
  { en: "france", phonetic: "/frɑ:ns/", cn: "法国", example: "Do you need a france?" },
  { en: "pro", phonetic: "/prәu/", cn: "正面地\\[计]可编程远程操作", example: "What are the pros and cons of buying a car?" },
  { en: "region", phonetic: "/'ri:dʒәn/", cn: "区域", example: "the equatorial regions" },
  { en: "island", phonetic: "/'ailәnd/", cn: "岛", example: "an island of colors on a butterfly's wing" },
  { en: "record", phonetic: "/ri'kɒ:d/", cn: "记录", example: "The person had a record of the interview so she could review her notes." },
  { en: "direct", phonetic: "/di'rekt/", cn: "直接的", example: "to direct the affairs of a nation or the movements of an army" },
  { en: "conference", phonetic: "/'kɒnfәrәns/", cn: "会议\\[经]会议", example: "I have a conference." },
  { en: "environment", phonetic: "/in'vairәnmәnt/", cn: "环境", example: "That program uses the Microsoft Windows environment." },
  { en: "records", phonetic: "/ˈɹɛkɔːdz/", cn: "记录", example: "The person had a record of the interview so she could review her notes." },
  { en: "st", phonetic: "", cn: "[计]段表", example: "\"Saint Stephen was the first martyr.\"" },
  { en: "district", phonetic: "/'distrikt/", cn: "区域", example: "the Soho district of London" },
  { en: "calendar", phonetic: "/'kælindә/", cn: "日历", example: "The three principal calendars are the Gregorian, Jewish, and Islamic calendars." },
  { en: "costs", phonetic: "/ˈkɑsts/", cn: "费用", example: "This is my costs." },
  { en: "style", phonetic: "/stail/", cn: "风格", example: "Where is the style?" },
  { en: "url", phonetic: "", cn: "[计]统一资源定位器", example: "I like this url." },
  { en: "front", phonetic: "/frʌnt/", cn: "前面", example: "Do you need a front?" },
  { en: "statement", phonetic: "/'steitmәnt/", cn: "陈述", example: "I have a statement." },
  { en: "update", phonetic: "/ʌp'deit/", cn: "更新", example: "This is my update." },
  { en: "parts", phonetic: "/pɑ:ts/", cn: "零件", example: "Where is the parts?" },
  { en: "aug", phonetic: "", cn: "八月", example: "I like this aug." },
  { en: "ever", phonetic: "/'evә/", cn: "曾经", example: "Do you need an ever?" },
  { en: "downloads", phonetic: "", cn: "下载", example: "I have a downloads." },
  { en: "early", phonetic: "/'ә:li/", cn: "早的", example: "This is my early." },
  { en: "miles", phonetic: "/maɪlz/", cn: "英里", example: "Where is the miles?" },
  { en: "sound", phonetic: "/saund/", cn: "声音", example: "I like this sound." },
  { en: "resource", phonetic: "/ri'sɒ:s/", cn: "资源", example: "Do you need a resource?" },
  { en: "present", phonetic: "/'preznt/", cn: "现在", example: "I have a present." },
  { en: "applications", phonetic: "/ˌæplɪˈkeɪʃənz/", cn: "应用", example: "This is my applications." },
  { en: "ago", phonetic: "/ә'gәu/", cn: "以前", example: "Where is the ago?" },
  { en: "document", phonetic: "/'dɒkjumәnt/", cn: "文件", example: "I like this document." },
  { en: "word", phonetic: "/wә:d/", cn: "话", example: "Do you need a word?" },
  { en: "works", phonetic: "/wɜːks/", cn: "工程", example: "I have a works." },
  { en: "material", phonetic: "/mә'tiәriәl/", cn: "材料", example: "This is my material." },
  { en: "bill", phonetic: "/bil/", cn: "帐单", example: "Where is the bill?" },
  { en: "apr", phonetic: "", cn: "[计]替换通路再试器", example: "I like this apr." },
  { en: "written", phonetic: "/'ritn/", cn: "书面的", example: "Do you need a written?" },
  { en: "talk", phonetic: "/tɒ:k/", cn: "谈话", example: "I have a talk." },
  { en: "federal", phonetic: "/'fedәrәl/", cn: "联邦的", example: "This is my federal." },
  { en: "hosting", phonetic: "/'hәustiŋ/", cn: "作战", example: "Where is the hosting?" },
  { en: "rules", phonetic: "/ˈɹuːlz/", cn: "规则", example: "I like this rules." },
  { en: "final", phonetic: "/'fainl/", cn: "期末考试", example: "Do you need a final?" },
  { en: "adult", phonetic: "/'ædʌlt/", cn: "成人", example: "I have an adult." },
  { en: "tickets", phonetic: "/ˈtɪkɪts/", cn: "票", example: "This is my tickets." },
  { en: "thing", phonetic: "/θiŋ/", cn: "事物", example: "Where is the thing?" },
  { en: "centre", phonetic: "/'sentә/", cn: "中心", example: "I like this centre." },
  { en: "requirements", phonetic: "/ɹɪˈkwaɪɹmənts/", cn: "调整需要量", example: "Do you need a requirements?" },
  { en: "via", phonetic: "/vaiә/", cn: "经由", example: "I have a via." },
  { en: "cheap", phonetic: "/tʃi:p/", cn: "便宜的", example: "This is my cheap." },
  { en: "kids", phonetic: "/kɪ(d)z/", cn: "小山羊", example: "Where is the kids?" },
  { en: "finance", phonetic: "/fai'næns/", cn: "财政", example: "I like this finance." },
  { en: "true", phonetic: "/tru:/", cn: "真实的", example: "Do you need a true?" },
  { en: "minutes", phonetic: "/ˈmɪnɪts/", cn: "会议记录\\[法]备忘录", example: "I have a minutes." },
  { en: "else", phonetic: "/els/", cn: "别的", example: "This is my else." },
  { en: "mark", phonetic: "/mɑ:k/", cn: "标志", example: "Where is the mark?" },
  { en: "third", phonetic: "/θә:d/", cn: "第三", example: "I like this third." },
  { en: "rock", phonetic: "/rɒk/", cn: "岩石", example: "Do you need a rock?" },
  { en: "gifts", phonetic: "/ɡɪfts/", cn: "礼品", example: "I have a gifts." },
  { en: "europe", phonetic: "/'juәrәp/", cn: "欧洲", example: "This is my europe." },
  { en: "reading", phonetic: "/'ri:diŋ/", cn: "阅读", example: "Where is the reading?" },
  { en: "topics", phonetic: "/ˈtɒpɪks/", cn: "总联机程序和信息控制系统", example: "I like this topics." },
  { en: "bad", phonetic: "/bæd/", cn: "坏的\\.坏\\.坏地", example: "Do you need a bad?" },
  { en: "individual", phonetic: "/.indi'vidʒuәl/", cn: "人", example: "I have an individual." },
  { en: "tips", phonetic: "/tɪps/", cn: "秘诀", example: "This is my tips." },
  { en: "plus", phonetic: "/plʌs/", cn: "加上", example: "Where is the plus?" },
  { en: "auto", phonetic: "/'ɒ:tәu/", cn: "汽车\\.表示\"自己\"、\"本身\"", example: "I like this auto." },
  { en: "cover", phonetic: "/'kʌvә/", cn: "盖子", example: "The soldiers took cover behind a ruined building." },
  { en: "usually", phonetic: "/'ju:ʒuәli/", cn: "通常", example: "Except for one or two days a year, he usually walks to work." },
  { en: "edit", phonetic: "/'edit/", cn: "编辑", example: "He edits the Chronicle." },
  { en: "together", phonetic: "/tә'geðә/", cn: "一起", example: "He's really together." },
  { en: "videos", phonetic: "", cn: "视频文件", example: "I like this videos." },
  { en: "percent", phonetic: "/pә'sent/", cn: "百分比", example: "only a small percent attain the top ranks" },
  { en: "fast", phonetic: "/fɑ:st/", cn: "快速的", example: "That rope is dangerously loose. Make it fast!" },
  { en: "function", phonetic: "/'fʌŋkʃәn/", cn: "官能", example: "This is my function." },
  { en: "fact", phonetic: "/fækt/", cn: "事实", example: "In this story, the Gettysburg Address is a fact, but the rest is fiction." },
  { en: "unit", phonetic: "/'ju:nit/", cn: "单位", example: "The centimetre is a unit of length." },
  { en: "getting", phonetic: "/'^etiŋ/", cn: "采煤", example: "I'm going to get a computer tomorrow from the discount store." },
  { en: "global", phonetic: "/'glәubl/", cn: "通用的", example: "I have a global." },
  { en: "tech", phonetic: "/tek/", cn: "技术学院或学校", example: "This is my tech." },
  { en: "meet", phonetic: "/mi:t/", cn: "会", example: "OK, let's arrange a meet with Tyler and ask him." },
  { en: "far", phonetic: "/fɑ:/", cn: "远的", example: "He went to a far land." },
  { en: "economic", phonetic: "/.i:kә'nɒmik/", cn: "经济上的", example: "Do you need an economic?" },
  { en: "en", phonetic: "/en/", cn: "字母", example: "The Scottish and the English have a history of conflict." },
  { en: "player", phonetic: "/'pleiә/", cn: "竞赛者", example: "He thought he could become a player, at least at the state level." },
  { en: "projects", phonetic: "", cn: "项目", example: "Projects like Pruitt-Igoe were considered irreparably dangerous and demolished." },
  { en: "lyrics", phonetic: "/ˈlɪɹ.ɪks/", cn: "歌词", example: "The lyric in line 3 doesn't rhyme." },
  { en: "often", phonetic: "/'ɒ:fn/", cn: "时常", example: "I often walk to work when the weather is nice." },
  { en: "subscribe", phonetic: "/sәb'skraib/", cn: "捐献", example: "Would you like to subscribe or subscribe a friend to our new magazine, Lexicography Illustrated?" },
  { en: "submit", phonetic: "/sәb'mit/", cn: "使服从", example: "They will not submit to the destruction of their rights." },
  { en: "germany", phonetic: "/'dʒә:mәni/", cn: "德国", example: "Where is the germany?" },
  { en: "amount", phonetic: "/ә'maunt/", cn: "总数", example: "The amount of atmospheric pollution threatens a health crisis." },
  { en: "watch", phonetic: "/wɒtʃ/", cn: "观察", example: "Do you need a watch?" },
  { en: "included", phonetic: "/in'klu:did/", cn: "包括在内\\[计]包含的", example: "I have an included." },
  { en: "feel", phonetic: "/fi:l/", cn: "感觉", example: "This is my feel." },
  { en: "though", phonetic: "/ðәu/", cn: "然而", example: "Where is the though?" },
  { en: "bank", phonetic: "/bæŋk/", cn: "银行", example: "I like this bank." },
  { en: "risk", phonetic: "/risk/", cn: "冒险", example: "Do you need a risk?" },
  { en: "thanks", phonetic: "/θæŋks/", cn: "感谢", example: "I have a thanks." },
  { en: "everything", phonetic: "/'evriθiŋ/", cn: "每件事物", example: "This is my everything." },
  { en: "deals", phonetic: "/diːlz/", cn: "协约", example: "Where is the deals?" },
  { en: "various", phonetic: "/'vєәriәs/", cn: "不同的", example: "I like this various." },
  { en: "words", phonetic: "/wɜːdz/", cn: "言语", example: "Do you need a words?" },
  { en: "linux", phonetic: "", cn: "一个个人电脑上免费的操作系统", example: "I have a linux." },
  { en: "jul", phonetic: "", cn: "七月", example: "This is my jul." },
  { en: "production", phonetic: "/prә'dʌkʃәn/", cn: "制造", example: "Where is the production?" },
  { en: "commercial", phonetic: "/kә'mә:ʃәl/", cn: "商业的", example: "I like this commercial." },
  { en: "james", phonetic: "/dʒeimz/", cn: "詹姆斯", example: "Do you need a james?" },
  { en: "weight", phonetic: "/weit/", cn: "重", example: "I have a weight." },
  { en: "town", phonetic: "/taun/", cn: "城镇", example: "This is my town." },
  { en: "heart", phonetic: "/hɑ:t/", cn: "心", example: "Where is the heart?" },
  { en: "advertising", phonetic: "/'ædvәtaiziŋ/", cn: "广告业", example: "I like this advertising." },
  { en: "received", phonetic: "/ri'si:vd/", cn: "被一般承认的", example: "Do you need a received?" },
  { en: "choose", phonetic: "/tʃu:z/", cn: "选择", example: "I have a choose." },
  { en: "treatment", phonetic: "/'tri:tmәnt/", cn: "治疗", example: "This is my treatment." },
  { en: "newsletter", phonetic: "/'nju:z.letә/", cn: "时事通讯", example: "Where is the newsletter?" },
  { en: "archives", phonetic: "/'ɑ:kaivz/", cn: "档案", example: "I like this archives." },
  { en: "points", phonetic: "/pɔɪnts/", cn: "转轨器", example: "Do you need a points?" },
  { en: "knowledge", phonetic: "/'nɒlidʒ/", cn: "知识", example: "I have a knowledge." },
  { en: "magazine", phonetic: "/.mægә'zi:n/", cn: "杂志", example: "This is my magazine." },
  { en: "error", phonetic: "/'erә/", cn: "错误", example: "Where is the error?" },
  { en: "camera", phonetic: "/'kæmәrә/", cn: "照相机", example: "I like this camera." },
  { en: "jun", phonetic: "/dʒʌn/", cn: "六月", example: "Do you need a jun?" },
  { en: "girl", phonetic: "/gә:l/", cn: "女孩", example: "I have a girl." },
  { en: "currently", phonetic: "/'kʌrәntli/", cn: "现在", example: "This is my currently." },
  { en: "construction", phonetic: "/kәn'strʌkʃәn/", cn: "建筑", example: "Where is the construction?" },
  { en: "toys", phonetic: "", cn: "玩具", example: "I like this toys." },
  { en: "registered", phonetic: "/'redʒistәd/", cn: "注册的", example: "Do you need a registered?" },
  { en: "clear", phonetic: "/kliә/", cn: "清楚的", example: "I have a clear." },
  { en: "golf", phonetic: "/gɒlf/", cn: "高尔夫球\\.打高尔夫球", example: "This is my golf." },
  { en: "receive", phonetic: "/ri'si:v/", cn: "收到", example: "Where is the receive?" },
  { en: "domain", phonetic: "/dәu'mein/", cn: "领域", example: "I like this domain." },
  { en: "methods", phonetic: "", cn: "方法", example: "Do you need a methods?" },
  { en: "chapter", phonetic: "/'tʃæptә/", cn: "章", example: "I have a chapter." },
  { en: "makes", phonetic: "/meɪks/", cn: "做", example: "This is my makes." },
  { en: "protection", phonetic: "/prә'tekʃәn/", cn: "保护", example: "Where is the protection?" },
  { en: "policies", phonetic: "", cn: "政策", example: "I like this policies." },
  { en: "loan", phonetic: "/lәun/", cn: "贷款", example: "Do you need a loan?" },
  { en: "wide", phonetic: "/waid/", cn: "宽的", example: "I have a wide." },
  { en: "beauty", phonetic: "/'bju:ti/", cn: "美", example: "This is my beauty." },
  { en: "manager", phonetic: "/'mænidʒә/", cn: "经理", example: "Where is the manager?" },
  { en: "india", phonetic: "/'indjә/", cn: "印度", example: "I like this india." },
  { en: "position", phonetic: "/pә'ziʃәn/", cn: "位置", example: "Do you need a position?" },
  { en: "taken", phonetic: "/'teikәn/", cn: "的过去分词", example: "I have a taken." },
  { en: "sort", phonetic: "/sɒ:t/", cn: "种类", example: "I had a sort of my cupboard." },
  { en: "listings", phonetic: "", cn: "表", example: "Aardvaark Plumbing is the first listing in Yellow Pages." },
  { en: "models", phonetic: "/'mɒdlz/", cn: "模型", example: "The beautiful model had her face on the cover of almost every fashion magazine imaginable." },
  { en: "michael", phonetic: "/'maikl/", cn: "迈克尔", example: "Do you need a michael?" },
  { en: "known", phonetic: "/nәun/", cn: "已知的", example: "He knew something terrible was going to happen." },
  { en: "half", phonetic: "/hɑ:f/", cn: "一半", example: "I ate the slightly smaller half of the apple." },
  { en: "cases", phonetic: "/ˈkeɪsɪz/", cn: "案例", example: "For a change, in this case, he was telling the truth." },
  { en: "step", phonetic: "/step/", cn: "步骤", example: "He improved step by step, or by steps." },
  { en: "engineering", phonetic: "/.endʒi'niәriŋ/", cn: "工程学", example: "Do you need an engineering?" },
  { en: "florida", phonetic: "/'flɒridә/", cn: "佛罗里达州", example: "I have a florida." },
  { en: "simple", phonetic: "/'simpl/", cn: "简单的", example: "This is my simple." },
  { en: "quick", phonetic: "/kwik/", cn: "快的", example: "He's a quick runner." },
  { en: "none", phonetic: "/nʌn/", cn: "一点也不", example: "I felt none the worse for my recent illness." },
  { en: "wireless", phonetic: "/'waiәlis/", cn: "无线电\\.无线的", example: "Only about a hundred years ago, wireless was a new technology." },
  { en: "license", phonetic: "/'laisns/", cn: "执照", example: "In order to enter the building, I need to show my license." },
  { en: "paul", phonetic: "/pɔ:l/", cn: "保罗", example: "This is my paul." },
  { en: "friday", phonetic: "/'fraidi/", cn: "星期五", example: "Where is the friday?" },
  { en: "lake", phonetic: "/leik/", cn: "湖", example: "For example, the name of a lake prepared by extending the aluminum salt prepared from FD&C Blue No. 1 upon the substratum would be FD&C Blue No. 1--Aluminum Lake." },
  { en: "whole", phonetic: "/hәul/", cn: "全部", example: "This variety of fascinating details didn't fall together into an enjoyable, coherent whole." },
  { en: "annual", phonetic: "/'ænjuәl/", cn: "年刊", example: "I read the magazine, but I usually don't purchase the annuals." },
  { en: "published", phonetic: "/ˈpʌblɪʃt/", cn: "已发布的", example: "Most of the sketches Faulkner published in 1925 appeared in the Sunday magazine section of the New Orleans Times-Picayune." },
  { en: "later", phonetic: "/'leitә/", cn: "以后", example: "It was late in the evening when we finally arrived." },
  { en: "basic", phonetic: "/'beisik/", cn: "基本原理", example: "I like this basic." },
  { en: "sony", phonetic: "", cn: "索尼", example: "Do you need a sony?" },
  { en: "shows", phonetic: "/ʃəʊz/", cn: "秀场", example: "I have a shows." },
  { en: "corporate", phonetic: "/'kɒ:pәrit/", cn: "社团的", example: "This is my corporate." },
  { en: "google", phonetic: "/ˈɡuːɡəl/", cn: "谷歌", example: "Where is the google?" },
  { en: "church", phonetic: "/tʃә:tʃ/", cn: "教堂", example: "I like this church." },
  { en: "method", phonetic: "/'meθәd/", cn: "方法", example: "Do you need a method?" },
  { en: "purchase", phonetic: "/'pә:tʃәs/", cn: "购买", example: "I have a purchase." },
  { en: "customers", phonetic: "/ˈkʌstəməz/", cn: "客户", example: "This is my customers." },
  { en: "active", phonetic: "/'æktiv/", cn: "活跃的", example: "Where is the active?" },
  { en: "response", phonetic: "/ri'spɒns/", cn: "反应", example: "I like this response." },
  { en: "practice", phonetic: "/'præktis/", cn: "实践", example: "Do you need a practice?" },
  { en: "hardware", phonetic: "/'hɑ:dwєә/", cn: "硬件", example: "I have a hardware." },
  { en: "figure", phonetic: "/'figә/", cn: "数字", example: "This is my figure." },
  { en: "materials", phonetic: "/məˈtɪəɹɪəlz/", cn: "材料", example: "Where is the materials?" },
  { en: "fire", phonetic: "/'faiә/", cn: "火", example: "I like this fire." },
  { en: "holiday", phonetic: "/'hɒlәdi/", cn: "假日", example: "Do you need a holiday?" },
  { en: "chat", phonetic: "/tʃæt/", cn: "闲谈\\.闲谈", example: "I have a chat." },
  { en: "enough", phonetic: "/i'nʌf/", cn: "充足", example: "This is my enough." },
  { en: "designed", phonetic: "/di'zaind/", cn: "故意的", example: "Where is the designed?" },
  { en: "along", phonetic: "/ә'lɒŋ/", cn: "平行地", example: "I like this along." },
  { en: "among", phonetic: "/ә'mʌŋ/", cn: "在...之中", example: "Do you need an among?" },
  { en: "death", phonetic: "/deθ/", cn: "死亡\\[医]死亡", example: "I have a death." },
  { en: "writing", phonetic: "/'raitiŋ/", cn: "书写", example: "This is my writing." },
  { en: "speed", phonetic: "/spi:d/", cn: "速率", example: "Where is the speed?" },
  { en: "html", phonetic: "", cn: "[计]超文本标记语言", example: "I like this html." },
  { en: "countries", phonetic: "/ˈkʌntɹiz/", cn: "国家", example: "Do you need a countries?" },
  { en: "loss", phonetic: "/lɒs/", cn: "损失", example: "I have a loss." },
  { en: "face", phonetic: "/feis/", cn: "脸", example: "This is my face." },
  { en: "brand", phonetic: "/brænd/", cn: "商标", example: "Where is the brand?" },
  { en: "discount", phonetic: "/'diskaunt/", cn: "折扣", example: "I like this discount." },
  { en: "higher", phonetic: "/'haiә/", cn: "[经]上扬", example: "Do you need a higher?" },
  { en: "effects", phonetic: "/ɪˈfɛkts/", cn: "财物", example: "I have an effects." },
  { en: "created", phonetic: "/kri: 'eitid/", cn: "创造的\\[电]创造的", example: "This is my created." },
  { en: "remember", phonetic: "/ri'membә/", cn: "记得", example: "Where is the remember?" },
  { en: "standards", phonetic: "/ˈstændədz/", cn: "标准", example: "I like this standards." },
  { en: "oil", phonetic: "/ɒil/", cn: "油", example: "Do you need an oil?" },
  { en: "bit", phonetic: "/bit/", cn: "少量", example: "I have a bit." },
  { en: "yellow", phonetic: "/'jelәu/", cn: "黄色\\.黄色的", example: "This is my yellow." },
  { en: "political", phonetic: "/pә'litikl/", cn: "政治的", example: "Where is the political?" },
  { en: "increase", phonetic: "/in'kri:s/", cn: "增加", example: "I like this increase." },
  { en: "advertise", phonetic: "/'ædvәtaiz/", cn: "做广告", example: "Do you need an advertise?" },
  { en: "kingdom", phonetic: "/'kiŋdәm/", cn: "王国", example: "I have a kingdom." },
  { en: "base", phonetic: "/beis/", cn: "底部", example: "This is my base." },
  { en: "near", phonetic: "/niә/", cn: "近的", example: "Where is the near?" },
  { en: "environmental", phonetic: "/in.vaiәrәn'mentәl/", cn: "周围的", example: "I like this environmental." },
  { en: "thought", phonetic: "/θɒ:t/", cn: "想法", example: "Do you need a thought?" },
  { en: "stuff", phonetic: "/stʌf/", cn: "原料", example: "I have a stuff." },
  { en: "french", phonetic: "/frentʃ/", cn: "法国人", example: "This is my french." },
  { en: "storage", phonetic: "/'stɒ:ridʒ/", cn: "存储器", example: "Where is the storage?" },
  { en: "japan", phonetic: "/dʒә'pæn/", cn: "日本\\[化]天然漆", example: "I like this japan." },
  { en: "doing", phonetic: "/'du:iŋ/", cn: "行为", example: "Do you need a doing?" },
  { en: "loans", phonetic: "", cn: "借贷", example: "I have a loans." },
  { en: "shoes", phonetic: "/ʃuːz/", cn: "鞋子", example: "This is my shoes." },
  { en: "entry", phonetic: "/'entri/", cn: "登录", example: "Where is the entry?" },
  { en: "stay", phonetic: "/stei/", cn: "停留", example: "I hope you enjoyed your stay in Hawaii." },
  { en: "nature", phonetic: "/'neitʃә/", cn: "自然", example: "Do you need a nature?" },
  { en: "orders", phonetic: "/ˈɔːdəz/", cn: "牧师职", example: "The house is in order; the machinery is out of order." },
  { en: "availability", phonetic: "/ә.veilә'biliti/", cn: "有效性", example: "What is your availability this week?" },
  { en: "africa", phonetic: "/'æfrikә/", cn: "非洲", example: "Where is the africa?" },
  { en: "summary", phonetic: "/'sʌmәri/", cn: "摘要", example: "I like this summary." },
  { en: "turn", phonetic: "/tә:n/", cn: "转弯", example: "They say they can turn the parts in two days." },
  { en: "mean", phonetic: "/mi:n/", cn: "低劣的", example: "I have a mean." },
  { en: "growth", phonetic: "/grәuθ/", cn: "生长", example: "This is my growth." },
  { en: "notes", phonetic: "/nəʊts/", cn: "票据", example: "Where is the notes?" },
  { en: "agency", phonetic: "/'eidʒәnsi/", cn: "代理机构", example: "I like this agency." },
  { en: "king", phonetic: "/kiŋ/", cn: "国王", example: "Do you need a king?" },
  { en: "monday", phonetic: "/'mʌndi/", cn: "星期一", example: "I have a monday." },
  { en: "european", phonetic: "/.juәrә'pi:әn/", cn: "欧洲人\\.欧洲的", example: "This is my european." },
  { en: "activity", phonetic: "/æk'tiviti/", cn: "活动", example: "Where is the activity?" },
  { en: "copy", phonetic: "/'kɒpi/", cn: "副本", example: "I like this copy." },
  { en: "although", phonetic: "/ɒ:l'ðou/", cn: "虽然", example: "Do you need an although?" },
  { en: "drug", phonetic: "/drʌg/", cn: "药", example: "I have a drug." },
  { en: "pics", phonetic: "/pɪks/", cn: "[计]生产信息控制系统", example: "This is my pics." },
  { en: "western", phonetic: "/'westәn/", cn: "西方人", example: "Where is the western?" },
  { en: "income", phonetic: "/'inkʌm/", cn: "收入", example: "I like this income." },
  { en: "force", phonetic: "/fɒ:s/", cn: "力量", example: "Do you need a force?" },
  { en: "cash", phonetic: "/kæʃ/", cn: "现金\\.兑现", example: "I have a cash." },
  { en: "employment", phonetic: "/im'plɒimәnt/", cn: "雇用", example: "This is my employment." },
  { en: "overall", phonetic: "/'әuvәrɒ:l/", cn: "全部的", example: "Where is the overall?" },
  { en: "bay", phonetic: "/bei/", cn: "海湾", example: "I like this bay." },
  { en: "river", phonetic: "/'rivә/", cn: "河", example: "Do you need a river?" },
  { en: "commission", phonetic: "/kә'miʃәn/", cn: "委任状", example: "I have a commission." },
  { en: "ad", phonetic: "/æd/", cn: "广告\\[计]地址", example: "This is my ad." },
  { en: "package", phonetic: "/'pækidʒ/", cn: "包裹", example: "Where is the package?" },
  { en: "contents", phonetic: "/'kɒntents/", cn: "目录\\[计]目录", example: "I like this contents." },
  { en: "seen", phonetic: "/si:n/", cn: "的过去分词", example: "Do you need a seen?" },
  { en: "players", phonetic: "/ˈpleɪəz/", cn: "队员", example: "I have a players." },
  { en: "engine", phonetic: "/'endʒin/", cn: "引擎", example: "This is my engine." },
  { en: "port", phonetic: "/pɒ:t/", cn: "港口", example: "Where is the port?" },
  { en: "album", phonetic: "/'ælbәm/", cn: "粘贴簿", example: "I like this album." },
  { en: "regional", phonetic: "/'ri:dʒәnәl/", cn: "地方的", example: "Do you need a regional?" },
  { en: "stop", phonetic: "/stɒp/", cn: "停止", example: "I have a stop." },
  { en: "supplies", phonetic: "/səˈplaɪz/", cn: "供应品", example: "This is my supplies." },
  { en: "started", phonetic: "/s'tɑ:tɪd/", cn: "出发", example: "Where is the started?" },
  { en: "administration", phonetic: "/әd.mini'streiʃәn/", cn: "行政", example: "I like this administration." },
  { en: "bar", phonetic: "/bɑ:/", cn: "条", example: "Do you need a bar?" },
  { en: "institute", phonetic: "/'institju:t/", cn: "学会", example: "I have an institute." },
  { en: "views", phonetic: "/vjuːz/", cn: "景点", example: "This is my views." },
  { en: "plans", phonetic: "/plænz/", cn: "计划", example: "Where is the plans?" },
  { en: "double", phonetic: "/'dʌbl/", cn: "两倍\\.两倍的", example: "I like this double." },
  { en: "dog", phonetic: "/dɒg/", cn: "狗", example: "Do you need a dog?" },
  { en: "build", phonetic: "/bild/", cn: "建立", example: "I have a build." },
  { en: "screen", phonetic: "/skri:n/", cn: "幕", example: "This is my screen." },
  { en: "exchange", phonetic: "/iks'tʃeindʒ/", cn: "交换", example: "Where is the exchange?" },
  { en: "types", phonetic: "/taɪps/", cn: "打字", example: "I like this types." },
  { en: "soon", phonetic: "/su:n/", cn: "不久", example: "Do you need a soon?" },
  { en: "sponsored", phonetic: "/ˈspɔnsəd/", cn: "赞助", example: "I have a sponsored." },
  { en: "lines", phonetic: "", cn: "台词", example: "This is my lines." },
  { en: "electronic", phonetic: "/.ilek'trɒnik/", cn: "电子的\\[计]电子工业协会接口", example: "Where is the electronic?" },
  { en: "continue", phonetic: "/kәn'tinju:/", cn: "继续", example: "I like this continue." },
  { en: "across", phonetic: "/ә'krɒs/", cn: "越过", example: "Do you need an across?" },
  { en: "benefits", phonetic: "", cn: "利益", example: "I have a benefits." },
  { en: "needed", phonetic: "/ˈniːdɪd/", cn: "需要的", example: "This is my needed." },
  { en: "season", phonetic: "/'si:zn/", cn: "季节", example: "Where is the season?" },
  { en: "apply", phonetic: "/ә'plai/", cn: "涂", example: "to apply cream to a rash" },
  { en: "someone", phonetic: "/'sʌmwʌn/", cn: "有人", example: "Do you need a gift for that special someone?" },
  { en: "held", phonetic: "/held/", cn: "的过去式和过去分词", example: "Hold the pencil like this." },
  { en: "ny", phonetic: "", cn: "纽约\\[经]纽约", example: "This is my ny." },
  { en: "anything", phonetic: "/'eniθiŋ/", cn: "任何事", example: "I would not do it for anything." },
  { en: "printer", phonetic: "/'printә/", cn: "印刷工", example: "I like this printer." },
  { en: "condition", phonetic: "/kәn'diʃәn/", cn: "情况", example: "Environmental protection is a condition for sustainability.   What other planets might have the right conditions for life?   The union had a dispute over sick time and other conditions of employment." },
  { en: "effective", phonetic: "/i'fektiv/", cn: "有效的", example: "The pill is an effective method of birth control." },
  { en: "believe", phonetic: "/bi'li:v/", cn: "相信", example: "I believe there are faeries." },
  { en: "organization", phonetic: "/.ɒ:gәnai'zeiʃәn/", cn: "组织", example: "This painting shows little organization at first glance, but little by little the structure becomes clear." },
  { en: "effect", phonetic: "/i'fekt/", cn: "结果", example: "The effect of the hurricane was a devastated landscape." },
  { en: "asked", phonetic: "/ˈɑːskt/", cn: "卖方要价", example: "I asked her age." },
  { en: "eur", phonetic: "", cn: "欧洲", example: "I have an eur." },
  { en: "mind", phonetic: "/maind/", cn: "思想", example: "Despite advancing age, his mind was still as sharp as ever." },
  { en: "sunday", phonetic: "/'sʌndi/", cn: "星期日\\.星期日的", example: "Where is the sunday?" },
  { en: "selection", phonetic: "/si'lekʃәn/", cn: "选择", example: "The large number of good candidates made selection difficult." },
  { en: "casino", phonetic: "/kә'si:nәu/", cn: "卡西诺赌场", example: "Do you need a casino?" },
  { en: "pdf", phonetic: "", cn: "概率分部函数", example: "I have a pdf." },
  { en: "lost", phonetic: "/lɒst/", cn: "失去的", example: "He lost his hearing in the explosion." },
  { en: "tour", phonetic: "/tuә/", cn: "旅游", example: "On our last holiday to Spain we took a tour of the wine-growing regions." },
  { en: "menu", phonetic: "/'menju:/", cn: "菜单", example: "I like this menu." },
  { en: "volume", phonetic: "/'vɒljum/", cn: "册", example: "The room is 9x12x8, so its volume is 864 cubic feet." },
  { en: "cross", phonetic: "/krɒs/", cn: "十字架", example: "Put a cross for a wrong answer and a tick for a right one." },
  { en: "anyone", phonetic: "/'eniwʌn/", cn: "任何人", example: "This is my anyone." },
  { en: "mortgage", phonetic: "/'mɒ:gidʒ/", cn: "抵押", example: "Where is the mortgage?" },
  { en: "hope", phonetic: "/hәup/", cn: "希望", example: "I like this hope." },
  { en: "silver", phonetic: "/'silvә/", cn: "银", example: "Do you need a silver?" },
  { en: "corporation", phonetic: "/.kɒ:pә'reiʃәn/", cn: "公司", example: "I have a corporation." },
  { en: "wish", phonetic: "/wiʃ/", cn: "希望", example: "This is my wish." },
  { en: "inside", phonetic: "/'in'said/", cn: "内部", example: "Where is the inside?" },
  { en: "solution", phonetic: "/sә'lu:ʃәn/", cn: "解决", example: "I like this solution." },
  { en: "mature", phonetic: "/mә'tjuә/", cn: "成熟的", example: "Do you need a mature?" },
  { en: "role", phonetic: "/rәul/", cn: "角色", example: "I have a role." },
  { en: "rather", phonetic: "/'ræðә/", cn: "宁可", example: "This is my rather." },
  { en: "weeks", phonetic: "/wi:ks/", cn: "威克斯", example: "Where is the weeks?" },
  { en: "addition", phonetic: "/ә'diʃәn/", cn: "加法", example: "I like this addition." },
  { en: "came", phonetic: "/keim/", cn: "的过去式", example: "Do you need a came?" },
  { en: "supply", phonetic: "/sә'plai/", cn: "补给", example: "I have a supply." },
  { en: "nothing", phonetic: "/'nʌθiŋ/", cn: "无", example: "This is my nothing." },
  { en: "certain", phonetic: "/'sә:tәn/", cn: "确定的", example: "Where is the certain?" },
  { en: "usr", phonetic: "", cn: "不加热血清反应素玻片试验", example: "I like this usr." },
  { en: "executive", phonetic: "/ig'zekjutiv/", cn: "执行部门", example: "Do you need an executive?" },
  { en: "running", phonetic: "/'rʌniŋ/", cn: "赛跑", example: "I have a running." },
  { en: "lower", phonetic: "/'lәuә/", cn: "低的", example: "This is my lower." },
  { en: "necessary", phonetic: "/'nesisәri/", cn: "必要的", example: "Where is the necessary?" },
  { en: "union", phonetic: "/'ju:njәn/", cn: "联盟", example: "I like this union." },
  { en: "jewelry", phonetic: "/'dʒu:әlri/", cn: "珠宝", example: "Do you need a jewelry?" },
  { en: "according", phonetic: "/ә'kɒ:diŋ/", cn: "相符的", example: "I have an according." },
  { en: "dc", phonetic: "", cn: "直流电\\[计]数据单元", example: "This is my dc." },
  { en: "clothing", phonetic: "/'klәuðiŋ/", cn: "衣服", example: "Where is the clothing?" },
  { en: "mon", phonetic: "/mәun/", cn: "发动机辛烷值", example: "I like this mon." },
  { en: "com", phonetic: "", cn: "[计]计算机输出缩微胶片", example: "Do you need a com?" },
  { en: "particular", phonetic: "/pә'tikjulә/", cn: "一项", example: "I have a particular." },
  { en: "fine", phonetic: "/fain/", cn: "罚款", example: "This is my fine." },
  { en: "names", phonetic: "/neɪmz/", cn: "名字", example: "Where is the names?" },
  { en: "robert", phonetic: "/'rɔbәt/", cn: "[法]警察", example: "I like this robert." },
  { en: "homepage", phonetic: "/'hәumpeidʒ/", cn: "主页", example: "Do you need a homepage?" }
];

const DEFAULT_ORAL = [
  { en: "How are you today?", cn: "你今天好吗？" },
  { en: "Nice to meet you.", cn: "很高兴见到你。" },
  { en: "Long time no see.", cn: "好久不见。" },
  { en: "How have you been?", cn: "你最近怎么样？" },
  { en: "I'm fine, thank you.", cn: "我很好，谢谢。" },
  { en: "See you later.", cn: "回头见。" },
  { en: "Good morning!", cn: "早上好！" },
  { en: "Have a nice day!", cn: "祝你今天愉快！" },
  { en: "What do you do for a living?", cn: "你是做什么工作的？" },
  { en: "Where are you from?", cn: "你来自哪里？" },
  { en: "What's your hobby?", cn: "你的爱好是什么？" },
  { en: "How's the weather today?", cn: "今天天气怎么样？" },
  { en: "Did you have a good weekend?", cn: "周末过得愉快吗？" },
  { en: "I'd like to order a coffee, please.", cn: "我想点一杯咖啡。" },
  { en: "Could you bring me the menu?", cn: "能把菜单给我吗？" },
  { en: "The food is delicious.", cn: "这食物很好吃。" },
  { en: "Could we have the bill, please?", cn: "请给我们账单好吗？" },
  { en: "I'm full, thank you.", cn: "我吃饱了，谢谢。" },
  { en: "How much does this cost?", cn: "这个多少钱？" },
  { en: "Could you give me a discount?", cn: "能给我打个折吗？" },
  { en: "I'm just looking, thanks.", cn: "我只是随便看看，谢谢。" },
  { en: "Do you have this in a larger size?", cn: "这款有更大的尺码吗？" },
  { en: "Where is the nearest supermarket?", cn: "最近的超市在哪里？" },
  { en: "Where is the nearest subway station?", cn: "最近的地铁站在哪里？" },
  { en: "How can I get to the airport?", cn: "我怎么去机场？" },
  { en: "Is there a bus to the city center?", cn: "有去市中心的公交车吗？" },
  { en: "Could you call me a taxi?", cn: "能帮我叫辆出租车吗？" },
  { en: "I'm lost. Can you help me?", cn: "我迷路了，能帮我吗？" },
  { en: "Let's keep in touch.", cn: "我们保持联系吧。" },
  { en: "Could you give me a hand with this?", cn: "你能帮我一下吗？" },
  { en: "I'm really looking forward to it.", cn: "我对此非常期待。" },
  { en: "Could you send me the file?", cn: "你能把文件发给我吗？" },
  { en: "When is the deadline?", cn: "截止日期是什么时候？" },
  { en: "Let's schedule a meeting.", cn: "我们安排个会议吧。" },
  { en: "Sorry, I'm late.", cn: "抱歉，我迟到了。" },
  { en: "Could you speak more slowly, please?", cn: "你能说慢一点吗？" },
  { en: "I'm sorry, I didn't catch that.", cn: "抱歉，我没听清。" },
  { en: "Could you say that again?", cn: "你能再说一遍吗？" },
  { en: "Excuse me, could you help me?", cn: "打扰一下，能帮我吗？" },
  { en: "Thank you very much for your help.", cn: "非常感谢你的帮助。" },
  { en: "I'd like to book a table for two.", cn: "我想预订一张两人的桌子。" },
  { en: "Do you have a room available?", cn: "还有空房间吗？" },
  { en: "I need a doctor.", cn: "我需要看医生。" },
  { en: "Call the police, please.", cn: "请报警。" },
  { en: "Where is the restroom?", cn: "洗手间在哪里？" },
  { en: "I agree with you.", cn: "我同意你的看法。" },
  { en: "I'm not sure about that.", cn: "我不太确定。" },
  { en: "What do you think?", cn: "你怎么看？" },
  { en: "That sounds great!", cn: "听起来很棒！" },
  { en: "I don't think so.", cn: "我不这么认为。" },
  { en: "Could you recommend a good restaurant?", cn: "你能推荐一家好餐厅吗？" },
  { en: "I'd like to make a reservation.", cn: "我想预订一下。" },
  { en: "Can I pay by card?", cn: "我可以用卡支付吗？" },
  { en: "Do you speak English?", cn: "你会说英语吗？" },
  { en: "Let me check.", cn: "让我查一下。" },
  { en: "No problem.", cn: "没问题。" },
  { en: "Take care!", cn: "保重！" },
  { en: "Have a good trip!", cn: "旅途愉快！" },
  { en: "What time is it?", cn: "现在几点了？" },
  { en: "I'm tired. Let's take a break.", cn: "我累了，我们休息一下吧。" },
  { en: "I have a new.", cn: "我有新的。" },
  { en: "This is my home.", cn: "这是我的家。" },
  { en: "Where is the page?", cn: "页在哪里？" },
  { en: "I like this search.", cn: "我喜欢这个搜寻。" },
  { en: "Do you need a free?", cn: "你需要自由的吗？" },
  { en: "I have an one.", cn: "我有一。" },
  { en: "This is my information.", cn: "这是我的消息。" },
  { en: "Where is the time?", cn: "时间在哪里？" },
  { en: "I like this site.", cn: "我喜欢这个位置。" },
  { en: "Do you need a news?", cn: "你需要新闻吗？" },
  { en: "I have an use.", cn: "我有使用。" },
  { en: "This is my see.", cn: "这是我的看见。" },
  { en: "Where is the contact?", cn: "联系在哪里？" },
  { en: "I like this business.", cn: "我喜欢这个生意。" },
  { en: "Do you need a web?", cn: "你需要网吗？" },
  { en: "I have a help.", cn: "我有帮忙。" },
  { en: "This is my get.", cn: "这是我的得到。" },
  { en: "Where is the pm?", cn: "出纳员在哪里？" },
  { en: "I like this view.", cn: "我喜欢这个视野。" },
  { en: "Do you need an online?", cn: "你需要[计]联机吗？" },
  { en: "I have a c.", cn: "我有[计]调用。" },
  { en: "This is my e.", cn: "这是我的[计]元件。" },
  { en: "Where is the first?", cn: "首先在哪里？" },
  { en: "I like this am.", cn: "我喜欢这个的单数第一人称\\[计]存取管理程序。" },
  { en: "Do you need a been?", cn: "你需要的过去分词吗？" },
  { en: "I have a s.", cn: "我有[计]标量。" },
  { en: "This is my services.", cn: "这是我的服务。" },
  { en: "Where is the these?", cn: "这些在哪里？" },
  { en: "I like this click.", cn: "我喜欢这个咔哒声。" },
  { en: "Do you need an its?", cn: "你需要它的吗？" },
  { en: "I have a like.", cn: "我有相似的。" },
  { en: "This is my service.", cn: "这是我的服务。" },
  { en: "Where is the x?", cn: "未知数\\[计]交换在哪里？" },
  { en: "I like this find.", cn: "我喜欢这个发现。" },
  { en: "Do you need a price?", cn: "你需要价格吗？" },
  { en: "I have a date.", cn: "我有日期。" },
  { en: "This is my back.", cn: "这是我的后面的\\.使后退。" },
  { en: "Where is the top?", cn: "顶部在哪里？" },
  { en: "I like this people.", cn: "我喜欢这个人。" },
  { en: "Do you need a list?", cn: "你需要目录吗？" },
  { en: "I have a name.", cn: "我有名字。" },
  { en: "This is my state.", cn: "这是我的州。" },
  { en: "Where is the year?", cn: "年在哪里？" },
  { en: "I like this day.", cn: "我喜欢这个天。" },
  { en: "Do you need an email?", cn: "你需要电子信函吗？" },
  { en: "I have a two.", cn: "我有二。" },
  { en: "This is my health.", cn: "这是我的健康。" },
  { en: "Where is the n?", cn: "[计]负的在哪里？" },
  { en: "I like this world.", cn: "我喜欢这个世界。" },
  { en: "Do you need a re?", cn: "你需要关于\\.不动产吗？" },
  { en: "I have a next.", cn: "我有下一个\\.下一个的。" },
  { en: "This is my used.", cn: "这是我的使用过的。" },
  { en: "Where is the go?", cn: "去在哪里？" },
  { en: "I like this b.", cn: "我喜欢这个[计]基地址。" },
  { en: "Do you need a work?", cn: "你需要工作吗？" },
  { en: "I have a last.", cn: "我有最后的。" },
  { en: "This is my products.", cn: "这是我的产品。" },
  { en: "Where is the music?", cn: "音乐在哪里？" },
  { en: "I like this buy.", cn: "我喜欢这个买。" },
  { en: "Do you need a data?", cn: "你需要资料吗？" },
  { en: "I have a make.", cn: "我有制造。" },
  { en: "This is my product.", cn: "这是我的产品。" },
  { en: "Where is the system?", cn: "系统在哪里？" },
  { en: "I like this post.", cn: "我喜欢这个柱。" },
  { en: "Do you need a city?", cn: "你需要城市吗？" },
  { en: "I have a t.", cn: "我有[计]表。" },
  { en: "This is my add.", cn: "这是我的增加。" },
  { en: "Where is the policy?", cn: "政策在哪里？" },
  { en: "I like this number.", cn: "我喜欢这个数。" },
  { en: "Do you need a please?", cn: "你需要请\\.使高兴吗？" },
  { en: "I have an available.", cn: "我有可利用的。" },
  { en: "This is my copyright.", cn: "这是我的版权。" },
  { en: "Where is the support?", cn: "支持在哪里？" },
  { en: "I like this message.", cn: "我喜欢这个消息。" },
  { en: "Do you need a best?", cn: "你需要最好的\\.最好地\\.最好的人吗？" },
  { en: "I have a software.", cn: "我有软件\\[计]软设备。" },
  { en: "This is my jan.", cn: "这是我的一月。" },
  { en: "Where is the good?", cn: "善行在哪里？" },
  { en: "I like this video.", cn: "我喜欢这个影像。" },
  { en: "Do you need a well?", cn: "你需要井吗？" },
  { en: "I have a d.", cn: "我有[计]数据。" },
  { en: "This is my info.", cn: "这是我的信息\\[计]信息。" },
  { en: "Where is the rights?", cn: "正当权利\\[计]权限在哪里？" },
  { en: "I like this public.", cn: "我喜欢这个公众。" },
  { en: "Do you need a books?", cn: "你需要书评吗？" },
  { en: "I have a high.", cn: "我有高度。" },
  { en: "This is my school.", cn: "这是我的学校。" },
  { en: "Where is the m?", cn: "[计]尾数在哪里？" },
  { en: "I like this links.", cn: "我喜欢这个高尔夫球场。" },
  { en: "Do you need a review?", cn: "你需要检讨吗？" },
  { en: "I have a years.", cn: "我有年代。" },
  { en: "This is my order.", cn: "这是我的次序。" },
  { en: "Where is the privacy?", cn: "隐私在哪里？" },
  { en: "I like this book.", cn: "我喜欢这个书。" },
  { en: "Do you need an items?", cn: "你需要项目吗？" },
  { en: "I have a company.", cn: "我有公司。" },
  { en: "This is my r.", cn: "这是我的[计]半径。" },
  { en: "Where is the read?", cn: "读在哪里？" },
  { en: "I like this group.", cn: "我喜欢这个团体。" },
  { en: "Do you need a need?", cn: "你需要需要吗？" },
  { en: "I have a many.", cn: "我有多数。" },
  { en: "This is my user.", cn: "这是我的使用者\\[计]用户。" },
  { en: "Where is the said?", cn: "上述的\\的过去式和过去分词在哪里？" },
  { en: "I like this de.", cn: "我喜欢这个[化]非对映体过量\\[医]铥。" },
  { en: "Do you need a set?", cn: "你需要日落吗？" },
  { en: "I have a general.", cn: "我有一般。" },
  { en: "This is my research.", cn: "这是我的研究。" },
  { en: "Where is the university?", cn: "大学在哪里？" },
  { en: "I like this january.", cn: "我喜欢这个一月。" },
  { en: "Do you need a mail?", cn: "你需要邮件吗？" },
  { en: "I have a full.", cn: "我有全部。" },
  { en: "This is my map.", cn: "这是我的地图。" },
  { en: "Where is the reviews?", cn: "评论在哪里？" },
  { en: "I like this program.", cn: "我喜欢这个节目。" },
  { en: "Do you need a life?", cn: "你需要生活吗？" },
  { en: "I have a know.", cn: "我有知道。" },
  { en: "This is my way.", cn: "这是我的路。" },
  { en: "Where is the days?", cn: "一生在哪里？" },
  { en: "I like this management.", cn: "我喜欢这个经营。" },
  { en: "Do you need a p?", cn: "你需要便士\\[计]页吗？" },
  { en: "I have a part.", cn: "我有部分。" },
  { en: "This is my great.", cn: "这是我的大的。" },
  { en: "Where is the united?", cn: "联合的在哪里？" },
  { en: "I like this hotel.", cn: "我喜欢这个旅馆。" },
  { en: "Do you need a real?", cn: "你需要真的吗？" },
  { en: "I have a f.", cn: "我有[计]故障。" },
  { en: "This is my item.", cn: "这是我的项目。" },
  { en: "Where is the international?", cn: "国际的\\.国别设定\\[计]国别设定在哪里？" },
  { en: "I like this center.", cn: "我喜欢这个中心。" },
  { en: "Do you need an ebay?", cn: "你需要电子港湾吗？" },
  { en: "I have a store.", cn: "我有商店。" },
  { en: "This is my travel.", cn: "这是我的旅行。" },
  { en: "Where is the comments?", cn: "注解在哪里？" },
  { en: "I like this made.", cn: "我喜欢这个人工制成的。" },
  { en: "Do you need a development?", cn: "你需要发展\\[化]展开吗？" },
  { en: "I have a report.", cn: "我有报告。" },
  { en: "This is my member.", cn: "这是我的成员。" },
  { en: "Where is the details?", cn: "详细资料在哪里？" },
  { en: "I like this line.", cn: "我喜欢这个列。" },
  { en: "Do you need a terms?", cn: "你需要条件吗？" },
  { en: "I have a hotels.", cn: "我有酒店。" },
  { en: "This is my send.", cn: "这是我的发送。" },
  { en: "Where is the right?", cn: "权利在哪里？" },
  { en: "I like this type.", cn: "我喜欢这个类型。" },
  { en: "Do you need a because?", cn: "你需要因为吗？" },
  { en: "I have a local.", cn: "我有地方性的。" },
  { en: "This is my those.", cn: "这是我的那些。" },
  { en: "Where is the using?", cn: "[计]使用在哪里？" },
  { en: "I like this results.", cn: "我喜欢这个结果。" },
  { en: "Do you need an office?", cn: "你需要办公室吗？" },
  { en: "I have an education.", cn: "我有教育。" },
  { en: "This is my national.", cn: "这是我的国家的。" },
  { en: "Where is the car?", cn: "汽车在哪里？" },
  { en: "I like this design.", cn: "我喜欢这个设计。" },
  { en: "Do you need a take?", cn: "你需要拿吗？" },
  { en: "I have a posted.", cn: "我有贴出。" },
  { en: "This is my internet.", cn: "这是我的[计]因特网。" },
  { en: "Where is the address?", cn: "住址在哪里？" },
  { en: "I like this community.", cn: "我喜欢这个社区。" },
  { en: "Do you need a states?", cn: "你需要美国吗？" },
  { en: "I have an area.", cn: "我有区域。" },
  { en: "This is my want.", cn: "这是我的需要的东西。" },
  { en: "Where is the phone?", cn: "电话在哪里？" },
  { en: "I like this dvd.", cn: "我喜欢这个数字化视频光盘。" },
  { en: "Do you need a shipping?", cn: "你需要装运吗？" },
  { en: "I have a reserved.", cn: "我有保留的。" },
  { en: "This is my subject.", cn: "这是我的科目。" },
  { en: "Where is the forum?", cn: "论坛在哪里？" },
  { en: "I like this family.", cn: "我喜欢这个家庭。" },
  { en: "Do you need a l?", cn: "你需要见习驾驶员\\[计]电感吗？" },
  { en: "I have a long.", cn: "我有长的。" },
  { en: "This is my based.", cn: "这是我的立基于。" },
  { en: "Where is the w?", cn: "[计]等待在哪里？" },
  { en: "I like this code.", cn: "我喜欢这个代码。" },
  { en: "Do you need a show?", cn: "你需要显示吗？" },
  { en: "I have an o.", cn: "我有啊。" },
  { en: "This is my even.", cn: "这是我的平坦的。" },
  { en: "Where is the black?", cn: "黑色在哪里？" },
  { en: "I like this check.", cn: "我喜欢这个检查。" },
  { en: "Do you need a special?", cn: "你需要专辑吗？" },
  { en: "I have a prices.", cn: "我有价格。" },
  { en: "This is my website.", cn: "这是我的网站。" },
  { en: "Where is the index?", cn: "索引在哪里？" },
  { en: "I like this being.", cn: "我喜欢这个存在。" },
  { en: "Do you need a women?", cn: "你需要女人吗？" },
  { en: "I have a much.", cn: "我有大量。" },
  { en: "This is my sign.", cn: "这是我的符号。" },
  { en: "Where is the file?", cn: "档案在哪里？" },
  { en: "I like this link.", cn: "我喜欢这个环。" },
  { en: "Do you need an open?", cn: "你需要公开吗？" },
  { en: "I have a today.", cn: "我有今天。" },
  { en: "This is my technology.", cn: "这是我的技术。" },
  { en: "Where is the south?", cn: "南方在哪里？" },
  { en: "I like this case.", cn: "我喜欢这个情形。" },
  { en: "Do you need a project?", cn: "你需要计划吗？" },
  { en: "I have a pages.", cn: "我有页数。" },
  { en: "This is my uk.", cn: "这是我的联合王国。" },
  { en: "Where is the version?", cn: "一种描述在哪里？" },
  { en: "I like this section.", cn: "我喜欢这个区段。" },
  { en: "Do you need a found?", cn: "你需要建立吗？" },
  { en: "I have a house.", cn: "我有房子。" },
  { en: "This is my related.", cn: "这是我的讲述的。" },
  { en: "Where is the security?", cn: "安全在哪里？" },
  { en: "I like this g.", cn: "我喜欢这个[计]千兆。" },
  { en: "Do you need a county?", cn: "你需要县吗？" },
  { en: "I have an american.", cn: "我有美国人\\.美国的。" },
  { en: "This is my photo.", cn: "这是我的相片。" },
  { en: "Where is the game?", cn: "比赛在哪里？" },
  { en: "I like this members.", cn: "我喜欢这个成员。" },
  { en: "Do you need a power?", cn: "你需要力吗？" },
  { en: "I have a while.", cn: "我有一会儿。" },
  { en: "This is my care.", cn: "这是我的小心。" },
  { en: "Where is the network?", cn: "网络在哪里？" },
  { en: "I like this computer.", cn: "我喜欢这个电脑。" },
  { en: "Do you need a systems?", cn: "你需要体制吗？" },
  { en: "I have a three.", cn: "我有三。" },
  { en: "This is my total.", cn: "这是我的全体的。" },
  { en: "Where is the place?", cn: "地方在哪里？" },
  { en: "I like this end.", cn: "我喜欢这个结束。" },
  { en: "Do you need a following?", cn: "你需要下列各项吗？" },
  { en: "I have a download.", cn: "我有[计]卸载。" },
  { en: "This is my h.", cn: "这是我的[计]硬件。" },
  { en: "Where is the him?", cn: "他在哪里？" },
  { en: "I like this access.", cn: "我喜欢这个通路。" },
  { en: "Do you need a think?", cn: "你需要想吗？" },
  { en: "I have a north.", cn: "我有北方。" },
  { en: "This is my resources.", cn: "这是我的资源。" },
  { en: "Where is the current?", cn: "涌流在哪里？" },
  { en: "I like this posts.", cn: "我喜欢这个标杆。" },
  { en: "Do you need a big?", cn: "你需要大的吗？" },
  { en: "I have a media.", cn: "我有媒体\\[计]媒质。" },
  { en: "This is my law.", cn: "这是我的法律。" },
  { en: "Where is the control?", cn: "控制在哪里？" },
  { en: "I like this water.", cn: "我喜欢这个水。" },
  { en: "Do you need a history?", cn: "你需要历史吗？" },
  { en: "I have a pictures.", cn: "我有电影院。" },
  { en: "This is my size.", cn: "这是我的大小。" },
  { en: "Where is the art?", cn: "艺术在哪里？" },
  { en: "I like this personal.", cn: "我喜欢这个私人的。" },
  { en: "Do you need a since?", cn: "你需要自...以后吗？" },
  { en: "I have an including.", cn: "我有包含。" },
  { en: "This is my guide.", cn: "这是我的引导者。" },
  { en: "Where is the shop?", cn: "商店在哪里？" },
  { en: "I like this directory.", cn: "我喜欢这个目录。" },
  { en: "Do you need a board?", cn: "你需要木板吗？" },
  { en: "I have a location.", cn: "我有位置。" },
  { en: "This is my change.", cn: "这是我的变化。" },
  { en: "Where is the white?", cn: "白色在哪里？" },
  { en: "I like this text.", cn: "我喜欢这个文本。" },
  { en: "Do you need a small?", cn: "你需要小的吗？" },
  { en: "I have a rating.", cn: "我有等级。" },
  { en: "This is my rate.", cn: "这是我的比率。" },
  { en: "Where is the government?", cn: "政府在哪里？" },
  { en: "I like this children.", cn: "我喜欢这个孩子。" },
  { en: "Do you need an usa?", cn: "你需要美国吗？" },
  { en: "I have a return.", cn: "我有回来。" },
  { en: "This is my v.", cn: "这是我的[计]溢出。" },
  { en: "Where is the shopping?", cn: "买东西在哪里？" },
  { en: "I like this account.", cn: "我喜欢这个报告。" },
  { en: "Do you need a times?", cn: "你需要时代吗？" },
  { en: "I have a sites.", cn: "我有遗址。" },
  { en: "This is my level.", cn: "这是我的水平。" },
  { en: "Where is the digital?", cn: "数字显示的在哪里？" },
  { en: "I like this profile.", cn: "我喜欢这个侧面。" },
  { en: "Do you need a previous?", cn: "你需要早先的吗？" },
  { en: "I have a form.", cn: "我有形状。" },
  { en: "This is my events.", cn: "这是我的事件。" },
  { en: "Where is the love?", cn: "爱在哪里？" },
  { en: "I like this old.", cn: "我喜欢这个以前。" },
  { en: "Do you need a john?", cn: "你需要盥洗室吗？" },
  { en: "I have a main.", cn: "我有主要部分。" },
  { en: "This is my call.", cn: "这是我的呼叫。" },
  { en: "Where is the hours?", cn: "小时在哪里？" },
  { en: "I like this image.", cn: "我喜欢这个影像。" },
  { en: "Do you need a department?", cn: "你需要部门吗？" },
  { en: "I have a title.", cn: "我有头衔。" },
  { en: "This is my description.", cn: "这是我的描述。" },
  { en: "Where is the non?", cn: "非在哪里？" },
  { en: "I like this k.", cn: "我喜欢这个[计]键。" },
  { en: "Do you need a y?", cn: "你需要[计]原型\\[医]钇吗？" },
  { en: "I have an insurance.", cn: "我有保险。" },
  { en: "This is my another.", cn: "这是我的另外的。" },
  { en: "Where is the shall?", cn: "将在哪里？" },
  { en: "I like this property.", cn: "我喜欢这个财产。" },
  { en: "Do you need a class?", cn: "你需要班级吗？" },
  { en: "I have a cd.", cn: "我有镭射碟。" },
  { en: "This is my still.", cn: "这是我的蒸馏室。" },
  { en: "Where is the money?", cn: "金钱在哪里？" },
  { en: "I like this quality.", cn: "我喜欢这个品质。" },
  { en: "Do you need an every?", cn: "你需要每一吗？" },
  { en: "I have a listing.", cn: "我有[计]列表。" },
  { en: "This is my content.", cn: "这是我的内容。" },
  { en: "Where is the country?", cn: "国家在哪里？" },
  { en: "I like this private.", cn: "我喜欢这个私人的。" },
  { en: "Do you need a little?", cn: "你需要一点点吗？" },
  { en: "I have a visit.", cn: "我有拜访。" },
  { en: "This is my save.", cn: "这是我的救球\\.解救。" },
  { en: "Where is the tools?", cn: "工具在哪里？" },
  { en: "I like this low.", cn: "我喜欢这个低点。" },
  { en: "Do you need a reply?", cn: "你需要答复吗？" },
  { en: "I have a customer.", cn: "我有消费者\\[化]顾客。" },
  { en: "This is my december.", cn: "这是我的十二月。" },
  { en: "Where is the compare?", cn: "比较在哪里？" },
  { en: "I like this movies.", cn: "我喜欢这个电影。" },
  { en: "Do you need an include?", cn: "你需要包括吗？" },
  { en: "I have a college.", cn: "我有学院。" },
  { en: "This is my value.", cn: "这是我的价值。" },
  { en: "Where is the article?", cn: "文章在哪里？" },
  { en: "I like this york.", cn: "我喜欢这个约克郡。" },
  { en: "Do you need a man?", cn: "你需要男人吗？" },
  { en: "I have a card.", cn: "我有卡片。" },
  { en: "This is my jobs.", cn: "这是我的工作。" },
  { en: "Where is the provide?", cn: "提供在哪里？" },
  { en: "I like this j.", cn: "我喜欢这个字母。" },
  { en: "Do you need a food?", cn: "你需要食物吗？" },
  { en: "I have a source.", cn: "我有来源。" },
  { en: "This is my author.", cn: "这是我的作家。" },
  { en: "Where is the different?", cn: "不同的\\[机]差动在哪里？" },
  { en: "I like this press.", cn: "我喜欢这个压。" },
  { en: "Do you need an u?", cn: "你需要适于各种年龄观众的\\.适合各种年龄的人观看的影片\\[计]装置吗？" },
  { en: "I have a learn.", cn: "我有学习。" },
  { en: "This is my sale.", cn: "这是我的出售。" },
  { en: "Where is the around?", cn: "包围在哪里？" },
  { en: "I like this print.", cn: "我喜欢这个打印。" },
  { en: "Do you need a course?", cn: "你需要课程吗？" },
  { en: "I have a job.", cn: "我有工作。" },
  { en: "This is my canada.", cn: "这是我的加拿大。" },
  { en: "Where is the process?", cn: "程序在哪里？" },
  { en: "I like this teen.", cn: "我喜欢这个愤怒。" },
  { en: "Do you need a room?", cn: "你需要房间吗？" },
  { en: "I have a stock.", cn: "我有树干。" },
  { en: "This is my training.", cn: "这是我的训练。" },
  { en: "Where is the credit?", cn: "信用在哪里？" },
  { en: "I like this point.", cn: "我喜欢这个点。" },
  { en: "Do you need a join?", cn: "你需要参加吗？" },
  { en: "I have a science.", cn: "我有科学。" },
  { en: "This is my men.", cn: "这是我的的复数。" },
  { en: "Where is the categories?", cn: "分类在哪里？" },
  { en: "I like this advanced.", cn: "我喜欢这个在前的。" },
  { en: "Do you need a west?", cn: "你需要西方吗？" },
  { en: "I have a sales.", cn: "我有销售的\\[计]销售。" },
  { en: "This is my look.", cn: "这是我的一看。" },
  { en: "Where is the english?", cn: "英语\\.英文的在哪里？" },
  { en: "I like this left.", cn: "我喜欢这个左边的。" },
  { en: "Do you need a team?", cn: "你需要队吗？" },
  { en: "I have an estate.", cn: "我有不动产。" },
  { en: "This is my box.", cn: "这是我的盒子。" },
  { en: "Where is the conditions?", cn: "形势在哪里？" },
  { en: "I like this select.", cn: "我喜欢这个挑选出来的。" },
  { en: "Do you need a windows?", cn: "你需要微软公司生产的“视窗”操作系统吗？" },
  { en: "I have a photos.", cn: "我有照片。" },
  { en: "This is my gay.", cn: "这是我的欢快的。" },
  { en: "Where is the thread?", cn: "线在哪里？" },
  { en: "I like this week.", cn: "我喜欢这个星期。" },
  { en: "Do you need a category?", cn: "你需要种类吗？" },
  { en: "I have a note.", cn: "我有笔记。" },
  { en: "This is my live.", cn: "这是我的活的。" },
  { en: "Where is the large?", cn: "大的在哪里？" },
  { en: "I like this gallery.", cn: "我喜欢这个走廊。" },
  { en: "Do you need a table?", cn: "你需要桌子吗？" },
  { en: "I have a register.", cn: "我有寄存器。" },
  { en: "This is my however.", cn: "这是我的然而。" },
  { en: "Where is the june?", cn: "六月在哪里？" },
  { en: "I like this october.", cn: "我喜欢这个十月。" },
  { en: "Do you need a november?", cn: "你需要十一月吗？" },
  { en: "I have a market.", cn: "我有市场。" },
  { en: "This is my library.", cn: "这是我的图书馆。" },
  { en: "Where is the really?", cn: "实际上在哪里？" },
  { en: "I like this action.", cn: "我喜欢这个行动。" },
  { en: "Do you need a start?", cn: "你需要惊起吗？" },
  { en: "I have a series.", cn: "我有串联。" },
  { en: "This is my model.", cn: "这是我的模型。" },
  { en: "Where is the features?", cn: "容貌在哪里？" },
  { en: "I like this air.", cn: "我喜欢这个空气。" },
  { en: "Do you need an industry?", cn: "你需要勤劳吗？" },
  { en: "I have a plan.", cn: "我有计划。" },
  { en: "This is my human.", cn: "这是我的人。" },
  { en: "Where is the provided?", cn: "倘若在哪里？" },
  { en: "I like this tv.", cn: "我喜欢这个电视\\[计]电视。" },
  { en: "Do you need a yes?", cn: "你需要是\\.是吗？" },
  { en: "I have a required.", cn: "我有必需的。" },
  { en: "This is my second.", cn: "这是我的秒。" },
  { en: "Where is the hot?", cn: "热的在哪里？" },
  { en: "I like this accessories.", cn: "我喜欢这个辅助程序。" },
  { en: "Do you need a cost?", cn: "你需要代价吗？" },
  { en: "I have a movie.", cn: "我有电影。" },
  { en: "This is my forums.", cn: "这是我的论坛。" },
  { en: "Where is the march?", cn: "三月在哪里？" },
  { en: "I like this la.", cn: "我喜欢这个[医]镧。" },
  { en: "Do you need a september?", cn: "你需要九月吗？" },
  { en: "I have a better.", cn: "我有较好的\\.比较好。" },
  { en: "This is my say.", cn: "这是我的说。" },
  { en: "Where is the questions?", cn: "问题在哪里？" },
  { en: "I like this july.", cn: "我喜欢这个七月。" },
  { en: "Do you need a yahoo?", cn: "你需要人面兽心的人吗？" },
  { en: "I have a going.", cn: "我有去。" },
  { en: "This is my medical.", cn: "这是我的医生。" },
  { en: "Where is the test?", cn: "测试在哪里？" },
  { en: "I like this friend.", cn: "我喜欢这个朋友。" },
  { en: "Do you need a come?", cn: "你需要过来吗？" },
  { en: "I have a dec.", cn: "我有美国数字电子公司\\[计]数字设备公司。" },
  { en: "This is my server.", cn: "这是我的服伺者。" },
  { en: "Where is the pc?", cn: "个人计算机\\[计]外部控制在哪里？" },
  { en: "I like this study.", cn: "我喜欢这个学习。" },
  { en: "Do you need an application?", cn: "你需要应用吗？" },
  { en: "I have a cart.", cn: "我有二轮运货马车\\.驾运货马车\\.用车装载。" },
  { en: "This is my staff.", cn: "这是我的全体人员。" },
  { en: "Where is the articles?", cn: "文章在哪里？" },
  { en: "I like this san.", cn: "我喜欢这个存储区域网。" },
  { en: "Do you need a feedback?", cn: "你需要反馈吗？" },
  { en: "I have an again.", cn: "我有再一次。" },
  { en: "This is my play.", cn: "这是我的游戏。" },
  { en: "Where is the looking?", cn: "有…相貌的在哪里？" },
  { en: "I like this issues.", cn: "我喜欢这个议题。" },
  { en: "Do you need an april?", cn: "你需要四月吗？" },
  { en: "I have a never.", cn: "我有从不。" },
  { en: "This is my users.", cn: "这是我的使用者。" },
  { en: "Where is the complete?", cn: "完全的在哪里？" },
  { en: "I like this street.", cn: "我喜欢这个街道。" },
  { en: "Do you need a topic?", cn: "你需要主题吗？" },
  { en: "I have a comment.", cn: "我有注解。" },
  { en: "This is my financial.", cn: "这是我的财政的。" },
  { en: "Where is the things?", cn: "所有物在哪里？" },
  { en: "I like this working.", cn: "我喜欢这个工作。" },
  { en: "Do you need a standard?", cn: "你需要标准吗？" },
  { en: "I have a tax.", cn: "我有税。" },
  { en: "This is my person.", cn: "这是我的人。" },
  { en: "Where is the below?", cn: "在下面\\.在下面在哪里？" },
  { en: "I like this mobile.", cn: "我喜欢这个移动的。" },
  { en: "Do you need a less?", cn: "你需要较少吗？" },
  { en: "I have a got.", cn: "我有的过去式和过去分词\\[化]谷草转氨酶。" },
  { en: "This is my blog.", cn: "这是我的博客。" },
  { en: "Where is the party?", cn: "宴会在哪里？" },
  { en: "I like this payment.", cn: "我喜欢这个付款。" },
  { en: "Do you need an equipment?", cn: "你需要装备吗？" },
  { en: "I have a login.", cn: "我有[计]注册。" },
  { en: "This is my student.", cn: "这是我的学生。" },
  { en: "Where is the let?", cn: "让在哪里？" },
  { en: "I like this programs.", cn: "我喜欢这个程序。" },
  { en: "Do you need an offers?", cn: "你需要提议吗？" },
  { en: "I have a legal.", cn: "我有法律的。" },
  { en: "This is my above.", cn: "这是我的在上方。" },
  { en: "Where is the recent?", cn: "最近的在哪里？" },
  { en: "I like this park.", cn: "我喜欢这个公园。" },
  { en: "Do you need a side?", cn: "你需要旁边吗？" },
  { en: "I have an act.", cn: "我有行动。" },
  { en: "This is my problem.", cn: "这是我的问题。" },
  { en: "Where is the red?", cn: "红的在哪里？" },
  { en: "I like this give.", cn: "我喜欢这个弹性。" },
  { en: "Do you need a memory?", cn: "你需要记忆吗？" },
  { en: "I have a performance.", cn: "我有施行。" },
  { en: "This is my social.", cn: "这是我的社会的。" },
  { en: "Where is the q?", cn: "[计]质量在哪里？" },
  { en: "I like this august.", cn: "我喜欢这个八月\\.威严的。" },
  { en: "Do you need a quote?", cn: "你需要引用\\.引述吗？" },
  { en: "I have a language.", cn: "我有语言。" },
  { en: "This is my story.", cn: "这是我的故事。" },
  { en: "Where is the sell?", cn: "卖在哪里？" },
  { en: "I like this options.", cn: "我喜欢这个选择。" },
  { en: "Do you need an experience?", cn: "你需要经历吗？" },
  { en: "I have a rates.", cn: "我有比率。" },
  { en: "This is my create.", cn: "这是我的创造。" },
  { en: "Where is the key?", cn: "钥匙在哪里？" },
  { en: "I like this body.", cn: "我喜欢这个身体。" },
  { en: "Do you need a young?", cn: "你需要年轻的吗？" },
  { en: "I have an america.", cn: "我有美洲。" },
  { en: "This is my important.", cn: "这是我的重要的。" },
  { en: "Where is the field?", cn: "领域在哪里？" },
  { en: "I like this east.", cn: "我喜欢这个东方。" },
  { en: "Do you need a paper?", cn: "你需要纸吗？" },
  { en: "I have a single.", cn: "我有单身的。" },
  { en: "This is my ii.", cn: "这是我的微光。" },
  { en: "Where is the age?", cn: "年龄在哪里？" },
  { en: "I like this club.", cn: "我喜欢这个俱乐部。" },
  { en: "Do you need an example?", cn: "你需要例子吗？" },
  { en: "I have a girls.", cn: "我有女孩。" },
  { en: "This is my additional.", cn: "这是我的附加的。" },
  { en: "Where is the password?", cn: "密码在哪里？" },
  { en: "I like this z.", cn: "我喜欢这个[计]阻抗。" },
  { en: "Do you need a latest?", cn: "你需要最近的吗？" },
  { en: "I have a something.", cn: "我有某事。" },
  { en: "This is my road.", cn: "这是我的路。" },
  { en: "Where is the gift?", cn: "礼物在哪里？" },
  { en: "I like this question.", cn: "我喜欢这个问题。" },
  { en: "Do you need a changes?", cn: "你需要变化吗？" },
  { en: "I have a night.", cn: "我有夜。" },
  { en: "This is my ca.", cn: "这是我的[医]钙。" },
  { en: "Where is the hard?", cn: "坚硬的在哪里？" },
  { en: "I like this texas.", cn: "我喜欢这个德克萨斯。" },
  { en: "Do you need an oct?", cn: "你需要十月吗？" },
  { en: "I have a pay.", cn: "我有薪资。" },
  { en: "This is my four.", cn: "这是我的四。" },
  { en: "Where is the poker?", cn: "戳的人在哪里？" },
  { en: "I like this status.", cn: "我喜欢这个状态。" },
  { en: "Do you need a browse?", cn: "你需要浏览吗？" },
  { en: "I have an issue.", cn: "我有发行。" },
  { en: "This is my range.", cn: "这是我的排。" },
  { en: "Where is the building?", cn: "建筑物在哪里？" },
  { en: "I like this seller.", cn: "我喜欢这个销售者\\[化]卖方。" },
  { en: "Do you need a court?", cn: "你需要法院吗？" },
  { en: "I have a february.", cn: "我有二月。" },
  { en: "This is my always.", cn: "这是我的总是。" },
  { en: "Where is the result?", cn: "结果在哪里？" },
  { en: "I like this audio.", cn: "我喜欢这个音频的。" },
  { en: "Do you need a light?", cn: "你需要光吗？" },
  { en: "I have a write.", cn: "我有书写。" },
  { en: "This is my war.", cn: "这是我的战争。" },
  { en: "Where is the nov?", cn: "十一月在哪里？" },
  { en: "I like this offer.", cn: "我喜欢这个给予。" },
  { en: "Do you need a blue?", cn: "你需要蓝色\\.蓝色的吗？" },
  { en: "I have a groups.", cn: "我有群组。" },
  { en: "This is my al.", cn: "这是我的[计]算法语言。" },
  { en: "Where is the easy?", cn: "容易的在哪里？" },
  { en: "I like this given.", cn: "我喜欢这个赠予的。" },
  { en: "Do you need a files?", cn: "你需要文件吗？" },
  { en: "I have an event.", cn: "我有事件。" },
  { en: "This is my release.", cn: "这是我的释放。" },
  { en: "Where is the analysis?", cn: "分析\\[计]分析机在哪里？" },
  { en: "I like this request.", cn: "我喜欢这个请求。" },
  { en: "Do you need a fax?", cn: "你需要传真\\.发传真\\[计]传真系统吗？" },
  { en: "I have a china.", cn: "我有中国。" },
  { en: "This is my making.", cn: "这是我的制造。" },
  { en: "Where is the picture?", cn: "图画在哪里？" },
  { en: "I like this possible.", cn: "我喜欢这个可能的。" },
  { en: "Do you need a professional?", cn: "你需要专业人才\\.专业的吗？" },
  { en: "I have a yet.", cn: "我有还。" },
  { en: "This is my month.", cn: "这是我的月\\[经]月。" },
  { en: "Where is the major?", cn: "主修课在哪里？" },
  { en: "I like this star.", cn: "我喜欢这个星。" },
  { en: "Do you need an areas?", cn: "你需要区域吗？" },
  { en: "I have a future.", cn: "我有未来。" },
  { en: "This is my space.", cn: "这是我的位置。" },
  { en: "Where is the committee?", cn: "委员会\\[经]委员会在哪里？" },
  { en: "I like this hand.", cn: "我喜欢这个手。" },
  { en: "Do you need a sun?", cn: "你需要太阳吗？" },
  { en: "I have a problems.", cn: "我有问题。" },
  { en: "This is my london.", cn: "这是我的伦敦。" },
  { en: "Where is the washington?", cn: "华盛顿在哪里？" },
  { en: "I like this meeting.", cn: "我喜欢这个会议。" },
  { en: "Do you need a rss?", cn: "你需要和的平方根吗？" },
  { en: "I have a become.", cn: "我有变成。" },
  { en: "This is my interest.", cn: "这是我的兴趣。" },
  { en: "Where is the id?", cn: "遗传素质在哪里？" },
  { en: "I like this child.", cn: "我喜欢这个孩子。" },
  { en: "Do you need a keep?", cn: "你需要生计吗？" },
  { en: "I have an enter.", cn: "我有进入。" },
  { en: "This is my california.", cn: "这是我的加利福尼亚。" },
  { en: "Where is the share?", cn: "部分在哪里？" },
  { en: "I like this similar.", cn: "我喜欢这个相似的。" },
  { en: "Do you need a garden?", cn: "你需要花园吗？" },
  { en: "I have a schools.", cn: "我有学校。" },
  { en: "This is my million.", cn: "这是我的百万。" },
  { en: "Where is the added?", cn: "额外的在哪里？" },
  { en: "I like this reference.", cn: "我喜欢这个参考。" },
  { en: "Do you need a companies?", cn: "你需要公司吗？" },
  { en: "I have a listed.", cn: "我有列出的\\[经]上市的。" },
  { en: "This is my baby.", cn: "这是我的婴孩\\[医]婴儿。" },
  { en: "Where is the learning?", cn: "学问在哪里？" },
  { en: "I like this energy.", cn: "我喜欢这个精力。" },
  { en: "Do you need a run?", cn: "你需要跑吗？" },
  { en: "I have a delivery.", cn: "我有递送。" },
  { en: "This is my net.", cn: "这是我的网。" },
  { en: "Where is the popular?", cn: "通俗的在哪里？" },
  { en: "I like this term.", cn: "我喜欢这个术语。" },
  { en: "Do you need a film?", cn: "你需要软片吗？" },
  { en: "I have a stories.", cn: "我有故事。" },
  { en: "This is my put.", cn: "这是我的放。" },
  { en: "Where is the computers?", cn: "计算机在哪里？" },
  { en: "I like this journal.", cn: "我喜欢这个日记。" },
  { en: "Do you need a reports?", cn: "你需要报表吗？" },
  { en: "I have a co.", cn: "我有[医]钴。" },
  { en: "This is my try.", cn: "这是我的尝试。" },
  { en: "Where is the welcome?", cn: "欢迎在哪里？" },
  { en: "I like this central.", cn: "我喜欢这个中央的。" },
  { en: "Do you need an images?", cn: "你需要图片吗？" },
  { en: "I have a president.", cn: "我有总统。" },
  { en: "This is my notice.", cn: "这是我的注意。" },
  { en: "Where is the original?", cn: "最初的在哪里？" },
  { en: "I like this head.", cn: "我喜欢这个头。" },
  { en: "Do you need a radio?", cn: "你需要无线电吗？" },
  { en: "I have an until.", cn: "我有直到。" },
  { en: "This is my cell.", cn: "这是我的单元。" },
  { en: "Where is the color?", cn: "颜色在哪里？" },
  { en: "I like this self.", cn: "我喜欢这个自己。" },
  { en: "Do you need a council?", cn: "你需要会议吗？" },
  { en: "I have an away.", cn: "我有离去。" },
  { en: "This is my includes.", cn: "这是我的包含。" },
  { en: "Where is the track?", cn: "轨迹在哪里？" },
  { en: "I like this australia.", cn: "我喜欢这个澳洲。" },
  { en: "Do you need a discussion?", cn: "你需要讨论吗？" },
  { en: "I have an archive.", cn: "我有把...存档\\.档案馆。" },
  { en: "This is my once.", cn: "这是我的一次。" },
  { en: "Where is the others?", cn: "其他人在哪里？" },
  { en: "I like this entertainment.", cn: "我喜欢这个娱乐。" },
  { en: "Do you need an agreement?", cn: "你需要同意吗？" },
  { en: "I have a format.", cn: "我有开本。" },
  { en: "This is my least.", cn: "这是我的最少。" },
  { en: "Where is the society?", cn: "社会在哪里？" },
  { en: "I like this months.", cn: "我喜欢这个月份。" },
  { en: "Do you need a log?", cn: "你需要记录吗？" },
  { en: "I have a safety.", cn: "我有安全。" },
  { en: "This is my friends.", cn: "这是我的老友记。" },
  { en: "Where is the sure?", cn: "确信在哪里？" },
  { en: "I like this faq.", cn: "我喜欢这个中等品。" },
  { en: "Do you need a trade?", cn: "你需要贸易吗？" },
  { en: "I have an edition.", cn: "我有版本。" },
  { en: "This is my cars.", cn: "这是我的中美洲研究站。" },
  { en: "Where is the messages?", cn: "信息在哪里？" },
  { en: "I like this marketing.", cn: "我喜欢这个行销。" },
  { en: "Do you need a tell?", cn: "你需要告诉吗？" },
  { en: "I have a further.", cn: "我有更远的。" },
  { en: "This is my updated.", cn: "这是我的更新的。" },
  { en: "Where is the association?", cn: "协会\\[计]关联在哪里？" },
  { en: "I like this able.", cn: "我喜欢这个能干的。" },
  { en: "Do you need a having?", cn: "你需要财产吗？" },
  { en: "I have a provides.", cn: "我有提供。" },
  { en: "This is my david.", cn: "这是我的大卫。" },
  { en: "Where is the fun?", cn: "乐趣在哪里？" },
  { en: "I like this already.", cn: "我喜欢这个已经。" },
  { en: "Do you need a green?", cn: "你需要绿色吗？" },
  { en: "I have a studies.", cn: "我有研究。" },
  { en: "This is my close.", cn: "这是我的结束。" },
  { en: "Where is the common?", cn: "通常的在哪里？" },
  { en: "I like this drive.", cn: "我喜欢这个驾车。" },
  { en: "Do you need a specific?", cn: "你需要特效药吗？" },
  { en: "I have a several.", cn: "我有几个的。" },
  { en: "This is my gold.", cn: "这是我的黄金。" },
  { en: "Where is the feb?", cn: "二月在哪里？" },
  { en: "I like this living.", cn: "我喜欢这个生活。" },
  { en: "Do you need a sep?", cn: "你需要九月吗？" },
  { en: "I have a collection.", cn: "我有收集。" },
  { en: "This is my called.", cn: "这是我的被呼叫的。" },
  { en: "Where is the short?", cn: "短的在哪里？" },
  { en: "I like this arts.", cn: "我喜欢这个文科。" },
  { en: "Do you need a lot?", cn: "你需要运气吗？" },
  { en: "I have an ask.", cn: "我有问。" },
  { en: "This is my display.", cn: "这是我的显示。" },
  { en: "Where is the limited?", cn: "有限制的在哪里？" },
  { en: "I like this powered.", cn: "我喜欢这个有动力装置的。" },
  { en: "Do you need a solutions?", cn: "你需要解决方案吗？" },
  { en: "I have a means.", cn: "我有方法。" },
  { en: "This is my director.", cn: "这是我的主管。" },
  { en: "Where is the daily?", cn: "每日的在哪里？" },
  { en: "I like this beach.", cn: "我喜欢这个海滩。" },
  { en: "Do you need a past?", cn: "你需要过去吗？" },
  { en: "I have a natural.", cn: "我有白痴\\.自然的。" },
  { en: "This is my whether.", cn: "这是我的是否。" },
  { en: "Where is the due?", cn: "应得的东西在哪里？" },
  { en: "I like this et.", cn: "我喜欢这个[化]乙基。" },
  { en: "Do you need an electronics?", cn: "你需要电子学\\[计]电子学吗？" },
  { en: "I have a five.", cn: "我有五。" },
  { en: "This is my upon.", cn: "这是我的在...之上。" },
  { en: "Where is the period?", cn: "时期在哪里？" },
  { en: "I like this planning.", cn: "我喜欢这个计划的制订。" },
  { en: "Do you need a database?", cn: "你需要数据库\\[计]数据库吗？" },
  { en: "I have a says.", cn: "我有说。" },
  { en: "This is my official.", cn: "这是我的官员。" },
  { en: "Where is the weather?", cn: "天气在哪里？" },
  { en: "I like this mar.", cn: "我喜欢这个损毁。" },
  { en: "Do you need a land?", cn: "你需要陆地吗？" },
  { en: "I have an average.", cn: "我有平均。" },
  { en: "This is my done.", cn: "这是我的完成了的。" },
  { en: "Where is the technical?", cn: "技术上的在哪里？" },
  { en: "I like this window.", cn: "我喜欢这个窗户。" },
  { en: "Do you need a france?", cn: "你需要法国吗？" },
  { en: "I have a pro.", cn: "我有正面地\\[计]可编程远程操作。" },
  { en: "This is my region.", cn: "这是我的区域。" },
  { en: "Where is the island?", cn: "岛在哪里？" },
  { en: "I like this record.", cn: "我喜欢这个记录。" },
  { en: "Do you need a direct?", cn: "你需要直接的吗？" },
  { en: "I have a conference.", cn: "我有会议\\[经]会议。" },
  { en: "This is my environment.", cn: "这是我的环境。" },
  { en: "Where is the records?", cn: "记录在哪里？" },
  { en: "I like this st.", cn: "我喜欢这个[计]段表。" },
  { en: "Do you need a district?", cn: "你需要区域吗？" },
  { en: "I have a calendar.", cn: "我有日历。" },
  { en: "This is my costs.", cn: "这是我的费用。" },
  { en: "Where is the style?", cn: "风格在哪里？" },
  { en: "I like this url.", cn: "我喜欢这个[计]统一资源定位器。" },
  { en: "Do you need a front?", cn: "你需要前面吗？" },
  { en: "I have a statement.", cn: "我有陈述。" },
  { en: "This is my update.", cn: "这是我的更新。" },
  { en: "Where is the parts?", cn: "零件在哪里？" },
  { en: "I like this aug.", cn: "我喜欢这个八月。" },
  { en: "Do you need an ever?", cn: "你需要曾经吗？" },
  { en: "I have a downloads.", cn: "我有下载。" },
  { en: "This is my early.", cn: "这是我的早的。" },
  { en: "Where is the miles?", cn: "英里在哪里？" },
  { en: "I like this sound.", cn: "我喜欢这个声音。" },
  { en: "Do you need a resource?", cn: "你需要资源吗？" },
  { en: "I have a present.", cn: "我有现在。" },
  { en: "This is my applications.", cn: "这是我的应用。" },
  { en: "Where is the ago?", cn: "以前在哪里？" },
  { en: "I like this document.", cn: "我喜欢这个文件。" },
  { en: "Do you need a word?", cn: "你需要话吗？" },
  { en: "I have a works.", cn: "我有工程。" },
  { en: "This is my material.", cn: "这是我的材料。" },
  { en: "Where is the bill?", cn: "帐单在哪里？" },
  { en: "I like this apr.", cn: "我喜欢这个[计]替换通路再试器。" },
  { en: "Do you need a written?", cn: "你需要书面的吗？" },
  { en: "I have a talk.", cn: "我有谈话。" },
  { en: "This is my federal.", cn: "这是我的联邦的。" },
  { en: "Where is the hosting?", cn: "作战在哪里？" },
  { en: "I like this rules.", cn: "我喜欢这个规则。" },
  { en: "Do you need a final?", cn: "你需要期末考试吗？" },
  { en: "I have an adult.", cn: "我有成人。" },
  { en: "This is my tickets.", cn: "这是我的票。" },
  { en: "Where is the thing?", cn: "事物在哪里？" },
  { en: "I like this centre.", cn: "我喜欢这个中心。" },
  { en: "Do you need a requirements?", cn: "你需要调整需要量吗？" },
  { en: "I have a via.", cn: "我有经由。" },
  { en: "This is my cheap.", cn: "这是我的便宜的。" },
  { en: "Where is the kids?", cn: "小山羊在哪里？" },
  { en: "I like this finance.", cn: "我喜欢这个财政。" },
  { en: "Do you need a true?", cn: "你需要真实的吗？" },
  { en: "I have a minutes.", cn: "我有会议记录\\[法]备忘录。" },
  { en: "This is my else.", cn: "这是我的别的。" },
  { en: "Where is the mark?", cn: "标志在哪里？" },
  { en: "I like this third.", cn: "我喜欢这个第三。" },
  { en: "Do you need a rock?", cn: "你需要岩石吗？" },
  { en: "I have a gifts.", cn: "我有礼品。" },
  { en: "This is my europe.", cn: "这是我的欧洲。" },
  { en: "Where is the reading?", cn: "阅读在哪里？" },
  { en: "I like this topics.", cn: "我喜欢这个总联机程序和信息控制系统。" },
  { en: "Do you need a bad?", cn: "你需要坏的\\.坏\\.坏地吗？" },
  { en: "I have an individual.", cn: "我有人。" },
  { en: "This is my tips.", cn: "这是我的秘诀。" },
  { en: "Where is the plus?", cn: "加上在哪里？" },
  { en: "I like this auto.", cn: "我喜欢这个汽车\\.表示\"自己\"、\"本身\"。" },
  { en: "Do you need a cover?", cn: "你需要盖子吗？" },
  { en: "I have an usually.", cn: "我有通常。" },
  { en: "This is my edit.", cn: "这是我的编辑。" },
  { en: "Where is the together?", cn: "一起在哪里？" },
  { en: "I like this videos.", cn: "我喜欢这个视频文件。" },
  { en: "Do you need a percent?", cn: "你需要百分比吗？" },
  { en: "I have a fast.", cn: "我有快速的。" },
  { en: "This is my function.", cn: "这是我的官能。" },
  { en: "Where is the fact?", cn: "事实在哪里？" },
  { en: "I like this unit.", cn: "我喜欢这个单位。" },
  { en: "Do you need a getting?", cn: "你需要采煤吗？" },
  { en: "I have a global.", cn: "我有通用的。" },
  { en: "This is my tech.", cn: "这是我的技术学院或学校。" },
  { en: "Where is the meet?", cn: "会在哪里？" },
  { en: "I like this far.", cn: "我喜欢这个远的。" },
  { en: "Do you need an economic?", cn: "你需要经济上的吗？" },
  { en: "I have an en.", cn: "我有字母。" },
  { en: "This is my player.", cn: "这是我的竞赛者。" },
  { en: "Where is the projects?", cn: "项目在哪里？" },
  { en: "I like this lyrics.", cn: "我喜欢这个歌词。" },
  { en: "Do you need an often?", cn: "你需要时常吗？" },
  { en: "I have a subscribe.", cn: "我有捐献。" },
  { en: "This is my submit.", cn: "这是我的使服从。" },
  { en: "Where is the germany?", cn: "德国在哪里？" },
  { en: "I like this amount.", cn: "我喜欢这个总数。" },
  { en: "Do you need a watch?", cn: "你需要观察吗？" },
  { en: "I have an included.", cn: "我有包括在内\\[计]包含的。" },
  { en: "This is my feel.", cn: "这是我的感觉。" },
  { en: "Where is the though?", cn: "然而在哪里？" },
  { en: "I like this bank.", cn: "我喜欢这个银行。" },
  { en: "Do you need a risk?", cn: "你需要冒险吗？" },
  { en: "I have a thanks.", cn: "我有感谢。" },
  { en: "This is my everything.", cn: "这是我的每件事物。" },
  { en: "Where is the deals?", cn: "协约在哪里？" },
  { en: "I like this various.", cn: "我喜欢这个不同的。" },
  { en: "Do you need a words?", cn: "你需要言语吗？" },
  { en: "I have a linux.", cn: "我有一个个人电脑上免费的操作系统。" },
  { en: "This is my jul.", cn: "这是我的七月。" },
  { en: "Where is the production?", cn: "制造在哪里？" },
  { en: "I like this commercial.", cn: "我喜欢这个商业的。" },
  { en: "Do you need a james?", cn: "你需要詹姆斯吗？" },
  { en: "I have a weight.", cn: "我有重。" },
  { en: "This is my town.", cn: "这是我的城镇。" },
  { en: "Where is the heart?", cn: "心在哪里？" },
  { en: "I like this advertising.", cn: "我喜欢这个广告业。" },
  { en: "Do you need a received?", cn: "你需要被一般承认的吗？" },
  { en: "I have a choose.", cn: "我有选择。" },
  { en: "This is my treatment.", cn: "这是我的治疗。" },
  { en: "Where is the newsletter?", cn: "时事通讯在哪里？" },
  { en: "I like this archives.", cn: "我喜欢这个档案。" },
  { en: "Do you need a points?", cn: "你需要转轨器吗？" },
  { en: "I have a knowledge.", cn: "我有知识。" },
  { en: "This is my magazine.", cn: "这是我的杂志。" },
  { en: "Where is the error?", cn: "错误在哪里？" },
  { en: "I like this camera.", cn: "我喜欢这个照相机。" },
  { en: "Do you need a jun?", cn: "你需要六月吗？" },
  { en: "I have a girl.", cn: "我有女孩。" },
  { en: "This is my currently.", cn: "这是我的现在。" },
  { en: "Where is the construction?", cn: "建筑在哪里？" },
  { en: "I like this toys.", cn: "我喜欢这个玩具。" },
  { en: "Do you need a registered?", cn: "你需要注册的吗？" },
  { en: "I have a clear.", cn: "我有清楚的。" },
  { en: "This is my golf.", cn: "这是我的高尔夫球\\.打高尔夫球。" },
  { en: "Where is the receive?", cn: "收到在哪里？" },
  { en: "I like this domain.", cn: "我喜欢这个领域。" },
  { en: "Do you need a methods?", cn: "你需要方法吗？" },
  { en: "I have a chapter.", cn: "我有章。" },
  { en: "This is my makes.", cn: "这是我的做。" },
  { en: "Where is the protection?", cn: "保护在哪里？" },
  { en: "I like this policies.", cn: "我喜欢这个政策。" },
  { en: "Do you need a loan?", cn: "你需要贷款吗？" },
  { en: "I have a wide.", cn: "我有宽的。" },
  { en: "This is my beauty.", cn: "这是我的美。" },
  { en: "Where is the manager?", cn: "经理在哪里？" },
  { en: "I like this india.", cn: "我喜欢这个印度。" },
  { en: "Do you need a position?", cn: "你需要位置吗？" },
  { en: "I have a taken.", cn: "我有的过去分词。" },
  { en: "This is my sort.", cn: "这是我的种类。" },
  { en: "Where is the listings?", cn: "表在哪里？" },
  { en: "I like this models.", cn: "我喜欢这个模型。" },
  { en: "Do you need a michael?", cn: "你需要迈克尔吗？" },
  { en: "I have a known.", cn: "我有已知的。" },
  { en: "This is my half.", cn: "这是我的一半。" },
  { en: "Where is the cases?", cn: "案例在哪里？" },
  { en: "I like this step.", cn: "我喜欢这个步骤。" },
  { en: "Do you need an engineering?", cn: "你需要工程学吗？" },
  { en: "I have a florida.", cn: "我有佛罗里达州。" },
  { en: "This is my simple.", cn: "这是我的简单的。" },
  { en: "Where is the quick?", cn: "快的在哪里？" },
  { en: "I like this none.", cn: "我喜欢这个一点也不。" },
  { en: "Do you need a wireless?", cn: "你需要无线电\\.无线的吗？" },
  { en: "I have a license.", cn: "我有执照。" },
  { en: "This is my paul.", cn: "这是我的保罗。" },
  { en: "Where is the friday?", cn: "星期五在哪里？" },
  { en: "I like this lake.", cn: "我喜欢这个湖。" },
  { en: "Do you need a whole?", cn: "你需要全部吗？" },
  { en: "I have an annual.", cn: "我有年刊。" },
  { en: "This is my published.", cn: "这是我的已发布的。" },
  { en: "Where is the later?", cn: "以后在哪里？" },
  { en: "I like this basic.", cn: "我喜欢这个基本原理。" },
  { en: "Do you need a sony?", cn: "你需要索尼吗？" },
  { en: "I have a shows.", cn: "我有秀场。" },
  { en: "This is my corporate.", cn: "这是我的社团的。" },
  { en: "Where is the google?", cn: "谷歌在哪里？" },
  { en: "I like this church.", cn: "我喜欢这个教堂。" },
  { en: "Do you need a method?", cn: "你需要方法吗？" },
  { en: "I have a purchase.", cn: "我有购买。" },
  { en: "This is my customers.", cn: "这是我的客户。" },
  { en: "Where is the active?", cn: "活跃的在哪里？" },
  { en: "I like this response.", cn: "我喜欢这个反应。" },
  { en: "Do you need a practice?", cn: "你需要实践吗？" },
  { en: "I have a hardware.", cn: "我有硬件。" },
  { en: "This is my figure.", cn: "这是我的数字。" },
  { en: "Where is the materials?", cn: "材料在哪里？" },
  { en: "I like this fire.", cn: "我喜欢这个火。" },
  { en: "Do you need a holiday?", cn: "你需要假日吗？" },
  { en: "I have a chat.", cn: "我有闲谈\\.闲谈。" },
  { en: "This is my enough.", cn: "这是我的充足。" },
  { en: "Where is the designed?", cn: "故意的在哪里？" },
  { en: "I like this along.", cn: "我喜欢这个平行地。" },
  { en: "Do you need an among?", cn: "你需要在...之中吗？" },
  { en: "I have a death.", cn: "我有死亡\\[医]死亡。" },
  { en: "This is my writing.", cn: "这是我的书写。" },
  { en: "Where is the speed?", cn: "速率在哪里？" },
  { en: "I like this html.", cn: "我喜欢这个[计]超文本标记语言。" },
  { en: "Do you need a countries?", cn: "你需要国家吗？" },
  { en: "I have a loss.", cn: "我有损失。" },
  { en: "This is my face.", cn: "这是我的脸。" },
  { en: "Where is the brand?", cn: "商标在哪里？" },
  { en: "I like this discount.", cn: "我喜欢这个折扣。" },
  { en: "Do you need a higher?", cn: "你需要[经]上扬吗？" },
  { en: "I have an effects.", cn: "我有财物。" },
  { en: "This is my created.", cn: "这是我的创造的\\[电]创造的。" },
  { en: "Where is the remember?", cn: "记得在哪里？" },
  { en: "I like this standards.", cn: "我喜欢这个标准。" },
  { en: "Do you need an oil?", cn: "你需要油吗？" },
  { en: "I have a bit.", cn: "我有少量。" },
  { en: "This is my yellow.", cn: "这是我的黄色\\.黄色的。" },
  { en: "Where is the political?", cn: "政治的在哪里？" },
  { en: "I like this increase.", cn: "我喜欢这个增加。" },
  { en: "Do you need an advertise?", cn: "你需要做广告吗？" },
  { en: "I have a kingdom.", cn: "我有王国。" },
  { en: "This is my base.", cn: "这是我的底部。" },
  { en: "Where is the near?", cn: "近的在哪里？" },
  { en: "I like this environmental.", cn: "我喜欢这个周围的。" },
  { en: "Do you need a thought?", cn: "你需要想法吗？" },
  { en: "I have a stuff.", cn: "我有原料。" },
  { en: "This is my french.", cn: "这是我的法国人。" },
  { en: "Where is the storage?", cn: "存储器在哪里？" },
  { en: "I like this japan.", cn: "我喜欢这个日本\\[化]天然漆。" },
  { en: "Do you need a doing?", cn: "你需要行为吗？" },
  { en: "I have a loans.", cn: "我有借贷。" },
  { en: "This is my shoes.", cn: "这是我的鞋子。" },
  { en: "Where is the entry?", cn: "登录在哪里？" },
  { en: "I like this stay.", cn: "我喜欢这个停留。" },
  { en: "Do you need a nature?", cn: "你需要自然吗？" },
  { en: "I have an orders.", cn: "我有牧师职。" },
  { en: "This is my availability.", cn: "这是我的有效性。" },
  { en: "Where is the africa?", cn: "非洲在哪里？" },
  { en: "I like this summary.", cn: "我喜欢这个摘要。" },
  { en: "Do you need a turn?", cn: "你需要转弯吗？" },
  { en: "I have a mean.", cn: "我有低劣的。" },
  { en: "This is my growth.", cn: "这是我的生长。" },
  { en: "Where is the notes?", cn: "票据在哪里？" },
  { en: "I like this agency.", cn: "我喜欢这个代理机构。" },
  { en: "Do you need a king?", cn: "你需要国王吗？" },
  { en: "I have a monday.", cn: "我有星期一。" },
  { en: "This is my european.", cn: "这是我的欧洲人\\.欧洲的。" },
  { en: "Where is the activity?", cn: "活动在哪里？" },
  { en: "I like this copy.", cn: "我喜欢这个副本。" },
  { en: "Do you need an although?", cn: "你需要虽然吗？" },
  { en: "I have a drug.", cn: "我有药。" },
  { en: "This is my pics.", cn: "这是我的[计]生产信息控制系统。" },
  { en: "Where is the western?", cn: "西方人在哪里？" },
  { en: "I like this income.", cn: "我喜欢这个收入。" },
  { en: "Do you need a force?", cn: "你需要力量吗？" },
  { en: "I have a cash.", cn: "我有现金\\.兑现。" },
  { en: "This is my employment.", cn: "这是我的雇用。" },
  { en: "Where is the overall?", cn: "全部的在哪里？" },
  { en: "I like this bay.", cn: "我喜欢这个海湾。" },
  { en: "Do you need a river?", cn: "你需要河吗？" },
  { en: "I have a commission.", cn: "我有委任状。" },
  { en: "This is my ad.", cn: "这是我的广告\\[计]地址。" },
  { en: "Where is the package?", cn: "包裹在哪里？" },
  { en: "I like this contents.", cn: "我喜欢这个目录\\[计]目录。" },
  { en: "Do you need a seen?", cn: "你需要的过去分词吗？" },
  { en: "I have a players.", cn: "我有队员。" },
  { en: "This is my engine.", cn: "这是我的引擎。" },
  { en: "Where is the port?", cn: "港口在哪里？" },
  { en: "I like this album.", cn: "我喜欢这个粘贴簿。" },
  { en: "Do you need a regional?", cn: "你需要地方的吗？" },
  { en: "I have a stop.", cn: "我有停止。" },
  { en: "This is my supplies.", cn: "这是我的供应品。" },
  { en: "Where is the started?", cn: "出发在哪里？" },
  { en: "I like this administration.", cn: "我喜欢这个行政。" },
  { en: "Do you need a bar?", cn: "你需要条吗？" },
  { en: "I have an institute.", cn: "我有学会。" },
  { en: "This is my views.", cn: "这是我的景点。" },
  { en: "Where is the plans?", cn: "计划在哪里？" },
  { en: "I like this double.", cn: "我喜欢这个两倍\\.两倍的。" },
  { en: "Do you need a dog?", cn: "你需要狗吗？" },
  { en: "I have a build.", cn: "我有建立。" },
  { en: "This is my screen.", cn: "这是我的幕。" },
  { en: "Where is the exchange?", cn: "交换在哪里？" },
  { en: "I like this types.", cn: "我喜欢这个打字。" },
  { en: "Do you need a soon?", cn: "你需要不久吗？" },
  { en: "I have a sponsored.", cn: "我有赞助。" },
  { en: "This is my lines.", cn: "这是我的台词。" },
  { en: "Where is the electronic?", cn: "电子的\\[计]电子工业协会接口在哪里？" },
  { en: "I like this continue.", cn: "我喜欢这个继续。" },
  { en: "Do you need an across?", cn: "你需要越过吗？" }
];

const DEFAULT_NEWS = [
  { title: "中共中央国务院印发《关于加强新时代社会工作的意见》", time: "2026-07-23", source: "人民网", tag: "时政", url: "https://cpc.people.com.cn/GB/67481/431391/index.html" },
  { title: "国务院批复同意《扩大消费“十五五”规划》", time: "2026-07-14", source: "中国政府网", tag: "经济", url: "https://www.gov.cn/" },
  { title: "国务院印发《国民健康“十五五”规划》 部署健康中国建设", time: "2026-07-14", source: "新华社", tag: "民生", url: "https://www.news.cn/" },
  { title: "9 部门印发《关于促进家政服务业高质量发展的若干政策措施》", time: "2026-07-13", source: "商务部", tag: "民生", url: "https://www.mofcom.gov.cn/" },
  { title: "新就业形态人员职业伤害保障试点向全国 31 省份推开", time: "2026-07-01", source: "人社部", tag: "社会", url: "https://www.mohrss.gov.cn/" },
  { title: "《社会救助法》《民用航空法》等一批新规 7 月起施行", time: "2026-07-01", source: "人民日报", tag: "法治", url: "https://paper.people.com.cn/" },
  { title: "水利部将辽宁、吉林洪水防御应急响应提升至Ⅲ级", time: "2026-07-13", source: "中国水利", tag: "应急", url: "http://www.mwr.gov.cn/" },
  { title: "国家发改委安排 3000 万元支持河北暴雨洪涝灾害灾后恢复", time: "2026-07-13", source: "国家发改委", tag: "应急", url: "https://www.ndrc.gov.cn/" },
  { title: "国家药监局、国家医保局联合检查药店和医疗机构", time: "2026-07-13", source: "央视新闻", tag: "监管", url: "https://news.cctv.com/" },
  { title: "长征五号遥十四火箭运抵文昌 将执行嫦娥七号发射任务", time: "2026-07-13", source: "新华社", tag: "科技", url: "https://www.news.cn/" }
];

// AI 动态兜底数据（联网拉取失败时使用，均为真实近期 AI 新闻）
const DEFAULT_AI_NEWS = [
  { title: "四大 AI 实验室 7 月连发新模型：Grok 4.5、Claude Opus 5、GPT-5.6、Kimi K3 同台", url: "https://gfdaily.com/tech/en-four-ai-labs-release-new-models-in-july-performance-gap-narrows-ms2igeaa", source: "GFdaily", time: "2026-07-28" },
  { title: "三天三模型：Gemini 3.6 Flash 省 Token、千问 3.8-Max 将开源、Opus 5 登顶推理榜", url: "https://www.sohu.com/a/1055222979_122802957", source: "搜狐", time: "2026-07-28" },
  { title: "July 2026 LLM 发布盘点：Kimi K3 以 2.8 万亿参数登顶开源权重之最", url: "https://presenc.ai/research/july-2026-llm-release-roundup", source: "Presenc AI", time: "2026-07-28" },
  { title: "Agnes 2.5 Flash 上线、Pro Alpha 开放，单周处理量破 8 万亿 Token", url: "https://www.163.com/dy/article/L2SC1UGU051180F7.html", source: "智东西", time: "2026-07-27" },
  { title: "一周七款前沿模型发布，AI 进入「几乎每天一个新模型」时代", url: "https://www.buinsoft.com/en/blog/ai-model-wave-july-2026-small-business-guide", source: "Buinsoft", time: "2026-07-28" },
  { title: "Moonshot Kimi K3 开源权重放出，支持本地部署、数据不出内网", url: "https://presenc.ai/research/july-2026-llm-release-roundup", source: "Moonshot", time: "2026-07-27" },
  { title: "Gemini 3.6 Flash 输出 Token 减少 17%，价格同步下调", url: "https://www.sohu.com/a/1055222979_122802957", source: "Google", time: "2026-07-21" },
  { title: "DeepSeek 退役旧模型名，统一切换至新版", url: "https://www.buinsoft.com/en/blog/ai-model-wave-july-2026-small-business-guide", source: "DeepSeek", time: "2026-07-24" },
  { title: "阿里千问 3.8-Max 采用 MoE 架构，承诺全面开源权重与训练方案", url: "https://www.sohu.com/a/1055222979_122802957", source: "阿里", time: "2026-07-19" },
  { title: "Claude Sonnet 5 成为免费/Pro 默认模型，重置多数用户回答基线", url: "https://presenc.ai/research/july-2026-llm-release-roundup", source: "Anthropic", time: "2026-06-30" }
];

// AI 学习视频精选池（按「模型」分类，每日按日期洗牌，点击可播放）
// 字段：tag=所属模型分类；bvid=B站视频号（优先内嵌播放）；url=外部课程链接（无 bvid 时新窗口打开）
const DEFAULT_AI_VIDEOS = [
  // —— ChatGPT ——
  { tag: "ChatGPT", bvid: "BV1e8411o7NP", title: "吴恩达 × OpenAI：ChatGPT 提示工程实战课（开发者版）", author: "深度学习课程", duration: 5400, cover: "" },
  { tag: "ChatGPT", bvid: "BV1tm4y1r7zu", title: "ChatGPT Teach-Out｜密歇根大学零基础通识课", author: "密歇根大学", duration: 7200, cover: "" },

  // —— Codex ——
  { tag: "Codex", bvid: "BV1V5Lm6AEBL", title: "PAPAYA《20 分钟入门 Codex》校庆自动化实战", author: "PAPAYA电脑教室", duration: 1189, cover: "" },
  { tag: "Codex", bvid: "BV1Kk9kBAEJv", title: "技术爬爬虾《Codex APP 保姆级全攻略》（12 大功能模块）", author: "技术爬爬虾", duration: 2400, cover: "" },
  { tag: "Codex", bvid: "BV1Nd596vEyU", title: "秋芝2046《全网最全！40 分钟全面掌握 Codex》", author: "秋芝2046", duration: 2400, cover: "" },

  // —— Claude ——
  { tag: "Claude", bvid: "BV1Hc5r69E5L", title: "Claude Code 官方 9 节课（B站搬运·含官方字幕）", author: "官方搬运", duration: 3600, cover: "" },
  { tag: "Claude", bvid: "BV1TTR8BaEnL", title: "从零开始 Claude Code（安装到接入工作流）", author: "技术教程", duration: 1800, cover: "" },
  { tag: "Claude", bvid: "BV14JEj6uEdG", title: "程序员鱼皮：国内无门槛用 Claude Code + Codex（CC Switch）", author: "程序员鱼皮", duration: 120, cover: "" },

  // —— Gemini ——
  { tag: "Gemini", bvid: "BV1kxUMB7EJk", title: "Gemini 3 最强教程：8 大场景实测", author: "AI工具测评", duration: 900, cover: "" },
  { tag: "Gemini", bvid: "BV1zXJxzrEdc", title: "如何用好用透 Gemini（2.5 Pro·免费 API·多 Key 轮询）", author: "Gemini教程", duration: 1200, cover: "" },
  { tag: "Gemini", bvid: "BV1LuKdzjEAc", title: "Gemini CLI 上手实测（国内安装与登录避坑）", author: "编程导航", duration: 900, cover: "" },

  // —— DeepSeek ——
  { tag: "DeepSeek", bvid: "BV1cRN4eSEoy", title: "【清华大学】DeepSeek 从入门到精通", author: "清华出品", duration: 3600, cover: "" },
  { tag: "DeepSeek", bvid: "BV1TrNieJEbA", title: "DeepSeek 保姆级使用教程", author: "大模型教程", duration: 2400, cover: "" },
  { tag: "DeepSeek", bvid: "BV1UZFfeMEvd", title: "DeepSeek 19 大使用技巧，从入门到精通", author: "技巧合集", duration: 1800, cover: "" },
  { tag: "DeepSeek", bvid: "BV1DsNueLE72", title: "最简单的 DeepSeek R1 本地运行教程", author: "本地部署", duration: 600, cover: "" },
  { tag: "DeepSeek", bvid: "BV1QyFoeuE3e", title: "本地部署 DeepSeek-R1 后，搭建自己的知识库", author: "知识库", duration: 900, cover: "" },

  // —— WorkBuddy ——
  { tag: "WorkBuddy", bvid: "BV1VPdHBxEsm", title: "WorkBuddy（小龙虾）介绍及使用入门", author: "WorkBuddy", duration: 600, cover: "" },
  { tag: "WorkBuddy", bvid: "BV1d7w2z5E4c", title: "龙虾 + AI 短剧导演智能体：零门槛做短剧", author: "AI短剧", duration: 600, cover: "" },
  { tag: "WorkBuddy", url: "https://coding.imooc.com/class/992.html", title: "腾讯龙虾 WorkBuddy 多场景 AI 办公新范式实战（慕课网系统课）", author: "慕课网", duration: 28000, cover: "" },
  { tag: "WorkBuddy", url: "https://www.sanjieke.cn/course/detail/sjk/8009709", title: "WorkBuddy AI 智能体实战课：从对话指令到全自动执行（三节课）", author: "三节课", duration: 7560, cover: "" },

  // —— 通识基础 ——
  { tag: "通识", bvid: "BV1atCRYsE7x", title: "90 分钟！清华博士带你搞懂人工智能和神经网络", author: "漫士沉思录", duration: 5338, cover: "" },
  { tag: "通识", bvid: "BV1EE411W7V3", title: "【AI 101】人工智能系列科普视频（商汤教育）", author: "商汤教育", duration: 3274, cover: "" },
  { tag: "通识", bvid: "BV1as4y1q73s", title: "【央视纪录片】《智能时代》人工智能如何改变世界", author: "纪录片", duration: 19426, cover: "" }
];

const DIET_CATEGORIES = {
  expense: ["餐饮", "交通", "购物", "娱乐", "居住", "医疗", "其他"],
  income: ["工资", "副业", "理财", "红包", "其他"]
};

const SPORT_TYPES = ["跑步", "快走", "骑行", "跳绳", "瑜伽", "力量训练", "游泳", "羽毛球", "其他"];
const SPORT_CAL_RATES = {
  "跑步": 10,
  "快走": 5,
  "骑行": 7,
  "跳绳": 12,
  "瑜伽": 3,
  "力量训练": 6,
  "游泳": 10,
  "羽毛球": 6,
  "其他": 5
};

const SKINCARE_STEPS = {
  morning: ["洁面", "爽肤水", "精华", "乳液/面霜", "防晒", "敷面膜"],
  evening: ["卸妆", "洁面", "爽肤水", "精华", "乳液/面霜", "眼霜", "敷面膜"]
};

// =================== 初始化数据 ===================
function initData() {
  // 每日计划：按日期存储 tasksByDate["YYYY-MM-DD"] = [{id,time,text}]
  if (!STORE.get("tasksByDate", null)) {
    const map = {};
    const old = STORE.get("tasks", null);
    const hasOld = !!(old && Array.isArray(old) && old.length);
    const seed = hasOld ? old : DEFAULT_TASKS;
    map[today()] = seed.map(t => ({ id: genId(), time: t.time, text: t.text }));
    const dn = {};
    if (hasOld) {
      const oldDone = STORE.get("taskDone", {}) || {};
      seed.forEach(t => {
        if (oldDone[`${today()}_${t.time}`]) {
          const nt = map[today()].find(x => x.time === t.time && x.text === t.text);
          if (nt) dn[`${today()}_${nt.id}`] = true;
        }
      });
    }
    STORE.set("tasksByDate", map);
    STORE.set("taskDone", dn);
  }
  if (!STORE.get("taskDone", null)) STORE.set("taskDone", {});
  if (!STORE.get("meals", null)) STORE.set("meals", { breakfast: "", lunch: "", dinner: "" });
  if (!STORE.get("weight", null)) STORE.set("weight", [{ date: today(), value: 54.4 }]);
  if (!STORE.get("diet", null)) STORE.set("diet", []);
  if (!STORE.get("dietByDate", null)) STORE.set("dietByDate", {});
  // 将旧版「全局饮食列表」迁移到按日期存储（按时间推断早/午/晚）
  (function migrateDiet() {
    const oldDiet = STORE.get("diet");
    if (Array.isArray(oldDiet) && oldDiet.length) {
      const map = STORE.get("dietByDate") || {};
      oldDiet.forEach(d => {
        const date = d.date || today();
        const hh = (d.time || "12:00").slice(0, 2);
        const meal = hh < "11" ? "breakfast" : hh >= "18" ? "dinner" : "lunch";
        map[date] = map[date] || { breakfast: [], lunch: [], dinner: [] };
        map[date][meal].push({ id: genId(), name: d.name, grams: d.weight || 0, kcal: d.cal || 0 });
      });
      STORE.set("dietByDate", map);
      STORE.set("diet", []); // 迁移后清空旧数据，避免重复
    }
  })();
  if (!STORE.get("sport", null)) STORE.set("sport", []);
  if (!STORE.get("money", null)) STORE.set("money", []);
  if (!STORE.get("memo", null)) STORE.set("memo", []);
  if (!STORE.get("aiNotes", null)) STORE.set("aiNotes", []);
  if (!STORE.get("weekly", null)) STORE.set("weekly", []);
  if (!STORE.get("skincare", null)) STORE.set("skincare", []);
  if (!STORE.get("wordProgress", null)) STORE.set("wordProgress", { current: 0, known: [] });
  if (!STORE.get("oralProgress", null)) STORE.set("oralProgress", { current: 0, known: [] });
  if (!STORE.get("news", null)) STORE.set("news", DEFAULT_NEWS);
}
initData();

// =================== 页面渲染 ===================
const PAGES = {
  dashboard: renderDashboard,
  daily: renderDaily,
  ai: renderAI,
  diet: renderDiet,
  sport: renderSport,
  money: renderMoney,
  memo: renderMemo,
  news: renderNews,
  weekly: renderWeekly,
  skincare: renderSkincare,
  word: renderWord
};

function go(page) {
  $$(".nav-item").forEach(n => n.classList.toggle("active", n.dataset.page === page));
  const content = $("#content");
  content.innerHTML = '<div class="fade-in">' + (PAGES[page] ? PAGES[page]() : "<p>页面不存在</p>") + "</div>";
}

$$(".nav-item").forEach(n => n.addEventListener("click", () => go(n.dataset.page)));

// 顶部时间
function updateTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  $("#topTime").textContent = `${hh}:${mm}`;
  $("#topDate").textContent = `${fmtDate(d)} 周${weekDay(d)}`;
}
updateTime();
setInterval(updateTime, 30000);

// =================== 工作台（首页） ===================
function renderDashboard() {
  const tasksMap = STORE.get("tasksByDate") || {};
  const done = STORE.get("taskDone") || {};
  const tdy = today();
  const tdyTasks = tasksMap[tdy] || [];
  const doneToday = tdyTasks.filter(t => done[`${tdy}_${t.id}`]).length;
  const todoToday = tdyTasks.length - doneToday;

  const weight = STORE.get("weight");
  const lastW = weight[weight.length - 1]?.value || "--";
  const sport = STORE.get("sport");
  const todaySport = sport.filter(s => s.date === tdy);
  const sportMin = todaySport.reduce((s, x) => s + (x.min || 0), 0);

  const money = STORE.get("money");
  const todayMoney = money.filter(m => m.date === tdy);
  const todayIn = todayMoney.filter(m => m.type === "income").reduce((s, x) => s + x.amount, 0);
  const todayOut = todayMoney.filter(m => m.type === "expense").reduce((s, x) => s + x.amount, 0);

  const wp = STORE.get("wordProgress");
  const wordDone = (wp.known || []).length;
  const aiNews = STORE.get("aiNews", null);
  const aiNewsCount = (aiNews && aiNews.date === tdy && aiNews.items) ? aiNews.items.length : 0;
  const newsToday = STORE.get("newsToday", null);
  const newsCount = (newsToday && newsToday.date === tdy && newsToday.items) ? newsToday.items.length : 0;

  const greet = `<div class="greeting-card">
    <img class="greet-avatar" src="icon-192.png" alt="锦锦">
    <div class="greet-text">
      <div class="greet-title">锦锦的工作台<br>美好的一天开始了~</div>
      <div class="greet-sub">${fmtDate(new Date())} 周${weekDay(new Date())} · 愿你今天高效又开心</div>
    </div>
  </div>`;

  return `${greet}
    <div class="card">
      <div class="card-title"><span class="icon">${ic('star')}</span><span>今日概览</span></div>
      <div class="dash-grid">
        <div class="dash-card" onclick="go('daily')">
          <div class="dc-emoji">${ic('calendar', 'lg')}</div>
          <div class="dc-label">今日计划</div>
          <div class="dc-num">${doneToday}/${tdyTasks.length}</div>
        </div>
        <div class="dash-card" onclick="go('diet')">
          <div class="dc-emoji">${ic('scale', 'lg')}</div>
          <div class="dc-label">当前体重</div>
          <div class="dc-num">${lastW} kg</div>
        </div>
        <div class="dash-card" onclick="go('sport')">
          <div class="dc-emoji">${ic('activity', 'lg')}</div>
          <div class="dc-label">今日运动</div>
          <div class="dc-num">${sportMin} min</div>
        </div>
        <div class="dash-card" onclick="go('money')">
          <div class="dc-emoji">${ic('wallet', 'lg')}</div>
          <div class="dc-label">今日收支</div>
          <div class="dc-num" style="color:#7E9E4A">+${todayIn.toFixed(0)}</div>
          <div class="dc-num" style="color:#D47A7A;font-size:13px;margin-top:-2px">-${todayOut.toFixed(0)}</div>
        </div>
        <div class="dash-card" onclick="go('word')">
          <div class="dc-emoji">${ic('bookOpen', 'lg')}</div>
          <div class="dc-label">已学单词</div>
          <div class="dc-num">${wordDone}</div>
        </div>
        <div class="dash-card" onclick="go('ai')">
          <div class="dc-emoji">${ic('brain', 'lg')}</div>
          <div class="dc-label">AI学习</div>
          <div class="dc-num">${DEFAULT_AI_VIDEOS.length} 视频</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('flame')}</span><span>待办提醒</span></div>
      <p class="card-hint" style="margin-bottom:8px">今天还有 <b style="color:#c66">${todoToday}</b> 项任务未完成</p>
      <div class="progress"><div class="progress-bar" style="width:${(tdyTasks.length ? doneToday/tdyTasks.length*100 : 0).toFixed(0)}%"></div></div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('rocket')}</span><span>快捷入口</span></div>
      <div class="dash-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="dash-card" onclick="go('memo')"><div class="dc-emoji">${ic('notebook', 'md')}</div><div class="dc-label">备忘录</div></div>
        <div class="dash-card" onclick="go('news')"><div class="dc-emoji">${ic('newspaper', 'md')}</div><div class="dc-label">时政</div></div>
        <div class="dash-card" onclick="go('weekly')"><div class="dc-emoji">${ic('bar', 'md')}</div><div class="dc-label">周总结</div></div>
        <div class="dash-card" onclick="go('skincare')"><div class="dc-emoji">${ic('droplet', 'md')}</div><div class="dc-label">护肤</div></div>
      </div>
    </div>
  `;
}

// =================== 每日计划（按日期） ===================
let planSel = (function () { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() }; })();
function planKey() { return `${planSel.y}-${String(planSel.m + 1).padStart(2, "0")}-${String(planSel.d).padStart(2, "0")}`; }

let dietSel = (function () { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() }; })();
function dietKey() { return `${dietSel.y}-${String(dietSel.m + 1).padStart(2, "0")}-${String(dietSel.d).padStart(2, "0")}`; }

let sportSel = (function () { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() }; })();
function sportKey() { return `${sportSel.y}-${String(sportSel.m + 1).padStart(2, "0")}-${String(sportSel.d).padStart(2, "0")}`; }
function sportIsToday() { const n = new Date(); return sportSel.y === n.getFullYear() && sportSel.m === n.getMonth() && sportSel.d === n.getDate(); }
window.sportStep = function (delta) {
  _dayStep(sportSel, delta, (y, m, d) => { sportSel = { y, m, d }; });
  go("sport");
};
window.sportMonthStep = function (delta) {
  _monthStep(sportSel, delta, (y, m, d) => { sportSel = { y, m, d }; });
  go("sport");
};
window.sportToday = function () {
  const n = new Date();
  sportSel = { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() };
  go("sport");
};
window.selectSportDay = function(d) { sportSel.d = d; go("sport"); };

let moneySel = (function () { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() }; })();
function moneyKey() { return `${moneySel.y}-${String(moneySel.m + 1).padStart(2, "0")}-${String(moneySel.d).padStart(2, "0")}`; }
function moneyIsToday() { const n = new Date(); return moneySel.y === n.getFullYear() && moneySel.m === n.getMonth() && moneySel.d === n.getDate(); }
window.moneyStep = function (delta) {
  _dayStep(moneySel, delta, (y, m, d) => { moneySel = { y, m, d }; });
  go("money");
};
window.moneyMonthStep = function (delta) {
  _monthStep(moneySel, delta, (y, m, d) => { moneySel = { y, m, d }; });
  go("money");
};
window.moneyToday = function () {
  const n = new Date();
  moneySel = { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() };
  go("money");
};
window.selectMoneyDay = function(d) { moneySel.d = d; go("money"); };

// 日期导航公共辅助：禁止切换到未来
function _todayMid() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime(); }
function _selTime(s) { return new Date(s.y, s.m, s.d).getTime(); }
function _selMonthVal(s) { return s.y * 12 + s.m; }
function _nowMonthVal() { const n = new Date(); return n.getFullYear() * 12 + n.getMonth(); }
// 选中的“下一天”是否会进入未来（用于禁用“›”）
function _dayForwardBlocked(s) { return _selTime(s) >= _todayMid(); }
// 选中的“下一月”是否会进入未来（用于禁用月份“›”）
function _monthForwardBlocked(s) { return _selMonthVal(s) >= _nowMonthVal(); }
// 月份加减（已自动阻止进入未来月份）
function _monthStep(sel, delta, clamp) {
  let y = sel.y, m = sel.m + delta;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  if (_selMonthVal({ y, m }) > _nowMonthVal()) return false; // 未来月份，拒绝
  const dim = new Date(y, m + 1, 0).getDate();
  const d = sel.d > dim ? dim : sel.d;
  clamp(y, m, d);
  return true;
}
// 日加减（已自动阻止进入未来日期）
function _dayStep(sel, delta, set) {
  const dt = new Date(sel.y, sel.m, sel.d + delta);
  if (dt.getTime() > _todayMid()) return false; // 未来日期，拒绝
  set(dt.getFullYear(), dt.getMonth(), dt.getDate());
  return true;
}

// 通用日历（与每日计划一致的日期切换）：月份导航 + 可点击日期格
// opts: { sel, prevFn, nextFn, selectFn, hasMap, disableFuture }
function buildCalendar(opts) {
  const { sel, prevFn, nextFn, selectFn, hasMap, disableFuture } = opts;
  const y = sel.y, m = sel.m;
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startDay = first.getDay();
  const days = last.getDate();
  const tObj = new Date();
  const tMid = new Date(tObj.getFullYear(), tObj.getMonth(), tObj.getDate()).getTime();
  const isTodayCell = (i) => i === tObj.getDate() && m === tObj.getMonth() && y === tObj.getFullYear();

  let cells = "";
  for (let i = 0; i < startDay; i++) cells += `<div class="calendar-cell empty"></div>`;
  for (let i = 1; i <= days; i++) {
    const ck = `${y}-${String(m + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const cellTime = new Date(y, m, i).getTime();
    const future = disableFuture && cellTime > tMid;
    const cls = ["calendar-cell"];
    if (isTodayCell(i)) cls.push("today");
    if (i === sel.d) cls.push("selected");
    if (hasMap && hasMap[ck]) cls.push("has-task");
    if (future) cls.push("future");
    const attr = future ? "" : ` onclick="${selectFn}(${i})"`;
    cells += `<div class="${cls.join(" ")}"${attr}>${i}</div>`;
  }

  return `
    <div class="cal-nav">
      <button class="btn btn-sm" onclick="${prevFn}()">‹</button>
      <span class="cal-title">${y}年${m + 1}月</span>
      <button class="btn btn-sm" onclick="${nextFn}()">›</button>
    </div>
    <div class="calendar-header"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>
    <div class="calendar-grid">${cells}</div>
  `;
}

function renderDaily() {
  const map = STORE.get("tasksByDate") || {};
  const done = STORE.get("taskDone") || {};
  const key = planKey();
  const tasks = (map[key] || []).slice().sort((a, b) => a.time.localeCompare(b.time));

  const taskListHtml = tasks.map((t) => {
    const isDone = !!done[`${key}_${t.id}`];
    return `
      <div class="task-row ${isDone ? "done" : ""}">
        <div class="checkbox ${isDone ? "done" : ""}" onclick="toggleTask('${t.id}')"></div>
        <div class="task-time">${t.time}</div>
        <div class="task-text">${escapeHtml(t.text)}</div>
        <button class="btn btn-sm" onclick="editTask('${t.id}')">编辑</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTask('${t.id}')">删</button>
      </div>
    `;
  }).join("");

  return `
    <div class="card">
      <div class="card-title"><span class="icon">${ic('calendar')}</span><span>每日计划</span>
        <button class="btn btn-sm btn-outline" style="margin-left:auto" onclick="go('dashboard')">首页</button>
      </div>
      ${buildCalendar({ sel: planSel, prevFn: "planPrevMonth", nextFn: "planNextMonth", selectFn: "selectPlanDay", hasMap: map, disableFuture: false })}
      <p class="card-hint">${key} · 点击日期切换当天；圆点表示当天有任务</p>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('clipboard')}</span><span>${key} 任务（${tasks.length}）</span></div>
      <div style="margin-bottom:10px">
        <div class="row">
          <input class="input" id="newTime" placeholder="时间-15:00">
          <input class="input" id="newText" placeholder="任务内容">
          <button class="btn" onclick="addTask()">添加</button>
        </div>
      </div>
      <div>${taskListHtml || '<p class="card-hint">这一天还没有任务，添加一条吧～</p>'}</div>
    </div>
  `;
}

window.selectPlanDay = function(d) { planSel.d = d; go("daily"); };
window.planPrevMonth = function() {
  planSel.m--; if (planSel.m < 0) { planSel.m = 11; planSel.y--; }
  const dim = new Date(planSel.y, planSel.m + 1, 0).getDate();
  if (planSel.d > dim) planSel.d = dim;
  go("daily");
};
window.planNextMonth = function() {
  planSel.m++; if (planSel.m > 11) { planSel.m = 0; planSel.y++; }
  const dim = new Date(planSel.y, planSel.m + 1, 0).getDate();
  if (planSel.d > dim) planSel.d = dim;
  go("daily");
};

window.toggleTask = function(id) {
  const key = planKey();
  const done = STORE.get("taskDone") || {};
  done[`${key}_${id}`] = !done[`${key}_${id}`];
  STORE.set("taskDone", done);
  go("daily");
};

window.addTask = function() {
  const time = $("#newTime").value.trim();
  const text = $("#newText").value.trim();
  if (!time || !text) return alert("请填写时间和任务");
  const key = planKey();
  const map = STORE.get("tasksByDate") || {};
  if (!map[key]) map[key] = [];
  map[key].push({ id: genId(), time, text });
  map[key].sort((a, b) => a.time.localeCompare(b.time));
  STORE.set("tasksByDate", map);
  go("daily");
};

window.closeModal = function() {
  const m = document.getElementById("appModal");
  if (m) m.remove();
};
function openModal(title, bodyHtml, actionsHtml) {
  const exist = document.getElementById("appModal");
  if (exist) exist.remove();
  const mask = document.createElement("div");
  mask.className = "modal-mask";
  mask.id = "appModal";
  mask.innerHTML = `
    <div class="modal fade-in">
      <div class="modal-title">${title}</div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-actions">${actionsHtml}</div>
    </div>`;
  mask.addEventListener("click", (e) => { if (e.target === mask) window.closeModal(); });
  document.body.appendChild(mask);
}

window.editTask = function(id) {
  const map = STORE.get("tasksByDate") || {};
  const tasks = map[planKey()] || [];
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  const body = `
    <input class="input" id="editTaskTime" value="${escapeHtml(t.time)}" placeholder="时间 如 15:00">
    <input class="input" id="editTaskText" value="${escapeHtml(t.text)}" placeholder="任务内容">
  `;
  const actions = `
    <button class="btn btn-outline" onclick="closeModal()">取消</button>
    <button class="btn" onclick="saveTaskEdit('${id}')">保存</button>
  `;
  openModal("编辑任务", body, actions);
};
window.saveTaskEdit = function(id) {
  const nt = $("#editTaskTime").value.trim();
  const tx = $("#editTaskText").value.trim();
  if (!nt || !tx) { alert("请填写时间和内容"); return; }
  const map = STORE.get("tasksByDate") || {};
  const tasks = map[planKey()] || [];
  const t = tasks.find(x => x.id === id);
  if (t) {
    t.time = nt; t.text = tx;
    tasks.sort((a, b) => a.time.localeCompare(b.time));
    STORE.set("tasksByDate", map);
  }
  closeModal();
  go("daily");
};

window.deleteTask = function(id) {
  const actions = `
    <button class="btn btn-outline" onclick="closeModal()">取消</button>
    <button class="btn btn-danger" onclick="confirmDeleteTask('${id}')">删除</button>
  `;
  openModal("确认删除", '<p class="card-hint">确认删除该任务？</p>', actions);
};
window.confirmDeleteTask = function(id) {
  const map = STORE.get("tasksByDate") || {};
  const key = planKey();
  map[key] = (map[key] || []).filter(x => x.id !== id);
  STORE.set("tasksByDate", map);
  closeModal();
  go("daily");
};

// =================== AI 学习 ===================
let aiTab = "news"; // "news" | "video"
let aiVideoTag = "全部"; // 视频按模型分类筛选：全部 / ChatGPT / Codex / Claude / Gemini / DeepSeek / WorkBuddy / 通识

function aiVideoTags() {
  return ["全部", ...Array.from(new Set(DEFAULT_AI_VIDEOS.map(v => v.tag)))];
}

function buildVideoListHtml(list) {
  if (!list || !list.length) return '<p class="card-hint">该分类暂无视频</p>';
  return list.map((v, i) => `
    <div class="list-item video-item" onclick="openVideoPlayer('${v.bvid || ""}', '${v.url || ""}')">
      <div class="video-cover">
        ${v.cover ? `<img src="${encodeURI(v.cover)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
        <div class="video-cover-ph">${v.tag}</div>
        <span class="video-duration">${fmtDuration(v.duration)}</span>
      </div>
      <div class="li-content">
        <div class="li-title">${i + 1}. ${escapeHtml(v.title)}</div>
        <div class="li-sub">${escapeHtml(v.author)} · <span class="tag-pill">${v.tag}</span>${v.url && !v.bvid ? ' · 外部课程↗' : ''}</div>
      </div>
      <div class="li-action" style="color:#8B7EC7;font-size:18px">▶</div>
    </div>
  `).join("");
}

function renderAI() {
  const notes = STORE.get("aiNotes");
  const aiVideosAll = getTodayAiVideos();
  const aiVideos = aiVideoTag === "全部" ? aiVideosAll : aiVideosAll.filter(v => v.tag === aiVideoTag);

  const newsPanel = `
    <div class="ai-tab-panel" id="aiPanelNews" ${aiTab === 'news' ? '' : 'style="display:none"'}>
      <div class="card">
        <div class="card-title">
          <span class="icon">${ic('brain')}</span><span>今日 AI 动态</span>
          <button class="btn btn-sm btn-outline" style="margin-left:auto" onclick="refreshAiNews()">刷新</button>
        </div>
        <p class="card-hint" id="aiNewsStatus" style="margin-bottom:8px">加载中…</p>
        <div class="list" id="aiNewsList">
          <div class="card-hint">正在拉取今日 AI 动态…</div>
        </div>
      </div>
    </div>
  `;

  const tagChips = aiVideoTags().map(t =>
    `<button class="ai-tag-chip ${aiVideoTag === t ? 'active' : ''}" data-tag="${t}" onclick="switchAiVideoTag('${t}')">${t}</button>`
  ).join("");

  const videoHtml = buildVideoListHtml(aiVideos);

  const videoPanel = `
    <div class="ai-tab-panel" id="aiPanelVideo" ${aiTab === 'video' ? '' : 'style="display:none"'}>
      <div class="card">
        <div class="card-title">
          <span class="icon">${ic('brain')}</span><span>AI 模型学习视频</span>
          <button class="btn btn-sm btn-outline" style="margin-left:auto" onclick="refreshAiVideos()">换一批</button>
        </div>
        <div class="ai-tag-chips">${tagChips}</div>
        <p class="card-hint" id="aiVideoHint" style="margin-bottom:8px">共 ${aiVideos.length} 个「${aiVideoTag}」模型学习视频，点击即可播放</p>
        <div class="list video-list">${videoHtml}</div>
      </div>
    </div>
  `;

  const noteHtml = notes.slice().reverse().map((n, i) => {
    const idx = notes.length - 1 - i;
    return `
      <div class="list-item">
        <div class="li-content">
          <div class="li-title">${escapeHtml(n.title)}</div>
          <div class="li-sub">${escapeHtml(n.content)} · ${n.date}</div>
        </div>
        <div class="li-action">
          <button class="btn btn-sm btn-danger" onclick="aiNoteDel(${idx})">删</button>
        </div>
      </div>
    `;
  }).join("");

  const html = `
    <div class="tabs ai-tabs">
      <button class="tab ${aiTab === 'news' ? 'active' : ''}" data-tab="news" onclick="switchAiTab('news')">今日 AI 动态</button>
      <button class="tab ${aiTab === 'video' ? 'active' : ''}" data-tab="video" onclick="switchAiTab('video')">AI学习视频</button>
    </div>
    ${newsPanel}
    ${videoPanel}

    <div class="card">
      <div class="card-title"><span class="icon">${ic('notebook')}</span><span>学习笔记</span></div>
      <div style="margin-bottom:10px">
        <input class="input" id="aiNoteTitle" placeholder="笔记标题" style="margin-bottom:6px">
        <textarea class="textarea" id="aiNoteContent" placeholder="今天学到的内容..."></textarea>
        <button class="btn btn-block" style="margin-top:8px" onclick="aiNoteAdd()">保存笔记</button>
      </div>
      <div class="list">${noteHtml || '<p class="card-hint">还没有笔记</p>'}</div>
    </div>
  `;

  // 进入页面后异步拉取/校验「今日 AI 动态」
  setTimeout(() => ensureAiNews(false), 0);
  return html;
}

window.switchAiTab = function(tab) {
  aiTab = tab;
  const news = $("#aiPanelNews"), video = $("#aiPanelVideo");
  if (news) news.style.display = tab === 'news' ? '' : 'none';
  if (video) video.style.display = tab === 'video' ? '' : 'none';
  document.querySelectorAll('.ai-tabs .tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
};

// =================== 今日 AI 动态（每天推送 10 条） ===================
function relTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600) return Math.max(1, Math.floor(diff / 60)) + " 分钟前";
  if (diff < 86400) return Math.floor(diff / 3600) + " 小时前";
  return Math.floor(diff / 86400) + " 天前";
}

function renderAiNewsList(items) {
  if (!items || !items.length) return '<p class="card-hint">暂无动态</p>';
  return items.map((it, i) => `
    <a class="list-item ai-news-item" href="${encodeURI(it.url || "#")}" target="_blank" rel="noopener">
      <div class="li-content">
        <div class="li-title">${i + 1}. ${escapeHtml(it.title)}</div>
        <div class="li-sub">${escapeHtml(it.source || "AI")}${it.time ? " · " + (relTime(it.time) || it.time) : ""}${it.points ? " · ▲ " + it.points : ""}</div>
      </div>
      <div class="li-action" style="color:#8B7EC7;font-size:18px">›</div>
    </a>
  `).join("");
}

async function fetchAiNewsLive() {
  // 中文 AI 资讯源（通过 rss2json 代理，避免跨域），优先 AI 垂直媒体
  const sources = [
    { name: "量子位", feed: "https://www.qbitai.com/feed" },
    { name: "机器之心", feed: "https://www.jiqizhixin.com/rss" },
    { name: "36氪", feed: "https://36kr.com/feed" }
  ];
  for (const s of sources) {
    try {
      const url = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(s.feed);
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 9000);
      let data;
      try {
        const res = await fetch(url, { signal: ctrl.signal, mode: "cors" });
        if (!res.ok) throw new Error("http " + res.status);
        data = await res.json();
      } finally { clearTimeout(to); }
      const items = (data.items || [])
        .map(it => ({
          title: decodeEntities(it.title),
          url: it.link || it.guid,
          source: s.name,
          time: it.pubDate
        }))
        .filter(it => it.title && it.title.length > 4)
        .slice(0, 10);
      if (items.length) return items;
    } catch (e) { /* 尝试下一个源 */ }
  }
  return null;
}

async function ensureAiNews(force) {
  const box = $("#aiNewsList");
  if (!box) return;
  const t = today();
  const cached = STORE.get("aiNews", null);
  if (!force && cached && cached.date === t && cached.items && cached.items.length) {
    box.innerHTML = renderAiNewsList(cached.items);
    updateAiNewsStatus("今日已推送 " + cached.items.length + " 条 · " + t);
    return;
  }
  box.innerHTML = '<p class="card-hint">正在拉取今日 AI 动态…</p>';
  updateAiNewsStatus("更新中…");
  let items = null;
  try { items = await fetchAiNewsLive(); } catch (e) { items = null; }
  if (!items || !items.length) {
    items = DEFAULT_AI_NEWS;
    STORE.set("aiNews", { date: t, items, offline: true });
    box.innerHTML = renderAiNewsList(items) +
      '<p class="card-hint" style="margin-top:8px">（当前离线，已显示兜底内容；联网后点「刷新」获取最新）</p>';
    updateAiNewsStatus("今日已推送 " + items.length + " 条 · 离线兜底");
    return;
  }
  STORE.set("aiNews", { date: t, items });
  box.innerHTML = renderAiNewsList(items);
  updateAiNewsStatus("今日已推送 " + items.length + " 条 · " + t);
}

function updateAiNewsStatus(txt) {
  const el = $("#aiNewsStatus");
  if (el) el.textContent = txt;
}

window.refreshAiNews = function() {
  ensureAiNews(true);
};

function fmtDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function dateSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    h = h >>> 0;
  }
  return h;
}

function seededRng(seed) {
  let s = seed >>> 0;
  return function() {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(arr, seed) {
  const rng = seededRng(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getTodayAiVideos(forceRefresh) {
  const t = today();
  const cached = STORE.get("aiVideos", null);
  if (!forceRefresh && cached && cached.date === t && Array.isArray(cached.items) && cached.items.length) {
    return cached.items;
  }
  const seed = dateSeed(t);
  const items = shuffleWithSeed(DEFAULT_AI_VIDEOS.slice(), seed);
  STORE.set("aiVideos", { date: t, items });
  return items;
}

window.refreshAiVideos = function() {
  STORE.set("aiVideos", null);
  go("ai");
};

window.openVideoPlayer = function(bvid, url) {
  if (bvid) {
    const overlay = document.createElement("div");
    overlay.className = "video-overlay";
    overlay.innerHTML = `
      <div class="video-modal">
        <div class="video-header">
          <span>视频播放</span>
          <button class="video-close" onclick="closeVideoPlayer()" aria-label="关闭">✕</button>
        </div>
        <div class="video-frame">
          <iframe src="https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0" allowfullscreen></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  } else if (url) {
    window.open(url, "_blank", "noopener");
  }
};

window.switchAiVideoTag = function(tag) {
  aiVideoTag = tag;
  const all = getTodayAiVideos();
  const list = tag === "全部" ? all : all.filter(v => v.tag === tag);
  const container = document.querySelector("#aiPanelVideo .video-list");
  if (container) container.innerHTML = buildVideoListHtml(list);
  const hint = document.getElementById("aiVideoHint");
  if (hint) hint.textContent = `共 ${list.length} 个「${tag}」模型学习视频，点击即可播放`;
  document.querySelectorAll(".ai-tag-chip").forEach(c => c.classList.toggle("active", c.dataset.tag === tag));
};

window.closeVideoPlayer = function() {
  const el = $(".video-overlay");
  if (el) el.remove();
};

window.aiNoteAdd = function() {
  const title = $("#aiNoteTitle").value.trim();
  const content = $("#aiNoteNoteContent, #aiNoteContent").value.trim();
  if (!title || !content) return alert("请填写标题和内容");
  const notes = STORE.get("aiNotes");
  notes.push({ title, content, date: today() });
  STORE.set("aiNotes", notes);
  go("ai");
};
window.aiNoteDel = async function(i) {
  if (!(await appConfirm("删除该笔记？"))) return;
  const notes = STORE.get("aiNotes");
  notes.splice(i, 1);
  STORE.set("aiNotes", notes);
  go("ai");
};

// 常见食物热量库（千卡 / 100g），用于输入饮食自动换算大卡
const FOOD_DB = [
  // 主食
  { name: "米饭", per100: 116, alias: ["白米饭", "大米饭"] },
  { name: "粥", per100: 46, alias: ["白粥", "米粥"] },
  { name: "面条", per100: 110, alias: ["煮面", "汤面"] },
  { name: "馒头", per100: 223 },
  { name: "面包", per100: 265, alias: ["吐司"] },
  { name: "全麦面包", per100: 246 },
  { name: "燕麦", per100: 367, alias: ["麦片", "即食燕麦"] },
  { name: "红薯", per100: 86, alias: ["地瓜"] },
  { name: "紫薯", per100: 99 },
  { name: "土豆", per100: 77, alias: ["马铃薯"] },
  { name: "玉米", per100: 106, alias: ["苞谷"] },
  { name: "小米", per100: 358 },
  { name: "荞麦", per100: 324 },
  // 蛋白质
  { name: "鸡胸肉", per100: 133, alias: ["鸡胸"] },
  { name: "鸡蛋", per100: 144, alias: ["蛋"] },
  { name: "牛肉", per100: 125, alias: ["瘦牛肉", "牛里脊"] },
  { name: "猪肉", per100: 143, alias: ["瘦肉", "瘦猪肉"] },
  { name: "羊肉", per100: 203 },
  { name: "鱼肉", per100: 105, alias: ["鱼", "鲈鱼", "鲫鱼"] },
  { name: "三文鱼", per100: 208 },
  { name: "虾", per100: 93, alias: ["虾仁"] },
  { name: "蟹", per100: 95, alias: ["螃蟹"] },
  { name: "豆腐", per100: 81, alias: ["嫩豆腐"] },
  { name: "豆浆", per100: 31, alias: ["黄豆豆浆"] },
  { name: "牛奶", per100: 54, alias: ["纯牛奶"] },
  { name: "酸奶", per100: 72, alias: ["原味酸奶"] },
  { name: "希腊酸奶", per100: 59 },
  // 蔬菜
  { name: "西兰花", per100: 34, alias: ["绿菜花"] },
  { name: "菠菜", per100: 23 },
  { name: "白菜", per100: 17, alias: ["大白菜"] },
  { name: "黄瓜", per100: 15 },
  { name: "番茄", per100: 18, alias: ["西红柿"] },
  { name: "胡萝卜", per100: 41 },
  { name: "生菜", per100: 15 },
  { name: "芹菜", per100: 16 },
  { name: "茄子", per100: 24 },
  { name: "冬瓜", per100: 10 },
  { name: "南瓜", per100: 23 },
  { name: "青椒", per100: 20, alias: ["甜椒"] },
  { name: "蘑菇", per100: 26, alias: ["香菇", "平菇"] },
  { name: "金针菇", per100: 26 },
  { name: "洋葱", per100: 40, alias: ["洋葱头"] },
  { name: "芦笋", per100: 20 },
  { name: "西葫芦", per100: 17 },
  { name: "苦瓜", per100: 19 },
  // 水果
  { name: "苹果", per100: 52 },
  { name: "香蕉", per100: 89 },
  { name: "橙子", per100: 47, alias: ["脐橙"] },
  { name: "梨", per100: 57, alias: ["雪梨"] },
  { name: "葡萄", per100: 43 },
  { name: "草莓", per100: 32 },
  { name: "蓝莓", per100: 57 },
  { name: "西瓜", per100: 26 },
  { name: "桃子", per100: 39, alias: ["水蜜桃"] },
  { name: "猕猴桃", per100: 61, alias: ["奇异果"] },
  { name: "火龙果", per100: 50 },
  { name: "芒果", per100: 60 },
  { name: "菠萝", per100: 50, alias: ["凤梨"] },
  { name: "柚子", per100: 33 },
  // 坚果零食
  { name: "花生", per100: 567 },
  { name: "核桃", per100: 654 },
  { name: "杏仁", per100: 579 },
  { name: "腰果", per100: 553 },
  { name: "瓜子", per100: 601, alias: ["葵花籽"] },
  { name: "巧克力", per100: 546 },
  { name: "饼干", per100: 433, alias: ["曲奇"] },
  { name: "蛋糕", per100: 348 },
  { name: "薯片", per100: 548 },
  { name: "奶茶", per100: 70, alias: ["珍珠奶茶"] },
  { name: "可乐", per100: 43 },
  { name: "雪碧", per100: 41 },
  { name: "咖啡", per100: 2, alias: ["美式咖啡", "黑咖啡"] },
  { name: "拿铁", per100: 50, alias: ["咖啡拿铁"] },
  { name: "蜂蜜", per100: 304 },
  { name: "糖", per100: 400, alias: ["白糖"] },
  // 油脂调味
  { name: "橄榄油", per100: 884 },
  { name: "黄油", per100: 717 },
  { name: "沙拉酱", per100: 400 }
];
function findFood(q) {
  q = (q || "").replace(/\s/g, "");
  if (!q) return null;
  let best = null, bestLen = 0;
  for (const f of FOOD_DB) {
    const names = [f.name, ...(f.alias || [])];
    for (const n of names) {
      if (!n) continue;
      if (n === q) return f;
      if (n.includes(q) || q.includes(n)) {
        if (n.length > bestLen) { bestLen = n.length; best = f; }
      }
    }
  }
  return best;
}

// =================== 减肥计划 ===================
function renderDiet() {
  const db = STORE.get("dietByDate") || {};
  const key = dietKey();
  const dayData = db[key] || { breakfast: [], lunch: [], dinner: [] };
  const weight = STORE.get("weight");
  const lastW = weight[weight.length - 1];

  const dietHas = {};
  for (const ck in db) {
    const o = db[ck] || {};
    if ((o.breakfast && o.breakfast.length) || (o.lunch && o.lunch.length) || (o.dinner && o.dinner.length)) dietHas[ck] = 1;
  }
  (weight || []).forEach(w => { if (w.date) dietHas[w.date] = 1; });

  const MEALS = [
    { key: "breakfast", label: "早餐", icon: "sunrise" },
    { key: "lunch", label: "午餐", icon: "sun" },
    { key: "dinner", label: "晚餐", icon: "moon" }
  ];

  // 当天三餐摄入总热量
  let dayKcal = 0;
  MEALS.forEach(m => { (dayData[m.key] || []).forEach(f => dayKcal += (f.kcal || 0)); });

  // 体重趋势：使用所有历史记录，按日期升序排列，横屏可滑动
  const allDays = (weight || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const vals = allDays.map(d => d.value);
  const maxV = vals.length ? Math.max(...vals) : 60;
  const minV = vals.length ? Math.min(...vals) : 50;
  const range = Math.max(maxV - minV, 8);
  const maxH = 36, minH = 18, barW = 36;
  const onlyOne = allDays.length === 1;
  const trendHtml = allDays.map(d => {
    const h = onlyOne ? maxH : Math.max(minH, Math.min(maxH, ((d.value - minV) / range) * (maxH - minH) + minH));
    const short = d.date.slice(5);
    return `
      <div class="weight-bar-item" style="width:${barW}px;flex:0 0 ${barW}px;text-align:center">
        <div style="height:${maxH}px;display:flex;align-items:flex-end;justify-content:center">
          <div style="width:26px;height:${h}px;background:linear-gradient(180deg,#B8A9E8,#8B7EC7);border-radius:5px 5px 0 0"></div>
        </div>
        <div style="font-size:10px;color:#8E82A8;margin-top:3px;white-space:nowrap">${short}</div>
        <div style="font-size:11px;font-weight:700;color:#8B7EC7">${d.value}</div>
      </div>
    `;
  }).join("");

  // 当前选中日期的体重
  const wRec = weight.find(w => w.date === key);

  // 初始体重 & 变化量
  const initialW = allDays[0];          // 最早一条记录
  const currentW = lastW;               // 最新一条记录
  let diffNum = "--", diffLabel = "", diffColor = "#999";
  if (initialW && currentW) {
    const diff = Math.round((initialW.value - currentW.value) * 10) / 10;
    if (diff > 0) { diffNum = diff + " kg"; diffLabel = "已减重"; diffColor = "#34A853"; }
    else if (diff < 0) { diffNum = Math.abs(diff) + " kg"; diffLabel = "已增重"; diffColor = "#EA4335"; }
    else { diffNum = "无变化"; diffColor = "#999"; }
  }

  const mealHtml = MEALS.map(m => {
    const items = dayData[m.key] || [];
    const mealKcal = items.reduce((s, x) => s + (x.kcal || 0), 0);
    const listHtml = items.length ? items.map(f => `
      <div class="food-row">
        <div>
          <span class="food-name">${escapeHtml(f.name)}</span>
          <span class="food-meta"> · ${f.grams}g · ${f.kcal}千卡</span>
        </div>
        <button class="btn btn-sm btn-danger" onclick="delDietFood('${m.key}', '${f.id}')">删</button>
      </div>
    `).join("") : '<p class="card-hint" style="margin:4px 0">还没有记录</p>';
    return `
      <div class="meal-block">
        <div class="meal-head">
          <span>${ic(m.icon)} ${m.label}</span>
          <span class="meal-kcal">${mealKcal} 千卡</span>
        </div>
        ${listHtml}
        <div class="food-add">
          <input class="input" id="dietName_${m.key}" placeholder="食物" oninput="updateDietKcal('${m.key}')">
          <input class="input" id="dietGrams_${m.key}" type="number" placeholder="克" style="max-width:62px" oninput="updateDietKcal('${m.key}')">
          <input class="input" id="dietKcal_${m.key}" type="number" placeholder="千卡" style="max-width:62px">
          <button class="btn btn-sm" onclick="addDietFood('${m.key}')">添加</button>
        </div>
        <div class="mini-kcal" id="dietHint_${m.key}"></div>
      </div>
    `;
  }).join("");

  return `
    <div class="card">
      ${buildCalendar({ sel: dietSel, prevFn: "dietMonthStep(-1)", nextFn: "dietMonthStep(1)", selectFn: "selectDietDay", hasMap: dietHas, disableFuture: true })}
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:6px">
        <span style="font-size:13px;color:#7B6BA6">当日摄入</span>
        <span style="font-size:22px;font-weight:800;color:#8B7EC7">${dayKcal}<span style="font-size:13px;font-weight:600"> 千卡</span></span>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('scale')}</span><span>体重记录</span></div>
      <div class="row" style="margin-bottom:10px">
        <input class="input" id="wVal" type="number" step="0.1" placeholder="体重 kg" value="${wRec ? wRec.value : ""}">
        <input class="input" id="wDate" type="date" value="${key}" max="${today()}" style="max-width:140px">
        <button class="btn" onclick="weightAdd()">保存</button>
      </div>

      <div style="background:linear-gradient(135deg,#8B7EC7,#9B8ED8);border-radius:16px;padding:16px 18px;display:flex;align-items:center;gap:14px;box-shadow:0 6px 18px rgba(139,126,199,0.22);margin-bottom:4px">
        <div style="width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,0.22);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px">
          ⚖️
        </div>
        <div style="flex:1">
          <div style="font-size:26px;font-weight:800;color:#fff;line-height:1.1">${wRec ? wRec.value : (lastW?.value || "--")} <span style="font-size:14px;font-weight:600;opacity:0.85">kg</span></div>
          <div style="font-size:12px;color:#fff;opacity:0.75;margin-top:3px">${wRec ? key : (lastW?.date || "暂无记录")}</div>
        </div>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
        <div style="flex:1;min-width:130px;background:#F5F1FC;border-radius:12px;padding:12px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
          <span style="font-size:11px;color:#7B6BA6;white-space:nowrap">初始体重</span>
          <div style="font-size:20px;font-weight:800;color:#8B7EC7;line-height:1.2;margin:4px 0">
            ${initialW ? initialW.value : "--"}<span style="font-size:11px;font-weight:600;color:#8E82A8"> kg</span>
          </div>
          ${initialW ? `<span style="font-size:10px;color:#B0A5C9;white-space:nowrap">${initialW.date.slice(5)}</span>` : ""}
        </div>
        <div style="flex:1;min-width:130px;background:#F5F1FC;border-radius:12px;padding:12px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
          <span style="font-size:11px;color:#7B6BA6;white-space:nowrap">当前变化</span>
          <div style="font-size:20px;font-weight:800;color:${diffColor};line-height:1.2;margin:2px 0;white-space:nowrap">${diffNum}</div>
          ${diffLabel ? `<span style="font-size:11px;color:${diffColor};white-space:nowrap">${diffLabel}</span>` : ""}
        </div>
      </div>

      <div style="margin-top:14px">
        <div class="li-title" style="margin-bottom:6px">减肥体重趋势</div>
        <div class="weight-trend-scroll">
          <div class="weight-trend-track">${trendHtml}</div>
        </div>
      </div>

    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('utensils')}</span><span>每日三餐</span></div>
      ${mealHtml}
    </div>
  `;
}

window.dietStep = function(delta) {
  _dayStep(dietSel, delta, (y, m, d) => { dietSel = { y, m, d }; });
  go("diet");
};
window.dietMonthStep = function(delta) {
  _monthStep(dietSel, delta, (y, m, d) => { dietSel = { y, m, d }; });
  go("diet");
};
window.dietToday = function() {
  const dt = new Date();
  dietSel = { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
  go("diet");
};
window.selectDietDay = function(d) { dietSel.d = d; go("diet"); };
window.updateDietKcal = function(meal) {
  const name = $("#dietName_" + meal).value.trim();
  const grams = parseFloat($("#dietGrams_" + meal).value) || 0;
  const kcalInput = $("#dietKcal_" + meal);
  const hint = $("#dietHint_" + meal);
  const f = findFood(name);
  if (f) {
    hint.textContent = "约 " + f.per100 + " 千卡/100g" + (grams ? " · 合计 " + Math.round(grams / 100 * f.per100) + " 千卡" : "");
    if (grams) kcalInput.value = Math.round(grams / 100 * f.per100);
  } else {
    hint.textContent = name ? "未收录，请手填千卡" : "";
  }
};
window.addDietFood = function(meal) {
  const name = $("#dietName_" + meal).value.trim();
  const grams = parseFloat($("#dietGrams_" + meal).value) || 0;
  const kcalInput = $("#dietKcal_" + meal);
  let kcal = parseFloat(kcalInput.value);
  const f = findFood(name);
  if (f && grams && !kcal) kcal = Math.round(grams / 100 * f.per100);
  if (!name) return alert("请填写食物名称");
  if (!kcal || kcal <= 0) return alert("请填写或确认千卡数");
  const db = STORE.get("dietByDate") || {};
  const key = dietKey();
  db[key] = db[key] || { breakfast: [], lunch: [], dinner: [] };
  db[key][meal].push({ id: genId(), name, grams, kcal });
  STORE.set("dietByDate", db);
  go("diet");
};
window.delDietFood = function(meal, id) {
  const db = STORE.get("dietByDate") || {};
  const key = dietKey();
  if (!db[key]) return;
  db[key][meal] = (db[key][meal] || []).filter(x => x.id !== id);
  STORE.set("dietByDate", db);
  go("diet");
};
window.weightAdd = function() {
  const val = parseFloat($("#wVal").value);
  const date = $("#wDate").value || today();
  if (!val) return alert("请输入体重");
  if (date > today()) return alert("不能记录未来的日期");
  const list = STORE.get("weight");
  const exist = list.findIndex(x => x.date === date);
  if (exist >= 0) list[exist].value = val;
  else list.push({ date, value: val });
  list.sort((a, b) => a.date.localeCompare(b.date));
  STORE.set("weight", list);
  go("diet");
};
// =================== 运动 ===================
function renderSport() {
  const sport = STORE.get("sport");
  const sportHas = {};
  (sport || []).forEach(s => { if (s.date) sportHas[s.date] = 1; });
  const key = sportKey();
  const sDate = new Date(sportSel.y, sportSel.m, sportSel.d);

  // 当日统计
  const dayItems = sport.filter(s => s.date === key);
  const dayCal = dayItems.reduce((s, x) => s + (x.cal || 0), 0);
  const dayMin = dayItems.reduce((s, x) => s + (x.min || 0), 0);

  // 本周（以选中日所在周计算）
  const dow = sDate.getDay() || 7;
  const ws = new Date(sDate); ws.setDate(sDate.getDate() - dow + 1);
  const we = new Date(ws); we.setDate(ws.getDate() + 6);
  const weekItems = sport.filter(s => {
    const d = new Date(s.date);
    return d >= ws && d <= we;
  });
  const weekCal = weekItems.reduce((s, x) => s + (x.cal || 0), 0);
  const weekMin = weekItems.reduce((s, x) => s + (x.min || 0), 0);

  // 选中日记录（保留原数组下标用于删除）
  const items = [];
  sport.forEach((s, i) => { if (s.date === key) items.push({ s, i }); });
  items.reverse();
  const listHtml = items.map(({ s, i }) => `
      <div class="list-item">
        <div class="li-content">
          <div class="li-title">${escapeHtml(s.type)} · ${s.min} 分钟 · ${s.cal} 千卡</div>
          <div class="li-sub">${s.date}${s.note ? " · " + escapeHtml(s.note) : ""}</div>
        </div>
        <div class="li-action">
          <button class="btn btn-sm btn-danger" onclick="sportDel(${i})">删</button>
        </div>
      </div>
    `).join("");

  const sportOpts = SPORT_TYPES.map(t => `<option value="${t}">${t}</option>`).join("");

  return `
    <div class="card">
      ${buildCalendar({ sel: sportSel, prevFn: "sportMonthStep(-1)", nextFn: "sportMonthStep(1)", selectFn: "selectSportDay", hasMap: sportHas, disableFuture: true })}
      <div class="card-title"><span class="icon">${ic('activity')}</span><span>运动数据</span></div>
      <div class="dash-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="dash-card"><div class="dc-emoji">${ic('flame')}</div><div class="dc-label">当日消耗</div><div class="dc-num">${dayCal} 千卡</div></div>
        <div class="dash-card"><div class="dc-emoji">${ic('clock')}</div><div class="dc-label">当日时长</div><div class="dc-num">${dayMin} min</div></div>
        <div class="dash-card"><div class="dc-emoji">${ic('calendar')}</div><div class="dc-label">本周消耗</div><div class="dc-num">${weekCal} 千卡</div></div>
        <div class="dash-card"><div class="dc-emoji">${ic('bar')}</div><div class="dc-label">本周时长</div><div class="dc-num">${weekMin} min</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('plus')}</span><span>添加运动</span></div>
      <div class="row" style="margin-bottom:8px">
        <select class="select" id="sType" onchange="updateSportCal()">${sportOpts}</select>
        <input class="input" id="sMin" type="number" placeholder="分钟" oninput="updateSportCal()">
        <input class="input" id="sCal" type="number" placeholder="千卡">
      </div>
      <div class="row" style="margin-bottom:8px">
        <input class="input" id="sDate" type="date" value="${key}" max="${today()}">
        <input class="input" id="sNote" placeholder="备注" style="flex:2">
      </div>
      <div class="row" style="margin-bottom:8px">
        <button class="btn" onclick="sportAdd()" style="flex:1 1 100%;width:100%">保存</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('scroll')}</span><span>运动记录 · ${key}</span></div>
      <div class="list">${listHtml || '<p class="card-hint">当天还没有运动记录</p>'}</div>
    </div>
  `;
}
window.sportAdd = function() {
  const type = $("#sType").value;
  const min = parseInt($("#sMin").value) || 0;
  const cal = parseInt($("#sCal").value) || 0;
  const date = $("#sDate").value || today();
  const note = $("#sNote").value.trim();
  if (!min) return alert("请填写时长");
  if (date > today()) return alert("不能记录未来的日期");
  const list = STORE.get("sport");
  list.push({ type, min, cal, date, note });
  STORE.set("sport", list);
  go("sport");
};
window.sportDel = function(i) {
  const list = STORE.get("sport");
  list.splice(i, 1);
  STORE.set("sport", list);
  go("sport");
};
window.updateSportCal = function() {
  const type = $("#sType").value;
  const min = parseInt($("#sMin").value) || 0;
  const rate = SPORT_CAL_RATES[type] || 5;
  const cal = Math.round(min * rate);
  const calInput = $("#sCal");
  if (calInput && cal > 0) calInput.value = cal;
};

// =================== 记账 ===================
function renderMoney() {
  const list = STORE.get("money");
  const moneyHas = {};
  (list || []).forEach(x => { if (x.date) moneyHas[x.date] = 1; });
  const key = moneyKey();
  const ym = key.slice(0, 7);

  const dayItems = list.filter(m => m.date === key);
  const dayIn = dayItems.filter(m => m.type === "income").reduce((s, x) => s + x.amount, 0);
  const dayOut = dayItems.filter(m => m.type === "expense").reduce((s, x) => s + x.amount, 0);
  const monthItems = list.filter(m => m.date.startsWith(ym));
  const monthIn = monthItems.filter(m => m.type === "income").reduce((s, x) => s + x.amount, 0);
  const monthOut = monthItems.filter(m => m.type === "expense").reduce((s, x) => s + x.amount, 0);

  const items = [];
  list.forEach((m, i) => { if (m.date === key) items.push({ m, i }); });
  items.reverse();
  const listHtml = items.map(({ m, i }) => {
    const isIn = m.type === "income";
    return `
      <div class="list-item">
        <div class="li-content">
          <div class="li-title">${escapeHtml(m.category)} · ${escapeHtml(m.note || "无备注")}</div>
          <div class="li-sub">${m.date}</div>
        </div>
        <div style="font-weight:700;color:${isIn ? "#3a8a3a" : "#c66"};font-size:14px">
          ${isIn ? "+" : "-"}${m.amount.toFixed(2)}
        </div>
        <button class="btn btn-sm btn-danger" onclick="moneyDel(${i})">删</button>
      </div>
    `;
  }).join("");

  return `
    <div class="card">
      ${buildCalendar({ sel: moneySel, prevFn: "moneyMonthStep(-1)", nextFn: "moneyMonthStep(1)", selectFn: "selectMoneyDay", hasMap: moneyHas, disableFuture: true })}
      <div class="card-title"><span class="icon">${ic('wallet')}</span><span>收支概览</span></div>
      <div class="dash-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="dash-card"><div class="dc-emoji">${ic('calendar')}</div><div class="dc-label">当日收入</div><div class="dc-num" style="color:#3a8a3a">+${dayIn.toFixed(2)}</div></div>
        <div class="dash-card"><div class="dc-emoji">${ic('calendar')}</div><div class="dc-label">当日支出</div><div class="dc-num" style="color:#c66">-${dayOut.toFixed(2)}</div></div>
        <div class="dash-card"><div class="dc-emoji">${ic('calendar')}</div><div class="dc-label">当月收入</div><div class="dc-num" style="color:#3a8a3a;font-size:16px">+${monthIn.toFixed(2)}</div></div>
        <div class="dash-card"><div class="dc-emoji">${ic('calendar')}</div><div class="dc-label">当月支出</div><div class="dc-num" style="color:#c66;font-size:16px">-${monthOut.toFixed(2)}</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('plus')}</span><span>记一笔</span></div>
      <div class="tabs tabs-compact" id="moneyTabs">
        <button class="tab active" data-type="expense">支出</button>
        <button class="tab" data-type="income">收入</button>
      </div>
      <div class="row" style="margin-bottom:8px">
        <input class="input" id="mAmount" type="number" step="0.01" placeholder="金额">
        <select class="select" id="mCategory"></select>
      </div>
      <div class="row" style="margin-bottom:8px">
        <input class="input" id="mDate" type="date" value="${key}" max="${today()}">
        <input class="input" id="mNote" placeholder="备注" style="flex:2">
      </div>
      <div class="row" style="margin-bottom:8px">
        <button class="btn" onclick="moneyAdd()" style="flex:1 1 100%;width:100%">保存</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('scroll')}</span><span>账单明细 · ${key}</span></div>
      <div class="list">${listHtml || '<p class="card-hint">当天还没有账单</p>'}</div>
    </div>
  `;
}

let currentMoneyType = "expense";
function updateMoneyCategory() {
  const sel = $("#mCategory");
  if (!sel) return;
  sel.innerHTML = DIET_CATEGORIES[currentMoneyType].map(c => `<option value="${c}">${c}</option>`).join("");
}
document.addEventListener("click", (e) => {
  if (e.target.closest("#moneyTabs .tab")) {
    const t = e.target;
    $$("#moneyTabs .tab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    currentMoneyType = t.dataset.type;
    updateMoneyCategory();
  }
});

window.moneyAdd = function() {
  const amount = parseFloat($("#mAmount").value);
  const category = $("#mCategory").value;
  const date = $("#mDate").value || today();
  const note = $("#mNote").value.trim();
  if (!amount) return alert("请输入金额");
  if (date > today()) return alert("不能记录未来的日期");
  const list = STORE.get("money");
  list.push({ type: currentMoneyType, amount, category, date, note });
  STORE.set("money", list);
  go("money");
};
window.moneyDel = function(i) {
  const list = STORE.get("money");
  list.splice(i, 1);
  STORE.set("money", list);
  go("money");
};

// 渲染记账页时初始化分类
const _origRenderMoney = renderMoney;
renderMoney = function() {
  const html = _origRenderMoney();
  setTimeout(updateMoneyCategory, 0);
  return html;
};
PAGES.money = renderMoney;

// =================== 备忘录 ===================
function renderMemo() {
  const list = STORE.get("memo");
  const listHtml = list.slice().reverse().map((m, i) => {
    const idx = list.length - 1 - i;
    return `
      <div class="list-item" style="flex-direction:column;align-items:stretch;cursor:pointer" onclick="memoEdit(${idx})">
        <div class="row">
          <div style="flex:1">
            <div class="li-title">${escapeHtml(m.title || "(无标题)")}</div>
            <div class="li-sub">${m.date}</div>
          </div>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();memoDel(${idx})">删</button>
        </div>
        <div style="margin-top:6px;font-size:12px;color:#4a5a3a;white-space:pre-wrap">${escapeHtml((m.content || "").slice(0, 200))}${(m.content||"").length > 200 ? "..." : ""}</div>
      </div>
    `;
  }).join("");

  return `
    <div class="card">
      <div class="card-title"><span class="icon">${ic('notebook')}</span><span>新建备忘录</span></div>
      <input class="input" id="memoTitle" placeholder="标题" style="margin-bottom:8px">
      <textarea class="textarea" id="memoContent" placeholder="内容..." style="min-height:100px"></textarea>
      <button class="btn btn-block" style="margin-top:8px" onclick="memoAdd()">保存</button>
    </div>
    <div class="card">
      <div class="card-title"><span class="icon">${ic('book')}</span><span>所有备忘录</span></div>
      <div class="list">${listHtml || '<p class="card-hint">还没有备忘录</p>'}</div>
    </div>
  `;
}
window.memoAdd = function() {
  const title = $("#memoTitle").value.trim();
  const content = $("#memoContent").value.trim();
  if (!title && !content) return alert("请填写标题或内容");
  const list = STORE.get("memo");
  list.push({ title, content, date: now() });
  STORE.set("memo", list);
  go("memo");
};
window.memoEdit = function(i) {
  const list = STORE.get("memo");
  const m = list[i];
  const title = prompt("修改标题", m.title || "");
  if (title === null) return;
  const content = prompt("修改内容", m.content || "");
  if (content === null) return;
  list[i] = { title, content, date: m.date };
  STORE.set("memo", list);
  go("memo");
};
window.memoDel = async function(i) {
  if (!(await appConfirm("删除该备忘录？"))) return;
  const list = STORE.get("memo");
  list.splice(i, 1);
  STORE.set("memo", list);
  go("memo");
};

// =================== 时政热点 ===================
function renderNews() {
  const todayCard = `
    <div class="card">
      <div class="card-title">
        <span class="icon">${ic('newspaper')}</span><span>今日时政动态</span>
        <button class="btn btn-sm btn-outline" style="margin-left:auto" onclick="refreshNews()">刷新</button>
      </div>
      <p class="card-hint" id="newsStatus" style="margin-bottom:8px">加载中…</p>
      <div class="list" id="newsList">
        <div class="card-hint">正在拉取今日时政动态…</div>
      </div>
    </div>
  `;

  const proxyCard = `
    <div class="card">
      <div class="card-title"><span class="icon">${ic('globe')}</span><span>数据来源（可选）</span></div>
      <p class="card-hint" style="margin-bottom:10px">填入你自建的新闻代理地址（如 https://xxx.workers.dev），即可每天稳定拉取最新时政、避免离线兜底。留空则使用内置多源。</p>
      <div class="row" style="margin-bottom:8px">
        <input class="input" id="nProxy" placeholder="https://你的代理地址" value="${escapeHtml(STORE.get('newsProxy') || '')}">
        <button class="btn" onclick="newsProxySave()">保存</button>
      </div>
    </div>
  `;

  const html = `
    ${todayCard}
    ${proxyCard}
  `;

  setTimeout(() => ensureNews(false), 0);
  return html;
}
window.newsProxySave = async function() {
  const el = $("#nProxy");
  const v = (el ? el.value : "").trim().replace(/\/+$/, "");
  STORE.set("newsProxy", v);
  if (v) {
    await appAlert("已保存代理地址，将优先用它每天拉取最新时政");
    ensureNews(true);
  } else {
    await appAlert("已清空，将使用内置多源拉取");
    ensureNews(true);
  }
};

// =================== 今日时政动态（每天推送 10 条） ===================
function renderNewsTodayList(items) {
  if (!items || !items.length) return '<p class="card-hint">暂无动态</p>';
  return items.map((it, i) => `
    <a class="list-item ai-news-item" href="${encodeURI(it.url || "#")}" target="_blank" rel="noopener">
      <div class="li-content">
        <div class="li-title">${i + 1}. ${escapeHtml(it.title)}</div>
        <div class="li-sub">${escapeHtml(it.source || "新闻")}${it.tag ? " · <span class=\"badge green\">" + escapeHtml(it.tag) + "</span>" : ""}${it.time ? " · " + (relTime(it.time) || it.time) : ""}</div>
      </div>
      <div class="li-action" style="color:#8B7EC7;font-size:18px">›</div>
    </a>
  `).join("");
}

async function fetchJsonWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, mode: "cors" });
    if (!res.ok) throw new Error("http " + res.status);
    return await res.json();
  } finally { clearTimeout(to); }
}

async function fetchTextWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, mode: "cors" });
    if (!res.ok) throw new Error("http " + res.status);
    return await res.text();
  } finally { clearTimeout(to); }
}

function parseRss(xmlText, sourceName) {
  try {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    return Array.from(doc.querySelectorAll("item")).map(it => ({
      title: (it.querySelector("title")?.textContent || "").trim(),
      url: (it.querySelector("link")?.textContent || "").trim(),
      source: sourceName,
      tag: (it.querySelector("category")?.textContent || "").trim() || "时政",
      time: (it.querySelector("pubDate")?.textContent || "").trim()
    }));
  } catch (e) { return []; }
}

// 多源容错：优先使用用户自建代理，失败再依次尝试不同代理/源，全部失败才走兜底
async function fetchNewsLive() {
  const proxy = STORE.get("newsProxy");
  if (proxy) {
    try {
      const data = await fetchJsonWithTimeout(proxy.replace(/\/+$/, "") + "/news", 10000);
      if (data && Array.isArray(data.items) && data.items.length) {
        return data.items
          .filter(it => it.title && it.title.length > 4)
          .slice(0, 10)
          .map(it => ({
            title: it.title,
            url: it.url || it.link || "",
            source: it.source || "代理",
            tag: it.tag || "时政",
            time: it.time || ""
          }));
      }
    } catch (e) { /* 代理失败，回退多源 */ }
  }
  const tries = [
    { type: "rss2json", name: "中国新闻网", feed: "https://www.chinanews.com.cn/rss/scroll-news.xml" },
    { type: "rss2json", name: "人民网", feed: "http://www.people.com.cn/rss/politics.xml" },
    { type: "allorigins", name: "人民网", feed: "http://www.people.com.cn/rss/politics.xml" },
    { type: "allorigins", name: "中国新闻网", feed: "https://www.chinanews.com.cn/rss/scroll-news.xml" }
  ];
  for (const s of tries) {
    try {
      let items = null;
      if (s.type === "rss2json") {
        const url = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(s.feed);
        const data = await fetchJsonWithTimeout(url, 9000);
        if (data && data.status === "ok") {
          items = (data.items || [])
            .filter(it => it.title && it.title.length > 4)
            .slice(0, 10)
            .map(it => ({
              title: it.title,
              url: it.link || it.guid,
              source: s.name,
              tag: (it.categories && it.categories[0]) || "时政",
              time: it.pubDate
            }));
        }
      } else {
        const url = "https://api.allorigins.win/raw?url=" + encodeURIComponent(s.feed);
        const xml = await fetchTextWithTimeout(url, 12000);
        items = parseRss(xml, s.name)
          .filter(it => it.title && it.title.length > 4)
          .slice(0, 10);
      }
      if (items && items.length) return items;
    } catch (e) { /* 尝试下一个源 */ }
  }
  return null;
}

async function ensureNews(force) {
  const box = $("#newsList");
  if (!box) return;
  const t = today();
  const cached = STORE.get("newsToday", null);
  if (!force && cached && cached.date === t && cached.items && cached.items.length) {
    box.innerHTML = renderNewsTodayList(cached.items);
    updateNewsStatus("今日已推送 " + cached.items.length + " 条 · " + t);
    return;
  }
  box.innerHTML = '<p class="card-hint">正在拉取今日时政动态…</p>';
  updateNewsStatus("更新中…");
  let items = null;
  try { items = await fetchNewsLive(); } catch (e) { items = null; }
  if (!items || !items.length) {
    items = DEFAULT_NEWS;
    STORE.set("newsToday", { date: t, items, offline: true });
    box.innerHTML = renderNewsTodayList(items) +
      '<p class="card-hint" style="margin-top:8px">（当前离线，已显示兜底内容；联网后点「刷新」获取最新）</p>';
    updateNewsStatus("今日已推送 " + items.length + " 条 · 离线兜底");
    return;
  }
  STORE.set("newsToday", { date: t, items });
  box.innerHTML = renderNewsTodayList(items);
  updateNewsStatus("今日已推送 " + items.length + " 条 · " + t);
}

function updateNewsStatus(txt) {
  const el = $("#newsStatus");
  if (el) el.textContent = txt;
}

window.refreshNews = function() {
  ensureNews(true);
};

// =================== 周总结 ===================
function renderWeekly() {
  const list = STORE.get("weekly");
  const listHtml = list.slice().reverse().map((w, i) => {
    const idx = list.length - 1 - i;
    return `
      <div class="list-item" style="flex-direction:column;align-items:stretch">
        <div class="row">
          <div style="flex:1">
            <div class="li-title">${escapeHtml(w.week)} · 完成 ${w.completed} 项任务</div>
            <div class="li-sub">运动 ${w.sportMin} min · ${w.weight > 0 ? "减重 " + w.weight : w.weight < 0 ? "增重 " + Math.abs(w.weight) : "体重无变化"} kg</div>
          </div>
          <button class="btn btn-sm btn-danger" onclick="weeklyDel(${idx})">删</button>
        </div>
        <div style="margin-top:6px;font-size:12px;color:#4a5a3a;white-space:pre-wrap">${escapeHtml(w.summary || "")}</div>
      </div>
    `;
  }).join("");

  return `
    <div class="card">
      <div class="card-title"><span class="icon">${ic('bar')}</span><span>本周数据预览</span></div>
      <div id="weekPreview"></div>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('edit')}</span><span>写周总结</span></div>
      <div class="row" style="margin-bottom:8px">
        <input class="input" id="wWeek" placeholder="如 2026年第30周">
        <input class="input" id="wWeight" type="number" step="0.1" placeholder="体重变化kg(涨为负)" style="max-width:140px">
      </div>
      <div id="wWeightHint" style="font-size:11px;color:#8E82A8;margin:-4px 0 8px"></div>
      <textarea class="textarea" id="wSummary" placeholder="本周收获、问题、下周计划..." style="min-height:100px"></textarea>
      <button class="btn btn-block" style="margin-top:8px" onclick="weeklyAdd()">保存</button>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('book')}</span><span>历史总结</span></div>
      <div class="list">${listHtml || '<p class="card-hint">还没有周总结</p>'}</div>
    </div>
  `;
}

const _origRenderWeekly = renderWeekly;
renderWeekly = function() {
  const html = _origRenderWeekly();
  setTimeout(renderWeekPreview, 0);
  return html;
};
PAGES.weekly = renderWeekly;

// 计算某周的体重变化：用“本周起点体重”对比“上周起点体重”（周同比）
// 起点体重优先取该周区间内的最早一条；若该周暂无记录，则取该周开始前最近一条
// 返回 { delta(正=减重 / 负=增重) } 或 null（无足够数据）
function weekWeightChange(ws, we) {
  const weight = STORE.get("weight") || [];
  if (!weight.length) return null;
  const prevStartDate = new Date(ws);
  prevStartDate.setDate(prevStartDate.getDate() - 7);
  const prevEndDate = new Date(prevStartDate);
  prevEndDate.setDate(prevEndDate.getDate() + 6);
  const pws = fmtDate(prevStartDate);
  const pwe = fmtDate(prevEndDate);

  const startOf = (start, end) => {
    const inRange = weight.filter(w => w.date >= start && w.date <= end).sort((a, b) => a.date.localeCompare(b.date));
    if (inRange.length) return inRange[0].value;
    const before = weight.filter(w => w.date < start).sort((a, b) => a.date.localeCompare(b.date));
    return before.length ? before[before.length - 1].value : null;
  };

  const thisStart = startOf(ws, we);
  const prevStart = startOf(pws, pwe);
  if (thisStart == null || prevStart == null) return null;
  const delta = +(prevStart - thisStart).toFixed(1);
  return { delta };
}

function renderWeekPreview() {
  const el = $("#weekPreview");
  if (!el) return;
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekStart = fmtDate(monday);
  const weekEnd = fmtDate(sunday);

  const tasksMap = STORE.get("tasksByDate") || {};
  const done = STORE.get("taskDone") || {};
  let doneCount = 0;
  for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
    const ds = fmtDate(d);
    const arr = tasksMap[ds] || [];
    doneCount += arr.filter(t => done[`${ds}_${t.id}`]).length;
  }
  const sport = STORE.get("sport").filter(s => s.date >= weekStart && s.date <= weekEnd);
  const sportMin = sport.reduce((s, x) => s + x.min, 0);
  const sportCal = sport.reduce((s, x) => s + x.cal, 0);
  const money = STORE.get("money").filter(m => m.date >= weekStart && m.date <= weekEnd);
  const income = money.filter(m => m.type === "income").reduce((s, x) => s + x.amount, 0);
  const expense = money.filter(m => m.type === "expense").reduce((s, x) => s + x.amount, 0);
  const ch = weekWeightChange(weekStart, weekEnd);
  let wDeltaText = "--";
  let wDeltaColor = "#888";
  if (ch) {
    if (ch.delta > 0) { wDeltaText = "减重 " + ch.delta + " kg"; wDeltaColor = "#3a8a3a"; }
    else if (ch.delta < 0) { wDeltaText = "增重 " + Math.abs(ch.delta) + " kg"; wDeltaColor = "#c0392b"; }
    else { wDeltaText = "无变化"; wDeltaColor = "#888"; }
  }

  el.innerHTML = `
    <div style="font-size:12px;color:#888;margin-bottom:8px">${weekStart} ~ ${weekEnd}</div>
    <div class="dash-grid" style="grid-template-columns: repeat(2, 1fr);">
      <div class="dash-card"><div class="dc-emoji">${ic('check')}</div><div class="dc-label">完成任务</div><div class="dc-num">${doneCount}</div></div>
      <div class="dash-card"><div class="dc-emoji">${ic('activity')}</div><div class="dc-label">运动时长</div><div class="dc-num">${sportMin} min</div></div>
      <div class="dash-card"><div class="dc-emoji">${ic('flame')}</div><div class="dc-label">运动消耗</div><div class="dc-num">${sportCal}</div></div>
      <div class="dash-card"><div class="dc-emoji">${ic('scale')}</div><div class="dc-label">体重变化</div><div class="dc-num" style="font-size:13px;color:${wDeltaColor}">${wDeltaText}</div></div>
      <div class="dash-card"><div class="dc-emoji">${ic('dollar')}</div><div class="dc-label">本周收入</div><div class="dc-num" style="color:#3a8a3a;font-size:15px">+${income.toFixed(0)}</div></div>
      <div class="dash-card"><div class="dc-emoji">${ic('trendDown')}</div><div class="dc-label">本周支出</div><div class="dc-num" style="color:#c66;font-size:15px">-${expense.toFixed(0)}</div></div>
    </div>
  `;
  // 自动填充“写周总结”里的体重变化（按现有约定：涨为负），减少手动填错正负号
  const wInput = $("#wWeight");
  if (wInput && !wInput.value.trim()) wInput.value = ch ? ch.delta : "";
  const wHint = $("#wWeightHint");
  if (wHint) wHint.textContent = ch ? ("本周自动计算：" + wDeltaText) : "暂无体重记录，可手动填写";
}

window.weeklyAdd = function() {
  const week = $("#wWeek").value.trim();
  const weight = parseFloat($("#wWeight").value) || 0;
  const summary = $("#wSummary").value.trim();
  if (!week) return alert("请填写周次");
  const list = STORE.get("weekly");
  const tasksMap = STORE.get("tasksByDate") || {};
  const done = STORE.get("taskDone") || {};
  let completed = 0;
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
    const ds = fmtDate(d);
    const arr = tasksMap[ds] || [];
    completed += arr.filter(t => done[`${ds}_${t.id}`]).length;
  }
  const sportMin = STORE.get("sport").filter(s => s.date >= fmtDate(monday) && s.date <= fmtDate(sunday)).reduce((s, x) => s + x.min, 0);
  list.push({ week, weight, summary, completed, sportMin });
  STORE.set("weekly", list);
  go("weekly");
};
window.weeklyDel = async function(i) {
  if (!(await appConfirm("删除该周总结？"))) return;
  const list = STORE.get("weekly");
  list.splice(i, 1);
  STORE.set("weekly", list);
  go("weekly");
};

// =================== 护肤记录 ===================
let skinViewY = null, skinViewM = null;
let skinSelDate = null;

function renderSkincare() {
  const list = STORE.get("skincare");
  const sel = skinSelDate || today();
  if (skinViewY === null) {
    const [yy, mm] = sel.split("-").map(Number);
    skinViewY = yy; skinViewM = mm - 1;
  }
  const y = skinViewY, m = skinViewM;
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startDay = first.getDay();
  const days = last.getDate();
  const now = new Date();
  const curY = now.getFullYear(), curM = now.getMonth(), curD = now.getDate();
  const monthStr = `${y}-${String(m + 1).padStart(2, "0")}`;
  const hasRec = new Set(list.filter(r => r.date.startsWith(monthStr)).map(r => Number(r.date.slice(8, 10))));
  const rec = list.find(r => r.date === sel);
  const morningDone = rec?.morning || [];
  const eveningDone = rec?.evening || [];

  let calCells = "";
  for (let i = 0; i < startDay; i++) calCells += `<div class="calendar-cell empty"></div>`;
  for (let i = 1; i <= days; i++) {
    const isToday = i === curD && y === curY && m === curM;
    const isSel = y === Number(sel.slice(0, 4)) && m === Number(sel.slice(5, 7)) - 1 && i === Number(sel.slice(8, 10));
    const cls = ["calendar-cell", isToday ? "today" : "", isSel ? "selected" : "", hasRec.has(i) ? "has-task" : ""].filter(Boolean).join(" ");
    calCells += `<div class="${cls}" onclick="skinPickDay(${i})">${i}</div>`;
  }

  const renderStep = (step, type) => {
    const isDone = (type === "morning" ? morningDone : eveningDone).includes(step);
    return `<div class="task-row ${isDone ? "done" : ""}">
      <div class="checkbox ${isDone ? "done" : ""}" onclick="skincareToggle('${type}','${step}')"></div>
      <div class="task-text">${step}</div>
    </div>`;
  };

  const morningHtml = SKINCARE_STEPS.morning.map(s => renderStep(s, "morning")).join("");
  const eveningHtml = SKINCARE_STEPS.evening.map(s => renderStep(s, "evening")).join("");

  return `
    <div class="card">
      <div class="card-title"><span class="icon">${ic('calendar')}</span><span>护肤日历</span></div>
      <div class="row" style="justify-content:space-between;margin-bottom:8px">
        <button class="btn btn-sm btn-outline" onclick="skinPrevMonth()">‹ 上月</button>
        <span style="text-align:center;font-size:14px;font-weight:700;color:#4A3E6B">${y}年${m + 1}月</span>
        <button class="btn btn-sm btn-outline" onclick="skinNextMonth()">下月 ›</button>
      </div>
      <div class="calendar-header"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>
      <div class="calendar-grid">${calCells}</div>
      <p class="card-hint">点击日期查看/编辑当日护肤 · 圆点表示当天有记录</p>
    </div>

    <div class="card">
      <div class="card-title"><span class="icon">${ic('sunrise')}</span><span>${sel} 早间护肤 (${morningDone.length}/${SKINCARE_STEPS.morning.length})</span></div>
      ${morningHtml}
    </div>
    <div class="card">
      <div class="card-title"><span class="icon">${ic('moon')}</span><span>${sel} 晚间护肤 (${eveningDone.length}/${SKINCARE_STEPS.evening.length})</span></div>
      ${eveningHtml}
    </div>
  `;
}
window.skinPickDay = function(d) {
  const y = skinViewY, m = skinViewM;
  skinSelDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  go("skincare");
};
window.skinPrevMonth = function() {
  if (skinViewM === 0) { skinViewM = 11; skinViewY--; } else skinViewM--;
  go("skincare");
};
window.skinNextMonth = function() {
  if (skinViewM === 11) { skinViewM = 0; skinViewY++; } else skinViewM++;
  go("skincare");
};
window.skincareToggle = function(type, step) {
  const tdy = skinSelDate || today();
  let list = STORE.get("skincare");
  let rec = list.find(r => r.date === tdy);
  if (!rec) {
    rec = { date: tdy, morning: [], evening: [] };
    list.push(rec);
  }
  const arr = rec[type];
  const i = arr.indexOf(step);
  if (i >= 0) arr.splice(i, 1);
  else arr.push(step);
  STORE.set("skincare", list);
  go("skincare");
};

// =================== 学英语 ===================
let wordMode = "word";
function renderWord() {
  const tab = `
    <div class="tabs" style="margin-bottom:12px">
      <button class="tab ${wordMode === "word" ? "active" : ""}" onclick="switchWordMode('word')">英语单词</button>
      <button class="tab ${wordMode === "oral" ? "active" : ""}" onclick="switchWordMode('oral')">英语口语</button>
      <button class="tab ${wordMode === "translate" ? "active" : ""}" onclick="switchWordMode('translate')">翻译</button>
    </div>`;
  if (wordMode === "oral") return tab + renderWordOral();
  if (wordMode === "translate") return tab + renderWordTranslate();
  return tab + renderWordBody();
}
window.switchWordMode = function(mode) {
  wordMode = mode;
  go("word");
};
function renderWordBody() {
  const wp = STORE.get("wordProgress");
  const list = DEFAULT_WORDS;
  const idx = wp.current || 0;
  const w = list[idx];
  if (!w) return `<div class="card"><p>词库为空</p></div>`;
  const known = wp.known || [];
  const learnedCount = known.length;
  const total = list.length;
  const pct = (learnedCount / total * 100).toFixed(0);
  const isKnown = known.includes(idx);

  return `
    <div class="card">
      <div class="card-title"><span class="icon">${ic('bookOpen')}</span><span>单词学习进度</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span>已掌握 ${learnedCount} / ${total}</span>
        <span>${pct}%</span>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
    </div>

    <div class="word-card" onclick="wordFlip()">
      <div style="display:flex;align-items:center;justify-content:center;gap:10px">
        <div class="word-en" id="wordEn" style="margin:0">${w.en}</div>
        <button class="word-speak" onclick="wordSpeak(event)" aria-label="朗读单词" title="朗读单词">${ic('volume', 'md')}</button>
      </div>
      <div class="word-phonetic">${w.phonetic}</div>
      <div class="word-cn" id="wordCn" style="display:none">${w.cn}</div>
      <div class="word-example" id="wordEx" style="display:none">${w.example}</div>
      <p class="card-hint" style="margin-top:8px">点击卡片显示释义</p>
    </div>

    <div class="card">
      <div class="row" style="flex-wrap:nowrap;gap:10px;margin-bottom:14px">
        <button class="btn btn-outline" style="flex:1;min-width:0;height:40px;padding:0 10px;font-size:13px" onclick="wordPrev()">← 上一个</button>
        <button class="btn btn-outline" style="flex:1;min-width:0;height:40px;padding:0 10px;font-size:13px" onclick="wordNext()">下一个 →</button>
      </div>
      <div class="row" style="flex-wrap:nowrap;gap:10px">
        <button class="btn" style="flex:1;min-width:0;height:40px;padding:0 10px;font-size:13px;background:${isKnown ? "#EDE4FF" : "#8B7EC7"};color:${isKnown ? "#8B7EC7" : "#fff"}" onclick="wordKnow()">
          ${isKnown ? ic("check") + " 已掌握" : "标记掌握"}
        </button>
        <button class="btn btn-outline" style="flex:1;min-width:0;height:40px;padding:0 10px;font-size:13px" onclick="wordReset()">重置进度</button>
      </div>
    </div>
  `;
}
function renderWordOral() {
  const op = STORE.get("oralProgress") || { current: 0, known: [] };
  const list = DEFAULT_ORAL;
  const idx = op.current || 0;
  const s = list[idx];
  if (!s) return `<div class="card"><p>口语库为空</p></div>`;
  const known = op.known || [];
  const learnedCount = known.length;
  const total = list.length;
  const pct = (learnedCount / total * 100).toFixed(0);
  const isKnown = known.includes(idx);

  return `
    <div class="card">
      <div class="card-title"><span class="icon">${ic('chat')}</span><span>口语练习进度</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span>已练熟 ${learnedCount} / ${total}</span>
        <span>${pct}%</span>
      </div>
      <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
    </div>

    <div class="word-card oral-card" onclick="oralFlip()">
      <div style="display:flex;align-items:flex-start;justify-content:center;gap:10px">
        <div class="word-en" id="oralEn" style="margin:0">${s.en}</div>
        <button class="word-speak" onclick="oralSpeak(event)" aria-label="朗读句子" title="朗读句子">${ic('volume', 'md')}</button>
      </div>
      <div class="word-cn" id="oralCn" style="display:none;font-size:18px;color:#7E70BC;margin-top:10px;font-weight:600">${s.cn}</div>
      <p class="card-hint" style="margin-top:8px">点击卡片显示中文</p>
    </div>

    <div class="card">
      <div class="row" style="flex-wrap:nowrap;gap:10px;margin-bottom:14px">
        <button class="btn btn-outline" style="flex:1;min-width:0;height:40px;padding:0 10px;font-size:13px" onclick="oralPrev()">← 上一个</button>
        <button class="btn btn-outline" style="flex:1;min-width:0;height:40px;padding:0 10px;font-size:13px" onclick="oralNext()">下一个 →</button>
      </div>
      <div class="row" style="flex-wrap:nowrap;gap:10px">
        <button class="btn" style="flex:1;min-width:0;height:40px;padding:0 10px;font-size:13px;background:${isKnown ? "#EDE4FF" : "#8B7EC7"};color:${isKnown ? "#8B7EC7" : "#fff"}" onclick="oralKnow()">
          ${isKnown ? ic("check") + " 已练熟" : "标记练熟"}
        </button>
        <button class="btn btn-outline" style="flex:1;min-width:0;height:40px;padding:0 10px;font-size:13px" onclick="oralReset()">重置进度</button>
      </div>
    </div>
  `;
}
function renderWordTranslate() {
  return `
    <div class="card">
      <div class="card-title"><span class="icon">${ic('globe')}</span><span>中英互译</span></div>
      <p class="card-hint" style="margin-bottom:10px">输入中文或英文，自动翻译为另一种语言（联网翻译）</p>
      <div class="row" style="margin-bottom:8px">
        <select class="select" id="trDir" onchange="translateText()">
          <option value="zh-en">中文 → 英文</option>
          <option value="en-zh">英文 → 中文</option>
        </select>
      </div>
      <textarea id="trInput" class="input" rows="3" placeholder="输入要翻译的内容…" style="width:100%;resize:vertical;font-size:13px;line-height:1.5;font-family:inherit"></textarea>
      <button class="btn" style="width:100%;margin-top:10px;height:42px;font-size:15px" onclick="translateText()">翻译</button>
      <div id="trResult" style="margin-top:12px"></div>
    </div>
  `;
}

const LOCAL_TRANSLATIONS = {
  "zh-en": {
    "我爱你": "I love you",
    "我恨你": "I hate you",
    "你好": "Hello",
    "你好吗": "How are you",
    "谢谢": "Thank you",
    "对不起": "Sorry",
    "再见": "Goodbye",
    "早上好": "Good morning",
    "晚上好": "Good evening",
    "晚安": "Good night",
    "试题": "test questions",
    "考试": "exam",
    "老师": "teacher",
    "学生": "student",
    "作业": "homework",
    "课本": "textbook",
    "学习": "study",
    "单词": "word",
    "句子": "sentence",
    "翻译": "translation",
    "练习": "practice",
    "错误": "mistake",
    "正确答案": "correct answer",
    "问题": "question",
    "答案": "answer",
    "苹果": "apple",
    "香蕉": "banana",
    "水": "water",
    "书": "book",
    "笔": "pen",
    "电脑": "computer",
    "手机": "phone",
    "朋友": "friend",
    "家庭": "family",
    "工作": "work",
    "时间": "time",
    "今天": "today",
    "明天": "tomorrow",
    "昨天": "yesterday",
    "加油": "come on",
    "努力": "work hard",
    "开心": "happy",
    "难过": "sad"
  },
  "en-zh": {
    "i love you": "我爱你",
    "i hate you": "我恨你",
    "hello": "你好",
    "how are you": "你好吗",
    "thank you": "谢谢",
    "sorry": "对不起",
    "goodbye": "再见",
    "good morning": "早上好",
    "good evening": "晚上好",
    "good night": "晚安",
    "test": "测试",
    "exam": "考试",
    "teacher": "老师",
    "student": "学生",
    "homework": "作业",
    "study": "学习",
    "word": "单词",
    "sentence": "句子",
    "translation": "翻译",
    "practice": "练习",
    "question": "问题",
    "answer": "答案",
    "apple": "苹果",
    "banana": "香蕉",
    "water": "水",
    "book": "书",
    "pen": "笔",
    "computer": "电脑",
    "phone": "手机",
    "friend": "朋友",
    "family": "家庭",
    "work": "工作",
    "time": "时间",
    "today": "今天",
    "tomorrow": "明天",
    "yesterday": "昨天",
    "happy": "开心",
    "sad": "难过"
  }
};

function renderTranslateResult(txt, dir, sourceLabel) {
  const lang = dir === "zh-en" ? "en-US" : "zh-CN";
  const label = sourceLabel || "MyMemory";
  return `
    <div class="word-card translate-result-card" style="margin-bottom:0;cursor:default">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="flex:1;text-align:left;word-break:break-word;font-size:18px;line-height:1.5;color:#3D3151;font-weight:600">${escapeHtml(txt)}</div>
        <button class="word-speak" style="flex:0 0 auto" onclick="speakTr(event)" aria-label="朗读翻译" title="朗读翻译">${ic('volume', 'md')}</button>
      </div>
    </div>
    <div id="trSpoken" data-lang="${lang}" style="display:none">${escapeHtml(txt)}</div>
    <p class="card-hint" style="margin-top:8px">翻译结果仅供参考（${escapeHtml(label)}）</p>`;
}

async function fetchWithTimeout(url, ms) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseMyMemory(data) {
  const strip = s => String(s || "").replace(/<[^>]+>/g, "").trim();
  const matches = Array.isArray(data.matches) ? data.matches : [];
  // 优先取神经网络(neural)翻译，质量通常更准
  const neural = matches
    .filter(m => m && m.model === "neural" && strip(m.translation))
    .sort((a, b) => (parseFloat(b.quality) || 0) - (parseFloat(a.quality) || 0));
  if (neural.length) return strip(neural[0].translation);
  // 其次用主结果（众包 TMM）
  const main = data && data.responseData ? strip(data.responseData.translatedText) : "";
  if (main) return main;
  // 最后兜底任意匹配项
  const any = matches.find(m => m && strip(m.translation));
  return any ? strip(any.translation) : "";
}

async function fetchMyMemory(src, dir) {
  const pair = dir === "zh-en" ? "zh-CN|en" : "en|zh-CN";
  const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(src) + "&langpair=" + pair;
  const r = await fetchWithTimeout(url, 8000);
  if (!r.ok) throw new Error("HTTP " + r.status);
  const data = await r.json();
  const txt = parseMyMemory(data);
  if (txt) return { txt: txt, source: "MyMemory" };
  const detail = data && data.responseDetails ? String(data.responseDetails) : "未知错误";
  throw new Error(detail);
}

window.translateText = async function () {
  const srcEl = $("#trInput");
  const dirEl = $("#trDir");
  const resEl = $("#trResult");
  if (!resEl) return;
  const src = (srcEl ? srcEl.value : "").trim();
  const dir = dirEl ? dirEl.value : "zh-en";
  if (!src) {
    resEl.innerHTML = '<p class="card-hint">请输入要翻译的内容</p>';
    return;
  }

  // 本地优先：常见基础词/句直接返回，避免众包数据被污染
  const localMap = LOCAL_TRANSLATIONS[dir];
  const localKey = dir === "en-zh" ? src.toLowerCase() : src;
  if (localMap && localMap[localKey]) {
    resEl.innerHTML = renderTranslateResult(localMap[localKey], dir, "本地");
    return;
  }

  resEl.innerHTML = '<p class="card-hint">翻译中…</p>';
  try {
    const result = await fetchMyMemory(src, dir);
    resEl.innerHTML = renderTranslateResult(result.txt, dir, result.source);
  } catch (e) {
    const msg = e && e.name === "AbortError" ? "翻译超时，请稍后重试" : "翻译失败，请检查网络是否可用";
    resEl.innerHTML = '<p class="card-hint" style="color:#c0392b">' + msg + '</p>';
  }
};

window.speakTr = function (ev) {
  if (ev) ev.stopPropagation();
  const el = $("#trSpoken");
  if (!el) return;
  const lang = el.getAttribute("data-lang") || "en-US";
  window.speechSynthesis && window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(el.textContent);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis && window.speechSynthesis.speak(u);
};

window.oralFlip = function() {
  const cn = $("#oralCn");
  cn.style.display = cn.style.display === "none" ? "block" : "none";
};
window.oralNext = function() {
  const op = STORE.get("oralProgress") || { current: 0, known: [] };
  op.current = (op.current + 1) % DEFAULT_ORAL.length;
  STORE.set("oralProgress", op);
  go("word");
};
window.oralPrev = function() {
  const op = STORE.get("oralProgress") || { current: 0, known: [] };
  op.current = (op.current - 1 + DEFAULT_ORAL.length) % DEFAULT_ORAL.length;
  STORE.set("oralProgress", op);
  go("word");
};
window.oralKnow = function() {
  const op = STORE.get("oralProgress") || { current: 0, known: [] };
  const idx = op.current;
  const known = op.known || [];
  const i = known.indexOf(idx);
  if (i >= 0) known.splice(i, 1);
  else known.push(idx);
  op.known = known;
  STORE.set("oralProgress", op);
  go("word");
};
window.oralReset = async function() {
  if (!(await appConfirm("重置所有口语练习进度？"))) return;
  STORE.set("oralProgress", { current: 0, known: [] });
  go("word");
};
window.oralSpeak = function(ev) {
  if (ev) ev.stopPropagation();
  const op = STORE.get("oralProgress") || { current: 0, known: [] };
  const s = DEFAULT_ORAL[op.current || 0];
  if (!s || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(s.en);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch (e) { /* 忽略不支持的环境 */ }
};
window.wordFlip = function() {
  $("#wordCn").style.display = $("#wordCn").style.display === "none" ? "block" : "none";
  $("#wordEx").style.display = $("#wordEx").style.display === "none" ? "block" : "none";
};
window.wordNext = function() {
  const wp = STORE.get("wordProgress");
  wp.current = (wp.current + 1) % DEFAULT_WORDS.length;
  STORE.set("wordProgress", wp);
  go("word");
};
window.wordPrev = function() {
  const wp = STORE.get("wordProgress");
  wp.current = (wp.current - 1 + DEFAULT_WORDS.length) % DEFAULT_WORDS.length;
  STORE.set("wordProgress", wp);
  go("word");
};
window.wordKnow = function() {
  const wp = STORE.get("wordProgress");
  const idx = wp.current;
  const known = wp.known || [];
  const i = known.indexOf(idx);
  if (i >= 0) known.splice(i, 1);
  else known.push(idx);
  wp.known = known;
  STORE.set("wordProgress", wp);
  go("word");
};
window.wordReset = async function() {
  if (!(await appConfirm("重置所有背单词进度？"))) return;
  STORE.set("wordProgress", { current: 0, known: [] });
  go("word");
};

window.wordSpeak = function(ev) {
  if (ev) ev.stopPropagation();
  const wp = STORE.get("wordProgress");
  const w = DEFAULT_WORDS[wp.current || 0];
  if (!w || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(w.en);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch (e) { /* 忽略不支持的环境 */ }
};

// =================== 工具：转义 HTML ===================
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// 解码 RSS 标题里残留的 HTML 实体（&amp; &#8217; 等）
function decodeEntities(s) {
  const txt = document.createElement("textarea");
  txt.innerHTML = String(s || "");
  return txt.value.replace(/\s+/g, " ").trim();
}

// =================== 启动 ===================
go("dashboard");

// iOS PWA 中键盘收起后自动回滚到顶部，防止状态栏与页面顶部内容重叠
if ("standalone" in navigator && navigator.standalone) {
  document.addEventListener("focusout", () => {
    setTimeout(() => {
      window.scrollTo(0, 0);
      if (document.body) document.body.scrollTop = 0;
      if (document.documentElement) document.documentElement.scrollTop = 0;
    }, 60);
  });
}
