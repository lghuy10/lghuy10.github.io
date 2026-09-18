// db.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // (thêm bởi Claude) cho pg biết chờ tối đa bao lâu khi mở 1 kết nối mới, tránh treo vô thời hạn
  connectionTimeoutMillis: 8000,
});

// (thêm bởi Claude) Không để lỗi trên 1 client đang rảnh (idle) trong pool làm crash toàn bộ process.
// Theo mặc định của thư viện pg, 1 lỗi mạng bất chợt trên client rảnh sẽ ném ra uncaughtException
// nếu không có listener 'error' — bắt lại ở đây, chỉ log, không crash app.
pool.on("error", (err) => {
  console.error("[db] Lỗi không mong đợi trên client rảnh trong pool:", err.message);
});

// (thêm bởi Claude) Danh sách mã lỗi coi là "tạm thời, thử lại là được" — điển hình là lúc app Railway
// vừa "thức dậy" sau khi ngủ (sleepApplication) và mạng riêng tới Postgres chưa kịp sẵn sàng vài giây.
const RETRYABLE_CODES = new Set(["ETIMEDOUT", "ECONNREFUSED", "ENOTFOUND", "EHOSTUNREACH", "EAI_AGAIN"]);

function isRetryable(err) {
  if (!err) return false;
  if (RETRYABLE_CODES.has(err.code)) return true;
  // AggregateError (nhiều địa chỉ IPv4/IPv6 đều fail) -> kiểm tra từng lỗi con
  if (Array.isArray(err.errors)) return err.errors.some((e) => RETRYABLE_CODES.has(e.code));
  return false;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// (thêm bởi Claude) Thử lại tối đa 4 lần với khoảng nghỉ tăng dần CHỈ với lỗi mạng tạm thời ở
// trên — lỗi khác (vd sai cú pháp SQL) thì ném ra ngay, không retry vô ích. Nới rộng hơn bản
// trước (300ms/800ms) vì thực tế Postgres lúc "ngủ dậy" đôi khi cần vài giây mới sẵn sàng hẳn,
// không chỉ 1 giây — thà lần đầu chậm thêm vài giây còn hơn phải tự tay vào Railway restart.
async function withRetry(fn, label) {
  const delays = [500, 1200, 2500, 4000]; // tổng tối đa ~8.2s chờ thêm nếu mọi lần đều fail
  let lastErr;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === delays.length) throw err;
      console.warn(`[db] ${label} gặp lỗi mạng tạm thời (${err.code || err.message}), thử lại lần ${attempt + 1}...`);
      await delay(delays[attempt]);
    }
  }
  throw lastErr;
}

const originalQuery = pool.query.bind(pool);
const originalConnect = pool.connect.bind(pool);

// Ghi đè .query()/.connect() để tự động retry — mọi file gọi pool.query(...) hay pool.connect()
// như bình thường (comments.js, speedrun.js, analytics.js) đều được lợi mà không cần sửa gì thêm.
pool.query = (...args) => withRetry(() => originalQuery(...args), "pool.query");
pool.connect = (...args) => withRetry(() => originalConnect(...args), "pool.connect");

export default pool;