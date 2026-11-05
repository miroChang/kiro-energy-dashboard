# 專案規則

## 技術限制

這是一個使用純 HTML、CSS、JavaScript 的靜態網站原型。

- **禁止**使用 Node.js、Vite、React、Vue、Angular 等前端框架
- **禁止**使用後端技術或資料庫
- **禁止**引入任何外部套件或 CDN 資源
- 所有功能僅以原生 HTML、CSS、JavaScript 實作

## 檔案結構

所有網站檔案統一放在 `docs/` 資料夾下，例如：

```
docs/
  index.html
  style.css
  main.js
```

## 語言

- 介面文字、程式碼註解、文件一律使用**繁體中文**

## 資料來源

- 資料以**模擬資料（mock data）**為主，直接寫在 JavaScript 檔案中
- 不串接任何真實 API 或外部服務

## 設計原則

- 保持設計**簡潔**，避免過度開發
- 不追求複雜的動畫或視覺效果
- 以能清楚呈現功能為目標即可
