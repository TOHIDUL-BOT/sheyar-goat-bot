const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "video",
    version: "1.0",
    author: "Kawsar & ChatGPT",
    cooldowns: 5,
    description: { en: "Download best video under 25MB from any link" },
    category: "media",
    guide: { en: "{pn} [video link]" }
  },

  onStart: async function ({ args, message, event }) {
    const url = args[0];
    if (!url) return message.reply("❌ Please provide a video link!");

    message.reply("🎬 Fetching video formats... Please wait...");

    exec(`python3 extract_video.py "${url}"`, async (err, stdout) => {
      if (err) return message.reply("❌ Python error: " + err.message);

      let data;
      try {
        data = JSON.parse(stdout);
      } catch {
        return message.reply("❌ Failed to parse video info.");
      }

      if (data.error) return message.reply("❌ Error: " + data.error);

      // ফরম্যাট ফিল্টার করো ২৫MB এর নিচে (filesize bytes এ)
      const formats = data.formats.filter(f => f.filesize && f.filesize < 25 * 1024 * 1024);

      if (!formats.length) return message.reply("❌ No video formats under 25MB found.");

      // filesize এর মধ্যে সবচেয়ে বড় resolution সিলেক্ট করো
      const bestFormat = formats.sort((a, b) => (b.height || 0) - (a.height || 0))[0];

      if (!bestFormat || !bestFormat.url) return message.reply("❌ Suitable video format not found.");

      const titleSlug = data.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const folderPath = path.join(__dirname, "..", "downloads", titleSlug);
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

      const ext = bestFormat.ext || "mp4";
      const filePath = path.join(folderPath, `${titleSlug}.${ext}`);

      message.reply(`⬇️ Downloading ${bestFormat.format_note || bestFormat.height + "p"} (${(bestFormat.filesize / 1048576).toFixed(1)}MB)...`);

      try {
        const response = await axios({
          url: bestFormat.url,
          method: "GET",
          responseType: "stream"
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on("finish", () => {
          message.reply({
            body: `✅ Here is your video: ${data.title}`,
            attachment: fs.createReadStream(filePath)
          }, () => {
            // ডাউনলোড ফাইল ও ফোল্ডার ডিলিট করো
            fs.rmSync(folderPath, { recursive: true, force: true });
          });
        });

        writer.on("error", (e) => {
          message.reply("❌ Error writing video file: " + e.message);
        });
      } catch (e) {
        return message.reply("❌ Download failed: " + e.message);
      }
    });
  }
};
