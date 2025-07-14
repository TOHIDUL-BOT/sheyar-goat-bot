const axios = require("axios");
const moment = require("moment");

module.exports = {
config: {
name: "uptime",
aliases: ["upt"],
version: "1.2",
author: "Kawsar",
cooldowns: 3,
description: { en: "Shows bot uptime & auto-pings host to keep alive" },
category: "system",
guide: { en: "{pn} [status]" }
},

// বট অন হলে চালু হবে — host link auto-ping system
onLoad: async function ({ api }) {
const { config } = global.GoatBot;

// ✅ Host URL detect (RENDER, REPLIT, GLITCH etc.)  
let hostURL = config.autoUptime?.url ||  
  (process.env.REPL_OWNER  
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`  
    : process.env.RENDER_EXTERNAL_URL ||  
      (process.env.PROJECT_DOMAIN ? `https://${process.env.PROJECT_DOMAIN}.glitch.me` : null));  

if (!hostURL) {  
  console.log("[UPTIME] ❌ Host URL not detected, auto-ping disabled.");  
  return;  
}  

if (!hostURL.startsWith("http")) hostURL = "https://" + hostURL;  
hostURL += "/uptime"; // append uptime path  

console.log(`[UPTIME] ✅ Auto ping started: ${hostURL}`);  

let lastStatus = "ok";  

setInterval(async () => {  
  try {  
    await axios.get(hostURL, { timeout: 10000 });  
    if (lastStatus !== "ok") {  
      lastStatus = "ok";  
      console.log("[UPTIME] ✅ Back online");  
    }  
  } catch (err) {  
    if (lastStatus !== "fail") {  
      lastStatus = "fail";  
      console.log("[UPTIME] ❌ Ping failed");  

      const admins = global.GoatBot.config.adminBot || [];  
      for (const adminID of admins) {  
        api.sendMessage(  
          `🚨 𝐔𝐏𝐓𝐈𝐌𝐄 𝐀𝐋𝐄𝐑𝐓:\nYour bot host seems 🔴 **DOWN**!\n➤ ${hostURL}\n⏱️ Time: ${moment().format("YYYY-MM-DD HH:mm:ss")}`,  
          adminID  
        );  
      }  
    }  
  }  
}, 1000 * 60 * 5); // প্রতি ৫ মিনিটে ping

},

// যখন কেউ /uptime কমান্ড চালাবে
onStart: async function ({ message, args }) {
// ✅ Bot uptime in seconds
const uptime = Math.floor(process.uptime());
const days = Math.floor(uptime / 86400);
const hours = Math.floor((uptime % 86400) / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
const seconds = uptime % 60;

let uptimeFormatted = `⏳ ${days}d ${hours}h ${minutes}m ${seconds}s`;  
if (days === 0) uptimeFormatted = `⏳ ${hours}h ${minutes}m ${seconds}s`;  
if (hours === 0) uptimeFormatted = `⏳ ${minutes}m ${seconds}s`;  
if (minutes === 0) uptimeFormatted = ` ${seconds}s`;  

return message.reply(` 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲:${uptimeFormatted}`);

}
};
