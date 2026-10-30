const fs = require("fs");
const path = require("path");
const { getHistory, formatQuake, WEBSITE_URL } = require("./nusaalertApi");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const SUBS_FILE = path.join(DATA_DIR, "subscribers.json");
const STATE_FILE = path.join(DATA_DIR, "state.json");

const POLL_MS = (Number(process.env.NOTIFY_INTERVAL_SEC) || 60) * 1000;
const DEFAULT_MIN_MAG = 0;
const MAX_SEEN = 500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

// ---- Subscriber: { "<chatId>": { minMag } } ----
const subscribers = readJson(SUBS_FILE, {});

function subscribe(chatId, minMag = DEFAULT_MIN_MAG) {
  subscribers[chatId] = { minMag };
  writeJson(SUBS_FILE, subscribers);
}

function unsubscribe(chatId) {
  const had = String(chatId) in subscribers;
  delete subscribers[chatId];
  if (had) writeJson(SUBS_FILE, subscribers);
  return had;
}

function getSubscription(chatId) {
  return subscribers[chatId] ?? null;
}

// ---- State: gempa yang sudah pernah diproses ----
const saved = readJson(STATE_FILE, null);
let seen = new Set(saved?.seen ?? []);
let initialized = saved !== null;

const keyOf = (q) => `${q.timestamp}|${q.magnitude}`;

function saveState() {
  if (seen.size > MAX_SEEN) seen = new Set([...seen].slice(-MAX_SEEN));
  writeJson(STATE_FILE, { seen: [...seen] });
}

// ---- Kirim ----
async function sendTo(bot, chatId, text) {
  const opts = { parse_mode: "HTML", link_preview_options: { is_disabled: true } };
  try {
    await bot.api.sendMessage(chatId, text, opts);
  } catch (err) {
    const code = err.error_code;
    const desc = err.description ?? err.message;

    if (code === 429) {
      await sleep((err.parameters?.retry_after ?? 1) * 1000);
      return bot.api.sendMessage(chatId, text, opts).catch(() => {});
    }
    if (code === 403 || (code === 400 && /chat not found/i.test(desc))) {
      console.log(`[notifier] hapus subscriber ${chatId}: ${desc}`);
      unsubscribe(chatId);
      return;
    }
    console.error(`[notifier] gagal kirim ke ${chatId}:`, desc);
  }
}

async function broadcast(bot, quake) {
  const text =
    `<b>Gempa baru</b>\n${formatQuake(quake)}\n\n` +
    `Mau cek gempa lainnya? Buka ${WEBSITE_URL}`;

  for (const [chatId, sub] of Object.entries(subscribers)) {
    if (sub.minMag > 0 && !(quake.magnitude >= sub.minMag)) continue;
    await sendTo(bot, chatId, text);
    await sleep(50); // jaga-jaga limit Telegram
  }
}

// ---- Polling ----
async function poll(bot) {
  let items;
  try {
    ({ items } = await getHistory({ limit: 50, fresh: true }));
  } catch (err) {
    console.error("[notifier] gagal ambil data:", err.message);
    return;
  }
  if (!items.length) return;

  if (!initialized) {
    [...items].reverse().forEach((q) => seen.add(keyOf(q)));
    initialized = true;
    saveState();
    console.log(`[notifier] inisialisasi: ${items.length} gempa ditandai sudah dilihat`);
    return;
  }

  // items terbaru-dulu -> balik jadi lama-dulu biar notif berurutan
  const baru = items.filter((q) => !seen.has(keyOf(q))).reverse();
  if (!baru.length) return;

  for (const q of baru) {
    seen.add(keyOf(q));
    await broadcast(bot, q);
  }
  saveState();
}

function startNotifier(bot) {
  const loop = async () => {
    try {
      await poll(bot);
    } catch (err) {
      console.error("[notifier] error:", err);
    }
    setTimeout(loop, POLL_MS);
  };
  loop();
  console.log(`[notifier] aktif, cek tiap ${POLL_MS / 1000} detik`);
}

module.exports = {
  startNotifier,
  subscribe,
  unsubscribe,
  getSubscription,
  DEFAULT_MIN_MAG,
};