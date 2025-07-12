const axios = require("axios");
const fs = require("fs");
const path = require("path");

const monitorFile = path.join(__dirname, "monitor.json");
if (!fs.existsSync(monitorFile)) fs.writeFileSync(monitorFile, JSON.stringify({}));

function loadMonitors() {
  return JSON.parse(fs.readFileSync(monitorFile, "utf8"));
}

function saveMonitors(data) {
  fs.writeFileSync(monitorFile, JSON.stringify(data, null, 2));
}

// প্রতি ৫ মিনিটে মনিটর করা সাইট চেক করবে
setInterval(async () => {
  const monitors = loadMonitors();
  for (const [uid, info] of Object.entries(monitors)) {
    try {
      await axios.get(info.url, { timeout: 10000 });
      if (!info.up) {
        monitors[uid].up = true;
        saveMonitors(monitors);
      }
    } catch {
      if (info.up) {
        info.api.sendMessage(
          {
            body: `🔴 𝐔𝐩𝐭𝐢𝐦𝐞 𝐀𝐥𝐞𝐫𝐭:\nYour site seems **down** now:\n➤ ${info.url}`,
            mentions: [{ id: uid, tag: info.name }]
          },
          info.threadID
        );
        monitors[uid].up = false;
        saveMonitors(monitors);
      }
    }
  }
}, 5 * 60 * 1000);

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt"], 
    version: "1.2",
    author: "Kawsar",
    cooldowns: 3,
    description: { en: "Monitor URL or show bot uptime" },
    category: "Utilities",
    guide: { en: "{pn} [url|status]" }
  },

  onStart: async function ({ api, event, args }) {
    const { senderID, threadID } = event;
    const monitors = loadMonitors();

    // যদি args না থাকে → uptime দেখাবে
    if (args.length === 0) {
      const uptime = Math.floor(process.uptime());
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;

      let uptimeFormatted = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;
      if (days === 0) uptimeFormatted = `⏳ ${hours}h ${minutes}m ${seconds}s`;
      if (hours === 0) uptimeFormatted = `⏳ ${minutes}m ${seconds}s`;
      if (minutes === 0) uptimeFormatted = `⏳ ${seconds}s`;

      return api.sendMessage(`🕒 Bot Uptime:\n${uptimeFormatted}`, threadID);
    }

    // যদি args[0] == "status" → মনিটর করা URL এর অবস্থা দেখাবে
    if (args[0] === "status") {
      if (!monitors[senderID])
        return api.sendMessage("⚠️ | তোমার জন্য কোনো সাইট মনিটর করা হয়নি!", threadID);
    
      const info = monitors[senderID];
      const status = info.up ? "🟢 Online" : "🔴 Down";
    
      const lastCheck = info.lastCheck
        ? new Date(info.lastCheck).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })
        : "N/A";
    
      return api.sendMessage(
        `📡 Monitoring Status:
    ➤ URL: ${info.url}
    ➤ Status: ${status}
    🕓 Last Checked: ${lastCheck}`,
        threadID
      );
    }
    

    // অন্যথায় args[0] কে URL ধরে মনিটরিং শুরু করবে
    const url = args[0];
    if (!url.startsWith("http"))
      return api.sendMessage("⚠️ | সঠিক URL দিতে হবে, যেমন http://example.com", threadID);

    monitors[senderID] = {
      url,
      up: true,
      name: event.senderName || "User",
      threadID,
      api
    };

    saveMonitors(monitors);

    return api.sendMessage(
      `✅ | মনিটর শুরু হলো:\n➤ ${url}\n\n⏱ ডাউন হলে জানানো হবে।`,
      threadID
    );
  }
};
