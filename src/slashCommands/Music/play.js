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

    const player = await client.manager.createPlayer({
      guildId: interaction.guildId,
      voiceId: interaction.member.voice.channelId,
      textId: interaction.channelId,
      deaf: true,
    });

    const result = await searchFirstResult(player, queries, interaction.user);

    if (!result || !result.tracks.length) return interaction.editReply({ content: 'No playable radio stream was found' });
    if (result.type === "PLAYLIST") {
      for (let track of result.tracks) player.queue.add(track);
    } else {
      player.queue.add(result.tracks[0]);
    }

 const played = new MessageEmbed()
                    .setColor("#DDBD86")
                    .setDescription(`
<:notes:1119915814733217843> Successfully joined and bound to ${interaction.member.voice.channel}.`)

    await player.setVolume(DEFAULT_VOLUME);
    if (!player.playing && !player.paused) await player.play();
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

async function searchFirstResult(player, queries, requester) {
  for (const query of queries) {
    try {
      const result = await player.search(query, { requester });
      if (result && result.tracks && result.tracks.length) return result;
    } catch (_) {
      continue;
    }
  }

  return null;
}
