const { CommandInteraction, Client } = require('discord.js');
module.exports = {
  name: 'stop',
  description: 'Leaves the voice channel',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],
  dj: true,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    await interaction.deferReply({
      ephemeral: false,
    });
    

   const player = client.manager.players.get(interaction.guild.id); 
if (!player) {
  return interaction.editReply({ embeds: [{
    color: '#DDBD86',
    description: `There is no player for this guild.`
  }]});
}
await player.destroy(interaction.guild.id);

await interaction.followUp({ embeds: [{
      color: '#DDBD86',
      description: `<:stop:1119915842893783052> Successfully disconnected from ${interaction.member.voice.channel}
 `
    }]})
            

  

  },
};
