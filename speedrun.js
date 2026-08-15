// speedrun.js — Bảng xếp hạng "Đấu hạng - Speedrun"
// Ưu tiên xếp hạng: badge_count giảm dần, rồi time_seconds tăng dần (nhanh hơn thắng khi hòa huy hiệu).
// Danh tính người chơi = (name, class_name) không phân biệt hoa/thường + khoảng trắng thừa.
// Chỉ ghi đè kết quả cũ nếu kết quả mới TỐT HƠN (nhiều huy hiệu hơn, hoặc bằng huy hiệu nhưng nhanh hơn).

import express from "express";
import pool from "./db.js";

const router = express.Router();
let schemaReady = null;

async function ensureSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = pool.query(`
    CREATE TABLE IF NOT EXISTS speedrun_results (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      name_key TEXT NOT NULL,
      class_key TEXT NOT NULL,
      badge_count INTEGER NOT NULL DEFAULT 0,
      progress_count INTEGER NOT NULL DEFAULT 0,
      time_seconds INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (name_key, class_key)
    );
  `);
  await schemaReady;
  return schemaReady;
}

function normKey(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// GET /speedrun/top?limit=5 — top người chơi, ưu tiên huy hiệu rồi tới thời gian
router.get("/top", async (req, res) => {
  try {
    await ensureSchema();
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 5));
    const { rows } = await pool.query(
      `SELECT name, class_name, badge_count, progress_count, time_seconds, updated_at
       FROM speedrun_results
       ORDER BY badge_count DESC, time_seconds ASC
       LIMIT $1`,
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error("[speedrun] GET /top error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST /speedrun — nộp kết quả 1 lượt chơi (do nút Hoàn thành, hết giờ, hoặc auto-submit khi đóng hết tab)
router.post("/", async (req, res) => {
  try {
    await ensureSchema();
    const { name, class_name, badge_count, progress_count, time_seconds } = req.body || {};

    const cleanName = String(name || "").trim().slice(0, 80);
    const cleanClass = String(class_name || "").trim().slice(0, 60);
    const badges = Math.max(0, Math.min(20, parseInt(badge_count, 10) || 0));
    const progress = Math.max(0, Math.min(10, parseInt(progress_count, 10) || 0));
    const seconds = Math.max(0, Math.min(30 * 60, parseInt(time_seconds, 10) || 0));

    if (!cleanName || !cleanClass) {
      return res.status(400).json({ error: "Thiếu tên hoặc lớp" });
    }

    const nameKey = normKey(cleanName);
    const classKey = normKey(cleanClass);

    const existing = await pool.query(
      `SELECT id, badge_count, time_seconds FROM speedrun_results WHERE name_key = $1 AND class_key = $2`,
      [nameKey, classKey]
    );

    if (existing.rows.length === 0) {
      const { rows } = await pool.query(
        `INSERT INTO speedrun_results (name, class_name, name_key, class_key, badge_count, progress_count, time_seconds)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [cleanName, cleanClass, nameKey, classKey, badges, progress, seconds]
      );
      return res.status(201).json({ saved: true, replaced: false, result: rows[0] });
    }

    const old = existing.rows[0];
    const isBetter = badges > old.badge_count || (badges === old.badge_count && seconds < old.time_seconds);

    if (!isBetter) {
      return res.json({ saved: false, replaced: false, reason: "Kết quả cũ vẫn tốt hơn hoặc bằng, không ghi đè" });
    }

    const { rows } = await pool.query(
      `UPDATE speedrun_results
       SET name = $1, class_name = $2, badge_count = $3, progress_count = $4, time_seconds = $5, updated_at = now()
       WHERE id = $6 RETURNING *`,
      [cleanName, cleanClass, badges, progress, seconds, old.id]
    );
    res.json({ saved: true, replaced: true, result: rows[0] });
  } catch (err) {
    console.error("[speedrun] POST / error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;