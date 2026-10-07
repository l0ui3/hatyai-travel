/* ===================================================================
   合艾行程 Dashboard — app logic. Data lives in data.js.
   All schedule times are Thailand time (Asia/Bangkok, UTC+7).
   =================================================================== */
"use strict";

const TZ_TH = "Asia/Bangkok", TZ_MY = "Asia/Kuala_Lumpur";
const ICON = { train:"🚆", home:"🏠", work:"💻", massage:"💆", coffee:"☕", food:"🍜", shop:"🛍️", sight:"🌳", night:"🌙", bar:"🍺", border:"🛂" };
const CATNAME = { train:"交通", home:"Airbnb", work:"工作", massage:"按摩", coffee:"咖啡", food:"吃飯", shop:"Shopping", sight:"景點", night:"夜市", bar:"夜生活", border:"過境" };
const KIND = { work:"工作日", off:"放假", fly:"移動日" };

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const hm = t => { const [h, m] = t.split(":").map(Number); return h + m / 60; };
const pad = n => String(n).padStart(2, "0");
const fmtH = h => { h = ((h % 24) + 24) % 24; const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return mm === 60 ? `${pad(hh + 1)}:00` : `${pad(hh)}:${pad(mm)}`; };
const TRIP_DATES = DAYS.map(d => "2026-" + d.d.replace("/", "-"));

/* ---------- maps links ---------- */
function mapsUrl(p){
  if (!p) return "#";
  if (p.url) return p.url;
  if (p.lat && p.lng && p.pin) return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.q || p.n)}`;
}
function dirUrl(p){
  const dest = p.url ? encodeURIComponent(p.q || p.n) : (p.lat && p.lng && p.pin ? `${p.lat},${p.lng}` : encodeURIComponent(p.q || p.n));
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(PLACES.home.q)}&destination=${dest}&travelmode=${(p.walk && p.walk <= 20) ? "walking" : "driving"}`;
}
const mapLink = (id, label) => { const p = PLACES[id]; return p ? `<a href="${mapsUrl(p)}" target="_blank" rel="noopener">📍 ${esc(label || p.n)}</a>` : ""; };

/* ---------- travel estimates (Airbnb is the reference point) ---------- */
function haversine(a, b){
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
/* returns {km, grab, walk, mode, label} for going from `fromId` (default home) to `toId` */
function travel(toId, fromId = "home"){
  const to = PLACES[toId], from = PLACES[fromId];
  if (!to || !from || toId === fromId) return null;
  let km, grab, walk;
  if (fromId === "home" && to.km != null){ km = to.km; grab = to.grab; walk = to.walk; }
  else if (toId === "home" && from.km != null){ km = from.km; grab = from.grab; walk = from.walk; }
  else {
    km = +(haversine(from, to) * 1.3).toFixed(1);
    walk = Math.max(2, Math.round(km / 4.5 * 60));
    grab = Math.max(4, Math.round(km / 22 * 60) + 4);
  }
  if (walk == null) walk = Math.round(km / 4.5 * 60);
  if (grab == null) grab = Math.max(4, Math.round(km / 22 * 60) + 4);
  const useWalk = walk <= 20;
  const mins = useWalk ? walk : grab;
  return { km, grab, walk, mode: useWalk ? "walk" : "grab", mins, label: useWalk ? `🚶 ${walk} 分` : `🚕 Grab 約 ${grab} 分` };
}
/* leave time for an item: start - travel - buffer */
function leaveTime(item, prevPlace){
  if (!item.place || item.noleave) return null;
  const tr = item.travel ? { mins: item.travel.mins, label: item.travel.label } : travel(item.place, prevPlace || "home");
  if (!tr) return null;
  const buffer = item.buffer ?? 5;
  return { at: fmtH(hm(item.s) - (tr.mins + buffer) / 60), tr, buffer };
}
/* which place the traveller is at before item i of day */
function prevPlaceOf(day, i){
  for (let k = i - 1; k >= 0; k--){ if (day.items[k].place) return day.items[k].place; }
  return "home";
}

/* ---------- clocks ---------- */
const fTH = new Intl.DateTimeFormat("en-GB", { timeZone: TZ_TH, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23" });
const fMY = new Intl.DateTimeFormat("en-GB", { timeZone: TZ_MY, hour:"2-digit", minute:"2-digit", hourCycle:"h23" });
function thNow(){
  const p = Object.fromEntries(fTH.formatToParts(new Date()).map(x => [x.type, x.value]));
  return { date:`${p.year}-${p.month}-${p.day}`, h:+p.hour + p.minute / 60 + p.second / 3600, hh:p.hour, mm:p.minute, ss:p.second };
}
function tickClocks(){
  const t = thNow();
  $("#clk-th").textContent = `${t.hh}:${t.mm}`;
  $("#clk-my").textContent = fMY.format(new Date());
}

/* ---------- tabs ---------- */
const tabs = [...document.querySelectorAll(".tabbar button")];
function showTab(name, push = true){
  if (!document.getElementById("p-" + name)) name = "today";
  tabs.forEach(b => b.classList.toggle("on", b.dataset.tab === name));
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("on", p.id === "p-" + name));
  if (push){ try{ history.replaceState(null, "", "#" + name); }catch(e){} }
  window.scrollTo({ top: 0, behavior: "auto" });
}
tabs.forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));
window.addEventListener("hashchange", () => showTab(location.hash.slice(1) || "today", false));

/* ---------- timeline rendering ---------- */
function renderItem(day, i, state){
  const it = day.items[i];
  const prev = prevPlaceOf(day, i);
  const lv = leaveTime(it, prev);
  const meta = [];
  if (lv){
    meta.push(`<span>${esc(lv.tr.label)}</span>`);
    meta.push(`<span class="leave">⏰ 建議 ${lv.at} 出發</span>`);
  } else if (it.travelNote) meta.push(`<span>${esc(it.travelNote)}</span>`);
  if (it.place && PLACES[it.place] && PLACES[it.place].km != null && it.place !== "home")
    meta.push(`<span>距 Airbnb ${PLACES[it.place].km} km</span>`);
  const places = (it.places || (it.place && it.place !== "home" ? [it.place] : [])).map(id => `<li>${mapLink(id)}</li>`).join("");
  const stLabel = state === "now" ? "進行中" : state === "next" ? "接下來" : "";
  return `
  <li class="it c-${it.cat}${state ? " " + state : ""}" id="it-${day.d.replace("/", "")}-${i}">
    <div class="it-time">${esc(it.s)}${it.e && !it.open ? `<span class="to">– ${esc(it.e)}</span>` : it.open ? `<span class="to">起</span>` : ""}</div>
    <div class="it-body">
      <div class="it-title"><span class="ic">${ICON[it.cat] || ""}</span>${esc(it.t)}${stLabel ? `<span class="st">${stLabel}</span>` : ""}</div>
      ${it.d ? `<p class="it-desc">${it.d}</p>` : ""}
      ${meta.length ? `<div class="it-meta">${meta.join("")}</div>` : ""}
      ${(it.tips || it.warn) ? `<ul class="tips">${(it.warn || []).map(t => `<li class="warn">⚠️ ${esc(t)}</li>`).join("")}${(it.tips || []).map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      ${places ? `<ul class="maps">${places}</ul>` : ""}
    </div>
  </li>`;
}
function itemStates(day, nowH, isToday){
  return day.items.map((it, i) => {
    if (!isToday) return "";
    const s = hm(it.s), e = it.e ? hm(it.e) : s + 1;
    if (nowH >= s && nowH < e) return "now";
    if (nowH >= e) return "done";
    return "";
  }).map((st, i, arr) => (st === "" && isToday && !arr.slice(0, i).some(x => x === "" ) && !arr.includes("now")) ? "next" : st);
}
function renderDay(idx, { showHead = true, isToday = false, nowH = 0 } = {}){
  const day = DAYS[idx];
  const states = itemStates(day, nowH, isToday);
  // "next" = first not-started item when nothing is in progress
  if (isToday && !states.includes("now")){
    const n = states.indexOf("");
    if (n !== -1) states[n] = "next";
  }
  const items = day.items.map((_, i) => renderItem(day, i, states[i] === "" ? "" : states[i])).join("");
  return `
  <div class="tl-day" id="day-${idx + 1}">
    ${showHead ? `<div class="tl-dayhead">
      <span class="d">${esc(day.d)}</span><span class="w">${esc(day.dow)}</span>
      <span class="k ${day.kind}" style="font-family:var(--f-label);font-size:.6rem;font-weight:600;letter-spacing:.08em;padding:1px 6px;border-radius:2px">${KIND[day.kind]}</span>
      <span class="t">${esc(day.title)}</span>
      <span class="wx" id="wx-${idx}" title="合艾當日天氣"></span>
    </div>` : ""}
    <ul class="tl">${items}</ul>
    ${day.foot ? `<div class="tl-foot"><span class="label">Note</span>${day.foot}</div>` : ""}
  </div>`;
}

/* ---------- today hero ---------- */
let lastHeroKey = "";
function renderToday(force = false){
  const now = thNow();
  const idx = TRIP_DATES.indexOf(now.date);
  const hero = $("#hero"), tl = $("#today-tl");
  const minuteKey = `${now.date}|${now.hh}:${now.mm}|${idx}`;
  if (!force && minuteKey === lastHeroKey) return;
  lastHeroKey = minuteKey;

  const bigNow = `<div class="hero-now">${now.hh}:${now.mm}<small>泰國時間</small></div>
    <div class="hero-my">馬來西亞 ${fMY.format(new Date())}（+1h）</div>`;

  if (idx === -1){
    const start = new Date("2026-10-08T00:00:00+07:00"), end = new Date("2026-10-12T00:00:00+07:00");
    const t = new Date();
    let msg, sub;
    if (t < start){
      const days = Math.ceil((start - t) / 864e5);
      msg = `距離出發還有 ${days} 天`;
      sub = "行程將從 10/8（四）凌晨抵達 Padang Besar 開始。先看「行程」與「交通」頁。";
    } else { msg = "旅程已結束"; sub = "感謝合艾。行程表仍可在「行程」頁回顧。"; }
    hero.innerHTML = `
      <div class="hero-top"><span class="hero-date">${esc(msg)}</span></div>
      <div class="hero-title">${esc(sub)}</div>
      ${bigNow}
      <div class="hero-foot">
        <a class="pill" href="${mapsUrl(PLACES.home)}" target="_blank" rel="noopener">🏠 Airbnb 導航</a>
        <button class="pill ghost" type="button" data-go="plan">🗓️ 看完整行程</button>
        <button class="pill ghost" type="button" data-go="transit">🚆 火車時刻</button>
      </div>`;
    tl.innerHTML = `<div class="sec-h"><h2>D1 預覽 · ${esc(DAYS[0].d)} ${esc(DAYS[0].dow)}</h2><span class="muted">${esc(DAYS[0].title)}</span></div>${renderDay(0, { showHead:false })}`;
    bindGo(hero);
    return;
  }

  const day = DAYS[idx];
  const cur = day.items.findIndex(it => hm(it.s) <= now.h && now.h < (it.e ? hm(it.e) : hm(it.s) + 1));
  const nxt = day.items.findIndex(it => hm(it.s) > now.h);
  const curIt = cur !== -1 ? day.items[cur] : null;
  const nxtIt = nxt !== -1 ? day.items[nxt] : null;

  const nowBox = curIt
    ? `<div class="hbox now"><span class="label">現在 · ${CATNAME[curIt.cat]}</span><div class="t">${ICON[curIt.cat]} ${esc(curIt.t)}</div><div class="m">${esc(curIt.s)}${curIt.e ? " – " + esc(curIt.e) : ""}${curIt.place && PLACES[curIt.place] ? " · " + esc(PLACES[curIt.place].n) : ""}</div></div>`
    : `<div class="hbox now"><span class="label">現在</span><div class="t">${nxtIt ? "自由時間" : "今日行程結束"}</div><div class="m">${nxtIt ? "下一個行程前可自由活動、休息或喝咖啡。" : "好好休息，明天見。"}</div></div>`;

  let nextBox = "", leaveBox = "";
  if (nxtIt){
    const diff = hm(nxtIt.s) - now.h;
    const h = Math.floor(diff), m = Math.floor((diff - h) * 60);
    const cd = h > 0 ? `${h}h ${pad(m)}m` : `${m} 分鐘`;
    nextBox = `<div class="hbox next"><span class="label">下一個 · ${esc(nxtIt.s)}</span><div class="big">${cd}</div><div class="t">${ICON[nxtIt.cat]} ${esc(nxtIt.t)}</div>${nxtIt.place && PLACES[nxtIt.place] ? `<div class="m">${esc(PLACES[nxtIt.place].n)}</div>` : ""}</div>`;
    const lv = leaveTime(nxtIt, prevPlaceOf(day, nxt));
    if (lv){
      const ld = hm(lv.at) - now.h;
      const late = ld <= 0;
      const lm = Math.round(Math.abs(ld) * 60);
      const lmTxt = lm >= 60 ? `${Math.floor(lm / 60)}h ${pad(lm % 60)}m` : `${lm} 分`;
      leaveBox = `<div class="hbox leave"><span class="label">建議出發</span><div class="big">${lv.at}</div><div class="m">${esc(lv.tr.label)} + ${lv.buffer} 分緩衝${late ? ` · <b style="color:var(--alert)">該出發了（晚 ${lmTxt}）</b>` : ` · 還有 ${lmTxt}`}</div></div>`;
    }
  } else {
    nextBox = `<div class="hbox next"><span class="label">下一個</span><div class="big">—</div><div class="t">今天沒有更多行程</div>${idx + 1 < DAYS.length ? `<div class="m">明天 ${esc(DAYS[idx + 1].items[0].s)} ${esc(DAYS[idx + 1].items[0].t)}</div>` : ""}</div>`;
  }

  const nextPlace = nxtIt && nxtIt.place && PLACES[nxtIt.place] && nxtIt.place !== "home" ? PLACES[nxtIt.place] : null;
  hero.innerHTML = `
    <div class="hero-top"><span class="hero-date">${esc(day.d)}</span><span class="hero-dow">${esc(day.dow)} · D${idx + 1}</span><span class="k ${day.kind}" style="font-family:var(--f-label);font-size:.6rem;font-weight:600;letter-spacing:.08em;padding:1px 6px;border-radius:2px">${KIND[day.kind]}</span></div>
    <div class="hero-title">${esc(day.title)}</div>
    ${bigNow}
    <div class="hero-grid">${nowBox}${nextBox}${leaveBox}</div>
    <div class="hero-foot">
      ${nextPlace ? `<a class="pill" href="${dirUrl(nextPlace)}" target="_blank" rel="noopener">🧭 導航到 ${esc(nextPlace.n)}</a>` : ""}
      <a class="pill ghost" href="${mapsUrl(PLACES.home)}" target="_blank" rel="noopener">🏠 回 Airbnb</a>
    </div>`;
  tl.innerHTML = `<div class="sec-h"><h2>今日 Timeline</h2><span class="muted" id="wx-today"></span></div>${renderDay(idx, { showHead:false, isToday:true, nowH: now.h })}`;
  const wx = document.getElementById("wx-" + idx);
  if (WX[idx]) $("#wx-today").textContent = WX[idx];
  bindGo(hero);
}
function bindGo(root){ root.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => showTab(b.dataset.go))); }

/* ---------- alerts ---------- */
function renderAlerts(){
  $("#alerts").innerHTML = ALERTS.map(a => `<li>⚠️ ${a}</li>`).join("");
}

/* ---------- plan (all days) ---------- */
let planIdx = 0;
function renderPlan(){
  const now = thNow();
  const tIdx = TRIP_DATES.indexOf(now.date);
  $("#daypick").innerHTML = DAYS.map((d, i) => `
    <button type="button" data-i="${i}" class="${i === planIdx ? "on" : ""}${i === tIdx ? " today" : ""}">
      <span class="d">${esc(d.d)}</span><span class="w">${esc(d.dow)}</span><span class="k ${d.kind}">${KIND[d.kind]}</span>
    </button>`).join("");
  $("#daypick").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { planIdx = +b.dataset.i; renderPlan(); }));
  $("#plan").innerHTML = renderDay(planIdx, { isToday: planIdx === tIdx, nowH: now.h });
  if (WX[planIdx]) { const el = document.getElementById("wx-" + planIdx); if (el) el.textContent = WX[planIdx]; }
}

/* ---------- map tab ---------- */
let mapFilter = "all";
const PLACE_CATS = [["all","全部"],["food","吃飯"],["coffee","咖啡"],["massage","按摩"],["sight","景點"],["night","夜市"],["shop","商場"],["train","交通"]];
function renderMap(){
  $("#map-filter").innerHTML = PLACE_CATS.map(([k, n]) => `<button type="button" data-k="${k}" class="${mapFilter === k ? "on" : ""}">${n}</button>`).join("");
  $("#map-filter").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { mapFilter = b.dataset.k; renderMap(); }));
  const list = Object.entries(PLACES).filter(([id, p]) => id !== "home" && (mapFilter === "all" || p.cat === mapFilter));
  $("#places").innerHTML = `
    <div class="place" style="padding-top:2px">
      <div><div class="n"><span class="ic">🏠</span>Airbnb（起點／終點）</div><div class="a">${esc(PLACES.home.addr)}</div></div>
      <div class="go"><a class="pill" href="${mapsUrl(PLACES.home)}" target="_blank" rel="noopener">📍 在 Google Maps 開啟</a></div>
    </div>` + list.map(([id, p]) => {
      const tr = travel(id);
      const dist = tr ? `<div class="dist"><span>📏 <b>${p.km} km</b></span><span>🚕 Grab 約 <b>${p.grab} 分</b></span>${p.walk <= 35 ? `<span>🚶 步行 <b>${p.walk} 分</b></span>` : ""}</div>` : "";
      const used = usedAt(id);
      return `<div class="place">
        <div>
          <div class="n"><span class="ic">${ICON[p.cat] || "📍"}</span>${esc(p.n)}${p.hv === true ? `<span class="tag v">已查證</span>` : p.hv === false ? `<span class="tag u">未查證</span>` : ""}</div>
          ${p.addr ? `<div class="a">${esc(p.addr)}</div>` : ""}
          ${p.hours ? `<div class="h">🕒 ${esc(p.hours)}</div>` : ""}
          ${p.note ? `<div class="h">${esc(p.note)}</div>` : ""}
          ${dist}
          ${used.length ? `<div class="h muted">行程：${used.map(u => `${u.d} ${u.s}${u.lv ? ` · 建議 ${u.lv} 出發` : ""}`).join("、")}</div>` : ""}
        </div>
        <div class="go"><a class="pill" href="${mapsUrl(p)}" target="_blank" rel="noopener">📍 在 Google Maps 開啟</a><a class="pill ghost" href="${dirUrl(p)}" target="_blank" rel="noopener">🧭 從 Airbnb 導航</a></div>
      </div>`;
    }).join("");
  if (window.L) renderLeaflet(list.map(([id]) => id)); else { $("#lmap").remove(); $("#schem").classList.remove("hide"); $("#map-note").textContent = "示意圖（離線）：紅點為 Airbnb，虛線圈為 1 km / 3 km / 6 km。點地名可開 Google Maps。"; renderSchematic(); }
}
let lmap = null, lmarkers = null;
const MK = { food:"#B07D08", coffee:"#B07D08", massage:"#04624B", sight:"#04624B", shop:"#3D5257", night:"#5B4A8A", bar:"#5B4A8A", train:"#6B7F83", work:"#B07D08" };
function renderLeaflet(ids){
  const home = PLACES.home;
  if (!lmap){
    lmap = L.map("lmap", { zoomControl:true, attributionControl:true, scrollWheelZoom:false, tap:false }).setView([home.lat, home.lng], 14);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(lmap);
    [1, 3].forEach(r => L.circle([home.lat, home.lng], { radius:r * 1000, color:"#6B7F83", weight:1, dashArray:"4 5", fill:false, interactive:false }).addTo(lmap));
    L.circleMarker([home.lat, home.lng], { radius:9, color:"#fff", weight:2, fillColor:"#B3261E", fillOpacity:1 }).addTo(lmap)
      .bindPopup(`<b>🏠 Airbnb</b><div class="pp">${esc(home.addr)}</div><a class="pill" href="${mapsUrl(home)}" target="_blank" rel="noopener">📍 Google Maps</a>`);
    lmarkers = L.layerGroup().addTo(lmap);
    setTimeout(() => lmap.invalidateSize(), 50);
    document.querySelector('.tabbar button[data-tab="map"]').addEventListener("click", () => setTimeout(() => lmap.invalidateSize(), 60));
  }
  lmarkers.clearLayers();
  const pts = [[home.lat, home.lng]];
  ids.forEach(id => {
    const p = PLACES[id]; if (!p.lat || (p.onMap === false && p.km > 10)) return;
    pts.push([p.lat, p.lng]);
    const m = L.circleMarker([p.lat, p.lng], { radius:7, color:"#fff", weight:2, fillColor:MK[p.cat] || "#04624B", fillOpacity:.95 });
    m.bindTooltip(p.short || p.n, { direction:"top", offset:[0, -6], opacity:.9 });
    m.bindPopup(`<b>${ICON[p.cat] || "📍"} ${esc(p.n)}</b>${p.hours ? `<div class="pp">🕒 ${esc(p.hours)}</div>` : ""}<div class="pp">📏 ${p.km} km · 🚕 ${p.grab} 分${p.walk <= 35 ? ` · 🚶 ${p.walk} 分` : ""}</div><a class="pill" href="${mapsUrl(p)}" target="_blank" rel="noopener">📍 Google Maps</a> <a class="pill ghost" href="${dirUrl(p)}" target="_blank" rel="noopener">🧭 導航</a>`);
    lmarkers.addLayer(m);
  });
  if (mapFilter !== "all" && pts.length > 1) lmap.fitBounds(pts, { padding:[24, 24], maxZoom:16 });
  else lmap.setView([home.lat, home.lng], 14);
}
function usedAt(id){
  const out = [];
  DAYS.forEach(day => day.items.forEach((it, i) => {
    if (it.place === id || (it.places || []).includes(id)){
      const lv = it.place === id ? leaveTime(it, prevPlaceOf(day, i)) : null;
      out.push({ d: day.d, s: it.s, lv: lv ? lv.at : null });
    }
  }));
  return out;
}
function renderSchematic(){
  const svg = $("#schem");
  const W = 360, H = 380, cx = 180, cy = 195;
  const home = PLACES.home;
  const pts = Object.entries(PLACES).filter(([id, p]) => id !== "home" && p.lat && p.lng && p.onMap !== false);
  const maxKm = Math.max(...pts.map(([, p]) => haversine(home, p)), 6.5);
  const scale = 165 / maxKm;
  const xy = p => {
    const dx = (p.lng - home.lng) * 111.32 * Math.cos(home.lat * Math.PI / 180);
    const dy = (p.lat - home.lat) * 110.57;
    return [cx + dx * scale, cy - dy * scale];
  };
  const rings = [1, 3, 6].filter(r => r <= maxKm + 0.5).map(r => `<circle class="ring" cx="${cx}" cy="${cy}" r="${(r * scale).toFixed(1)}"/><text class="ringl" x="${cx + 3}" y="${(cy - r * scale - 3).toFixed(1)}">${r} km</text>`).join("");
  // simple label de-overlap: sort by y and nudge
  const placed = [];
  const nodes = pts.map(([id, p]) => {
    let [x, y] = xy(p);
    x = Math.max(12, Math.min(W - 12, x)); y = Math.max(12, Math.min(H - 12, y));
    const cls = p.cat === "night" || p.cat === "bar" ? "n" : p.cat === "train" ? "t" : p.cat === "shop" || p.cat === "coffee" ? "h" : "";
    let ly = y + 4, lx = x + 7;
    for (let tries = 0; tries < 6; tries++){
      const clash = placed.some(q => Math.abs(q.x - lx) < 70 && Math.abs(q.y - ly) < 11);
      if (!clash) break;
      ly += 11;
    }
    placed.push({ x: lx, y: ly });
    const label = p.short || p.n;
    const anchor = lx > W - 80 ? `text-anchor="end" x="${x - 7}"` : `x="${lx}"`;
    return `<a href="${mapsUrl(p)}" target="_blank" rel="noopener"><circle class="dot ${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"/><text class="pl" ${anchor} y="${ly.toFixed(1)}">${esc(label)}</text></a>`;
  }).join("");
  svg.innerHTML = `<rect class="bg" width="${W}" height="${H}" rx="6"/>${rings}
    <a href="${mapsUrl(home)}" target="_blank" rel="noopener"><circle class="home" cx="${cx}" cy="${cy}" r="6"/><text class="pl" x="${cx + 9}" y="${cy - 6}" font-weight="700">Airbnb</text></a>${nodes}
    <text class="ringl" x="8" y="${H - 8}">N ↑ · 北在上</text>`;
}

/* ---------- transit / food / budget / info ---------- */
function renderTransit(){
  const t = TRANSIT;
  const trainTable = rows => `<table><thead><tr><th class="m">出發</th><th class="m">抵達</th><th>班次</th><th>備註</th></tr></thead><tbody>${rows.map(r => `<tr class="${r.hl ? "hl" : r.dim ? "dim" : ""}"><td class="m">${esc(r.dep)}</td><td class="m">${esc(r.arr)}</td><td>${esc(r.no)}</td><td>${r.note || ""}</td></tr>`).join("")}</tbody></table>`;
  $("#p-transit").innerHTML = `
    <div class="card">
      <div class="card-h"><h2>🕐 時差</h2><span class="muted">泰國比馬來西亞慢 1 小時</span></div>
      <div class="tzrow">
        <div class="hbox"><span class="label">泰國 Hat Yai (UTC+7)</span><div class="big" id="tz-th">--:--</div></div>
        <div class="hbox"><span class="label">馬來西亞 Padang Besar (UTC+8)</span><div class="big" id="tz-my">--:--</div></div>
      </div>
      <p class="small" style="margin-top:8px">${t.tznote}</p>
    </div>

    <div class="card">
      <div class="card-h"><h2>🚆 10/8（四）去程 · Padang Besar → Hat Yai</h2></div>
      <div class="timeline-mini">${t.inbound.steps.map(s => `<div class="tm${s.hl ? " hl" : ""}"><div class="t">${esc(s.t)}${s.tz ? `<small>${esc(s.tz)}</small>` : ""}</div><div class="x">${s.x}</div></div>`).join("")}</div>
      <h3 style="margin-top:14px">SRT 接駁火車時刻（Padang Besar → Hat Yai Jn，泰國時間）</h3>
      ${trainTable(t.inbound.trains)}
      <ul class="note-list">${t.inbound.notes.map(n => `<li>${n}</li>`).join("")}</ul>
    </div>

    <div class="card">
      <div class="card-h"><h2>🚆 10/11（日）回程 · Hat Yai → Padang Besar → KL</h2></div>
      <ul class="alerts" style="margin-top:0">${t.outbound.alerts.map(a => `<li>⚠️ ${a}</li>`).join("")}</ul>
      <div class="timeline-mini" style="margin-top:10px">${t.outbound.steps.map(s => `<div class="tm${s.hl ? " hl" : ""}"><div class="t">${esc(s.t)}${s.tz ? `<small>${esc(s.tz)}</small>` : ""}</div><div class="x">${s.x}</div></div>`).join("")}</div>
      <h3 style="margin-top:14px">SRT 接駁火車時刻（Hat Yai Jn → Padang Besar，泰國時間）</h3>
      ${trainTable(t.outbound.trains)}
      <h3 style="margin-top:14px">KTM ETS（Padang Besar → KL Sentral，馬來西亞時間）</h3>
      ${trainTable(t.outbound.ets)}
      <ul class="note-list">${t.outbound.notes.map(n => `<li>${n}</li>`).join("")}</ul>
    </div>

    <div class="card">
      <div class="card-h"><h2>🛂 Padang Besar 過境流程</h2></div>
      <ul class="note-list">${t.border.map(n => `<li>${n}</li>`).join("")}</ul>
    </div>

    <div class="card">
      <div class="card-h"><h2>🚕 市區交通</h2></div>
      <ul class="note-list">${t.local.map(n => `<li>${n}</li>`).join("")}</ul>
      <h3 style="margin-top:14px">從 Airbnb 出發（估算）</h3>
      <table><thead><tr><th>目的地</th><th class="m r">距離</th><th class="m r">Grab</th><th class="m r">步行</th></tr></thead><tbody>
        ${Object.entries(PLACES).filter(([id, p]) => id !== "home" && p.km != null && p.inTable !== false).sort((a, b) => a[1].km - b[1].km).map(([, p]) => `<tr><td>${esc(p.n)}</td><td class="m r">${p.km} km</td><td class="m r">${p.grab} 分</td><td class="m r">${p.walk <= 40 ? p.walk + " 分" : "—"}</td></tr>`).join("")}
      </tbody></table>
    </div>
    <p class="src">${t.sources}</p>`;
}
function renderFood(){
  $("#p-food").innerHTML = FOOD.groups.map(g => `
    <div class="card">
      <div class="card-h"><h2>${esc(g.title)}</h2><span class="muted">${esc(g.sub || "")}</span></div>
      ${g.items.map(id => {
        const p = PLACES[id]; if (!p) return "";
        return `<div class="place">
          <div>
            <div class="n"><span class="ic">${ICON[p.cat] || "🍽️"}</span>${esc(p.n)}${p.hv === true ? `<span class="tag v">已查證</span>` : p.hv === false ? `<span class="tag u">營業時間未查證</span>` : ""}</div>
            ${p.addr ? `<div class="a">${esc(p.addr)}</div>` : ""}
            ${p.hours ? `<div class="h">🕒 ${esc(p.hours)}</div>` : ""}
            ${p.note ? `<div class="h">${esc(p.note)}</div>` : ""}
            ${p.price ? `<div class="h">💸 ${esc(p.price)}</div>` : ""}
            ${p.km != null ? `<div class="dist"><span>📏 <b>${p.km} km</b></span><span>🚶 <b>${p.walk} 分</b></span>${p.walk > 20 ? `<span>🚕 <b>${p.grab} 分</b></span>` : ""}</div>` : ""}
          </div>
          <div class="go"><a class="pill" href="${mapsUrl(p)}" target="_blank" rel="noopener">📍 Google Maps</a></div>
        </div>`;
      }).join("")}
    </div>`).join("") + `<p class="src">${FOOD.sources}</p>`;
}

/* budget + spend log */
const SPEND_KEY = "hdy-spend";
let perPerson = false;
function loadSpend(){ try{ return JSON.parse(localStorage.getItem(SPEND_KEY) || "[]"); }catch(e){ return []; } }
function saveSpend(a){ try{ localStorage.setItem(SPEND_KEY, JSON.stringify(a)); }catch(e){} }
function renderBudget(){
  const b = BUDGET;
  const div = perPerson ? 2 : 1;
  const total = b.rows.reduce((s, r) => s + r.thb, 0);
  const twd = v => Math.round(v * b.rate.twd);
  const spend = loadSpend();
  const spent = spend.reduce((s, x) => s + x.thb, 0);
  $("#p-budget").innerHTML = `
    <div class="card">
      <div class="card-h"><h2>💰 預算估算</h2>
        <span class="seg-btn"><button type="button" data-pp="0" class="${perPerson ? "" : "on"}">2 人總計</button><button type="button" data-pp="1" class="${perPerson ? "on" : ""}">每人</button></span></div>
      <table><thead><tr><th>項目</th><th class="r m">THB</th><th class="r m">≈ TWD</th></tr></thead><tbody>
        ${b.rows.map(r => `<tr><td>${esc(r.n)}<div class="muted" style="font-size:.74rem">${esc(r.note || "")}</div></td><td class="r m">${Math.round(r.thb / div).toLocaleString()}</td><td class="r m">${twd(r.thb / div).toLocaleString()}</td></tr>`).join("")}
        <tr class="sum"><td>合計（不含住宿與跨國火車）</td><td class="r m">${Math.round(total / div).toLocaleString()}</td><td class="r m">${twd(total / div).toLocaleString()}</td></tr>
      </tbody></table>
      <p class="src">匯率 1 THB ≈ ${b.rate.twd} TWD ≈ ${b.rate.myr} MYR（${esc(b.rate.asof)}，粗估）。以上為 4 天 2 人估算，實際以當地價格為準。</p>
    </div>

    <div class="card">
      <div class="card-h"><h2>🔁 換算</h2><span class="muted">THB ↔ TWD</span></div>
      <div class="conv"><input id="cv-thb" type="number" inputmode="decimal" placeholder="THB" value="100"><span class="eq">⇄</span><div class="out" id="cv-twd">—</div></div>
      <div class="conv" style="margin-top:6px"><input id="cv-myr" type="number" inputmode="decimal" placeholder="MYR"><span class="eq">⇄</span><div class="out" id="cv-thb2">—</div></div>
    </div>

    <div class="card">
      <div class="card-h"><h2>🧾 記帳</h2><span class="muted">存在這支手機（離線可用）</span></div>
      <div class="spend-row">
        <input id="sp-n" type="text" placeholder="項目（例：按摩）" maxlength="40">
        <input id="sp-v" type="number" inputmode="decimal" placeholder="THB">
        <button type="button" id="sp-add">＋</button>
      </div>
      <ul class="spend-list" id="sp-list">${spend.map((x, i) => `<li><span>${esc(x.n)}</span><span class="d">${esc(x.d)}</span><span class="v">${x.thb.toLocaleString()}</span><button type="button" data-del="${i}" aria-label="刪除">✕</button></li>`).reverse().join("")}</ul>
      <div class="spend-total"><span>已花費</span><span class="mono">${spent.toLocaleString()} THB ≈ ${twd(spent).toLocaleString()} TWD</span></div>
    </div>

    <div class="card">
      <div class="card-h"><h2>📌 參考價格</h2></div>
      <table><thead><tr><th>項目</th><th class="r m">THB</th></tr></thead><tbody>
        ${b.refs.map(r => `<tr><td>${esc(r.n)}</td><td class="r m">${esc(r.v)}</td></tr>`).join("")}
      </tbody></table>
      <p class="src">${b.sources}</p>
    </div>`;
  $("#p-budget").querySelectorAll("[data-pp]").forEach(x => x.addEventListener("click", () => { perPerson = x.dataset.pp === "1"; renderBudget(); }));
  const upd = () => {
    const v = parseFloat($("#cv-thb").value); $("#cv-twd").textContent = isNaN(v) ? "—" : `${Math.round(v * b.rate.twd).toLocaleString()} TWD`;
    const m = parseFloat($("#cv-myr").value); $("#cv-thb2").textContent = isNaN(m) ? "—" : `${Math.round(m / b.rate.myr).toLocaleString()} THB`;
  };
  $("#cv-thb").addEventListener("input", upd); $("#cv-myr").addEventListener("input", upd); upd();
  $("#sp-add").addEventListener("click", () => {
    const n = $("#sp-n").value.trim(), v = parseFloat($("#sp-v").value);
    if (!n || isNaN(v)) return;
    const t = thNow();
    const a = loadSpend(); a.push({ n, thb: Math.round(v), d: t.date.slice(5).replace("-", "/") + " " + t.hh + ":" + t.mm }); saveSpend(a); renderBudget();
  });
  $("#p-budget").querySelectorAll("[data-del]").forEach(x => x.addEventListener("click", () => { const a = loadSpend(); a.splice(+x.dataset.del, 1); saveSpend(a); renderBudget(); }));
}

/* info */
const CHECK_KEY = "hdy-check";
function renderInfo(){
  let done = {}; try{ done = JSON.parse(localStorage.getItem(CHECK_KEY) || "{}"); }catch(e){}
  const i = INFO;
  $("#p-info").innerHTML = `
    <ul class="alerts" style="margin-top:4px">${ALERTS.map(a => `<li>⚠️ ${a}</li>`).join("")}</ul>

    <div class="card">
      <div class="card-h"><h2>🏠 Airbnb</h2></div>
      <div class="addr" id="addr">${esc(PLACES.home.addr)}</div>
      <div class="hero-foot">
        <a class="pill" href="${mapsUrl(PLACES.home)}" target="_blank" rel="noopener">📍 Google Maps</a>
        <button class="pill ghost" type="button" id="copy-addr">📋 複製地址（給司機看）</button>
      </div>
      <p class="small" style="margin-top:8px">${i.airbnb}</p>
    </div>

    ${i.sections.map(s => `
    <div class="card">
      <div class="card-h"><h2>${esc(s.title)}</h2></div>
      ${s.kv ? `<dl class="kv">${s.kv.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("")}</dl>` : ""}
      ${s.list ? `<ul class="note-list">${s.list.map(x => `<li>${x}</li>`).join("")}</ul>` : ""}
    </div>`).join("")}

    ${i.checklists.map((c, ci) => `
    <div class="card">
      <div class="card-h"><h2>${esc(c.title)}</h2><span class="muted">${esc(c.sub || "")}</span></div>
      <ul class="check">${c.items.map((x, xi) => { const k = `${ci}-${xi}`; return `<li class="${done[k] ? "done" : ""}"><input type="checkbox" id="ck-${k}" data-k="${k}" ${done[k] ? "checked" : ""}><label for="ck-${k}">${x}</label></li>`; }).join("")}</ul>
    </div>`).join("")}
    <p class="src">${i.sources}</p>`;
  $("#copy-addr").addEventListener("click", async () => {
    try{ await navigator.clipboard.writeText(PLACES.home.addr); $("#copy-addr").textContent = "✅ 已複製"; }catch(e){ $("#copy-addr").textContent = "長按上方地址複製"; }
  });
  $("#p-info").querySelectorAll(".check input").forEach(cb => cb.addEventListener("change", () => {
    done[cb.dataset.k] = cb.checked; cb.closest("li").classList.toggle("done", cb.checked);
    try{ localStorage.setItem(CHECK_KEY, JSON.stringify(done)); }catch(e){}
  }));
}

/* ---------- weather (Open-Meteo, no key) ---------- */
const WX = {};
(async () => {
  const IC = {0:"☀️",1:"🌤️",2:"⛅️",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌦️",61:"🌧️",63:"🌧️",65:"🌧️",66:"🌧️",67:"🌧️",71:"🌨️",73:"🌨️",75:"🌨️",77:"🌨️",80:"🌦️",81:"🌧️",82:"⛈️",85:"🌨️",86:"🌨️",95:"⛈️",96:"⛈️",99:"⛈️"};
  try{
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${PLACES.home.lat}&longitude=${PLACES.home.lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FBangkok&forecast_days=16`);
    if (!r.ok) return;
    const w = (await r.json()).daily;
    TRIP_DATES.forEach((date, i) => {
      const k = w.time.indexOf(date); if (k === -1) return;
      WX[i] = `${IC[w.weather_code[k]] || ""} ${Math.round(w.temperature_2m_min[k])}°/${Math.round(w.temperature_2m_max[k])}° 💧${w.precipitation_probability_max[k]}%`;
      const el = document.getElementById("wx-" + i); if (el) el.textContent = WX[i];
    });
    renderToday(true);
  }catch(e){ /* offline: stays blank */ }
})();

/* ---------- theme ---------- */
const themeBtn = $("#theme-btn");
const THEMES = [["auto","🌓"],["dark","🌙"],["light","☀️"]];
function applyTheme(t){
  if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t;
  themeBtn.textContent = THEMES.find(x => x[0] === t)[1];
  themeBtn.title = { auto:"自動", dark:"深色", light:"淺色" }[t];
  try{ t === "auto" ? localStorage.removeItem("theme") : localStorage.setItem("theme", t); }catch(e){}
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim();
}
let themeIdx = 0;
try{ themeIdx = Math.max(0, THEMES.findIndex(x => x[0] === localStorage.getItem("theme"))); }catch(e){}
applyTheme(THEMES[themeIdx][0]);
themeBtn.addEventListener("click", () => { themeIdx = (themeIdx + 1) % THEMES.length; applyTheme(THEMES[themeIdx][0]); });

/* ---------- boot ---------- */
(function boot(){
  const now = thNow();
  const tIdx = TRIP_DATES.indexOf(now.date);
  planIdx = tIdx === -1 ? 0 : tIdx;
  renderAlerts(); renderToday(true); renderPlan(); renderMap(); renderTransit(); renderFood(); renderBudget(); renderInfo();
  $("#colophon").innerHTML = COLOPHON;
  tickClocks();
  setInterval(() => {
    tickClocks();
    const t = $("#tz-th"), m = $("#tz-my");
    if (t){ t.textContent = $("#clk-th").textContent; m.textContent = $("#clk-my").textContent; }
    renderToday();
  }, 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden){ tickClocks(); renderToday(true); } });
  showTab(location.hash.slice(1) || "today", false);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
})();
