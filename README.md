# 合艾旅行行程 Dashboard · Hat Yai Travel Dashboard

10/8（四）– 10/11（日）合艾四日行程的手機 Dashboard：打開 3 秒內看到「現在在哪、下一站去哪、幾點要出發」。

## 頁面

- **今日** — 日期、泰國／馬來西亞時間、現在的行程、下一個行程倒數、建議出發時間、今日 Timeline、固定提醒
- **行程** — 四天完整 Timeline（時間 → 活動 → 地點 → 交通時間 → 備註），每個地點可「📍 在 Google Maps 開啟」
- **地圖** — 以 Airbnb 為中心的相對位置示意圖＋地點清單（距離、Grab 時間、步行時間、建議出發時間）
- **交通** — 10/8 去程、10/11 回程火車時刻、Padang Besar 過境流程、市區交通
- **美食** — 早餐／工作咖啡廳／餐廳／夜市／夜生活／按摩，含營業時間與查證狀態
- **預算** — 兩人四天估算、THB ⇄ TWD／MYR 換算、離線記帳（localStorage）
- **資訊** — 入境（TDAC／MDAC）、緊急電話、醫院、駐泰辦事處、天氣、行前檢查清單

## 開發

沒有建置步驟與相依套件，三個檔案：

- `index.html` — 版面與樣式（設計 token 與 sydney-travel 共用）
- `data.js` — 所有行程資料：`PLACES`（地點、座標、距 Airbnb 距離、營業時間）、`DAYS`（每日 items）、`TRANSIT`／`FOOD`／`BUDGET`／`INFO`、`ALERTS`
- `app.js` — 渲染、時鐘、今日／下一個／建議出發時間計算、天氣（Open-Meteo）、主題切換

```bash
python3 -m http.server 4173   # 然後開啟 http://localhost:4173
```

修改行程只需編輯 `data.js` 的 `DAYS`：每個 item 的 `s`／`e` 為起訖時間（泰國時間），`place` 為 `PLACES` 的 key（用來算交通時間與「建議出發」），`places` 為要列出的地圖連結。

「建議出發時間」＝ 行程開始時間 − 交通時間（步行 ≤ 20 分鐘用步行，否則用 Grab）− 緩衝（預設 5 分鐘，可用 `buffer` 覆寫）；交通時間以 Airbnb 為基準（`km`／`walk`／`grab` 由 OSRM 道路距離估算），非 Airbnb 出發時用兩點直線距離 ×1.3 估算。

## 部署

推送到 `main` 時由 `.github/workflows/deploy-pages.yml` 自動發佈到 GitHub Pages。首次部署前需手動：
**Settings → Pages → Build and deployment → Source 選 `GitHub Actions`**，之後網站位於
<https://l0ui3.github.io/hatyai-travel/>。

時間皆為泰國時間（UTC+7）；馬來西亞時間 = 泰國時間 + 1 小時。
