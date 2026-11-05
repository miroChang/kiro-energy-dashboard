/* ==============================================
   智慧能源管理儀表板 — 主程式
   ============================================== */

/* ----------------------------------------------
   模擬資料
   ---------------------------------------------- */
const mockData = {
  /* 今日用電量（kWh）；改為 520 可觸發超標警示 */
  todayUsage: 342,

  /* 本月累計用電量（kWh） */
  monthUsage: 8750,

  /* 碳排放換算係數（kg CO₂ / kWh） */
  carbonFactor: 0.502,

  /* 今日用電量超標閾值（kWh） */
  alertThreshold: 500,

  /* 過去 7 天每日用電量 */
  weeklyUsage: [
    { date: '10/30', usage: 410 },
    { date: '10/31', usage: 380 },
    { date: '11/01', usage: 520 },
    { date: '11/02', usage: 295 },
    { date: '11/03', usage: 460 },
    { date: '11/04', usage: 390 },
    { date: '11/05', usage: 342 },
  ],

  /* 設備狀態清單 */
  devices: [
    { name: '中央空調主機 A',  status: 'normal',  updatedAt: '2026-11-05 08:00' },
    { name: '中央空調主機 B',  status: 'warning', updatedAt: '2026-11-05 07:45' },
    { name: '伺服器機房冷卻',  status: 'normal',  updatedAt: '2026-11-05 08:00' },
    { name: '生產線電力系統', status: 'error',   updatedAt: '2026-11-05 06:30' },
    { name: '照明控制系統',   status: 'normal',  updatedAt: '2026-11-05 08:00' },
    { name: '太陽能逆變器',   status: 'warning', updatedAt: '2026-11-05 07:10' },
  ],
};

/* 狀態對應的中文標籤 */
const STATUS_LABEL = {
  normal:  '正常',
  warning: '警告',
  error:   '異常',
};

/* ----------------------------------------------
   工具函式：安全建立 SVG 元素
   ---------------------------------------------- */
function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/* ----------------------------------------------
   功能一 & 二：渲染摘要卡片
   ---------------------------------------------- */
function renderCards() {
  const { todayUsage, monthUsage, carbonFactor, alertThreshold } = mockData;

  /* 今日用電量 */
  document.getElementById('today-usage').textContent = todayUsage.toLocaleString();

  /* 超標警示 */
  const cardToday = document.getElementById('card-today');
  const todayNote = document.getElementById('today-note');
  if (todayUsage > alertThreshold) {
    cardToday.classList.add('card--alert');
    todayNote.textContent = `⚠ 已超過警示閾值（${alertThreshold} kWh）`;
  } else {
    cardToday.classList.remove('card--alert');
    todayNote.textContent = `尚在安全範圍（閾值：${alertThreshold} kWh）`;
  }

  /* 本月累計用電量 */
  document.getElementById('month-usage').textContent = monthUsage.toLocaleString();

  /* 預估碳排放：四捨五入至整數 */
  const carbon = Math.round(monthUsage * carbonFactor);
  document.getElementById('carbon-emission').textContent = carbon.toLocaleString();
}

/* ----------------------------------------------
   功能三：繪製 SVG 折線趨勢圖
   ---------------------------------------------- */
function renderChart() {
  const svg = document.getElementById('trend-chart');

  /* 清除佔位文字 */
  svg.innerHTML = '';

  const data = mockData.weeklyUsage;
  const count = data.length;

  /* 圖表區域邊距（留給座標軸標籤） */
  const MARGIN = { top: 20, right: 20, bottom: 36, left: 52 };
  const VIEW_W = 700;
  const VIEW_H = 240;
  const chartW = VIEW_W - MARGIN.left - MARGIN.right;
  const chartH = VIEW_H - MARGIN.top - MARGIN.bottom;

  /* 計算 Y 軸範圍：最大值取整至下一個百位 */
  const maxUsage = Math.max(...data.map(d => d.usage));
  const yMax = Math.ceil(maxUsage / 100) * 100;
  const yStep = yMax / 4; /* 4 個刻度 */

  /* 座標換算：toFixed(2) 避免浮點數過長污染 SVG 屬性 */
  function xPos(i) {
    return (MARGIN.left + (i / (count - 1)) * chartW).toFixed(2);
  }
  function yPos(val) {
    return (MARGIN.top + chartH - (val / yMax) * chartH).toFixed(2);
  }

  /* --- 繪製群組 --- */
  const g = svgEl('g', {});

  /* Y 軸網格線與刻度 */
  for (let i = 0; i <= 4; i++) {
    const val = i * yStep;
    const y = yPos(val);

    /* 水平網格線 */
    g.appendChild(svgEl('line', {
      class: 'axis-line',
      x1: MARGIN.left, y1: y,
      x2: MARGIN.left + chartW, y2: y,
    }));

    /* Y 軸刻度文字 */
    const labelY = svgEl('text', {
      x: MARGIN.left - 8,
      y: y + 4,
      'text-anchor': 'end',
    });
    labelY.textContent = val;
    g.appendChild(labelY);
  }

  /* Y 軸單位標籤：放在 Y 軸左側中間，旋轉 90 度 */
  const unitLabel = svgEl('text', {
    x: 10,
    y: MARGIN.top + chartH / 2,
    'text-anchor': 'middle',
    'font-size': '11',
    transform: `rotate(-90, 10, ${MARGIN.top + chartH / 2})`,
  });
  unitLabel.textContent = 'kWh';
  g.appendChild(unitLabel);

  /* X 軸基準線 */
  g.appendChild(svgEl('line', {
    class: 'axis-line',
    x1: MARGIN.left, y1: MARGIN.top + chartH,
    x2: MARGIN.left + chartW, y2: MARGIN.top + chartH,
    'stroke-width': '1.5',
  }));

  /* 填色區域（折線下方） */
  const areaPoints =
    data.map((d, i) => `${xPos(i)},${yPos(d.usage)}`).join(' ') +
    ` ${xPos(count - 1)},${MARGIN.top + chartH} ${xPos(0)},${MARGIN.top + chartH}`;
  g.appendChild(svgEl('polygon', {
    class: 'chart-area',
    points: areaPoints,
  }));

  /* 折線 */
  const linePoints = data.map((d, i) => `${xPos(i)},${yPos(d.usage)}`).join(' ');
  g.appendChild(svgEl('polyline', {
    class: 'chart-line',
    points: linePoints,
  }));

  /* X 軸標籤 + 資料點 */
  data.forEach((d, i) => {
    const cx = xPos(i);
    const cy = yPos(d.usage);

    /* 資料點圓形 */
    const circle = svgEl('circle', {
      class: 'data-point',
      cx, cy, r: 4.5,
    });
    /* 懸停提示 */
    const title = svgEl('title', {});
    title.textContent = `${d.date}：${d.usage} kWh`;
    circle.appendChild(title);
    g.appendChild(circle);

    /* X 軸日期標籤 */
    const labelX = svgEl('text', {
      x: cx,
      y: MARGIN.top + chartH + 18,
      'text-anchor': 'middle',
    });
    labelX.textContent = d.date;
    g.appendChild(labelX);
  });

  svg.appendChild(g);
}

/* ----------------------------------------------
   功能四：渲染設備狀態列表
   ---------------------------------------------- */
function renderDevices() {
  const tbody = document.getElementById('device-list');
  tbody.innerHTML = '';

  mockData.devices.forEach(device => {
    const tr = document.createElement('tr');

    /* 設備名稱欄 */
    const tdName = document.createElement('td');
    tdName.textContent = device.name;

    /* 狀態標籤欄 */
    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge badge--${device.status}`;
    badge.textContent = STATUS_LABEL[device.status] ?? device.status;
    tdStatus.appendChild(badge);

    /* 最後更新時間欄 */
    const tdTime = document.createElement('td');
    tdTime.textContent = device.updatedAt;

    tr.appendChild(tdName);
    tr.appendChild(tdStatus);
    tr.appendChild(tdTime);
    tbody.appendChild(tr);
  });
}

/* ----------------------------------------------
   功能四：檢查異常設備並顯示提醒橫幅
   ---------------------------------------------- */
function checkAlerts() {
  const errorDevices = mockData.devices.filter(d => d.status === 'error');

  if (errorDevices.length === 0) return;

  const banner = document.getElementById('alert-banner');
  const message = document.getElementById('alert-message');

  const names = errorDevices.map(d => d.name).join('、');
  message.textContent =
    `⚠ 警告：目前有 ${errorDevices.length} 台設備發生異常（${names}），請立即檢查。`;

  banner.classList.remove('hidden');
}

/* ----------------------------------------------
   功能四：綁定橫幅關閉按鈕
   ---------------------------------------------- */
function initAlertClose() {
  document.getElementById('alert-close').addEventListener('click', () => {
    document.getElementById('alert-banner').classList.add('hidden');
  });
}

/* ----------------------------------------------
   進入點：DOM 載入完成後依序執行
   ---------------------------------------------- */
document.addEventListener('DOMContentLoaded', function init() {
  renderCards();     /* 摘要卡片（功能一、二） */
  renderChart();     /* SVG 趨勢圖（功能三）   */
  renderDevices();   /* 設備狀態列表（功能四）  */
  checkAlerts();     /* 異常提醒橫幅（功能四）  */
  initAlertClose();  /* 關閉按鈕事件            */
});
