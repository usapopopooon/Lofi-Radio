
module.exports = {
    name: "playerError",
    run: async (client, player, type, error) => {
        client.logger.log(`[PLAYBACK] Player error in guild ${player.guildId}; type=${type}; message=${error.message}`, "error");
        const guild = client.guilds.cache.get(player.guildId);
        if(!guild) return;
        await player.destroy(guild);
    }
};
