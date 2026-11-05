# 智慧能源管理儀表板 — 設計文件

## 1. 檔案結構

```
docs/
  index.html   ← 唯一 HTML 頁面，包含所有結構
  styles.css   ← 全域樣式、元件樣式、響應式排版
  app.js       ← 模擬資料、DOM 操作、SVG 圖表繪製
```

所有資源使用相對路徑引用，不引入任何外部套件或 CDN。

---

## 2. 頁面整體佈局

```
┌─────────────────────────────────────────────┐
│  [異常提醒橫幅（若有異常設備則顯示）]           │
├─────────────────────────────────────────────┤
│  頁首 Header                                 │
│  智慧能源管理儀表板                            │
├─────────────────────────────────────────────┤
│  摘要卡片列（Summary Cards）                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │今日用電量 │ │本月用電量 │ │預估碳排放 │    │
│  └──────────┘ └──────────┘ └──────────┘    │
├─────────────────────────────────────────────┤
│  能源趨勢圖（SVG 折線圖）                      │
│  過去 7 天每日用電量                           │
├─────────────────────────────────────────────┤
│  設備狀態列表                                 │
│  設備名稱 ｜ 狀態標籤 ｜ 最後更新時間           │
├─────────────────────────────────────────────┤
│  頁尾 Footer                                 │
└─────────────────────────────────────────────┘
```

---

## 3. 元件設計

### 3.1 異常提醒橫幅（Alert Banner）

- 位於頁面最頂部，預設隱藏（`display: none`）
- 當模擬資料中存在狀態為「異常」的設備時，由 `app.js` 動態顯示
- 內容格式：「⚠ 警告：目前有 N 台設備發生異常，請立即檢查。」
- 右側提供「✕」關閉按鈕，點擊後將橫幅隱藏
- 樣式：背景紅色，白色文字

```html
<!-- 結構示意 -->
<div id="alert-banner" class="alert-banner hidden">
  <span id="alert-message"></span>
  <button id="alert-close">✕</button>
</div>
```

---

### 3.2 摘要卡片（Summary Card）

共三張卡片，以 CSS Flexbox 或 Grid 水平排列，小螢幕自動換行。

| 卡片 | 標題 | 數值來源 | 單位 | 警示條件 |
|------|------|----------|------|----------|
| 今日用電量 | 今日用電量 | `mockData.todayUsage` | kWh | > 500 kWh 時卡片變橘紅色 |
| 本月用電量 | 本月累計用電量 | `mockData.monthUsage` | kWh | 無 |
| 預估碳排放量 | 本月預估碳排放 | `monthUsage × 0.502` | kg CO₂ | 無 |

碳排放卡片底部顯示小字說明：「換算係數：0.502 kg CO₂/kWh」

```html
<!-- 結構示意 -->
<section class="cards-container">
  <div class="card" id="card-today">
    <h2 class="card-title">今日用電量</h2>
    <p class="card-value"><span id="today-usage">--</span> kWh</p>
  </div>
  <div class="card" id="card-month">
    <h2 class="card-title">本月累計用電量</h2>
    <p class="card-value"><span id="month-usage">--</span> kWh</p>
  </div>
  <div class="card" id="card-carbon">
    <h2 class="card-title">本月預估碳排放</h2>
    <p class="card-value"><span id="carbon-emission">--</span> kg CO₂</p>
    <p class="card-note">換算係數：0.502 kg CO₂/kWh</p>
  </div>
</section>
```

---

### 3.3 能源使用趨勢圖（SVG 折線圖）

- 使用原生 **SVG** 繪製，由 `app.js` 動態產生 SVG 元素
- 呈現過去 7 天每日用電量
- 圖表尺寸：寬 100%（響應式），高固定 240px
- 包含元素：
  - X 軸：日期標籤（MM/DD）
  - Y 軸：用電量刻度（kWh）
  - 折線：連接各日資料點
  - 資料點：圓形標記，滑鼠懸停顯示數值（`<title>` 提示）
  - 填色區域：折線下方淡藍色填色，增加可讀性

```html
<!-- 結構示意 -->
<section class="chart-section">
  <h2>能源使用趨勢（過去 7 天）</h2>
  <svg id="trend-chart" width="100%" height="240"
       viewBox="0 0 700 240" preserveAspectRatio="xMidYMid meet">
    <!-- 由 app.js 動態填入 -->
  </svg>
</section>
```

#### SVG 繪製邏輯（app.js 實作要點）

1. 取得模擬資料陣列 `mockData.weeklyUsage`（7 筆）
2. 計算最大值，等比例映射 Y 座標（留上下邊距）
3. 等分 X 座標（留左右邊距）
4. 建立 `<polyline>` 繪製折線，`<polygon>` 繪製填色區域
5. 以 `<text>` 繪製 X 軸日期與 Y 軸刻度標籤
6. 以 `<circle>` 加上 `<title>` 繪製資料點提示

---

### 3.4 設備狀態列表（Device Status List）

- 以 HTML `<table>` 呈現，欄位：設備名稱、狀態、最後更新時間
- 狀態欄以色彩標籤（`<span class="badge badge--{status}">`）顯示

| 狀態值 | 中文標籤 | 標籤顏色 |
|--------|----------|----------|
| `normal` | 正常 | 綠色 `#27ae60` |
| `warning` | 警告 | 橘色 `#f39c12` |
| `error` | 異常 | 紅色 `#e74c3c` |

```html
<!-- 結構示意 -->
<section class="device-section">
  <h2>設備狀態</h2>
  <table class="device-table">
    <thead>
      <tr>
        <th>設備名稱</th>
        <th>狀態</th>
        <th>最後更新時間</th>
      </tr>
    </thead>
    <tbody id="device-list">
      <!-- 由 app.js 動態填入 -->
    </tbody>
  </table>
</section>
```

---

## 4. 模擬資料結構（app.js）

```javascript
const mockData = {
  // 今日用電量（kWh）
  todayUsage: 342,

  // 本月累計用電量（kWh）
  monthUsage: 8750,

  // 碳排放換算係數
  carbonFactor: 0.502,

  // 過去 7 天每日用電量
  weeklyUsage: [
    { date: '10/30', usage: 410 },
    { date: '10/31', usage: 380 },
    { date: '11/01', usage: 520 },
    { date: '11/02', usage: 295 },
    { date: '11/03', usage: 460 },
    { date: '11/04', usage: 390 },
    { date: '11/05', usage: 342 },
  ],

  // 設備狀態清單
  devices: [
    { name: '中央空調主機 A',  status: 'normal',  updatedAt: '2026-11-05 08:00' },
    { name: '中央空調主機 B',  status: 'warning', updatedAt: '2026-11-05 07:45' },
    { name: '伺服器機房冷卻',  status: 'normal',  updatedAt: '2026-11-05 08:00' },
    { name: '生產線電力系統', status: 'error',   updatedAt: '2026-11-05 06:30' },
    { name: '照明控制系統',   status: 'normal',  updatedAt: '2026-11-05 08:00' },
    { name: '太陽能逆變器',   status: 'warning', updatedAt: '2026-11-05 07:10' },
  ],
};
```

---

## 5. 樣式設計規範（styles.css）

### 色彩系統

| 用途 | 色碼 |
|------|------|
| 主色（深藍） | `#1a2b4a` |
| 強調色（藍） | `#2980b9` |
| 背景色 | `#f4f6f9` |
| 卡片背景 | `#ffffff` |
| 警示橘 | `#e67e22` |
| 異常紅 | `#e74c3c` |
| 正常綠 | `#27ae60` |
| 警告橘 | `#f39c12` |
| 文字主色 | `#2c3e50` |
| 文字次色 | `#7f8c8d` |

### 排版

- 使用系統字型堆疊：`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- 卡片陰影：`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
- 卡片圓角：`border-radius: 8px`
- 內距：卡片 `padding: 24px`，頁面側邊距 `max-width: 1200px; margin: 0 auto; padding: 0 16px`

### 響應式

- 卡片區塊：使用 CSS Grid，`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`
- 設備表格：小螢幕（< 600px）允許水平捲動

---

## 6. JavaScript 模組職責（app.js）

| 函式名稱 | 說明 |
|----------|------|
| `renderCards()` | 將 mockData 寫入卡片數值；今日用電量超標時加上警示 class |
| `renderChart()` | 依 weeklyUsage 動態產生 SVG 折線圖元素 |
| `renderDevices()` | 依 devices 陣列動態產生設備狀態列表列 |
| `checkAlerts()` | 檢查是否有異常設備，有則顯示提醒橫幅並更新文字 |
| `initAlertClose()` | 綁定關閉按鈕事件，點擊後隱藏橫幅 |
| `init()` | 頁面載入後依序呼叫以上所有函式（`DOMContentLoaded`）|

---

## 7. 對應需求追溯

| 需求編號 | 需求描述 | 設計對應 |
|----------|----------|----------|
| 功能一 | 今日及本月用電量 | 摘要卡片 3.2 |
| 功能二 | 預估碳排放量 | 摘要卡片 3.2（碳排放卡片）|
| 功能三 | 能源使用趨勢圖 | SVG 折線圖 3.3 |
| 功能四 | 設備狀態與異常提醒 | 設備列表 3.4 + 提醒橫幅 3.1 |
