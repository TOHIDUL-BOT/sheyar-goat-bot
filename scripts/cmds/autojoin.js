const { findUid, sleep } = global.utils;

const rateLimit = new Map(); // threadID → last add time (ms)

module.exports = {
  config: {
    name: "autojoin",
    version: "1.1",
    author: "Kawsar x ChatGPT",
    role: 0,
    shortDescription: "Auto add FB user from valid profile link (always on)",
    longDescription: "Auto add FB user from valid profile link with 5 seconds rate limit, always enabled",
    category: "group",
    guide: { en: "Just send a Facebook profile link to auto add user" }
  },

  onMessage: async function({ api, event, message, threadsData }) {
    const { threadID, body } = event;
    if (!body || !body.startsWith("http")) return;

    // Rate limiting: 5 seconds per thread
    const now = Date.now();
    if (rateLimit.has(threadID) && now - rateLimit.get(threadID) < 5000) return;
    rateLimit.set(threadID, now);

    // Regex for valid Facebook profile link ONLY
    const regExValidFBProfile = /^(?:https?:\/\/)?(?:www\.|m\.)?(?:facebook|fb)\.com\/(?:(?:profile\.php\?id=\d+)|(?:[\w\.\-]+))(?:\/)?$/i;
    if (!regExValidFBProfile.test(body.trim())) return;

    const { members, adminIDs, approvalMode } = await threadsData.get(threadID);
    const botID = api.getCurrentUserID();

    let uid;
    try {
      uid = await findUid(body.trim());
    } catch {
      return;
    }
    if (!uid) return;

    if (members.some(m => m.userID == uid && m.inGroup)) return;

    try {
      await api.addUserToGroup(uid, threadID);
      if (approvalMode && !adminIDs.includes(botID)) {
        message.reply(`🟡 Add request sent for UID: ${uid} (waiting for admin approval).`);
      } else {
        message.reply(`✅ User (UID: ${uid}) added to group.`);
      }
    } catch (err) {
      message.reply(`❌ Could not add UID: ${uid}\nReason: ${err.message}`);
    }
  }
};
