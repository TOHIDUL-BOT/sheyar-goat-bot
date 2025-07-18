const axios = require("axios");

module.exports = {
  config: {
    name: "gemini3",
    version: "1.0.1",
    author: "Kawsar",
    countDown: 2,
    role: 0,
    shortDescription: "Gemini AI Chatbot",
    longDescription: "Toggle on/off Gemini AI auto-reply mode. When ON, it replies like a human after 2s delay.",
    category: "ai",
    guide: {
      en: "{pn} on/off/your message"
    }
  },

  onStart: async function ({ message, args, event }) {
    const { senderID, body } = event;

    global.gemini = global.gemini || {};
    global.gemini.autoReply = global.gemini.autoReply || {};
    global.gemini.chatHistory = global.gemini.chatHistory || {};

    const autoReply = global.gemini.autoReply;
    const chatHistory = global.gemini.chatHistory;

    const input = args.join(" ").trim().toLowerCase();

    // 🔘 Toggle ON
    if (input === "on") {
      autoReply[senderID] = true;
      return message.reply("✅ Gemini auto-reply is now ON.");
    }

    // 🔴 Toggle OFF
    if (input === "off") {
      autoReply[senderID] = false;
      chatHistory[senderID] = [];
      return message.reply("⛔ Gemini auto-reply is now OFF.");
    }

    // ⚠️ If not ON, and not calling manually
    if (!autoReply[senderID] && !body.toLowerCase().startsWith("gemini")) return;

    const userMsg = body;
    chatHistory[senderID] = chatHistory[senderID] || [];

    chatHistory[senderID].push(`User: ${userMsg}`);
    if (chatHistory[senderID].length > 6) chatHistory[senderID].shift();

    const fullChat = chatHistory[senderID].join("\n");

    const prompt = `You are Gemini AI. Speak in a friendly tone. Use the same language the user uses. Reply in 1 line max. Don't explain anything extra. Chat history:\n\n${fullChat}`;

    try {
      const res = await axios.get(`https://geminiw.onrender.com/chat?message=${encodeURIComponent(prompt)}`);
      const botReply = res.data.reply?.trim() || "Hmm... couldn't understand that!";
      chatHistory[senderID].push(`Gemini: ${botReply}`);
      return message.reply(botReply);
    } catch (err) {
      console.error("Gemini error:", err);
      return message.reply("⚠️ Gemini server is not responding.");
    }
  },

  onChat: async function ({ message, event }) {
    const { senderID, body, messageReply } = event;
    const autoReply = global.gemini?.autoReply || {};

    // ✅ Only reply if autoReply is ON and replying to bot
    if (autoReply[senderID] && messageReply && messageReply.senderID == global.GoatBot.botID) {
      this.onStart({ message, args: [body], event });
    }
  }
};
