
module.exports = {
    name: "playerUpdate",
    run: async (client, player) => {
       const now = Date.now();
       const lastLog = player.data.get("lastPlaybackUpdateLog") || 0;
       if (now - lastLog < 15000) return;

       player.data.set("lastPlaybackUpdateLog", now);
       client.logger.log(
        `[PLAYBACK] Player update in guild ${player.guildId}; position=${player.position}; playing=${player.playing}; paused=${player.paused}; state=${player.state || "unknown"}`,
        "log",
       );
    }
};
