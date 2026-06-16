const { CommandInteraction, Client, MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');
const db = require('../../schema/station.js');
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
    const np = stationSongs.words[Math.floor(Math.random() * stationSongs.words.length)];

    let query = np;

    const player = await client.manager.createPlayer({
      guildId: interaction.guildId,
      voiceId: interaction.member.voice.channelId,
      textId: interaction.channelId,
      deaf: true,
    });

    const result = await player.search(query, { requester: interaction.user });

    if (!result.tracks.length) return interaction.editReply({ content: 'No result was found' });
    if (result.type === "PLAYLIST") {
      for (let track of result.tracks) player.queue.add(track);
    } else {
      player.queue.add(result.tracks[0]);
    }

 const played = new MessageEmbed()
                    .setColor("#DDBD86")
                    .setDescription(`
<:notes:1119915814733217843> Successfully joined and bound to ${interaction.member.voice.channel}.
<:blank:1120331253569302619><:dvd:1119915776732827778> **You can enable 24/7 mode by voting here.**`)

 const bb = new MessageButton().setLabel(`Vote for ${client.user.username}`).setEmoji('1119915795565269112')
    .setURL(`https://discord.gg/aromax-development-708565122188312579`)
	.setStyle(`LINK`).setDisabled(false)

      if (!player.playing && !player.paused) player.play();
    await player.setLoop('queue');
    
// if (player.queue.current) {
//      const roww = new MessageActionRow().addComponents(bb);
//          await interaction.followUp({ embeds: [played], components: [roww]});
//     }
    
                
                const roww = new MessageActionRow().addComponents(bb);
         await interaction.followUp({ embeds: [played], components: [roww]});

    

    
  },
};
