const fs = require("fs");
const { exec } = require("child_process");

const configPath = __dirname + "/gemini_config.json";

// ⛳ fallback config
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
}

module.exports = {
  config: {
    name: "gemini2",
    version: "2.0",
    author: "Kawsar",
    cooldowns: 3,
    description: { en: "Gemini AI toggle & chat" },
    category: "ai",
    guide: { en: "{pn} on/off" }
  },

  // 🟢 Main logic for toggle
  onStart: async function ({ message, args }) {
    const input = args[0];
    if (!input) return message.reply("⚠️ Use: gemini on/off");

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    if (input.toLowerCase() === "on") {
      config.enabled = true;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return message.reply("✅ Gemini AI auto-reply is now ON.");
    }

    if (input.toLowerCase() === "off") {
      config.enabled = false;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      return message.reply("⛔ Gemini AI auto-reply is now OFF.");
    }

    message.reply("⚠️ Invalid input. Use `on` or `off`.");
  },

  // 📩 Reply to every message when ON
  onChat: async function ({ event, message, args }) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const userMessage = event.body;

    if (!config.enabled || !userMessage) return;

    // ✅ Optional: add filter words if needed
    if (userMessage.length < 2) return;

    // 🔁 Add 2s delay
    await new Promise(r => setTimeout(r, 2000));

    // 🧠 Call Python API
    exec(`python3 gemini_api.py "${userMessage.replace(/"/g, '\\"')}"`, (err, stdout, stderr) => {
      if (err || stderr) return;
      const reply = stdout.trim();
      if (reply.length > 0) {
        message.reply(reply);
      }
    });
  }
};
