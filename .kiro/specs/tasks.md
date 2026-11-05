# 智慧能源管理儀表板 — 任務清單

> **Spec 參考文件**
>
> - 需求：`.kiro/specs/requirements.md`
> - 設計：`.kiro/specs/design.md`
>
> **執行規則**
>
> - 所有檔案建立於 `docs/` 資料夾
> - 僅使用純 HTML / CSS / JavaScript，禁止引入外部套件或 CDN
> - 介面文字與程式碼註解一律使用繁體中文

---

## Task 1：建立 HTML 基礎結構

**目標檔案**：`docs/index.html`（新增）

**前置依賴**：無

**對應需求**：功能一、二、三、四（所有功能的骨架）

### 子任務

- [ ] 1-1 建立 `docs/` 資料夾與 `index.html` 檔案
- [ ] 1-2 撰寫 `<head>`：設定語系 `lang="zh-TW"`、`charset`、`viewport`，以相對路徑引用 `styles.css` 與 `app.js`
- [ ] 1-3 加入異常提醒橫幅（`#alert-banner`），預設隱藏，含關閉按鈕
- [ ] 1-4 加入頁首 `<header>`，顯示儀表板標題
- [ ] 1-5 加入摘要卡片區塊（`.cards-container`），含三張卡片：`#card-today`、`#card-month`、`#card-carbon`
- [ ] 1-6 加入趨勢圖區塊（`.chart-section`），放置 `<svg id="trend-chart">`
- [ ] 1-7 加入設備狀態區塊（`.device-section`），放置 `<table class="device-table">` 含表頭與空白 `<tbody id="device-list">`
- [ ] 1-8 加入頁尾 `<footer>`

**驗收方式**

- 以瀏覽器直接開啟 `docs/index.html` 不出現 console 錯誤
- 頁面可見標題、三個空白卡片、空白圖表區、空白表格
- 檢視原始碼確認無外部 CDN 引用

---

## Task 2：撰寫 CSS 版面與樣式

**目標檔案**：`docs/styles.css`（新增）

**前置依賴**：Task 1（需先有 HTML 結構才能驗收排版效果）

**對應需求**：功能一（卡片警示樣式）、功能四（狀態標籤色彩）

### 子任務

- [ ] 2-1 建立 `docs/styles.css`，撰寫 CSS Reset 與全域基礎樣式（字型、背景色 `#f4f6f9`、`box-sizing`）
- [ ] 2-2 頁首 `<header>` 樣式：主色背景 `#1a2b4a`、白色標題文字
- [ ] 2-3 摘要卡片容器：CSS Grid，`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`，間距 `gap: 16px`
- [ ] 2-4 卡片基礎樣式：白底、圓角 `8px`、陰影 `0 2px 8px rgba(0,0,0,0.08)`、內距 `24px`
- [ ] 2-5 卡片警示 class `.card--alert`：邊框與背景改為橘紅色（`#e67e22`），文字變白色
- [ ] 2-6 趨勢圖區塊：白底卡片樣式，標題與 SVG 上下留白
- [ ] 2-7 設備狀態表格：全寬、交替列背景色、欄位內距
- [ ] 2-8 狀態標籤 `.badge`：圓角小方塊；`.badge--normal`（綠）、`.badge--warning`（橘）、`.badge--error`（紅）
- [ ] 2-9 異常提醒橫幅 `.alert-banner`：紅底白字、關閉按鈕靠右；`.hidden` class 設定 `display: none`
- [ ] 2-10 響應式：螢幕寬度 < 600px 時，設備表格允許水平捲動（`overflow-x: auto`）
- [ ] 2-11 頁尾 `<footer>` 樣式：置中灰色小字

**驗收方式**

- 桌機寬度下三張卡片水平並排，窄螢幕自動換行
- `.card--alert` 套用後卡片呈現橘紅色
- 三種 `.badge` 色彩正確顯示
- 無外部字型或圖示引用

---

## Task 3：撰寫 JavaScript 資料、DOM 渲染與 SVG 圖表

**目標檔案**：`docs/app.js`（新增）

**前置依賴**：Task 1、Task 2（需要 HTML 元素存在且 CSS class 已定義）

**對應需求**：功能一、二、三、四

### 子任務

- [ ] 3-1 建立 `docs/app.js`，定義 `mockData` 物件，包含：
  - `todayUsage`（今日用電量，kWh）
  - `monthUsage`（本月用電量，kWh）
  - `carbonFactor`（換算係數 `0.502`）
  - `weeklyUsage`（過去 7 天陣列，含 `date` 與 `usage`）
  - `devices`（6 筆設備，含 `name`、`status`、`updatedAt`）
- [ ] 3-2 實作 `renderCards()`：將 `mockData` 數值填入三張卡片；碳排放 = `monthUsage × carbonFactor`（四捨五入至整數）；`todayUsage > 500` 時對 `#card-today` 加上 `.card--alert` class
- [ ] 3-3 實作 `renderChart()`：
  - 依 `weeklyUsage` 計算各資料點的 SVG 座標（`viewBox="0 0 700 240"`，左右邊距 60px，上下邊距 30px）
  - 以 `<polygon>` 繪製折線下方淡藍色填色區域
  - 以 `<polyline>` 繪製折線（藍色 `#2980b9`，`stroke-width="2"`）
  - 以 `<circle>` 加 `<title>` 繪製各資料點提示（顯示「日期：X kWh」）
  - 以 `<text>` 繪製 X 軸日期標籤與 Y 軸刻度（最小值 0、最大值取整至百位）
  - 以 `<line>` 繪製 X 軸與 Y 軸基準線
- [ ] 3-4 實作 `renderDevices()`：依 `mockData.devices` 動態產生 `<tr>` 列，狀態欄使用對應 `.badge--{status}` class
- [ ] 3-5 實作 `checkAlerts()`：篩選 `status === 'error'` 的設備，若有則設定 `#alert-message` 文字並移除 `#alert-banner` 的 `.hidden` class
- [ ] 3-6 實作 `initAlertClose()`：為關閉按鈕綁定 `click` 事件，點擊後對橫幅加回 `.hidden` class
- [ ] 3-7 實作 `init()` 函式，在 `DOMContentLoaded` 事件觸發後依序呼叫上述所有函式

**驗收方式**

- 三張卡片顯示正確數值；今日用電量 ≤ 500 kWh 時無警示，> 500 kWh 時卡片變色
- 碳排放數值 = `monthUsage × 0.502`（允許整數誤差 ±1）
- SVG 折線圖顯示 7 個資料點、X 軸日期、Y 軸刻度，滑鼠懸停顯示數值提示
- 設備列表顯示 6 筆資料，狀態標籤顏色正確
- 有異常設備時頂部橫幅出現；點擊關閉後橫幅消失

---

## Task 4：整合驗收

**目標檔案**：`docs/index.html`、`docs/styles.css`、`docs/app.js`（檢查與微調）

**前置依賴**：Task 1、Task 2、Task 3 全部完成

**對應需求**：所有功能（功能一～四）

### 子任務

- [ ] 4-1 確認三個檔案均存在於 `docs/` 資料夾，且 `index.html` 以相對路徑引用 `styles.css` 與 `app.js`
- [ ] 4-2 以瀏覽器開啟 `docs/index.html`，確認 console 無錯誤與警告
- [ ] 4-3 逐一核對 requirements.md 各驗收條件是否通過（勾選對應項目）
- [ ] 4-4 確認頁面在 1200px 桌機寬度與 375px 手機寬度均可正常閱讀
- [ ] 4-5 檢視原始碼，確認無任何外部 CDN、外部字型或第三方套件引用
- [ ] 4-6 確認所有介面文字為繁體中文

**驗收方式**

- requirements.md 所有驗收條件 checkbox 均可確認通過
- 無外部資源引用（可透過瀏覽器 Network 面板確認）
- 頁面功能在不啟動任何本地伺服器的情況下，直接以 `file://` 協定開啟即可正常運作

---

## 任務依賴關係

```
Task 1（HTML 結構）
    │
    ▼
Task 2（CSS 樣式）
    │
    ▼
Task 3（JS 資料 + 圖表）
    │
    ▼
Task 4（整合驗收）
```
