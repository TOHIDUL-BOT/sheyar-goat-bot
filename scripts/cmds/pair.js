const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    author: "xemon",
    role: 0,
    shortDescription: "যাকে পছন্দ করো তাকে জোড়া লাগাও!",
    longDescription: "র‍্যান্ডমভাবে কারো সাথে তোমার জোড়া মিলানো হবে।",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const pathImg = __dirname + "/cache/pair_result.png";
      const pathAvt1 = __dirname + "/cache/pair_avt1.png";
      const pathAvt2 = __dirname + "/cache/pair_avt2.png";

      const id1 = event.senderID;
      const threadInfo = await api.getThreadInfo(event.threadID);
      const allUsers = threadInfo.userInfo;
      const botID = api.getCurrentUserID();

      let gender1 = "UNKNOWN";
      let name1 = "User 1";
      for (let u of allUsers) {
        if (u.id == id1) {
          gender1 = u.gender;
          name1 = u.name;
        }
      }

      let candidates = allUsers.filter(u => u.id !== id1 && u.id !== botID);
      if (gender1 === "FEMALE") {
        candidates = candidates.filter(u => u.gender === "MALE");
      } else if (gender1 === "MALE") {
        candidates = candidates.filter(u => u.gender === "FEMALE");
      }

      if (candidates.length === 0) {
        return api.sendMessage("😥 দুঃখিত! কাউকে পাওয়া যায়নি জোড়া লাগানোর জন্য।", event.threadID);
      }

      const match = candidates[Math.floor(Math.random() * candidates.length)];
      const id2 = match.id;
      const name2 = match.name || "User 2";

      const rateOptions = [
        `${Math.floor(Math.random() * 100) + 1}`,
        "-1", "99.99", "101", "0.01"
      ];
      const rate = rateOptions[Math.floor(Math.random() * rateOptions.length)];

      const backgrounds = [
        "https://i.postimg.cc/wjJ29HRB/background1.png",
        "https://i.postimg.cc/zf4Pnshv/background2.png",
        "https://i.postimg.cc/5tXRQ46D/background3.png"
      ];
      const bgURL = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // Download avatar 1
      const avt1 = (await axios.get(`https://graph.facebook.com/${id1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathAvt1, Buffer.from(avt1));

      // Download avatar 2
      const avt2 = (await axios.get(`https://graph.facebook.com/${id2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathAvt2, Buffer.from(avt2));

      // Download background
      const bg = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathImg, Buffer.from(bg));

      const background = await loadImage(pathImg);
      const avatar1 = await loadImage(pathAvt1);
      const avatar2 = await loadImage(pathAvt2);

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(avatar1, 100, 150, 300, 300);
      ctx.drawImage(avatar2, 900, 150, 300, 300);

      const finalBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, finalBuffer);
      fs.removeSync(pathAvt1);
      fs.removeSync(pathAvt2);

      return api.sendMessage({
        body: `💞 ${name1} ❤️ ${name2} 💞\n👩‍❤️‍👨 আপনাদের প্রেমের সম্ভাবনা: ${rate}%!`,
        mentions: [
          { tag: name1, id: id1 },
          { tag: name2, id: id2 }
        ],
        attachment: fs.createReadStream(pathImg)
      }, event.threadID, () => fs.unlinkSync(pathImg));

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ কিছু একটা সমস্যা হয়েছে pair কমান্ডে।", event.threadID);
    }
  }
};