require("dotenv").config();

const { Bot } = require("grammy");
const { getHistory, getLatest, formatQuake, WEBSITE_URL } = require("./nusaalertApi");
const {
  startNotifier,
  subscribe,
  unsubscribe,
  getSubscription,
  DEFAULT_MIN_MAG,
} = require("./notifier");

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN belum diisi di .env");
  process.exit(1);
}
if (!process.env.NUSAALERT_API_URL) {
  console.error("NUSAALERT_API_URL belum diisi di .env");
  process.exit(1);
}

const bot = new Bot(token);

const HTML = { parse_mode: "HTML", link_preview_options: { is_disabled: true } };
const STALE_NOTE = "\n\n<i>Data mungkin belum terbaru.</i>";
const FOOTER = `\n\nMau cek gempa lainnya? Buka ${WEBSITE_URL}`;
const API_ERROR = "Data gempa lagi nggak bisa diambil, coba lagi nanti ya.";

const describeMin = (m) => 
  Number(m) > 0 ? `gempa M ${Number(m).toFixed(1)}+` : "semua gempa";

// Di grup, cuma admin yang boleh atur notifikasi.
async function canManage(ctx) {
  if (ctx.chat.type === "private") return true;
  try {
    const member = await ctx.getChatMember(ctx.from.id);
    return member.status === "creator" || member.status === "administrator";
  } catch {
    return false;
  }
}

bot.command("start", (ctx) =>
  ctx.reply(
    [
      "<b>NusaAlert</b> - info gempa BMKG.",
      "",
      "/terakhir - gempa terbaru",
      "/riwayat - 10 gempa terakhir (contoh: /riwayat 5)",
      "/subscribe - notifikasi otomatis semua gempa baru (atau /subscribe 5 untuk M 5+ saja)",
      "/unsubscribe - matikan notifikasi",
      "/status - cek status notifikasi",
    ].join("\n") + FOOTER,
    HTML
  )
);

bot.command("terakhir", async (ctx) => {
  try {
    const { item, stale } = await getLatest();
    if (!item) return ctx.reply("Belum ada data gempa.");
    await ctx.reply(formatQuake(item) + (stale ? STALE_NOTE : "") + FOOTER, HTML);
  } catch (err) {
    console.error("/terakhir gagal:", err.message);
    await ctx.reply(API_ERROR);
  }
});

bot.command("riwayat", async (ctx) => {
  // /riwayat atau /riwayat 5 (default 10, dibatasi 1-10)
  const n = parseInt(ctx.match, 10);
  const limit = Number.isFinite(n) ? Math.min(Math.max(n, 1), 10) : 10;

  try {
    const { items, stale } = await getHistory({ limit });
    if (!items.length) return ctx.reply("Belum ada data gempa.");

    const text =
      items.map(formatQuake).join("\n\n") + (stale ? STALE_NOTE : "") + FOOTER;
    await ctx.reply(text, HTML);
  } catch (err) {
    console.error("/riwayat gagal:", err.message);
    await ctx.reply(API_ERROR);
  }
});

bot.command("subscribe", async (ctx) => {
  if (!(await canManage(ctx))) {
    return ctx.reply("Cuma admin grup yang bisa atur notifikasi.");
  }
  // /subscribe atau /subscribe 5 (batas magnitudo minimal, 0-10)
  const arg = parseFloat(String(ctx.match ?? "").replace(",", "."));
  const minMag = Number.isFinite(arg) ? Math.min(Math.max(arg, 0), 10) : DEFAULT_MIN_MAG;

  subscribe(ctx.chat.id, minMag);
  await ctx.reply(
    `Notifikasi aktif: ${describeMin(minMag)} baru akan dikirim ke chat ini.\n` +
      "Mau batasi magnitudo? Ketik /subscribe 5. Matikan dengan /unsubscribe."
  );
});

bot.command("unsubscribe", async (ctx) => {
  if (!(await canManage(ctx))) {
    return ctx.reply("Cuma admin grup yang bisa atur notifikasi.");
  }
  await ctx.reply(
    unsubscribe(ctx.chat.id)
      ? "Notifikasi dimatikan."
      : "Chat ini belum berlangganan notifikasi."
  );
});

bot.command("status", (ctx) => {
  const sub = getSubscription(ctx.chat.id);
  return ctx.reply(
    sub
      ? `Notifikasi aktif untuk ${describeMin(sub.minMag)}.`
      : "Notifikasi belum aktif. Ketik /subscribe untuk mengaktifkan."
  );
});

bot.catch((err) => console.error("Error bot:", err.error ?? err));

bot.start({
  onStart: async (me) => {
    await bot.api.setMyCommands([
      { command: "terakhir", description: "Gempa terbaru" },
      { command: "riwayat", description: "Riwayat gempa terakhir" },
      { command: "subscribe", description: "Aktifkan notifikasi gempa baru" },
      { command: "unsubscribe", description: "Matikan notifikasi" },
      { command: "status", description: "Cek status notifikasi" },
    ]);
    console.log(`Bot jalan sebagai @${me.username}`);
    startNotifier(bot);
  },
});