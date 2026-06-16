const { CommandInteraction, Client, MessageEmbed, Permissions } = require('discord.js');
const db = require('../../schema/station.js');
const DEFAULT_VOLUME = getDefaultVolume();

module.exports = {
  name: 'play',
  description: 'Joins your voice channel and starts playing 24/7',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
    });


    
    if (!interaction.guild.members.me.permissions.has([Permissions.FLAGS.CONNECT, Permissions.FLAGS.SPEAK]))
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(client.embedColor)
            .setDescription(
              `I don't have enough permissions to execute this command! please give me permission \`CONNECT\` or \`SPEAK\`.`,
            ),
        ],
      });
    const { channel } = interaction.member.voice;

    if (!interaction.guild.members.me.permissionsIn(channel).has([Permissions.FLAGS.CONNECT, Permissions.FLAGS.SPEAK]))
      return interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setColor(client.embedColor)
            .setDescription(
              `I don't have enough permissions connect your vc please give me permission \`CONNECT\` or \`SPEAK\`.`,
            ),
        ],
      });

    const ress = await db.findOne(client.getGuildQuery(interaction.guildId));
    const station = ress && ress.Radio ? ress.Radio : "default";
    const stationFiles = {
      default: require('../../songs/default.json'),
      "Anime lo-fi": require('../../songs/anime.json'),
      "Sleep lo-fi": require('../../songs/sleep.json'),
      "Study lo-fi": require('../../songs/study.json'),
    };
    const stationSongs = stationFiles[station] || stationFiles.default;
    const queries = shuffle(stationSongs.words);
    client.logger.log(
      `[PLAYBACK] /play requested in guild ${interaction.guildId}, voice ${interaction.member.voice.channelId}, station ${station}, candidates ${queries.length}`,
      "log",
    );

    const player = await client.manager.createPlayer({
      guildId: interaction.guildId,
      voiceId: interaction.member.voice.channelId,
      textId: interaction.channelId,
      deaf: true,
    });
    client.logger.log(`[PLAYBACK] Player ready for guild ${interaction.guildId}, text ${interaction.channelId}`, "log");

    const result = await searchFirstResult(client, player, queries, interaction.user);

    if (!result || !result.tracks.length) {
      client.logger.log(`[PLAYBACK] No playable stream found for guild ${interaction.guildId}`, "warn");
      return interaction.editReply({ content: 'No playable radio stream was found' });
    }
    if (result.type === "PLAYLIST") {
      for (let track of result.tracks) player.queue.add(track);
    } else {
      player.queue.add(result.tracks[0]);
    }
    client.logger.log(
      `[PLAYBACK] Queued ${result.tracks.length} track(s) for guild ${interaction.guildId}; selected "${result.tracks[0]?.title}" from ${result.tracks[0]?.uri}`,
      "log",
    );

 const played = new MessageEmbed()
                    .setColor("#DDBD86")
                    .setDescription(`
<:notes:1119915814733217843> Successfully joined and bound to ${interaction.member.voice.channel}.`)

    await player.setVolume(DEFAULT_VOLUME);
    client.logger.log(`[PLAYBACK] Volume set to ${DEFAULT_VOLUME} for guild ${interaction.guildId}`, "log");
    if (!player.playing && !player.paused) await player.play();
    client.logger.log(
      `[PLAYBACK] Play invoked for guild ${interaction.guildId}; playing=${player.playing}, paused=${player.paused}, queue=${getQueueSize(player)}`,
      "log",
    );
    await player.setLoop('queue');

    await interaction.followUp({ embeds: [played] });

    

    
  },
};

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getDefaultVolume() {
  const volume = Number(process.env.DEFAULT_VOLUME || 65);
  if (!Number.isFinite(volume)) return 65;
  return Math.min(100, Math.max(1, volume));
}

function getQueueSize(player) {
  if (typeof player.queue?.size === "number") return player.queue.size;
  if (typeof player.queue?.length === "number") return player.queue.length;
  if (Array.isArray(player.queue)) return player.queue.length;
  return "unknown";
}

async function searchFirstResult(client, player, queries, requester) {
  for (const query of queries) {
    try {
      client.logger.log(`[PLAYBACK] Searching stream candidate: ${query}`, "log");
      const result = await player.search(query, { requester });
      const trackCount = result?.tracks?.length || 0;
      client.logger.log(`[PLAYBACK] Search result type=${result?.type || "unknown"} tracks=${trackCount} for ${query}`, "log");
      if (trackCount) return result;
    } catch (error) {
      client.logger.log(`[PLAYBACK] Search failed for ${query}: ${error.message}`, "error");
      continue;
    }
  }

  return null;
}
