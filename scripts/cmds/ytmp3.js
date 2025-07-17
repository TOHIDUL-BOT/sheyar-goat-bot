const { spawn } = require("child_process");
const fs = require("fs");

module.exports = {
  config: {
    name: "ytmp3",
    version: "1.0",
    author: "Kawsar",
    cooldowns: 5,
    description: { en: "Download YouTube audio using yt-dlp" },
    category: "media",
    guide: { en: "{pn} <YouTube URL>" }
  },

  onStart: async function ({ message, args, api, event }) {
    const url = args[0];
    if (!url || !url.includes("youtu")) {
      return message.reply("❌ | Please provide a valid YouTube URL.");
    }

    const process = spawn("python3", ["goat/scripts/ytmp3.py", url]);

    let stdout = "", stderr = "";

    process.stdout.on("data", (data) => stdout += data.toString());
    process.stderr.on("data", (data) => stderr += data.toString());

    process.on("close", async (code) => {
      if (code !== 0) {
        return message.reply(`❌ | Error downloading audio:\n${stderr}`);
      }

      const filePath = stdout.trim();

      if (!fs.existsSync(filePath)) {
        return message.reply("❌ | File not found.");
      }

      const fileSize = fs.statSync(filePath).size;
      if (fileSize > 26214400) {
        fs.unlinkSync(filePath);
        return message.reply("❌ | File too large to send (>25MB).");
      }

      message.reply({
        body: "✅ | Here's your audio:",
        attachment: fs.createReadStream(filePath)
      }, () => fs.unlinkSync(filePath));
    });
  }
};
