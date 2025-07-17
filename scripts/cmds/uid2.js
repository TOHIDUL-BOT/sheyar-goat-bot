//========= GoatBot Compatible Command =========//

module.exports = {
  config: {
    name: "uid2",
    version: "1.0.0",
    author: "TOHIDUL",
    cooldowns: 5,
    description: { en: "Send profile contact card of user" },
    category: "admin",
    guide: { en: "{pn} [@mention | uid | name]" }
  },

  onStart: async function ({ api, event, args, message }) {
    const { threadID, messageReply, senderID, mentions, type } = event;

    // যার প্রোফাইল চাচ্ছে তার ইউজার আইডি বের করি
    let id = Object.keys(mentions).length > 0
      ? Object.keys(mentions)[0].replace(/\&mibextid=ZbWKwL/g, '')
      : args[0] !== undefined
        ? isNaN(args[0])
          ? await global.utils.getUID(args[0])
          : args[0]
        : senderID;

    if (type === "message_reply") id = messageReply.senderID;

    // প্রোফাইল শেয়ার করো
    api.shareContact("", id, threadID);
  }
};
