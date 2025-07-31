const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "gay",
    version: "1.0",
    author: "@tas33n",
    countDown: 1,
    role: 3,
    shortDescription: "find gay",
    longDescription: "",
    category: "box chat",
    guide: "{pn}",
    envConfig: {
      deltaNext: 5
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người bạn muốn tát"
    },
    en: {
      noTag: "You must tag the person you want to "
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang, api }) {
    // Admin UIDs to exclude from gay command
    const adminUIDs = ["100092006324917"]; // Add your UID here

    let uid;

    // If someone is mentioned, use that person
    let mention = Object.keys(event.mentions);
    if (mention[0]) {
      uid = mention[0];
    } 
    // If replying to a message, use that person
    else if (event.type == "message_reply") {
      uid = event.messageReply.senderID;
    } 
    // Otherwise pick a random user from the group
    else {
      try {
        // Get thread info to get all participants
        const threadInfo = await api.getThreadInfo(event.threadID);
        const participants = threadInfo.participantIDs;

        // Filter out admin UIDs and bot's own ID
        const botID = api.getCurrentUserID();
        const eligibleUsers = participants.filter(id => 
          !adminUIDs.includes(id) && 
          id !== botID &&
          id !== event.senderID // Don't select the command sender
        );

        if (eligibleUsers.length === 0) {
          return message.reply("❌ No eligible users found in this group!");
        }

        // Pick random user
        uid = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
      } catch (error) {
        console.error("Error getting thread info:", error);
        return message.reply("❌ Error getting group members!");
      }
    }

    // Check if the target user is admin
    if (adminUIDs.includes(uid)) {
      return message.reply("❌boss er sathe gaddari korte parbo na 🥺🥱!");
    }

    try {
      let url = await usersData.getAvatarUrl(uid);
      let avt = await new DIG.Gay().getImage(url);

      const pathSave = `${__dirname}/tmp/gay.png`;
      fs.writeFileSync(pathSave, Buffer.from(avt));

      // Get user info for mention
      const userInfo = await usersData.get(uid);
      const userName = userInfo.name || "Unknown User";

      let body = `🏳️‍🌈 Look.... I found a gay! 🏳️‍🌈`;

      message.reply({
        body: body,
        attachment: fs.createReadStream(pathSave),
        mentions: [{
          tag: userName,
          id: uid
        }]
      }, () => fs.unlinkSync(pathSave));

    } catch (error) {
      console.error("Error in gay command:", error);
      message.reply("❌ An error occurred while processing the command!");
    }
  }
};