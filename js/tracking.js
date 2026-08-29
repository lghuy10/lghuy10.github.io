// tracking.js — Nhúng file này vào MỌI trang HTML (home-1.html, map.html, quiz.html, lehoi*.html...)
// bằng <script src="/js/tracking.js"></script>.
//
// CƠ CHẾ: khác với việc gửi ngay từng sự kiện, file này GOM tất cả sự kiện của phiên duyệt web
// (có thể trải dài qua nhiều tab/nhiều trang) vào 1 hàng đợi trong localStorage, và CHỈ GỬI 1 LẦN
// DUY NHẤT bằng navigator.sendBeacon khi người dùng đóng HẾT các tab đang mở của trang web này —
// dùng đúng cơ chế "đăng ký tab còn sống" (tab registry + heartbeat) mà speedrun-widget.js đã dùng.
//
// Cách dùng ở các trang khác, sau khi đã load file này:
//   window.trackEvent('quiz_start', { quizId })
//   window.trackEvent('quiz_complete', { quizId, score, correctCount, total, passed })
//   window.trackEvent('all_quizzes_complete')
//   window.trackEvent('badge_earned', { festId, type: 'doc' | 'quiz' })
//   window.trackEvent('tile_revealed', { festId })
//   window.trackEvent('speedrun_join')
//
// Tự động ghi nhận 'page_view' ngay khi file này load, không cần gọi gì thêm.

(function () {
  var API_BASE =
    window.ANALYTICS_API_BASE ||
    (location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "http://localhost:5500"
      : "https://backend-production-1a0d.up.railway.app");

  var SESSION_KEY = "festival_analytics_session_v1"; // định danh người dùng ẩn danh, sống lâu dài
  var QUEUE_KEY = "festival_analytics_queue_v1";      // hàng đợi sự kiện CHƯA gửi
  var TABS_KEY = "festival_analytics_open_tabs_v1";   // registry các tab đang mở (dùng chung mọi trang)
  var HEARTBEAT_MS = 5000;
  var STALE_MS = 120000; // tab bị trình duyệt "bóp nghẹt" khi chạy nền vẫn được coi là còn sống trong 2 phút

  var tabId = "tab-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
  var heartbeatInterval = null;

  function getSessionId() {
    try {
      var id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = "sid_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch (e) {
      return "sid_nostorage";
    }
  }

  function getDeviceType() {
    var ua = navigator.userAgent || "";
    if (/ipad|tablet|playbook|silk/i.test(ua) && !/mobile/i.test(ua)) return "tablet";
    if (/mobile|android|iphone|ipod|windows phone/i.test(ua)) return "mobile";
    return "desktop";
  }

  function currentPage() {
    return location.pathname.split("/").pop() || "index.html";
  }

  /* ---------------- hàng đợi sự kiện ---------------- */

  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch (e) { return []; }
  }
  function writeQueue(q) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) {}
  }

  function trackEvent(eventType, data) {
    try {
      var q = readQueue();
      q.push({
        event_type: String(eventType || "").slice(0, 40),
        page: currentPage(),
        data: data || {},
        ts: Date.now()
      });
      // giới hạn hàng đợi để tránh phình to nếu vì lý do gì đó không gửi được nhiều ngày liền
      if (q.length > 500) q = q.slice(q.length - 500);
      writeQueue(q);
    } catch (e) {}
  }
  window.trackEvent = trackEvent;

  /* ---------------- registry các tab đang mở (giống speedrun-widget.js) ---------------- */

  function readTabRegistry() {
    try { return JSON.parse(localStorage.getItem(TABS_KEY)) || {}; } catch (e) { return {}; }
  }
  function writeTabRegistry(reg) {
    try { localStorage.setItem(TABS_KEY, JSON.stringify(reg)); } catch (e) {}
  }
  function heartbeat() {
    var reg = readTabRegistry();
    var now = Date.now();
    reg[tabId] = now;
    Object.keys(reg).forEach(function (id) { if (now - reg[id] > STALE_MS) delete reg[id]; });
    writeTabRegistry(reg);
  }
  function removeSelfFromRegistry() {
    var reg = readTabRegistry();
    delete reg[tabId];
    writeTabRegistry(reg);
    return reg;
  }
  function anyOtherTabAlive(reg) {
    var now = Date.now();
    return Object.keys(reg).some(function (id) {
      return id !== tabId && (now - reg[id]) <= STALE_MS;
    });
  }

  /* ---------------- gửi hàng đợi lên server (1 lần, khi đóng hết tab) ---------------- */

  function flushQueue() {
    var q = readQueue();
    if (!q.length) return;

    var payload = JSON.stringify({
      session_id: getSessionId(),
      device_type: getDeviceType(),
      events: q
    });

    try {
      var url = API_BASE + "/analytics/track";
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
      } else {
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(function () {});
      }
      // gửi rồi thì xoá hàng đợi (chấp nhận rủi ro mất dữ liệu nếu beacon thất bại — tương tự cách speedrun-widget.js đang làm)
      writeQueue([]);
    } catch (e) {}
  }

  function handlePageLeaving() {
    var reg = removeSelfFromRegistry();
    if (!anyOtherTabAlive(reg)) flushQueue();
  }

  window.addEventListener("pagehide", handlePageLeaving);
  window.addEventListener("beforeunload", handlePageLeaving);

  // nhịp tim ngay lúc tab bị ẩn đi (chuyển tab khác) để registry có mốc thời gian mới nhất
  // trước khi trình duyệt có thể bóp nghẹt setInterval của tab nền
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") heartbeat();
  });

  // lưới an toàn: nếu 1 phiên duyệt web kéo dài rất lâu (nhiều giờ) mà chưa đóng tab nào,
  // vẫn gửi định kỳ để giảm rủi ro mất dữ liệu nếu trình duyệt bị tắt đột ngột (crash, mất điện...)
  var SAFETY_FLUSH_MS = 10 * 60 * 1000; // 10 phút
  setInterval(function () {
    var q = readQueue();
    if (q.length >= 50) flushQueue(); // chỉ gửi sớm nếu hàng đợi đã khá dài
  }, SAFETY_FLUSH_MS);

  function init() {
    heartbeat();
    heartbeatInterval = setInterval(heartbeat, HEARTBEAT_MS);
    trackEvent("page_view");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();