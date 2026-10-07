/* ===================================================================
   合艾行程 Dashboard — 行程資料（2026/10/8–10/11）
   所有時間為泰國時間（UTC+7）。馬來西亞時間 = 泰國時間 + 1 小時。
   營業時間：hv:true = 2026-10-07 由即時清單查證；hv:false = 僅見於未標日期的
   整理站／舊貼文，出發前請再用 Google Maps 確認。2025 年 11 月合艾大水災後
   部分店家時間可能異動。
   距離：以 Airbnb（39 Supasarnrungsan Soi 2）為基準，道路距離由 OSRM 估算；
   grab = 含等車／市區車流的 Grab 分鐘估計；walk = 步行分鐘（4.5 km/h）。
   =================================================================== */

const PLACES = {
  home: { n:"Airbnb", ic:"🏠", cat:"home", lat:7.0080, lng:100.4715,
    addr:"39 Supasarnrungsan Soi 2 Rd, Tambon Hat Yai, Hat Yai, Songkhla 90110, Thailand",
    q:"39 Supasarnrungsan Soi 2 Rd, Tambon Hat Yai, Hat Yai, Songkhla 90110",
    url:"https://maps.app.goo.gl/ZTiiDZ3h9k4i3hV29?g_st=ic" },

  /* ---- 交通 ---- */
  station: { n:"Hat Yai Junction 火車站", short:"火車站", cat:"train", lat:7.0039414, lng:100.4675799, km:1.2, walk:16, grab:8,
    q:"Hat Yai Junction Railway Station", addr:"Thamnoonvithi Rd（市中心西側）", hv:true,
    hours:"售票櫃台：接駁車票當日現場購買（50 THB）", note:"出站即 Thamnoonvithi Rd，往東走到 Lee Garden 約 10 分鐘。" },
  padang: { n:"Padang Besar 車站（馬來西亞）", short:"Padang Besar", cat:"train", lat:6.6626841, lng:100.3201982, km:58.5, walk:999, grab:60,
    q:"Padang Besar Railway Station Perlis", onMap:false, inTable:false, hv:true,
    hours:"CIQ（馬／泰雙邊關口）只在泰國火車進出時開放；陸路關口 06:00–22:00（馬來西亞時間）",
    note:"KTM ETS、Komuter 與 SRT 接駁車都在同一站；小小的「Padang Besar (Thai)」是另一個站，回程不要在那下車。" },
  busterm: { n:"Hat Yai 巴士總站", short:"巴士總站", cat:"train", lat:6.9947035, lng:100.4819768, km:2.6, walk:35, grab:12,
    q:"Hat Yai Bus Terminal", hv:false, hours:"往 Padang Besar 小巴 07:00–19:00，約 60 THB、1–1.5 小時，坐滿發車", onMap:false },

  /* ---- 咖啡／早餐 ---- */
  morningcup: { n:"Morning Cup Hatyai", short:"Morning Cup", cat:"coffee", lat:7.0108167, lng:100.4793179, km:1.1, walk:15, grab:7,
    q:"Morning Cup Hatyai Samchai Rd", addr:"59 Samchai Rd（近 Thamnoonvithi）", hv:false,
    hours:"二–日 06:30–14:00，週一休（另有來源說週三休）", note:"泰式 kopi、咖椰吐司、溫泉蛋，Muji 風小店。Wi-Fi／插座未確認。",
    price:"咖啡 50–90 THB" },
  mcd: { n:"McDonald's Lee Gardens", short:"McD", cat:"coffee", lat:7.0058, lng:100.4717, km:0.6, walk:8, grab:6, onMap:false,
    q:"McDonald's Lee Gardens Plaza Hat Yai", addr:"Lee Gardens Plaza 1F, Niphat Uthit 3 Rd", hv:false,
    hours:"07:00–23:00", note:"冷氣、插座、點餐後有 Wi-Fi。07:00 要坐 1–2 小時最保險的選項。" },
  acup: { n:"A Cup Cafe Hatyai", short:"A Cup", cat:"coffee", lat:7.0107059, lng:100.4744862, km:0.6, walk:8, grab:6,
    q:"A Cup Cafe Hatyai", addr:"144/28 Sangsri Rd", hv:false,
    hours:"每日 07:00–20:00", note:"筆電友善清單收錄；充電每小時加收 50 THB。" },
  realm: { n:"Realm (เริ่ม) Cafe", short:"Realm", cat:"coffee", lat:7.0043, lng:100.4700, km:0.7, walk:9, grab:6, onMap:false,
    q:"Realm cafe Thammanoon Vithi Rd Hat Yai", addr:"613 Thammanoon Vithi Rd（近火車站、Wat Khok Nao 旁）", hv:false,
    hours:"07:00–21:00", note:"1F 咖啡、樓上餐廳與頂樓。電話 095-023-7775。" },
  chokdee: { n:"Chokdee Dim Sum โชคดีแต่เตี้ยม", short:"Chokdee 點心", cat:"food", lat:7.0030, lng:100.4760, km:1.1, walk:15, grab:7,
    q:"Chokdee Dim Sum Hat Yai", addr:"58/25 Lamai Songkhro Rd Soi 1", hv:false,
    hours:"06:00–11:30、17:00–20:30（另有來源 06:00–12:00／17:00–22:00）", note:"合艾最有名的港式點心，抽號碼牌，10:00 前常賣完。電話 +66 74 234 253。",
    price:"每籠 20–45 THB，兩人約 200–300 THB" },
  hype: { n:"HYPE Coffee Bar", short:"HYPE", cat:"coffee", lat:7.0075, lng:100.4700, km:0.6, walk:8, grab:6, onMap:false,
    q:"HYPE Coffee Bar Hat Yai", addr:"19 Niphat Uthit 2 Rd（Kim Yong 市場街區內）", hv:false,
    hours:"08:30–17:00/18:00，週四休", note:"週五、六可去；10/8（四）不要撲空。" },
  desktop: { n:"Desktop Co-working Space", short:"Desktop CoWork", cat:"work", lat:7.0065234, lng:100.4732034, km:0.5, walk:7, grab:5,
    q:"Desktop Co-working Space Hat Yai", addr:"178/13 Prachathipat Rd", hv:false,
    hours:"一–五 07:00–21:00；六日 09:00–19:00", note:"每桌有插座。日票價格未查到，到場詢問。FB：DTCoWorkingSpace。" },
  better: { n:"Better Together Café & Bistro", short:"Better Together", cat:"work", lat:7.0040, lng:100.4728, km:0.9, walk:12, grab:7, onMap:false,
    q:"Better Together Cafe Bistro Prachathipat Rd Hat Yai", addr:"247 Prachathipat Rd（S Hatyai Hotel 對面）", hv:false,
    hours:"約 09:30–19:00", note:"3F 咖啡、4F 工作區，安靜、有插座與 Wi-Fi（評論）。" },
  tuber: { n:"Tuber Co-working Space", short:"Tuber", cat:"work", lat:7.0082, lng:100.4728, km:0.6, walk:8, grab:6, onMap:false,
    q:"Tuber Co-working Space Hat Yai", addr:"269 Saengchan Rd", hv:false,
    hours:"約 10:00–20:00（2025/26 是否仍營業未確認）", note:"合艾第一間 coworking。先打 +66 88 886 8910 確認。" },

  /* ---- 市區景點／商場 ---- */
  kimyong: { n:"Kim Yong Market 金榮市場", short:"Kim Yong", cat:"shop", lat:7.0079725, lng:100.4697246, km:0.6, walk:8, grab:6,
    q:"Kim Yong Market Hat Yai", addr:"Supasarnrungsan Rd × Niphat Uthit 1", hv:false,
    hours:"每日約 07:00–18:00", note:"零食、乾貨、水果、泰奶粉。2025/11 水災後已恢復營業。" },
  leegarden: { n:"Lee Gardens Plaza", short:"Lee Garden", cat:"shop", lat:7.0058506, lng:100.4716957, km:0.6, walk:8, grab:6,
    q:"Lee Gardens Plaza Hat Yai", addr:"29 Prachathipat Rd", hv:false,
    hours:"商場約 10:00–21:00；周邊 Niphat Uthit 3 夜間攤販到深夜", note:"合艾市中心地標，周邊換錢所、按摩、小吃最密集。" },
  chuechang: { n:"Wat Chue Chang 慈善堂", short:"慈善堂", cat:"sight", lat:7.0086758, lng:100.4721180, km:0.1, walk:2, grab:5,
    q:"Wat Chue Chang Hat Yai", addr:"118 Supasarnrungsan Rd（Airbnb 旁）", hv:false,
    hours:"每日 07:00–19:00", note:"華人寺廟，Airbnb 走路 2 分鐘。" },
  odean: { n:"Odean Shopping Mall", short:"Odean", cat:"shop", lat:7.0045882, lng:100.4711067, km:0.6, walk:8, grab:6, onMap:false,
    q:"Odean Shopping Mall Hat Yai", addr:"Sanehanusorn Rd", hv:false, hours:"約 10:00–21:00" },
  central: { n:"Central Hatyai", short:"Central", cat:"shop", lat:6.9918582, lng:100.4829622, km:2.9, walk:39, grab:14,
    q:"Central Hatyai", addr:"1518 Kanjanavanich Rd", hv:false,
    hours:"每日 10:00–21:00（部分來源 22:00）", note:"大型冷氣商場，有 Starbucks 可工作；雨天備案。" },
  park: { n:"Hat Yai Municipal Park 市立公園（纜車）", short:"Municipal Park", cat:"sight", lat:7.0424056, lng:100.5119483, km:7.4, walk:99, grab:22,
    q:"Hat Yai Municipal Park Cable Car", addr:"Khao Kho Hong, Kanjanavanich Rd 以東", hv:true,
    hours:"公園 05:00–20:00；纜車 09:00–16:00（10/8 即時清單；另一來源五–日到 17:30），週一休，大雨停駛",
    note:"纜車連接四面佛／觀音／大佛三座山頭。票價：外國人 200 THB（另有來源 50 THB 來回＋公園 20 THB），只收現金。深綠雙條車 1871 路可回 Kim Yong 市場。",
    price:"纜車 50–200 THB" },
  clocktower: { n:"Hat Yai 鐘樓", short:"鐘樓", cat:"sight", lat:7.0117267, lng:100.4701937, km:0.7, walk:9, grab:7, onMap:false,
    q:"Hat Yai Clock Tower", addr:"Phetkasem Rd", note:"附近穆斯林 roti 攤到深夜。" },

  /* ---- 夜市 ---- */
  asean: { n:"ASEAN Night Bazaar", short:"ASEAN 夜市", cat:"night", lat:6.9944565, lng:100.484117, km:3.0, walk:40, grab:13,
    q:"ASEAN Night Bazaar Hatyai", addr:"76/5 Chotevittayakul 4 Rd", hv:false,
    hours:"二–日 16:00–22:00，週一休（另有來源 17:00 起）", note:"合艾最大夜市：泰式小吃、海鮮、泰奶、衣服雜貨。10/9（五）有開。",
    price:"小吃 20–50、一盤 50–100 THB" },
  khlonghae: { n:"Khlong Hae Floating Market 水上市場", short:"Khlong Hae 水上市場", cat:"night", lat:7.0461795, lng:100.4738196, km:5.1, walk:68, grab:17,
    q:"Khlong Hae Floating Market", addr:"Khlong Hae–Khu Tao Rd", hv:true,
    hours:"只開五、六、日 15:00–21:00（另有來源六日 14:00–20:00）；一–四不開", note:"船上賣小吃、海鮮、甜點，2026/1 水災後已重開。回程 Grab 較難叫，可請 tuk-tuk 等候（來回約 350–500 THB）。",
    price:"小吃 20–60 THB/份" },
  greenway: { n:"Greenway Night Market", short:"Greenway", cat:"night", lat:6.9975025, lng:100.4874643, km:3.8, walk:51, grab:13,
    q:"Greenway Night Market Hat Yai", addr:"1406/3 Kanjanavanich Rd（Central 附近）", hv:true,
    hours:"17:00–22:00（10/8 即時清單）；二–日，週一休", note:"年輕人取向的小吃夜市，備案用。" },

  /* ---- 按摩 ---- */
  oliver: { n:"Oliver Thai Traditional Massage", short:"Oliver 按摩", cat:"massage", lat:7.0048, lng:100.4692, km:0.6, walk:8, grab:6,
    q:"Oliver Thai Traditional Massage Hat Yai", addr:"1 Rajuthit Soi 7 Rd（Lee Garden 與火車站之間）", hv:true,
    hours:"每日 09:00–23:00", note:"Google 4.2（332 則）。電話 +66 74 253 425。10/8 上午 10:00 首選。",
    price:"泰式 2 小時約 450 THB（2025/10 評論）" },
  pailin: { n:"Pailin Massage（Lee Garden 旁）", short:"Pailin 按摩", cat:"massage", lat:7.0060, lng:100.4720, km:0.6, walk:8, grab:6, onMap:false,
    q:"Pailin Massage Hat Yai", addr:"Lee Garden Plaza 旁（Pailin 1 & 2）", hv:true,
    hours:"每日 07:00–24:00", note:"Google 4.3（97 則）。泰式、精油、熱石。電話 +66 74 236 307。",
    price:"腳底約 200 THB/h；泰式／精油未查到" },
  easeme: { n:"Ease Me Massage & Residence", short:"Ease Me", cat:"massage", lat:7.0046184, lng:100.4747596, km:0.7, walk:9, grab:6,
    q:"Ease Me Thai Massage and Residence Hat Yai", addr:"79/17 Thamnoonvithi Rd（分店 45/2 Sanehanusorn Rd）", hv:true,
    hours:"一–四 11:00–22:00；五–日 11:00–24:00", note:"Google 4.4（175 則）。較高價、環境好；平日 16:00 前 9 折。10/10（六）晚上精油按摩首選。電話 +66 97 963 6619。",
    price:"腳底 1h 約 450 THB；精油價格到場詢問" },
  theone: { n:"The One Beauty Massage – Hatyai Center", short:"The One 按摩", cat:"massage", lat:6.9952341, lng:100.4846466, km:2.9, walk:39, grab:13,
    q:"The One Beauty Massage Hatyai Center", addr:"144 Chotwithayakul 5 Rd（ASEAN 夜市一帶）", hv:true,
    hours:"每日 11:00–24:00", note:"Google 4.9（2,678 則）。泰式、精油、芳療、熱石、草藥球。熱門，建議 LINE／WhatsApp 預約：092 239 9293。10/9 逛完 ASEAN 夜市順路。" },
  sukniyom: { n:"Sukniyom Thai Massage", short:"Sukniyom", cat:"massage", lat:7.0045, lng:100.4722, km:0.6, walk:8, grab:6, onMap:false,
    q:"Sukniyom Thai Massage Hat Yai", addr:"94 Thamnoonvithi Rd, Indra Hotel 2F", hv:false,
    hours:"未查到", price:"泰式 1h 300／2h 500 THB（評論）" },

  /* ---- 吃飯 ---- */
  decha: { n:"Kai Tod Decha 德差炸雞", short:"Decha 炸雞", cat:"food", lat:7.00397, lng:100.473763, km:0.7, walk:9, grab:6,
    q:"Kai Tod Decha Hat Yai", addr:"93 Chee Uthit Rd", hv:false,
    hours:"每日 11:00–21:30（另一來源 10:00–21:00）", note:"合艾炸雞代表店，清真、不賣酒。電話 +66 81 098 3751。", price:"兩人約 300–400 THB" },
  jaelek: { n:"Jae Lek Thai Restaurant", short:"Jae Lek", cat:"food", lat:7.0027381, lng:100.4703475, km:1.2, walk:16, grab:7,
    q:"Jae Lek Thai Restaurant Hat Yai", addr:"190/3-4 Niphat Uthit 2 Rd", hv:false,
    hours:"每日 10:00–22:00", note:"泰華菜、菜單很大，適合兩人點幾道分食。", price:"兩人約 300–500 THB" },
  bankampu: { n:"Bankampu Hatyai 螃蟹海鮮", short:"Bankampu", cat:"food", lat:7.0023861, lng:100.4754674, km:1.1, walk:15, grab:7,
    q:"Bankampu Hatyai", addr:"22/4-5 Lamai Songkhro Rd", hv:false,
    hours:"每日 11:00–22:00", note:"蟹肉炒飯、海鮮，18:30 後常客滿，早點到。", price:"兩人約 500–900 THB" },
  banthungkham: { n:"Ban Thung Kham Seafood", short:"Thung Kham", cat:"food", lat:7.0050, lng:100.4722, km:0.6, walk:8, grab:6, onMap:false,
    q:"Ban Thung Kham Seafood Hat Yai", addr:"124/1 Niphat Uthit 3 Rd", hv:false, hours:"11:00–22:00", price:"兩人約 500–800 THB" },
  streetfood: { n:"Niphat Uthit 1–3 街頭小吃", short:"街頭小吃", cat:"food", lat:7.0050, lng:100.4705, km:0.6, walk:8, grab:6, onMap:false,
    q:"Niphat Uthit 3 Rd Hat Yai", addr:"Lee Garden 周邊三條 Niphat Uthit 路", hv:false,
    hours:"傍晚到午夜", note:"炸雞、烤肉串、泰奶、roti；一份 50–80 THB。" },

  /* ---- 夜生活 ---- */
  postlaser: { n:"Post Laser Disc Pub", short:"Post Laser", cat:"bar", lat:7.0044761, lng:100.4720097, km:0.7, walk:9, grab:6,
    q:"Post Laser Disc Pub Hat Yai", addr:"82–84 Thammanoon Vithi Rd（Indra Hotel 對面）", hv:false,
    hours:"約 18:00–02:00", note:"英式酒吧、現場音樂、有 Guinness。電話 +66 74 232 027。", price:"啤酒 80–150 THB" },
  pocoloko: { n:"Poco Loko", short:"Poco Loko", cat:"bar", lat:7.0030, lng:100.4705, km:0.7, walk:9, grab:6, onMap:false,
    q:"Poco Loko Hat Yai", addr:"195 Niphat Uthit 2 Rd", hv:false,
    hours:"19:00–24:00，週三休", note:"便宜的啤酒小吧。", price:"啤酒 70–100 THB" },
  sintonic: { n:"Sin Tonic", short:"Sin Tonic", cat:"bar", lat:7.0094233, lng:100.4833942, km:1.8, walk:24, grab:9,
    q:"Sin Tonic Hat Yai", addr:"35 Rajyindee Soi 2", hv:false,
    hours:"每日 18:00–01:00", note:"泰國烈酒調酒吧。", price:"調酒 200–350 THB" },
  safetystop: { n:"Safety Stop Bar", short:"Safety Stop", cat:"bar", lat:7.0046, lng:100.4760, km:0.8, walk:11, grab:6, onMap:false,
    q:"Safety Stop Bar Hat Yai", addr:"391 Thammanoon Vithi Rd", hv:false,
    hours:"18:00–24:00，週四休", note:"7 支生啤＋精釀。10/8（四）不開，10/9、10/10 可去。" },

  /* ---- 醫院 ---- */
  bkkhosp: { n:"Bangkok Hospital Hat Yai（私立，24h 急診）", short:"Bangkok Hospital", cat:"sight", lat:7.0160263, lng:100.4864657, km:2.5, walk:33, grab:11, onMap:false, inTable:false,
    q:"Bangkok Hospital Hat Yai", addr:"75 Soi 15 Phetkasem Rd", hours:"急診 24 小時", note:"電話 074-272-800 / 1719" }
};

/* ---------- 固定提醒（首頁與資訊頁） ---------- */
const ALERTS = [
  "泰國比馬來西亞<b>慢 1 小時</b>：泰國 07:20 = 馬來西亞 08:20。火車時刻看清楚是哪國時間。",
  "10/8 凌晨 <b>04:11（馬）／03:11（泰）</b>抵達 Padang Besar。最早一班往 Hat Yai 的 SRT 接駁車是 <b>10:15 泰國時間</b>，車站關口只在泰國火車進出時開；要 06–07 點到合艾只能 06:00（馬）陸路關口開門後走過去再搭車。",
  "10/8 白天需要工作：<b>12:00–18:00</b> 固定工作時段。",
  "10/8 <b>18:00 後</b>才正式開始 Vacation Mode。",
  "10/11 <b>11:00（馬）Padang Besar ETS</b> 是固定、不可錯過的行程。注意：KTMB 2026/6/1 時刻表上 Padang Besar 南下班次是 09:45（EP9225）與 12:05（EG9449），<b>請用 KITS 訂票紀錄核對實際班次</b>。",
  "10/11 早上必須預留足夠時間：<b>07:20 的 45 次</b>是唯一來得及的火車（08:55 接駁車 10:40 馬來西亞時間才到，過關後趕不上 11:00）。06:45 前出門，06:55 前到站買票。",
  "入境：泰國 <b>TDAC</b> 數位入境卡抵達前 3 天內填（10/5–10/8）；馬來西亞 <b>MDAC</b> 10/9–10/11 內填。",
  "10 月是雨季：每天都可能午後／夜間雷陣雨，隨身帶雨具；水上市場、纜車遇大雨會停。",
  "2025 年 11 月合艾大水災後部分店家營業時間可能變動，前一晚用 Google Maps 再確認一次。"
];

/* ---------- 每日行程 ---------- */
const DAYS = [
  { d:"10/08", dow:"週四", kind:"work", title:"抵達 → 早餐 → 按摩 → 工作 → 18:00 放假",
    foot:"前一晚幾乎沒睡，今晚別排太晚；22:00 前回 Airbnb。工作地點優先順序：Airbnb 房內 → Desktop Co-working → 咖啡廳。",
    items:[
      { s:"03:11", e:"05:00", cat:"border", t:"抵達 Padang Besar（馬 04:11）", place:"padang", noleave:true,
        d:"KTM 夜車 04:11 馬來西亞時間到站＝<b>03:11 泰國時間</b>。車站內 CIQ 只在泰國火車進出時運作，此刻什麼都沒開；SRT 最早一班 10:15（泰）才開。在 2F 候車區／車站附近休息等天亮。",
        warn:["凌晨車站無任何往合艾的交通","SRT 接駁車最早 10:15 泰國時間（11:15 馬）"],
        tips:["泰國時間＝馬來西亞 −1h","車站有廁所、小吃部（夜間是否開放未確認）"] },
      { s:"05:00", e:"06:30", cat:"border", t:"走路過關 → 搭車前往 Hat Yai", noleave:true,
        d:"06:00（馬）＝05:00（泰）陸路關口開門：從車站 2F 走天橋到 ICQS 關口約 10 分鐘，辦馬來西亞出境、泰國入境（出示 TDAC QR）。泰國側找計程車到合艾（約 1 小時，2023 年喊價 700–1,500 THB，可殺價）；省錢的話等 07:00 的小巴（60 THB，到合艾巴士總站，再 Grab 進市區）。",
        warn:["此段是整趟最不確定的環節：凌晨關口外計程車數量少"],
        tips:["準備泰銖現金或馬幣","護照效期 ≥ 6 個月","2 人分攤計程車划算"] },
      { s:"06:30", e:"07:00", cat:"train", t:"抵達 Hat Yai 市區", place:"station", noleave:true,
        d:"計程車可直接請司機開到 Supasarnrungsan Rd（Kim Yong 市場旁）或先到早餐店；若搭小巴則在巴士總站下車，Grab 約 12 分鐘進市區。" },
      { s:"07:00", e:"08:30", cat:"coffee", t:"早餐＋咖啡＋休息", place:"morningcup", places:["morningcup","mcd","chokdee","acup"],
        d:"首選 <b>Morning Cup</b>（06:30 開、kopi＋咖椰吐司）；要坐久、確定有插座與 Wi-Fi 就去 <b>McDonald's Lee Gardens</b>（07:00）；想吃點心去 <b>Chokdee Dim Sum</b>（06:00 開，抽號碼牌）。",
        tips:["Morning Cup 週一休（另說週三）","帶著行李先別跑太遠"] },
      { s:"08:30", e:"09:30", cat:"home", t:"到 Airbnb 寄放行李／問能否提早入住", place:"home",
        d:"能入住：先洗澡休息。不能：寄放行李後到咖啡廳休息（A Cup Cafe 07:00 開，走路 8 分鐘）。",
        tips:["事前先用 Airbnb App 問房東 early check-in","記下門鎖密碼／Wi-Fi"] },
      { s:"10:00", e:"11:30", cat:"massage", t:"泰式按摩 60–90 分鐘（不要太大力）", place:"oliver", places:["oliver","pailin"],
        d:"首選 <b>Oliver Thai Traditional Massage</b>（09:00 開，走路 8 分鐘）；備案 <b>Pailin Massage</b>（Lee Garden 旁，07:00 開）。跟師傅說「เบา ๆ」（bao-bao，輕一點）。",
        tips:["泰式 1h 約 200–300 THB","小費 50–100 THB 直接給師傅"] },
      { s:"11:30", e:"12:00", cat:"food", t:"午餐外帶 → 回工作地點", place:"home",
        d:"Lee Garden 周邊買炸雞、泰式便當或 7-Eleven 外帶，12:00 前就定位。" },
      { s:"12:00", e:"18:00", cat:"work", t:"固定工作時間", place:"home", places:["desktop","better","tuber","central"],
        d:"1. Airbnb 房內（先測 Wi-Fi 速度）→ 2. <b>Desktop Co-working</b>（一–五 07:00–21:00，走路 7 分鐘，每桌插座）→ 3. <b>Better Together Café</b> 4F 工作區（約 09:30–19:00）。全部不行就 Grab 到 Central Hatyai 的 Starbucks。",
        tips:["需要：穩定 Wi-Fi、插座、冷氣、能坐 4–6 小時","熱點備援：先確認手機 SIM 流量"] },
      { s:"18:00", e:"18:30", cat:"home", t:"工作結束 → Vacation Mode", place:"home", noleave:true,
        d:"收電腦、沖澡、換衣服。" },
      { s:"18:30", e:"20:00", cat:"food", t:"市中心晚餐", place:"decha", places:["decha","jaelek","bankampu"],
        d:"首選 <b>Kai Tod Decha</b> 合艾炸雞（到 21:30，清真不賣酒）；想配啤酒去 <b>Jae Lek</b> 泰華菜（到 22:00）；想吃海鮮去 <b>Bankampu</b> 蟹肉炒飯（18:30 後易客滿）。",
        tips:["兩人 300–600 THB"] },
      { s:"20:00", e:"22:00", cat:"bar", t:"Lee Garden Plaza／Niphat Uthit 街區 · 夜市小吃 · 啤酒", place:"leegarden", places:["leegarden","streetfood","postlaser","pocoloko"],
        d:"逛 Lee Garden 周邊夜間攤販與換錢所；喝一杯去 <b>Post Laser Disc Pub</b>（英式酒吧、現場音樂）或 <b>Poco Loko</b>（便宜啤酒，週三休）。Safety Stop Bar 週四休，今天別去。",
        tips:["第一晚不要太晚","7-Eleven 啤酒 35–45 THB 回房喝也行"] },
      { s:"22:00", e:"23:00", cat:"home", t:"回 Airbnb 休息", place:"home", d:"走路 8 分鐘。明天 09:00 起床。" }
    ]},

  { d:"10/09", dow:"週五", kind:"off", title:"市區散步 · 市立公園纜車 · ASEAN 夜市",
    foot:"下午雷陣雨機率高：若 14:00 下大雨，纜車會停，改去 Central Hatyai 逛街或按摩，夜市照常。",
    items:[
      { s:"09:00", e:"10:00", cat:"coffee", t:"起床＋早餐", place:"chokdee", places:["chokdee","morningcup","hype"],
        d:"<b>Chokdee Dim Sum</b>（06:00–11:30，走路 15 分鐘）或 <b>Morning Cup</b>；想喝精品咖啡去 Kim Yong 街區的 <b>HYPE Coffee Bar</b>（08:30 開，週五有開）。" },
      { s:"10:00", e:"12:00", cat:"shop", t:"Hat Yai 市區：Kim Yong 市場 · 慈善堂 · Lee Garden", place:"kimyong", places:["kimyong","chuechang","leegarden","odean","clocktower"],
        d:"全部走路可達：Airbnb → <b>Wat Chue Chang 慈善堂</b>（2 分鐘）→ <b>Kim Yong Market</b> 買零食、泰奶粉、乾貨（8 分鐘）→ 鐘樓 → <b>Lee Garden Plaza</b>／Odean 吹冷氣。",
        tips:["Kim Yong 約 07:00–18:00","慈善堂 07:00–19:00","伴手禮這裡買最齊"] },
      { s:"12:00", e:"14:00", cat:"food", t:"午餐＋咖啡（悠閒）", place:"jaelek", places:["jaelek","acup","hype"],
        d:"<b>Jae Lek</b> 泰華菜（10:00 開）之後到 <b>A Cup Cafe</b> 或 HYPE 喝咖啡、休息，不要塞景點。" },
      { s:"14:30", e:"17:30", cat:"sight", t:"Hat Yai Municipal Park 市立公園 · 纜車 · 看城市", place:"park", buffer:10,
        d:"Grab 約 22 分鐘（7.4 km，約 100–150 THB）。纜車連接四面佛／觀音／大佛三座山頭，俯瞰合艾全景。<b>纜車 16:00 收班</b>（有來源說週五到 17:30），15:00 前到纜車站最保險；之後在公園散步拍照。",
        warn:["纜車 16:00 收班（最晚 17:30）→ 建議 14:00 就出發","大雨停駛"],
        tips:["纜車只收現金（50–200 THB）","回程可搭深綠雙條車 1871 到 Kim Yong，或在公園門口叫 Grab"] },
      { s:"18:00", e:"22:00", cat:"night", t:"ASEAN Night Bazaar 夜市晚餐", place:"asean", buffer:5,
        d:"公園直接 Grab 到夜市（約 6 km、15 分鐘）。泰式街頭美食、海鮮、小吃、泰奶、衣服雜貨。二–日 16:00–22:00。",
        tips:["小吃 20–50 THB/份","帶小額現金","夜市旁就是 The One Beauty Massage"] },
      { s:"22:00", e:"23:30", cat:"massage", t:"回 Airbnb（視體力：喝一杯或按摩）", place:"home", places:["theone","easeme","safetystop"],
        d:"夜市旁的 <b>The One Beauty Massage</b>（4.9 分、到 24:00，熱門建議 LINE 預約）或回市區的 <b>Ease Me</b>（週五到 24:00）。想喝一杯去 Safety Stop Bar（週五有開）。Grab 回 Airbnb 約 13 分鐘。" }
    ]},

  { d:"10/10", dow:"週六", kind:"off", title:"睡飽 · 自由活動 · Khlong Hae 水上市場 · 最後按摩",
    foot:"今天不要排滿。水上市場只開五六日，今天是最後機會；回程 Grab 較難叫，可請 tuk-tuk 等候或多留 15 分鐘叫車。23:00 回房一定要打包完，明早 06:00 起床。",
    items:[
      { s:"10:00", e:"11:30", cat:"coffee", t:"睡晚一點 · 早午餐＋咖啡", place:"acup", places:["acup","morningcup","chokdee","better"],
        d:"<b>A Cup Cafe</b>、<b>Morning Cup</b>（到 14:00）或 Better Together Café。想吃點心的話 Chokdee 11:30 前到。" },
      { s:"11:30", e:"14:00", cat:"shop", t:"自由活動：商場 · 市區散步 · 按摩 · Shopping", place:"central", places:["central","leegarden","kimyong","pailin","oliver"],
        d:"選一：Grab 14 分鐘到 <b>Central Hatyai</b> 吹冷氣逛街（10:00–21:00）；或市區散步補買伴手禮；或先來一次腳底按摩（Pailin／Oliver）。午餐在商場或市區解決。",
        tips:["雨天首選 Central","行李空間先想好"] },
      { s:"14:00", e:"14:40", cat:"home", t:"回 Airbnb 休息、換輕裝", place:"home", noleave:true, d:"把要帶去水上市場的現金、雨具準備好。" },
      { s:"15:00", e:"21:00", cat:"night", t:"Khlong Hae Floating Market 水上市場", place:"khlonghae", buffer:10,
        d:"Grab 約 17 分鐘（5.1 km，約 100–200 THB）。五六日 15:00–21:00（也有來源說週六 14:00–20:00，建議 16:00 前到最熱鬧）。船上買小吃、海鮮、泰式甜點，拍照。",
        warn:["只開五、六、日","回程 Grab 不好叫：請 tuk-tuk 等候（來回 350–500 THB）或 20:00 前離開"],
        tips:["小吃 20–60 THB/份","現金","下雨會提早收攤"] },
      { s:"18:00", e:"20:00", cat:"food", t:"市場內晚餐", place:"khlonghae", noleave:true,
        d:"烤海鮮、炒粿條、泰式甜點，邊逛邊吃。20:00–20:15 離開回市區。" },
      { s:"21:00", e:"23:00", cat:"massage", t:"最後一次按摩：精油／芳療／放鬆", place:"easeme", places:["easeme","theone","pailin"],
        d:"首選 <b>Ease Me</b>（週六到 24:00，走路 9 分鐘，環境好）；或 <b>The One Beauty Massage</b>（4.9 分，到 24:00，要先預約，Grab 13 分鐘）；備案 Pailin（到 24:00）。選 Oil / Aromatherapy / Relaxing，不要太大力。",
        tips:["精油 1h 約 400–500 THB","21:00 前到店才能做 90–120 分鐘"] },
      { s:"23:00", e:"23:45", cat:"home", t:"回 Airbnb · 整理行李", place:"home",
        d:"全部打包完再睡。明天 06:00 起床，06:45 出門。手機充飽、鬧鐘兩個。" }
    ]},

  { d:"10/11", dow:"週日", kind:"fly", title:"回吉隆坡：07:20 火車 → Padang Besar → 11:00 ETS",
    foot:"今天不排任何其他活動。45 次從曼谷開來可能誤點，但它是唯一來得及的班次；若 07:00 仍未見列車資訊，立即改叫計程車直奔 Padang Besar（約 1 小時，700–1,500 THB），仍可趕上 11:00 ETS。",
    items:[
      { s:"06:00", e:"06:15", cat:"home", t:"起床 · 最後檢查", place:"home", noleave:true,
        d:"護照、火車票／KITS 訂票、充電線、鑰匙歸還。MDAC 已填？" },
      { s:"06:15", e:"06:45", cat:"coffee", t:"早餐／Check-out", place:"home", noleave:true,
        d:"7-Eleven 或 Morning Cup（週日 06:30 開，但來回 30 分鐘，趕的話買了就走）。06:45 準時出門。" },
      { s:"06:45", e:"07:05", cat:"train", t:"前往 Hat Yai Junction · 買票", place:"station", buffer:20,
        d:"走路 16 分鐘或 Grab 8 分鐘（行李多就 Grab，06:30 前先叫車）。到櫃台買 Hat Yai → Padang Besar 3 等車票 50 THB／人（現金）。",
        tips:["06:55 前到站","月台看板確認 45 次／Padang Besar"] },
      { s:"07:20", e:"08:05", cat:"train", t:"45 次 Hat Yai → Padang Besar", place:"padang", noleave:true,
        d:"曼谷開來的特快，合艾加掛 3 等車廂。中途停 Khlong Ngae、Padang Besar (Thai)——<b>泰國那站不要下車</b>，坐到終點馬來西亞 Padang Besar。08:05 泰國時間＝09:05 馬來西亞時間抵達。",
        warn:["列車誤點 >40 分鐘 → 直接改計程車"] },
      { s:"09:05", e:"10:00", cat:"border", t:"（馬 09:05）下車過關：泰國出境 → 馬來西亞入境", place:"padang", noleave:true,
        d:"下車後在月台層 CIQ 依序辦泰國出境章、馬來西亞入境（MDAC）、海關開包檢查。約 30–60 分鐘。之後到 ETS 月台（西側）等車。<span class=\"muted\">此列顯示為馬來西亞時間（泰 08:05–09:00）。</span>",
        tips:["馬來西亞時間 +1h","KITS 車票先截圖"] },
      { s:"10:00", e:"10:50", cat:"home", t:"（馬 10:00–10:50）候車 buffer", noleave:true,
        d:"車站小吃部買水和早餐，不要離開車站。<span class=\"muted\">泰 09:00–09:50。</span>" },
      { s:"10:50", e:"11:00", cat:"train", t:"（馬 11:00）ETS Padang Besar → Kuala Lumpur", noleave:true,
        d:"固定且不可錯過。<b>請用 KITS 核對實際車次</b>：KTMB 2026/6 時刻表 Padang Besar 南下為 09:45（EP9225，15:10 到 KL Sentral）與 12:05（EG9449，約 17:45 到）；11:00 前後的班次可能是假期加班車。<span class=\"muted\">此列泰國時間 09:50–10:00。</span>",
        warn:["以 KTMB KITS 訂票為準"] }
    ]}
];

/* ---------- 交通頁 ---------- */
const TRANSIT = {
  tznote:"泰國 UTC+7、馬來西亞 UTC+8。火車時刻表各用自己國家的時間：SRT 用泰國時間、KTM 用馬來西亞時間。手機跨境後會自動跳時區，看時間先確認是哪一國。",
  inbound:{
    steps:[
      { t:"04:11", tz:"馬 · 泰 03:11", x:"KTM 抵達 Padang Besar（馬來西亞站）。站內 CIQ 此時不開。" },
      { t:"06:00", tz:"馬 · 泰 05:00", x:"陸路關口開門（06:00–22:00 馬）。從車站 2F 走天橋到 ICQS 約 10 分鐘，辦馬出境＋泰入境（TDAC QR）。", hl:true },
      { t:"06:30+", tz:"泰", x:"泰國側計程車到合艾約 1 小時（2023 年喊價 700–1,500 THB）；或等 07:00 起的小巴（60 THB，到合艾巴士總站）。" },
      { t:"10:15", tz:"泰 · 馬 11:15", x:"若不趕時間：SRT 948 次接駁車，11:00 到 Hat Yai Junction。售票櫃台約 09:00（馬）開，2F 右側。" }
    ],
    trains:[
      { dep:"10:15", arr:"11:00", no:"948 接駁", note:"當日最早班。50 THB／RM7，3 等、電扇、不劃位。", hl:true },
      { dep:"15:40", arr:"16:25", no:"950 接駁", note:"" },
      { dep:"17:00", arr:"17:45", no:"46 特快", note:"曼谷方向特快加掛 3 等車廂" }
    ],
    notes:[
      "沒有任何火車在 03:11–10:15（泰）之間。要 06–07 點到合艾只能走陸路關口再搭車。",
      "SRT 接駁車票只在車站當天買，從不賣完；車程約 45 分鐘、約 60 km。",
      "資料來源為 Thai Train Guide（2025/8 更新）與 train36（2026），未在 SRT 官網核對；可打 SRT 1690 確認。",
      "2025/12 水災後接駁車已恢復。"
    ]
  },
  outbound:{
    alerts:[
      "<b>07:20 的 45 次是唯一來得及 11:00 ETS 的火車</b>。08:55 接駁車 10:40（馬）才到，過關 30–60 分鐘後趕不上。",
      "KTMB 2026/6/1 時刻表無 11:00 班次（09:45 EP9225、12:05 EG9449）。<b>請用 KITS 訂票核對</b>，若其實是 09:45 那班，07:20 火車到站後只有 40 分鐘，請改搭更早的計程車。"
    ],
    steps:[
      { t:"06:45", tz:"泰", x:"出門：走路 16 分鐘或 Grab 8 分鐘到 Hat Yai Junction。" },
      { t:"06:55", tz:"泰", x:"櫃台買票 50 THB／人（現金），看板確認 45 次。" },
      { t:"07:20", tz:"泰", x:"45 次發車（曼谷開來，可能誤點）。", hl:true },
      { t:"08:05", tz:"泰 · 馬 09:05", x:"抵達 Padang Besar（馬來西亞站）。不要在 Padang Besar (Thai) 下車。", hl:true },
      { t:"09:05–10:00", tz:"馬", x:"月台層 CIQ：泰國出境 → 馬來西亞入境（MDAC）→ 海關檢查。" },
      { t:"11:00", tz:"馬", x:"ETS 往 Kuala Lumpur（以 KITS 訂票為準）。", hl:true }
    ],
    trains:[
      { dep:"07:20", arr:"08:05（馬 09:05）", no:"45 特快", note:"曼谷→合艾→Padang Besar，合艾加掛 3 等車廂，50 THB。", hl:true },
      { dep:"08:55", arr:"09:40（馬 10:40）", no:"947 接駁", note:"趕不上 11:00 ETS", dim:true },
      { dep:"14:00", arr:"14:45（馬 15:45）", no:"949 接駁", note:"", dim:true }
    ],
    ets:[
      { dep:"07:20", arr:"12:45", no:"EP9223", note:"", dim:true },
      { dep:"08:15", arr:"13:40", no:"EP9425", note:"", dim:true },
      { dep:"09:45", arr:"15:10", no:"EP9225", note:"45 次到站後 40 分鐘接駁，很緊" },
      { dep:"11:00", arr:"—", no:"（你的訂票）", note:"不在 2026/6 時刻表內，請核對 KITS", hl:true },
      { dep:"12:05", arr:"約 17:45", no:"EG9449", note:"最安全的備援班次" },
      { dep:"13:50", arr:"18:40", no:"EX9209", note:"", dim:true }
    ],
    notes:[
      "KTM ETS、Komuter、SRT 接駁車都在同一個 Padang Besar（馬來西亞）車站：馬來西亞列車用西側月台，泰國列車用東側。",
      "備援：火車出狀況時，從合艾叫計程車直達 Padang Besar 約 1 小時（58 km）；小巴 07:00 起從巴士總站發車，坐滿才開、約 1.5 小時，在泰國關口放人，再走 600–700 m 到馬來西亞車站。",
      "來源：KTMB《Jadual Tren ETS 1 Jun 2026》PDF、Thai Train Guide、train36。"
    ]
  },
  border:[
    "Padang Besar（馬）車站有馬來西亞唯一的「同址 CIQ」：馬、泰兩國櫃台都在月台層同一棟樓，只服務火車旅客。",
    "<b>往泰國</b>：兩國手續都在上車前辦完（馬出境 → 泰入境 → 上車）。閘門只在發車前不久才開。",
    "<b>回馬來西亞</b>：下車後泰出境章 → 馬入境 → 海關開包檢查。預留 30–60 分鐘。",
    "陸路關口（ICQS）在車站北邊約 200 m，從 2F 天橋走 10 分鐘；06:00–22:00（馬）開放。",
    "泰國 TDAC（tdac.immigration.go.th）：所有外國人陸海空入境都要，免費，抵達前 3 天內填，一人一份，出示 QR。",
    "馬來西亞 MDAC（imigresen-online.imi.gov.my/mdac）：每次入境都要，免費，抵達前 3 天內填，填錯不能改、要重填。",
    "台灣護照：2026/9/15 起泰國免簽改為 30 天，且<b>陸路免簽入境每年限 2 次</b>（二手來源，請以泰國官方為準）。護照效期 ≥ 6 個月。"
  ],
  local:[
    "<b>Grab</b>：合艾市區可用，App 內定價。GrabCar 市區短程約 40–80 THB，GrabBike 25–60 THB；尖峰、下雨加價 20–100%。00:00–05:00 司機很少。",
    "<b>Tuk-tuk／雙條車</b>：市區短程每人 20–30 THB、包車 50–200 THB，先講好價。深綠雙條 1871 路連接市立公園 ↔ Kim Yong 市場，10–30 THB。",
    "<b>水上市場回程</b>：Grab 不好叫。請 tuk-tuk 等候來回約 350–500 THB，或 20:00 前離開。",
    "<b>市立公園回程</b>：公園門口叫 Grab 或搭 1871 雙條車；有報導說叫車 App 在園區訊號差，走到大門再叫。",
    "合艾市中心很好走：Airbnb 到 Lee Garden、Kim Yong、火車站都在 1.2 km 內。"
  ],
  sources:"火車：thaitrainguide.com（2025/8）、train36.com（2026）、KTMB Jadual Tren ETS 1 Jun 2026、railtravelstation.com。過境：Wikipedia Padang Besar station、NST 2025/10（關口時間）、theislanddrum.com。Grab：citiesinsider.com、hatyaicity.com（2025/10）。"
};

/* ---------- 美食頁 ---------- */
const FOOD = {
  groups:[
    { title:"☕ 早餐／早上咖啡", sub:"07:00 前後已營業", items:["morningcup","chokdee","mcd","acup","realm"] },
    { title:"💻 工作用咖啡廳／Coworking", sub:"10/8 12:00–18:00", items:["desktop","better","tuber","central"] },
    { title:"🍜 午餐／晚餐", sub:"市中心走路可到", items:["decha","jaelek","bankampu","banthungkham","streetfood"] },
    { title:"🌙 夜市", sub:"確認營業日", items:["asean","khlonghae","greenway"] },
    { title:"☕ 下午咖啡", sub:"Kim Yong／Lee Garden 一帶", items:["hype","acup","morningcup"] },
    { title:"🍺 夜生活", sub:"21:00 後", items:["postlaser","pocoloko","safetystop","sintonic"] },
    { title:"💆 按摩", sub:"開門時間決定能不能排", items:["oliver","pailin","easeme","theone","sukniyom"] }
  ],
  sources:"營業時間來源：Google／Wanderlog 清單、Wongnai、Trip.com、Lemon8、TripAdvisor 搜尋摘要（2026-10-07 查）。「已查證」＝當天從即時清單讀到；其餘為未標日期的整理資料，出發前請再確認。研究時找不到「Jay Pae」「Kao Ya」這兩家店，故未列入。"
};

/* ---------- 預算 ---------- */
const BUDGET = {
  rate:{ twd:0.95, myr:0.121, asof:"2026-10-07 Wise 中間價" },
  rows:[
    { n:"餐飲（4 早 3 午 4 晚＋咖啡）", thb:5600, note:"早餐 100、午餐 150、晚餐 300 THB/人，咖啡 8 杯" },
    { n:"夜市小吃（2 晚）", thb:800, note:"每人每晚 200 THB" },
    { n:"按摩 ×3", thb:2700, note:"10/8 泰式 90 分、10/9 腳底（選配）、10/10 精油 90 分" },
    { n:"市區 Grab／tuk-tuk", thb:1600, note:"市區 10 趟＋公園、水上市場來回" },
    { n:"10/8 Padang Besar → 合艾（計程車）", thb:1200, note:"最壞情況；小巴只要 120 THB" },
    { n:"10/11 火車 Hat Yai → Padang Besar", thb:100, note:"50 THB ×2" },
    { n:"市立公園纜車＋門票", thb:440, note:"外國人 200 THB（來源不一致，可能更便宜）" },
    { n:"酒／夜生活（2 晚）", thb:800, note:"每人每晚 2 杯" },
    { n:"伴手禮／Shopping", thb:1500, note:"Kim Yong 市場" },
    { n:"SIM／eSIM（選配）", thb:600, note:"AIS 旅遊 SIM 約 299 THB/人" },
    { n:"預備金", thb:1000, note:"雨天改 Grab、臨時加按摩" }
  ],
  refs:[
    { n:"街頭小吃一餐", v:"40–80" }, { n:"點心早餐（含茶）", v:"80–120/人" }, { n:"咖啡廳咖啡", v:"50–100" },
    { n:"餐廳晚餐（兩人）", v:"300–800" }, { n:"啤酒 7-Eleven／酒吧", v:"35–45／70–120" },
    { n:"泰式按摩 1 小時", v:"200–300" }, { n:"精油按摩 1 小時", v:"400–500" },
    { n:"Grab 市區短程", v:"40–80" }, { n:"Grab 到水上市場（單程）", v:"100–250" },
    { n:"SRT 接駁火車", v:"50" }, { n:"ATM 手續費（每筆）", v:"220–250" }, { n:"瓶裝水 7-Eleven", v:"10–20" }
  ],
  sources:"hatyaicity.com（2025/10）、thailand-vloggers.com（2026）、Lemon8／Trip.com 評論、Wise 匯率（2026-10-07）。ATM：Krungsri 2026/3 起 Visa 250／Mastercard 350 THB，其他銀行 220–250。"
};

/* ---------- 重要資訊 ---------- */
const INFO = {
  airbnb:"39 Supasarnrungsan Soi 2 在合艾市中心：慈善堂走路 2 分鐘，Kim Yong 市場、Lee Garden Plaza 約 8 分鐘，火車站約 16 分鐘。迷路時把地址給司機看，或說「Kim Yong Market」再走過去。",
  sections:[
    { title:"🛂 入境與簽證", list:[
      "泰國 <b>TDAC 數位入境卡</b>：tdac.immigration.go.th，免費，抵達前 3 天內（含抵達日）填，一人一份，入境出示 QR。10/5–10/8 填。",
      "馬來西亞 <b>MDAC</b>：imigresen-online.imi.gov.my/mdac，每次入境都要，抵達前 3 天內填（10/9–10/11）。填錯不能改，要重填。",
      "台灣護照泰國免簽：2026/9/15 起改為 <b>30 天</b>，陸路免簽入境每年限 2 次（二手來源：zagdim、thaiest；請以泰國移民局／駐台辦事處公告為準）。護照效期 ≥ 6 個月，備妥回程車票。"
    ]},
    { title:"🆘 緊急電話", kv:[
      ["報警","<a href=\"tel:191\">191</a>"], ["救護車","<a href=\"tel:1669\">1669</a>"], ["觀光警察（24h，有英文）","<a href=\"tel:1155\">1155</a>"],
      ["合艾觀光警察","<a href=\"tel:+6674246733\">0 7424 6733</a>"], ["SRT 鐵路客服","<a href=\"tel:1690\">1690</a>"]
    ]},
    { title:"🏥 醫院", kv:[
      ["Bangkok Hospital Hat Yai（私立、24h 急診、離 Airbnb 2.5 km）","75 Soi 15 Phetkasem Rd · <a href=\"tel:+6674272800\">074-272-800</a> / <a href=\"tel:1719\">1719</a> · <a href=\"https://www.google.com/maps/search/?api=1&query=Bangkok+Hospital+Hat+Yai\" target=\"_blank\" rel=\"noopener\">📍 地圖</a>"],
      ["Hat Yai Hospital（公立）","182 Ratthakan Rd · <a href=\"tel:+6674273100\">074-273-100</a> · <a href=\"https://www.google.com/maps/search/?api=1&query=Hat+Yai+Hospital\" target=\"_blank\" rel=\"noopener\">📍 地圖</a>"],
      ["Songklanagarind Hospital（PSU 大學醫院）","15 Kanchanavanich Rd · <a href=\"https://www.google.com/maps/search/?api=1&query=Songklanagarind+Hospital\" target=\"_blank\" rel=\"noopener\">📍 地圖</a>"]
    ]},
    { title:"🇹🇼 駐泰國台北經濟文化辦事處", kv:[
      ["地址","40/64 Vibhavadi-Rangsit Soi 66, Laksi, Bangkok"],
      ["辦公時間電話","<a href=\"tel:+6621193555\">+66 2 119 3555</a>（一–五 09:00–17:00）"],
      ["急難救助","<a href=\"tel:+66816664006\">+66 81 666 4006</a>（泰國境內 081-666-4006）"],
      ["外交部旅外急難（台灣撥）","<a href=\"tel:0800085095\">0800-085-095</a>"]
    ]},
    { title:"💵 錢、網路、生活", list:[
      "換錢：Lee Garden／Prachathipat–Sanehanusorn 一帶有多家（Yuwadee Exchange 34 Prachathipat Rd 等），比 2–3 家再換。帶馬幣或台幣現鈔都可換。",
      "ATM：每筆手續費 220–250 THB（Krungsri 2026/3 起 Visa 250／Mastercard 350），一次多領；選「以泰銖計價」拒絕 DCC。",
      "SIM：7-Eleven 買 AIS 旅遊 SIM 約 299–599 THB；或出發前裝 eSIM。工作日 Wi-Fi 備援很重要。",
      "小費：按摩 50–100 THB 直接給師傅；計程車湊整；餐廳無服務費時 5–10%。",
      "插座 230V，A／B／C／O 型混合插座，台灣電器直接插；自來水不能喝，7-Eleven 瓶裝水 10–20 THB。",
      "Grab App 在合艾可用；7-Eleven 24 小時到處都有。"
    ]},
    { title:"🌧️ 天氣（10/7 查）", list:[
      "泰國氣象局 10/7–10/13 展望：南部東岸（含宋卡）各地雷陣雨，<b>10/10–10/12 局部大雨到豪雨</b>，10/9–10/12 注意山洪。氣溫 24–27 / 30–34 °C。",
      "英國 Met Office：10/8 32/24 °C 降雨 50%、10/9 31/24 50%、10/10 32/24 40%（13 時 90%）、10/11 32/24 40%。體感 38–40 °C。",
      "帶：輕便雨衣／折傘、快乾衣、防水袋裝電子產品、拖鞋。午後下雨就改室內（按摩、商場、咖啡）。",
      "首頁與行程頁日期旁會顯示 Open-Meteo 即時預報（需連線）。"
    ]}
  ],
  checklists:[
    { title:"✅ 出發前", sub:"10/5–10/7", items:[
      "填泰國 TDAC（10/5 起可填），截圖 QR",
      "KTMB KITS 核對 10/11 Padang Besar → KL 車次與時間，截圖車票",
      "Airbnb 訊息房東：10/8 早上寄放行李、能否提早入住、門鎖密碼",
      "準備泰銖現金（第一天至少 3,000 THB：計程車、早餐、按摩）",
      "下載 Grab、Google Maps 離線地圖（合艾＋Padang Besar）",
      "eSIM／SIM 方案確認；MacBook 充電器、轉接頭（不需要）、行動電源",
      "雨具、快乾衣、拖鞋",
      "把這個網站加到手機主畫面（Safari 分享 → 加入主畫面）"
    ]},
    { title:"✅ 10/9–10/10", items:[
      "填馬來西亞 MDAC（10/9 起可填）",
      "The One Beauty Massage 想去的話先 LINE／WhatsApp 預約",
      "10/10 23:00 前打包完成，鬧鐘設 06:00（兩個）",
      "10/10 晚上先用 Grab App 看 06:30 的預估車資／可叫車"
    ]},
    { title:"✅ 10/11 早上", items:[
      "護照、KITS 車票、TDAC／MDAC 截圖",
      "Airbnb 鑰匙歸還、關冷氣、檢查充電線",
      "06:45 出門，06:55 前到 Hat Yai Junction 買票",
      "上車後確認坐到「Padang Besar（馬來西亞）」終點，泰國那站不下車"
    ]}
  ],
  sources:"緊急電話：PSU 國際事務處；醫院：Bangkok Hospital Hat Yai 官網、citiesinsider；駐泰辦事處：外交部領事事務局；簽證：泰國外交部領務公告、zagdim、thaiest（2026/9）；TDAC／MDAC：官方網站與 Wikipedia；天氣：TMD 7-day outlook 2026-10-07、Met Office。"
};

const COLOPHON = "所有行程時間為泰國時間（UTC+7）；10/11 Padang Besar 段另標馬來西亞時間（UTC+8）。距離與交通時間以 Airbnb 為基準估算。營業時間於 2026-10-07 查詢，標示「未查證」者請出發前再確認；2025/11 水災後店家變動較多。";
