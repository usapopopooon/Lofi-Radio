
module.exports = {
    name: "playerException",
    run: async (client, player, reason) => {
        client.logger.log(`[PLAYBACK] Player exception in guild ${player.guildId}; reason=${reason}`, "error");
        const guild = client.guilds.cache.get(player.guildId);
        if(!guild) return;
        await player.destroy(guild);
    }
};
