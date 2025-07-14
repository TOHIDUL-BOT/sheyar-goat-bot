const axios = require("axios"); 
const yts = require("yt-search"); 
const fs = require("fs"); 
const path = require("path"); 
module.exports = { config: { 
   name: "sing", 
   version: "0.0.1", 
   author: "ArYAN", 
   description: "Fetch MP3 of a YouTube song by keyword or link",
   usage: "sing <keywords|youtube-url>", 
   cooldown: 5, role: 0, 
   category: "song" }, onStart: async function ({ api, event, args }) { const q = args.join(" ").trim(); if (!q) return api.sendMessage("⚠️ Type: sing <song name or YouTube link>", event.threadID, event.messageID); api.setMessageReaction("⏰", event.messageID, () => {}, true); let ytUrl = q; if (!/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(q)) { const res = await yts(q); if (!res.videos.length) { api.setMessageReaction("❌", event.messageID, () => {}, true); return api.sendMessage("❌ No results found.", event.threadID, event.messageID); } ytUrl = res.videos[0].url; } try { const apiRes = await axios.get(`http://193.149.164.168:5404/y?url=${encodeURIComponent(ytUrl)}`); if (!apiRes.data?.status) { api.setMessageReaction("❌", event.messageID, () => {}, true); return api.sendMessage("❌ Failed to fetch download link.", event.threadID, event.messageID); } const { title, sing } = apiRes.data.result; const tmp = path.join(__dirname, `sing_${Date.now()}.mp3`); const writer = fs.createWriteStream(tmp); const stream = await axios({ url: sing, responseType: "stream" }); stream.data.pipe(writer); await new Promise((r, j) => { writer.on("finish", r); writer.on("error", j); }); api.setMessageReaction("✅", event.messageID, () => {}, true); api.sendMessage( { body: `🎶 ${title}`, attachment: fs.createReadStream(tmp) }, event.threadID, () => fs.unlinkSync(tmp), event.messageID ); } catch (e) { api.setMessageReaction("❌", event.messageID, () => {}, true); api.sendMessage("❌ Error downloading song.", event.threadID, event.messageID); } } };
