import express from "express";
import pkg from "pg";
const { Pool } = pkg;
const router = express.Router();

// Tạo DB connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("localhost") 
        ? false 
        : { rejectUnauthorized: false }
});

// Khởi tạo Schema Postgres
async function initDB() {
    if (!process.env.DATABASE_URL) {
        console.warn("[comments.js] DATABASE_URL chưa được cấu hình, bỏ qua DB init.");
        return;
    }
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                avatar TEXT,
                image_data TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                post_id VARCHAR(100),
                parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
                badge_doc BOOLEAN DEFAULT false,
                badge_quiz BOOLEAN DEFAULT false
            );
        `);

        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='comments' AND column_name='image_data'
                ) THEN
                    ALTER TABLE comments ADD COLUMN image_data TEXT;
                END IF;
            END $$;
        `);

        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='comments' AND column_name='badge_doc'
                ) THEN
                    ALTER TABLE comments ADD COLUMN badge_doc BOOLEAN DEFAULT false;
                END IF;
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='comments' AND column_name='badge_quiz'
                ) THEN
                    ALTER TABLE comments ADD COLUMN badge_quiz BOOLEAN DEFAULT false;
                END IF;
            END $$;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS comment_reactions (
                id SERIAL PRIMARY KEY,
                comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
                user_id VARCHAR(255) NOT NULL,
                reaction_type VARCHAR(50) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(comment_id, user_id)
            );
        `);

        console.log("✅ [comments.js] Khởi tạo DB schema thành công!");
    } catch (err) {
        console.error("❌ [comments.js] Lỗi khởi tạo DB schema:", err);
    }
}

initDB();

// GET /comments - Lấy comment kèm reactions và myReaction
router.get("/", async (req, res) => {
    try {
        const { post_id, device_id, user_id } = req.query;
        const currentUserId = device_id || user_id;

        let query = `
            SELECT 
                c.*,
                COALESCE(
                    (
                        SELECT json_object_agg(reaction_type, count_val)
                        FROM (
                            SELECT reaction_type, COUNT(*)::int AS count_val
                            FROM comment_reactions r
                            WHERE r.comment_id = c.id
                            GROUP BY reaction_type
                        ) reaction_counts
                    ), '{}'::json
                ) AS reactions
        `;

        const params = [];
        if (currentUserId) {
            params.push(currentUserId);
            query += `,
                (
                    SELECT reaction_type 
                    FROM comment_reactions r 
                    WHERE r.comment_id = c.id AND r.user_id = $${params.length}
                    LIMIT 1
                ) AS "myReaction"
            `;
        } else {
            query += `, NULL AS "myReaction"`;
        }

        query += ` FROM comments c`;

        if (post_id) {
            params.push(post_id);
            query += ` WHERE c.post_id = $${params.length}`;
        }

        query += ` ORDER BY c.created_at DESC`;

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error("Lỗi GET /comments:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// POST /comments - Thêm comment mới (có ảnh)
router.post("/", async (req, res) => {
    try {
        const { name, message, avatar, image_data, created_at, post_id, parent_id, badge_doc, badge_quiz } = req.body;
        if (!name || !message) {
            return res.status(400).json({ error: "Name and message are required" });
        }

        const createdAtVal = created_at ? new Date(created_at) : new Date();

        const { rows } = await pool.query(
            `INSERT INTO comments (name, message, avatar, image_data, created_at, post_id, parent_id, badge_doc, badge_quiz) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *, '{}'::json AS reactions, NULL AS "myReaction"`,
            [name, message, avatar || null, image_data || null, createdAtVal, post_id || null, parent_id || null, !!badge_doc, !!badge_quiz]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        console.error("Lỗi POST /comments:", err);
        res.status(500).json({ error: "Database error" });
    }
});

// POST /comments/:id/react - Xử lý thả/gỡ cảm xúc từ frontend
router.post("/:id/react", async (req, res) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        const { device_id, user_id, emoji, reaction_type, action } = req.body;
        
        const userId = device_id || user_id;
        const selectedEmoji = emoji || reaction_type;

        if (!commentId || !userId || !selectedEmoji) {
            return res.status(400).json({ error: "comment_id, user_id/device_id và emoji là bắt buộc." });
        }

        if (action === "remove") {
            await pool.query(
                `DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2`,
                [commentId, userId]
            );
        } else {
            // Đã bấm loại cảm xúc khác hoặc thêm mới -> Dùng ON CONFLICT UPDATE
            await pool.query(
                `INSERT INTO comment_reactions (comment_id, user_id, reaction_type) 
                 VALUES ($1, $2, $3)
                 ON CONFLICT (comment_id, user_id) 
                 DO UPDATE SET reaction_type = EXCLUDED.reaction_type, created_at = CURRENT_TIMESTAMP`,
                [commentId, userId, selectedEmoji]
            );
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Lỗi POST /comments/:id/react:", err);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;