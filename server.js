// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import commentsRouter from "./comments.js";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import pool from "./db.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let DEFAULT_QUIZZES = [];
try {
  const raw = fs.readFileSync(path.join(__dirname, "js", "default_quizzes.js"), "utf-8");
  const match = raw.match(/const\s+DEFAULT_QUIZZES\s*=\s*(\[[\s\S]*\])\s*;\s*\n\s*if\s*\(typeof module/);
  if (match) {
    DEFAULT_QUIZZES = JSON.parse(match[1]);
  } else {
    console.error("[server.js] Không tách được DEFAULT_QUIZZES từ js/default_quizzes.js.");
  }
} catch (err) {
  console.error("[server.js] Lỗi đọc js/default_quizzes.js:", err);
}

dotenv.config({ path: path.resolve(__dirname, ".env") });

function getGeminiConfig() {
  dotenv.config({ path: path.resolve(__dirname, ".env") });
  return {
    key: (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim(),
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash"
  };
}

function isValidGeminiKey(key) {
  if (!key) return false;
  if (key.length < 20) return false;
  const k = String(key).trim();
  // Chặn các chuỗi placeholder rõ ràng
  if (/^(your-|xxx-|xxxxx|YOUR_|<|PLACEHOLDER|changeme|changethis|example|sample-key)/i.test(k)) return false;
  if (k.includes("YOUR_GOOGLE") || k.includes("API_KEY_HERE")) return false;
  // Chấp nhận cả 2 định dạng:
  //   - Cũ: AIza...  (traffic key, hợp lệ đến tháng 9/2026 nếu có cấu hình restrict)
  //   - Mới: AQ....   (authentication key, từ tháng 6/2026+)
  const okOld = /^AIza[a-zA-Z0-9_\-]{20,}$/.test(k);
  const okNew = /^AQ\.[a-zA-Z0-9_\-]{20,}$/.test(k);
  return okOld || okNew;
}

const ALLOWED_ORIGINS = [
  "https://baldandbad.github.io",
  "https://baldandbadgithubio-production-4f3f.up.railway.app",
  "https://baldandbadgithubio-production.up.railway.app",
  "http://localhost:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8080"
];

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn("⚠️ CORS blocked origin:", origin);
      callback(null, true);
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(bodyParser.json({ limit: "1mb" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* ---------------- GEMINI DIRECT REST API ---------------- */

// Danh sách model và API version được hỗ trợ theo thứ tự ưu tiên
// Thứ tự ưu tiên: model mới > bản ổn định > bản flash nhẹ
const GEMINI_MODEL_CANDIDATES = [
  { name: "gemini-2.0-flash",        version: "v1"     },
  { name: "gemini-2.0-flash-lite",    version: "v1"     },
  { name: "gemini-1.5-flash",         version: "v1"     },
  { name: "gemini-1.5-flash-8b",      version: "v1"     },
  { name: "gemini-1.5-pro",           version: "v1"     },
  { name: "gemini-2.0-flash-exp",    version: "v1beta" },
  { name: "gemini-1.5-flash",         version: "v1beta" }
];

function buildModelPayload(userMsg) {
  return {
    contents: [{ parts: [{ text: userMsg }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    systemInstruction: {
      parts: [{ text: "Bạn là một Trợ lý AI giúp học sinh tìm hiểu về các di tích lịch sử, lễ hội và văn hóa ở TP.HCM. Hãy phản hồi ngắn gọn (tối đa 3 câu), sinh động, lịch sự và chính xác bằng tiếng Việt. Nếu không chắc chắn, hãy nói rõ bạn không biết thay vì bịa." }]
    }
  };
}

function extractGeminiReply(data) {
  return String(
    (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.choices?.[0]?.message?.content ||
      data?.reply ||
      data?.message ||
      ""
    ) || ""
  ).trim();
}

app.post("/ask", async (req, res) => {
  const userMsg = String(req.body?.message || "").trim();
  const { key: GEMINI_KEY, model: PREFERRED_MODEL } = getGeminiConfig();

  if (!userMsg) {
    return res.status(400).json({ error: "Vui lòng nhập câu hỏi trước khi gửi." });
  }

  if (!GEMINI_KEY) {
    console.error("❌ Gemini API key chưa được cấu hình. Hãy thêm GEMINI_API_KEY vào file .env");
    return res.status(500).json({
      error: "AI chưa được cấu hình API key.",
      hint: "Vui lòng mở file .env và điền GEMINI_API_KEY bằng khóa thật từ Google AI Studio (định dạng mới AQ.... hoặc cũ AIza...)."
    });
  }

  if (!isValidGeminiKey(GEMINI_KEY)) {
    console.error("❌ Gemini API key trông không hợp lệ (định dạng sai):", GEMINI_KEY.substring(0, 12) + "...");
    return res.status(500).json({
      error: "API key trông không hợp lệ (có thể là placeholder).",
      hint: "Hãy kiểm tra lại khóa trong file .env. Định dạng đúng: mới = AQ.xxx, cũ = AIza... Lấy từ https://aistudio.google.com/app/apikey"
    });
  }

  // Xây dựng danh sách thử model: ưu tiên user đặt trước, sau đó các model khác
  const tried = [];
  const candidates = [];
  if (PREFERRED_MODEL) {
    for (const v of ["v1", "v1beta"]) {
      candidates.push({ name: PREFERRED_MODEL, version: v, preferred: true });
    }
  }
  for (const c of GEMINI_MODEL_CANDIDATES) {
    if (!candidates.some(x => x.name === c.name && x.version === c.version)) {
      candidates.push(c);
    }
  }

  const payload = buildModelPayload(userMsg);
  let lastErrorStatus = 0;
  let lastErrorDetail = "";

  for (const cand of candidates) {
    const keyLabel = `${cand.version}/models/${cand.name}`;
    tried.push(keyLabel);
    const url =
      `https://generativelanguage.googleapis.com/${cand.version}/models/${encodeURIComponent(cand.name)}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
    try {
      console.log(`🧪 Thử kết nối Gemini endpoint: ${keyLabel}...`);
      const googleRes = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_KEY,
          "x-goog-api-client": "trae-backend/3.0"
        },
        body: JSON.stringify(payload)
      });

      const data = await googleRes.json();

      if (!googleRes.ok) {
        const status = googleRes.status;
        const message = (data && data.error && data.error.message) || "No details";
        lastErrorStatus = status;
        lastErrorDetail = message;
        console.warn(`   ↳ ${keyLabel} trả về ${status}: ${message.substring(0, 120)}`);
        // Model 404 -> thử model tiếp theo (không trả về lỗi ngay)
        if (status === 404 || /not found|not supported for generateContent/i.test(message) || /model.*not found/i.test(message)) {
          continue;
        }
        // Lỗi khác (401/403/429/5xx) -> xử lý tốt hơn nhưng vẫn thử 1-2 model khác tùy lỗi
        if (status === 429 || status >= 500) continue;
        // 400/401/403 -> trả về lỗi luôn (thường do key sai)
        let userFriendly = message;
        if (status === 400) userFriendly = "Request sai định dạng hoặc API key không hợp lệ với endpoint này. Kiểm tra lại GEMINI_API_KEY.";
        else if (status === 401 || status === 403) userFriendly = "API key không có quyền truy cập hoặc bị khóa. Hãy kiểm tra khóa tại Google AI Studio.";
        else if (status === 429) userFriendly = "Quá nhiều yêu cầu trong thời gian ngắn. Thử lại sau vài phút.";
        else if (status >= 500) userFriendly = "Máy chủ Google AI đang gặp sự cố, thử lại sau.";
        return res.status(status).json({
          error: userFriendly,
          details: message,
          tried: tried
        });
      }

      // Thành công -> trích xuất câu trả lời
      const reply = extractGeminiReply(data);
      const finishReason = data && data.candidates && data.candidates[0] && data.candidates[0].finishReason;

      if (reply) {
        console.log(`✅ ${keyLabel} phản hồi thành công: ${reply.substring(0, 60)}...`);
        return res.json({
          reply,
          model: cand.name,
          version: cand.version,
          tried
        });
      }

      // Không có nội dung text nhưng finishReason khác STOP
      if (!reply && finishReason && finishReason !== "STOP") {
        console.warn(`   ↳ ${keyLabel} finishReason=${finishReason}, thử tiếp...`);
        lastErrorDetail = `finishReason=${finishReason}`;
        continue;
      }
    } catch (err) {
      lastErrorDetail = err.message || String(err);
      console.warn(`   ↳ ${keyLabel} network error: ${lastErrorDetail}`);
      // Network lỗi -> thử model tiếp
      continue;
    }
  }

  // Đã thử hết model vẫn không được
  console.error("❌ Đã thử tất cả model/version, không có endpoint nào hoạt động. Tried:", tried);
  return res.status(502).json({
    error:
      lastErrorStatus === 404
        ? "Không tìm thấy model phù hợp (404). Có thể tài khoản Google AI Studio của bạn chưa được bật quyền dùng model Gemini, hoặc khóa 'AQ.' cần đăng ký thêm quyền 'AI Platform / Generative Language' trên Google Cloud Console."
        : "Không thể nhận phản hồi từ bất kỳ endpoint Gemini nào.",
    details: lastErrorDetail,
    tried,
    hint: lastErrorStatus === 404 ? "👉 Bước 1: Vào https://aistudio.google.com → tạo key mới → thử copy key đó. 👉 Bước 2: Nếu vẫn 404, thử đăng ký thêm 'Vertex AI' / 'Generative AI' trên Google Cloud Console project tương ứng với key AQ. của bạn." : undefined
  });
});

app.use("/comments", commentsRouter);

app.get("/", (_req, res) => {
  res.send("Backend is running ✅");
});

async function getQuizzesData() {
  if (process.env.DATABASE_URL) {
    try {
      const { rows } = await pool.query("SELECT id, title FROM quizzes ORDER BY id");
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      console.warn("DB query for quizzes failed, using DEFAULT_QUIZZES fallback:", e.message);
    }
  }
  return DEFAULT_QUIZZES.map(q => ({ id: q.id, title: q.title }));
}

async function getQuestionsForQuiz(quizId) {
  if (process.env.DATABASE_URL) {
    try {
      const qRes = await pool.query(
        `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_option
         FROM questions WHERE quiz_id = $1 ORDER BY id`,
        [quizId]
      );
      if (qRes && qRes.rows && qRes.rows.length > 0) return qRes.rows;
    } catch (e) {
      console.warn("DB query for questions failed, using DEFAULT_QUIZZES fallback:", e.message);
    }
  }
  const qz = DEFAULT_QUIZZES.find(q => String(q.id) === String(quizId));
  return qz ? qz.questions : [];
}

app.get("/api/quizzes", async (_req, res) => {
  try {
    const list = await getQuizzesData();
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/quizzes/:id", async (req, res) => {
  try {
    const quizId = req.params.id;
    const rawQuestions = await getQuestionsForQuiz(quizId);

    const questions = rawQuestions.map(q => ({
      id: q.id,
      question: q.question_text || q.question,
      answers: [
        { id: "A", text: q.option_a },
        { id: "B", text: q.option_b },
        { id: "C", text: q.option_c },
        { id: "D", text: q.option_d }
      ].filter(x => x.text),
      correctAnswerId: q.correct_option || q.correctAnswerId
    }));

    res.json(questions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- Socket.IO multiplayer ---------------- */

const rooms = new Map();

/**
 * Accept multiple payload shapes:
 * - If payload is object, return first defined key in keys
 * - If payload is primitive, return it
 */
function extractField(payload, ...keys) {
  if (payload === undefined || payload === null) return payload;
  if (typeof payload === "object") {
    for (const k of keys) {
      if (payload[k] !== undefined) return payload[k];
    }
    return undefined;
  }
  return payload; // primitive (string/number)
}

/**
 * Score calculation:
 * - correct: basePoints + Math.floor(remainingSeconds)
 * - basePoints = 10
 */
function calcPoints(isCorrect, remainingSeconds) {
  if (!isCorrect) return 0;
  const base = 10;
  const bonus = Math.max(0, Math.floor(remainingSeconds)); // simple bonus
  return base + bonus;
}

io.on("connection", (socket) => {
  console.log("[socket] connected", socket.id);

  // Create room
  socket.on("createRoom", async (payload) => {
    try {
      const quizId = extractField(payload, "quizId", "qid") ?? payload;
      console.log("[createRoom] from", socket.id, "quizId=", quizId);

      const rawQuestions = await getQuestionsForQuiz(quizId);

      if (!rawQuestions || !rawQuestions.length) {
        socket.emit("error", "No questions found for this quiz");
        return;
      }

      const questions = rawQuestions.map(q => ({
        id: q.id,
        text: q.question_text || q.question,
        answers: [
          { id: "A", text: q.option_a, is_correct: (q.correct_option || q.correctAnswerId) === "A" },
          { id: "B", text: q.option_b, is_correct: (q.correct_option || q.correctAnswerId) === "B" },
          { id: "C", text: q.option_c, is_correct: (q.correct_option || q.correctAnswerId) === "C" },
          { id: "D", text: q.option_d, is_correct: (q.correct_option || q.correctAnswerId) === "D" }
        ].filter(x => x.text)
      }));

      const code = Math.random().toString(36).slice(2, 6).toUpperCase();
      const room = {
        hostId: socket.id,
        players: [{ id: socket.id, name: "Host", score: 0, lastAnsweredIndex: -1 }],
        questions,
        index: -1,
        pendingAnswers: {},     // { [questionIndex]: [{ playerId, choice, timeSecRemaining }] }
        questionTimeoutId: null,
        questionTimeLimit: 12,
        questionStartTs: null
      };

      rooms.set(code, room);
      socket.join(code);

      socket.emit("roomCreated", { code });
      io.to(code).emit("playerList", room.players.map(p => ({ id: p.id, name: p.name, score: p.score })));
      console.log("[createRoom] created", code, "host=", socket.id);
    } catch (err) {
      console.error("createRoom error:", err);
      socket.emit("error", "Failed to create room");
    }
  });

  // Join room
  socket.on("joinRoom", (payload) => {
    const code = extractField(payload, "code", "roomId") ?? payload;
    const name = extractField(payload, "name", "player") ?? "Player";
    console.log("[joinRoom]", socket.id, "->", code, name);

    const room = rooms.get(code);
    if (!room) {
      socket.emit("error", "Room not found: " + String(code));
      return;
    }

    // avoid duplicate same-socket
    if (room.players.some(p => p.id === socket.id)) {
      socket.emit("roomJoined", { code });
      socket.join(code);
      return;
    }

    room.players.push({ id: socket.id, name, score: 0, lastAnsweredIndex: -1 });
    socket.join(code);

    io.to(code).emit("playerList", room.players.map(p => ({ id: p.id, name: p.name, score: p.score })));
    socket.emit("roomJoined", { code });
    console.log("[joinRoom] success", socket.id, "in", code);
  });

  // Leave room
  socket.on("leaveRoom", (payload) => {
    const code = extractField(payload, "code", "roomId") ?? payload;
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;

    const idx = room.players.findIndex(p => p.id === socket.id);
    if (idx !== -1) {
      room.players.splice(idx, 1);
      socket.leave(code);
      io.to(code).emit("playerList", room.players.map(p => ({ id: p.id, name: p.name, score: p.score })));
      console.log("[leaveRoom] removed", socket.id, "from", code);
    }

    if (room.players.length === 0) {
      // delete empty room after short grace
      setTimeout(() => {
        const r = rooms.get(code);
        if (r && r.players.length === 0) {
          rooms.delete(code);
          console.log("[room] deleted empty", code);
        }
      }, 30000);
    }
  });

  // Start game (host can start)
  socket.on("startGame", (payload) => {
    const code = extractField(payload, "code", "roomId") ?? payload;
    const room = rooms.get(code);
    if (!room) {
      socket.emit("error", "Room not found: " + String(code));
      return;
    }

    // optional: enforce host only
    if (room.hostId && room.hostId !== socket.id) {
      // if you want to enforce, uncomment next lines:
      // socket.emit("error", "Only host can start the game");
      // return;
    }

    room.index = 0;
    room.pendingAnswers = {};
    room.players.forEach(p => p.lastAnsweredIndex = -1);
    emitQuestion(code);
    console.log("[startGame] started", code);
  });

  // Submit answer
  socket.on("submitAnswer", (payload) => {
    const code = extractField(payload, "code", "roomId") ?? payload;
    const answer = extractField(payload, "answerId", "answer");
    if (!code) {
      socket.emit("error", "Missing room code");
      return;
    }

    const room = rooms.get(code);
    if (!room) {
      socket.emit("error", "Room not found: " + String(code));
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      socket.emit("error", "You are not in that room");
      return;
    }

    // Ensure active question
    if (typeof room.index !== "number" || room.index < 0 || room.index >= room.questions.length) {
      socket.emit("error", "No active question");
      return;
    }

    // Prevent multiple answers for same question
    if (player.lastAnsweredIndex === room.index) {
      socket.emit("error", "Already answered this question");
      return;
    }

    // record answer with remaining time:
    const nowTs = Date.now();
    const elapsedSec = room.questionStartTs ? Math.floor((nowTs - room.questionStartTs) / 1000) : 0;
    const remaining = Math.max(0, (room.questionTimeLimit || 12) - elapsedSec);

    room.pendingAnswers[room.index] = room.pendingAnswers[room.index] || [];
    room.pendingAnswers[room.index].push({ playerId: socket.id, choice: String(answer), remainingSec: remaining });

    // mark player as answered (guard)
    player.lastAnsweredIndex = room.index;

    // notify lobby who answered (useful UI)
    io.to(code).emit("playerList", room.players.map(p => ({ id: p.id, name: p.name, score: p.score, answered: (p.lastAnsweredIndex === room.index) })));

    // If everyone answered early -> end question now
    const allAnswered = room.players.length > 0 && room.players.every(p => p.lastAnsweredIndex === room.index);
    if (allAnswered) {
      if (room.questionTimeoutId) {
        clearTimeout(room.questionTimeoutId);
        room.questionTimeoutId = null;
      }
      // small delay to allow clients to show 'locked in' UI; then process
      setTimeout(() => {
        endQuestion(code);
      }, 700);
    }
  });

  // Disconnect cleanup
  socket.on("disconnect", () => {
    console.log("[socket] disconnect", socket.id);
    for (const [code, room] of rooms.entries()) {
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        room.players.splice(idx, 1);
        io.to(code).emit("playerList", room.players.map(p => ({ id: p.id, name: p.name, score: p.score })));
        console.log("[disconnect] removed", socket.id, "from", code);
        if (room.players.length === 0) {
          setTimeout(() => {
            const r = rooms.get(code);
            if (r && r.players.length === 0) {
              rooms.delete(code);
              console.log("[room] deleted empty", code);
            }
          }, 30000);
        }
      }
    }
  });

  /* ---------------- helper functions inside connection for safety ---------------- */

  // End the current question: compute results, award points, emit question-ended, then advance or finish
  function endQuestion(code) {
    const room = rooms.get(code);
    if (!room) return;
    const qIndex = room.index;
    const q = room.questions[qIndex];
    if (!q) return;

    // collect results per-player
    const pending = room.pendingAnswers[qIndex] || [];
    const results = room.players.map(p => {
      const pa = pending.find(x => x.playerId === p.id);
      const chosen = pa ? pa.choice : null;
      const remainingSec = pa ? pa.remainingSec : 0;
      const answerObj = q.answers.find(a => String(a.id) === String(chosen));
      const correct = !!(answerObj && answerObj.is_correct);
      const points = calcPoints(correct, remainingSec);
      if (correct) p.score += points;
      // return result record
      return { playerId: p.id, name: p.name, choice: chosen, correct, points };
    });

    // emit question-ended (authoritative)
    io.to(code).emit("question-ended", {
      questionIndex: qIndex,
      questionId: q.id,
      correctAnswerId: q.answers.find(a => a.is_correct)?.id ?? null,
      results,
      scores: room.players.map(p => ({ id: p.id, name: p.name, total: p.score }))
    });

    // also emit an immediate score update for any UI that listens to updateScores
    io.to(code).emit("updateScores", room.players.map(p => ({ id: p.id, name: p.name, score: p.score })));

    // cleanup pending answers for this question (optional)
    delete room.pendingAnswers[qIndex];

    // prepare to advance after a short pause
    setTimeout(() => {
      room.index++;
      room.players.forEach(p => p.lastAnsweredIndex = -1);
      if (room.index >= room.questions.length) {
        // game over
        const finalScores = room.players.map(p => ({ id: p.id, name: p.name, total: p.score }));
        io.to(code).emit("gameOver", { scores: finalScores });
        // keep the room alive for a short time for clients to show results, then delete
        setTimeout(() => {
          const r = rooms.get(code);
          if (r) rooms.delete(code);
          console.log("[room] finished and deleted", code);
        }, 20000);
      } else {
        // emit next question
        emitQuestion(code);
      }
    }, 1200);
  }

  // Emit a question and start a per-question timeout so game can't hang
  function emitQuestion(code) {
    const room = rooms.get(code);
    if (!room) return;
    const q = room.questions[room.index];
    if (!q) return;

    // clear any previous timeout
    if (room.questionTimeoutId) {
      clearTimeout(room.questionTimeoutId);
      room.questionTimeoutId = null;
    }

    // set start timestamp
    room.questionStartTs = Date.now();
    const timeLimit = room.questionTimeLimit || 12;

    // emit the question (do NOT include is_correct)
    io.to(code).emit("question", {
      index: room.index,
      total: room.questions.length,
      id: q.id,
      text: q.text,
      answers: q.answers.map(a => ({ id: a.id, text: a.text })),
      timeLimit
    });

    // schedule auto-end when timer expires
    room.questionTimeoutId = setTimeout(() => {
      room.questionTimeoutId = null;
      endQuestion(code);
    }, timeLimit * 1000);
  }

});

/* -------------------- start server -------------------- */
const requestedPort = Number(process.env.PORT) || 5500;
const fallbackPorts = [requestedPort, 3001, 3002, 3003, 3004, 3005];

function startServer(port) {
  server.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });

  server.once("error", (err) => {
    if (err.code === "EADDRINUSE") {
      const nextPort = fallbackPorts[fallbackPorts.indexOf(port) + 1];
      if (nextPort) {
        console.warn(`⚠️ Cổng ${port} đã bị chiếm, đang thử cổng ${nextPort}...`);
        server.close();
        startServer(nextPort);
      } else {
        console.error("❌ Không thể mở bất kỳ cổng nào phù hợp.");
      }
    } else {
      console.error("❌ Lỗi server:", err);
    }
  });
}

startServer(requestedPort);
