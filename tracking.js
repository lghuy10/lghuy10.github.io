// tracking.js — Nhúng file này vào MỌI trang HTML (home-1.html, map.html, quiz.html, lehoi*.html...)
// bằng <script src="/js/tracking.js"></script>.
//
// CƠ CHẾ: gom sự kiện của phiên duyệt (có thể trải dài nhiều trang trong CÙNG 1 tab) vào 1 hàng
// đợi trong localStorage, rồi gửi lên server bằng navigator.sendBeacon ngay khi tab đó bị ẩn đi
// hoặc đóng lại (KHÔNG còn chờ "đóng hết mọi tab" như bản trước — cách đó dễ bị kẹt dữ liệu nếu
// có tab cũ đóng theo cách trình duyệt không kịp báo).
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
  var API_BASE = "https://backend-production-1a0d.up.railway.app";

  var SESSION_KEY = "festival_analytics_session_v1"; // định danh người dùng ẩn danh, sống lâu dài
  var QUEUE_KEY = "festival_analytics_queue_v1";      // hàng đợi sự kiện CHƯA gửi
  var tabId = "tab-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);

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
    var seg = location.pathname.split("/").pop();

    // (sửa bug — chuẩn hoá tên trang) Vercel bật "cleanUrls: true" nên URL hiển thị
    // KHÔNG có đuôi .html (vd /map thay vì /map.html) — nhưng dữ liệu ghi nhận luôn
    // phải có .html để khớp nhất quán với dữ liệu cũ (GitHub Pages) và các câu truy vấn
    // lọc theo ".html" ở trang thống kê. Không phụ thuộc vào việc URL đang hiển thị kiểu nào.
    if (!seg) return "index.html";           // domain gốc "/" -> trang chủ
    if (seg.indexOf(".") === -1) return seg + ".html"; // không có đuôi -> tự thêm .html
    return seg; // đã có đuôi sẵn (vd đang chạy trên GitHub Pages) -> giữ nguyên
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
    // (sửa bug — bỏ cơ chế "chờ đóng hết tab") Trước đây chỉ gửi khi KHÔNG còn tab nào khác
    // "còn sống" — nhưng nếu có 1 tab cũ bị đóng theo cách trình duyệt không kịp báo (đóng cả
    // cửa sổ, tắt máy đột ngột, vuốt tắt app...), dấu vết của nó vẫn nằm trong registry tới
    // STALE_MS (2 phút), khiến tab hiện tại tưởng nhầm "còn tab khác" rồi bỏ qua không gửi gì cả.
    // Giờ đơn giản hơn: hễ rời trang là gửi luôn dữ liệu của CHÍNH tab đó — mỗi lần chỉ tốn
    // 1 request rất nhẹ (sendBeacon), không cần chờ đợi hay đoán trạng thái tab khác nữa.
    flushQueue();
  }

  window.addEventListener("pagehide", handlePageLeaving);
  window.addEventListener("beforeunload", handlePageLeaving);

  // Gửi luôn dữ liệu ngay lúc tab bị ẩn đi (chuyển tab khác, khóa màn hình điện thoại...) —
  // đây là thời điểm đáng tin cậy hơn cả "unload" trên nhiều trình duyệt di động, vì
  // "pagehide"/"beforeunload" đôi khi không kịp chạy khi người dùng tắt hẳn ứng dụng.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flushQueue();
  });

  // lưới an toàn: nếu 1 phiên duyệt web kéo dài rất lâu (nhiều giờ) mà chưa đóng tab nào,
  // vẫn gửi định kỳ để giảm rủi ro mất dữ liệu nếu trình duyệt bị tắt đột ngột (crash, mất điện...)
  var SAFETY_FLUSH_MS = 10 * 60 * 1000; // 10 phút
  setInterval(function () {
    var q = readQueue();
    if (q.length >= 50) flushQueue(); // chỉ gửi sớm nếu hàng đợi đã khá dài
  }, SAFETY_FLUSH_MS);

  function init() {
    trackEvent("page_view");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();