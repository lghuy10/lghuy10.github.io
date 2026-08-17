// speedrun-widget.js — Đồng hồ Speedrun dùng chung cho MỌI trang (trừ map.html, đã có bản đầy đủ riêng
// kèm modal chào mừng). Chỉ cần nhúng 2 dòng vào mỗi file HTML, không cần dán thêm gì khác:
//   <link rel="stylesheet" href="/css/speedrun-widget.css">
//   <script src="/js/speedrun-widget.js"></script>
// (điều chỉnh lại đường dẫn cho khớp đúng chỗ bạn để 2 file này trong repo)
//
// File này tự tạo HTML của đồng hồ bằng JS, tự nhận diện có lượt Speedrun đang chạy dở không
// (đọc localStorage) — có thì tự hiện đồng hồ + tham gia "còn sống" cùng các tab khác, không có
// thì không làm gì cả, không ảnh hưởng gì tới trang.

(function () {
  const SPEEDRUN_API = 'https://backend-production-1a0d.up.railway.app/speedrun';
  const SESSION_KEY = 'speedrun_session_v1';
  const TABS_KEY = 'speedrun_open_tabs_v1';
  const FESTIVAL_BADGE_KEY = 'festival_badges_v1';
  const BACKUP_KEY = 'speedrun_progress_backup_v1';
  const PULSED_KEY_NAME = 'festival_badges_pulsed_v1';
  const DURATION_MS = 30 * 60 * 1000;
  const HEARTBEAT_MS = 5000;
  const STALE_MS = 45000;

  const tabId = 'tab-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
  let session = null;
  let tickInterval = null;
  let heartbeatInterval = null;
  let finalized = false;

  function loadSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
  }
  function saveSession(s) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function readTabRegistry() {
    try { return JSON.parse(localStorage.getItem(TABS_KEY)) || {}; } catch (e) { return {}; }
  }
  function writeTabRegistry(reg) {
    try { localStorage.setItem(TABS_KEY, JSON.stringify(reg)); } catch (e) {}
  }
  function heartbeat() {
    const reg = readTabRegistry();
    const now = Date.now();
    reg[tabId] = now;
    Object.keys(reg).forEach(id => { if (now - reg[id] > STALE_MS) delete reg[id]; });
    writeTabRegistry(reg);
  }
  function removeSelfFromRegistry() {
    const reg = readTabRegistry();
    delete reg[tabId];
    writeTabRegistry(reg);
    return reg;
  }
  function anyOtherTabAlive(reg) {
    const now = Date.now();
    return Object.keys(reg).some(id => id !== tabId && (now - reg[id]) <= STALE_MS);
  }

  function formatTime(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return m + ':' + s;
  }

  function showToast(msg) {
    const el = document.getElementById('speedrun-done-toast');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }

  // Tự chứa, không phụ thuộc window.FestivalBadges (chỉ có ở map.html)
  function computeBadgeCounts() {
    let all = {};
    try { all = JSON.parse(localStorage.getItem(FESTIVAL_BADGE_KEY)) || {}; } catch (e) {}
    let badgeCount = 0, progressCount = 0;
    Object.values(all).forEach(b => {
      if (b && b.doc) badgeCount++;
      if (b && b.quiz) badgeCount++;
      if (b && b.doc && b.quiz) progressCount++;
    });
    return { badgeCount, progressCount };
  }

  function computeResultPayload(reason) {
    const now = Date.now();
    const elapsedMs = Math.min(DURATION_MS, now - session.started_at);
    const { badgeCount, progressCount } = computeBadgeCounts();
    return {
      name: session.name,
      class_name: session.class_name,
      badge_count: badgeCount,
      progress_count: progressCount,
      time_seconds: Math.round(elapsedMs / 1000),
      reason: reason
    };
  }

  // (thêm bởi Claude — vá bug mất tiến trình) Khôi phục lại đúng tiến trình đã được map.html
  // sao lưu trước khi vào Speedrun. Trang này (không phải map.html) không có hệ thống Voronoi
  // để tự vẽ lại giao diện — nhưng map.html (nếu đang mở ở tab khác) sẽ TỰ nhận ra qua chính
  // listener 'storage' theo dõi FESTIVAL_BADGE_KEY mà nó đã có sẵn, nên không cần gọi thêm gì.
  function restoreBackedUpProgress() {
    try {
      const raw = localStorage.getItem(BACKUP_KEY);
      if (raw == null) return; // không có gì để khôi phục (vd lượt chơi không bắt đầu từ map.html)
      const backup = JSON.parse(raw);
      if (backup.badges != null) localStorage.setItem(FESTIVAL_BADGE_KEY, backup.badges);
      else localStorage.removeItem(FESTIVAL_BADGE_KEY);
      if (backup.pulsed != null) localStorage.setItem(PULSED_KEY_NAME, backup.pulsed);
      else localStorage.removeItem(PULSED_KEY_NAME);
      localStorage.removeItem(BACKUP_KEY);
    } catch (e) { console.warn('[speedrun] Không khôi phục được tiến trình cũ', e); }
  }

  async function submitResultNormal(reason) {
    if (finalized || !session) return;
    finalized = true;
    const payload = computeResultPayload(reason);
    stopTimers();
    session.completed = true;
    session.last_result = payload;
    saveSession(session);
    try {
      const res = await fetch(SPEEDRUN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (data && data.saved && data.replaced) {
        showToast('🏆 Đã nộp bài! Kết quả mới của bạn tốt hơn — đã cập nhật bảng xếp hạng!');
      } else if (data && data.saved) {
        showToast('🏆 Đã nộp bài và lưu vào bảng xếp hạng!');
      } else {
        showToast('✅ Đã nộp bài! (kết quả trước của bạn vẫn tốt hơn nên giữ nguyên bảng xếp hạng)');
      }
    } catch (err) {
      console.warn('[speedrun] submit failed', err);
      showToast('⚠️ Đã lưu kết quả trên máy, nhưng gửi lên bảng xếp hạng bị lỗi mạng.');
    }
    restoreBackedUpProgress();
    hideWidget();
    removeSelfFromRegistry();
  }

  function submitResultBeacon(reason) {
    if (finalized || !session) return;
    finalized = true;
    const payload = computeResultPayload(reason);
    session.completed = true;
    session.last_result = payload;
    saveSession(session);
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(SPEEDRUN_API, blob);
    } catch (err) {}
    restoreBackedUpProgress();
  }

  function stopTimers() {
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
  }

  function hideWidget() {
    const w = document.getElementById('speedrun-widget');
    if (w) w.classList.remove('active');
  }

  function tick() {
    if (!session || session.completed) return;
    const remaining = DURATION_MS - (Date.now() - session.started_at);
    const el = document.getElementById('speedrun-time-display');
    if (el) el.textContent = formatTime(remaining);
    if (remaining <= 0) submitResultNormal('timeout');
  }

  // Tự tạo HTML của widget bằng JS — không cần dán markup vào từng trang
  function injectWidgetMarkup() {
    if (document.getElementById('speedrun-widget')) return; // đã có sẵn (vd lỡ nhúng 2 lần) -> bỏ qua

    const widget = document.createElement('div');
    widget.id = 'speedrun-widget';
    widget.innerHTML = `
      <span class="speedrun-widget-mini-icon" id="speedrun-mini-icon" title="Mở rộng đồng hồ Speedrun">⚡</span>
      <div class="speedrun-widget-full" style="display:flex; align-items:center; gap:10px;">
        <div>
          <div class="speedrun-widget-label">Speedrun</div>
          <div class="speedrun-widget-time" id="speedrun-time-display">30:00</div>
        </div>
        <button id="speedrun-finish-btn" type="button">Hoàn thành</button>
        <button id="speedrun-minimize-btn" title="Thu nhỏ" type="button">➖</button>
      </div>
    `;
    document.body.appendChild(widget);

    const toast = document.createElement('div');
    toast.id = 'speedrun-done-toast';
    document.body.appendChild(toast);

    document.getElementById('speedrun-minimize-btn').addEventListener('click', () => {
      widget.classList.add('minimized');
    });
    document.getElementById('speedrun-mini-icon').addEventListener('click', () => {
      widget.classList.remove('minimized');
    });
    document.getElementById('speedrun-finish-btn').addEventListener('click', () => {
      if (window.confirm('Nộp bài ngay bây giờ? Không thể hoàn tác.')) {
        submitResultNormal('manual');
      }
    });
  }

  function startWidget() {
    injectWidgetMarkup();
    document.getElementById('speedrun-widget').classList.add('active');
    tick();
    tickInterval = setInterval(tick, 1000);
    heartbeat();
    heartbeatInterval = setInterval(heartbeat, HEARTBEAT_MS);
  }

  function handlePageLeaving() {
    if (!session || session.completed || finalized) return;
    const reg = removeSelfFromRegistry();
    if (!anyOtherTabAlive(reg)) submitResultBeacon('all_tabs_closed');
  }
  window.addEventListener('pagehide', handlePageLeaving);
  window.addEventListener('beforeunload', handlePageLeaving);

  // (thêm bởi Claude) Đồng bộ đa tab: khi 1 tab khác nộp bài xong (ghi completed:true vào
  // localStorage), sự kiện 'storage' sẽ bắn ở TẤT CẢ các tab còn lại (trừ tab vừa ghi) —
  // dùng đúng cơ chế này để dừng đếm giờ + ẩn widget ngay lập tức, không cần đợi tick() kế tiếp.
  window.addEventListener('storage', (e) => {
    if (e.key !== SESSION_KEY) return;
    const updated = loadSession();
    if (updated && updated.completed && session && !session.completed) {
      session = updated;
      finalized = true;
      stopTimers();
      hideWidget();
      showToast('✅ Đã nộp bài (từ tab khác) — không cần làm gì thêm ở tab này.');
    }
  });

  function init() {
    // Chỉ hiện đồng hồ nếu ĐANG có lượt Speedrun chạy dở — trang này không tự bắt đầu lượt mới
    const existing = loadSession();
    if (existing && !existing.completed) {
      session = existing;
      startWidget();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();