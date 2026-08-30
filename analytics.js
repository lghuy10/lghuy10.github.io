// analytics.js — Ghi nhận & tổng hợp số liệu thống kê truy cập/hành vi người dùng
// Cùng phong cách với speedrun.js: tự tạo bảng nếu chưa có (ensureSchema), dùng chung pool Postgres.
//
// CƠ CHẾ GỬI: trình duyệt (tracking.js) KHÔNG gửi từng sự kiện riêng lẻ ngay lúc xảy ra. Nó gom
// lại thành 1 hàng đợi và chỉ gửi 1 LẦN DUY NHẤT (bằng sendBeacon) khi người dùng đóng hết tất cả
// các tab liên quan đến web — nên POST /analytics/track nhận 1 MẢNG "events".
//
// CƠ CHẾ HUY HIỆU: không lấy dữ liệu trực tiếp từ quiz.html/lehoi*.html. Mỗi khi map.html dựng lại
// bảng tiến trình (badge-panel), nó gửi 1 "snapshot" toàn bộ trạng thái huy hiệu hiện tại (đọc từ
// localStorage) lên dưới dạng sự kiện 'badge_snapshot'. Vì 1 người có thể vào map.html nhiều lần,
// khi tổng hợp số liệu ta chỉ lấy snapshot MỚI NHẤT của mỗi session để tránh đếm trùng.

import express from "express";
import pool from "./db.js";

const router = express.Router();
let schemaReady = null;

// (thêm bởi Claude) sendBeacon (tracking.js) gửi body dạng "text/plain" để tránh CORS preflight
// (xem giải thích chi tiết trong tracking.js). Middleware này đọc riêng loại Content-Type đó thành
// chuỗi thô -> handler bên dưới JSON.parse lại. Request "application/json" (từ đường fetch dự
// phòng khi trình duyệt không có sendBeacon) đã được express.json()/bodyParser.json() ở server.js
// xử lý từ trước, req.body lúc đó đã là object sẵn nên không bị ảnh hưởng.
router.use(express.text({ type: "text/plain", limit: "1mb" }));

async function ensureSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_sessions (
        id SERIAL PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        device_type TEXT NOT NULL DEFAULT 'unknown',
        first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_seen TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        page TEXT,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        client_ts TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON analytics_events(page);`);
  })();
  return schemaReady;
}

function cleanDeviceType(d) {
  const v = String(d || "").toLowerCase();
  return ["desktop", "mobile", "tablet"].includes(v) ? v : "unknown";
}

// POST /analytics/track — nhận 1 LÔ sự kiện, gom từ lúc mở web tới lúc đóng hết tab
// Body: { session_id, device_type, events: [{ event_type, page, data, ts }, ...] }
router.post("/track", async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureSchema();
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const sessionId = String(body.session_id || "").trim().slice(0, 64);
    const deviceType = cleanDeviceType(body.device_type);
    const events = Array.isArray(body.events) ? body.events : [];

    if (!sessionId || events.length === 0) {
      return res.status(400).json({ error: "Thiếu session_id hoặc events rỗng" });
    }

    await client.query("BEGIN");

    await client.query(
      `INSERT INTO analytics_sessions (session_id, device_type)
       VALUES ($1, $2)
       ON CONFLICT (session_id)
       DO UPDATE SET last_seen = now(), device_type = EXCLUDED.device_type`,
      [sessionId, deviceType]
    );

    for (const ev of events.slice(0, 500)) {
      const eventType = String(ev?.event_type || "").trim().slice(0, 40);
      if (!eventType) continue;
      const page = String(ev?.page || "").trim().slice(0, 120) || null;
      const data = (ev?.data && typeof ev.data === "object") ? ev.data : {};
      const clientTs = Number.isFinite(ev?.ts) ? new Date(ev.ts) : null;

      await client.query(
        `INSERT INTO analytics_events (session_id, event_type, page, data, client_ts)
         VALUES ($1, $2, $3, $4, $5)`,
        [sessionId, eventType, page, JSON.stringify(data), clientTs]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ ok: true, received: events.length });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[analytics] POST /track error:", err);
    // Không để lỗi tracking làm hỏng trải nghiệm người dùng -> vẫn trả 200
    res.status(200).json({ ok: false });
  } finally {
    client.release();
  }
});

// GET /analytics/summary — số liệu tổng hợp thô (chưa có dashboard UI, dùng để kiểm tra/xây dashboard sau)
router.get("/summary", async (_req, res) => {
  try {
    await ensureSchema();

    const [
      uniqueVisitors,
      topPages,
      topArticles,
      deviceBreakdown,
      mapPageSessions,
      badgeStats,
      speedrunJoinSessions,
      totalSessions,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS n FROM analytics_sessions`),
      pool.query(`
        SELECT page, COUNT(*)::int AS views
        FROM analytics_events WHERE event_type = 'page_view' AND page IS NOT NULL
        GROUP BY page ORDER BY views DESC LIMIT 10
      `),
      pool.query(`
        SELECT page, COUNT(*)::int AS views
        FROM analytics_events
        WHERE event_type = 'page_view' AND page ~* '^lehoi.*\\.html$'
        GROUP BY page ORDER BY views DESC LIMIT 10
      `),
      pool.query(`
        SELECT device_type, COUNT(*)::int AS n
        FROM analytics_sessions GROUP BY device_type ORDER BY n DESC
      `),
      pool.query(`SELECT COUNT(DISTINCT session_id)::int AS n FROM analytics_events WHERE event_type = 'page_view' AND page = 'map.html'`),
      // Lấy snapshot huy hiệu MỚI NHẤT của mỗi session (1 người có thể vào map.html nhiều lần)
      pool.query(`
        WITH latest AS (
          SELECT DISTINCT ON (session_id) session_id, data
          FROM analytics_events
          WHERE event_type = 'badge_snapshot'
          ORDER BY session_id, created_at DESC
        )
        SELECT
          COUNT(*)::int AS sessions_with_snapshot,
          COALESCE(SUM((data->>'unlocked_tiles')::int), 0)::int AS total_unlocked_tiles,
          COALESCE(SUM((data->>'doc_completed_count')::int), 0)::int AS total_doc_badges,
          COALESCE(SUM((data->>'quiz_completed_count')::int), 0)::int AS total_quiz_badges,
          COUNT(*) FILTER (WHERE (data->>'unlocked_tiles')::int >= 1)::int AS sessions_with_at_least_1_tile,
          COUNT(*) FILTER (
            WHERE (data->>'total_festivals')::int > 0
              AND (data->>'quiz_completed_count')::int >= (data->>'total_festivals')::int
          )::int AS sessions_all_quizzes_done
        FROM latest
      `),
      pool.query(`SELECT COUNT(DISTINCT session_id)::int AS n FROM analytics_events WHERE event_type = 'speedrun_join'`),
      pool.query(`SELECT COUNT(*)::int AS n FROM analytics_sessions`),
    ]);

    const total = totalSessions.rows[0].n || 0;
    const pct = (n) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);
    const bs = badgeStats.rows[0];

    res.json({
      "Tổng số người truy cập (unique visitors)": uniqueVisitors.rows[0].n,

      "Trang được xem nhiều nhất": topPages.rows.map(r => ({ trang: r.page, luot_xem: r.views })),
      "Bài viết (lehoi*.html) được đọc nhiều nhất": topArticles.rows.map(r => ({ bai_viet: r.page, luot_doc: r.views })),

      "Thiết bị truy cập": deviceBreakdown.rows.map(r => ({
        loai_thiet_bi: r.device_type,
        so_nguoi: r.n,
        phan_tram: total > 0 ? Math.round((r.n / total) * 1000) / 10 : 0
      })),

      "% người đã bấm vào trang Bản đồ": pct(mapPageSessions.rows[0].n),

      "Tổng huy hiệu Tài liệu (📖) đã cấp": bs.total_doc_badges,
      "Tổng huy hiệu Quiz (📝) đã cấp": bs.total_quiz_badges,

      "Số người khai phá được ít nhất 1 mảnh bản đồ": bs.sessions_with_at_least_1_tile,
      "Số người chơi hết toàn bộ quiz": bs.sessions_all_quizzes_done,
      "Số người tham gia chế độ Đấu hạng (Speedrun)": speedrunJoinSessions.rows[0].n,

      "_ghi_chu": "Các số % được tính trên tổng " + total + " người truy cập đã ghi nhận được."
    });
  } catch (err) {
    console.error("[analytics] GET /summary error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
