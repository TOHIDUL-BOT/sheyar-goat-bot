const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "toilet",
    version: "2.0",
    author: "TOHI-BOT-HUB | Modified by ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Toilet image fun",
    longDescription: "Send someone to toilet with a funny edited image",
    category: "fun",
    guide: {
      en: "{pn} @mention | reply"
    }
  },

  onStart: async function ({ event, api, args, usersData }) {
    const OWNER_UIDS = ["100092006324917"];
    const senderID = event.senderID;

    // Get target ID from mention or reply or sender
    let targetID = senderID;
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    if (OWNER_UIDS.includes(targetID) && !OWNER_UIDS.includes(senderID)) {
      return api.sendMessage(
        "😹👑😎 Boss কে toilet এ পাঠানো যায় না! 💪",
        event.threadID,
        event.messageID
      );
    }

    const targetName = await usersData.getName(targetID);
    const msg = await api.sendMessage("🚽 Toilet preparation in progress... 💩", event.threadID);

    try {
      // Prepare canvas
      const canvas = Canvas.createCanvas(500, 670);
      const ctx = canvas.getContext("2d");

      // Load background
      try {
        const bg = await Canvas.loadImage("https://i.imgur.com/Kn7KpAr.jpg");
        ctx.drawImage(bg, 0, 0, 500, 670);
      } catch {
        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(0, 0, 500, 670);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(150, 400, 200, 150);
        ctx.fillRect(180, 350, 140, 50);
        ctx.fillStyle = "#000";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("TOILET", 250, 475);
      }

      // Avatar download
      let avatarBuffer;
      const avatarUrls = [
        `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        `https://graph.facebook.com/${targetID}/picture?width=512&height=512`,
        `https://graph.facebook.com/${targetID}/picture?type=large`
      ];

      for (let url of avatarUrls) {
        try {
          const res = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 8000
          });
          avatarBuffer = res.data;
          break;
        } catch (e) {}
      }

      if (avatarBuffer) {
        // Circular crop using Canvas
        const avCanvas = Canvas.createCanvas(512, 512);
        const avCtx = avCanvas.getContext("2d");
        const avatar = await Canvas.loadImage(avatarBuffer);

        avCtx.beginPath();
        avCtx.arc(256, 256, 256, 0, Math.PI * 2);
        avCtx.closePath();
        avCtx.clip();
        avCtx.drawImage(avatar, 0, 0, 512, 512);

        ctx.drawImage(avCanvas, 135, 350, 205, 205);
      } else {
        // Fallback: first letter
        ctx.fillStyle = '#4A90E2';
        ctx.beginPath();
        ctx.arc(237.5, 452.5, 102.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((targetName[0] || '?').toUpperCase(), 237.5, 452.5);
      }

      const imgPath = path.join(__dirname, "cache", `toilet_${Date.now()}.png`);
      const imgBuffer = canvas.toBuffer();
      fs.writeFileSync(imgPath, imgBuffer);

      const messages = [
        `🚽💩 ${targetName} এখন toilet এ বসে আছে! 😂`,
        `🚽 ${targetName} কে toilet এ পাঠিয়ে দেওয়া হয়েছে! 💩😹`,
        `💩 ${targetName} এর toilet break time! 🚽😂`,
        `🚽 ${targetName} এখন busy toilet এ! 💩🤣`
      ];

      api.unsendMessage(msg.messageID);

      return api.sendMessage(
        {
          body: messages[Math.floor(Math.random() * messages.length)],
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.unlinkSync(imgPath),
        event.messageID
      );

    } catch (err) {
      api.unsendMessage(msg.messageID);
      return api.sendMessage(
        `❌ Toilet command failed:\n${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
