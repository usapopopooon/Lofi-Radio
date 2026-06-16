const { MessageEmbed, MessageActionRow, MessageSelectMenu, CommandInteraction, Client } = require('discord.js');

const { MessageButton} = require("discord.js");
const DEFAULT_VOLUME = getDefaultVolume();

module.exports = {
  name: 'help',
  description: `Show Lofi Radio's help menu.`,
  userPrams: [],
  botPrams: ['EMBED_LINKS'],

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */

  run: async (client, interaction) => {
    const prefix = client.prefix;

    await interaction.deferReply({
      ephemeral: false,
    });





    

    const embed = new MessageEmbed()
        .setColor(`#DDBD86`)
          .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL(), url: `https://discord.gg/aromax-development-708565122188312579` })

          .setDescription(`
<:notes:1119915814733217843> **Music:**
<:blank:1120331253569302619><:next:1119915811415539722> **/play:** Joins your voice channel and starts playing 24/7.
<:blank:1120331253569302619><:stop:1119915842893783052> **/stop:** Leaves the voice channel.
<:blank:1120331253569302619><:dvd:1119915776732827778> **/song:** Shows the current playing song.
<:blank:1120331253569302619><:radio:1119915830344437790> **/station:** Changes the radio station/theme.
<:blank:1120331253569302619><:loud:1119915800535511070> **/volume:** Shows or changes the current volume.
<:blank:1120331253569302619><:sleep:1119915834886856785> **/sleep:** Sets a sleep timer.
<:star:1119915839064379472> **Profiles:**
<:blank:1120331253569302619><:profile:1119915826326278265> **/profile:** Shows your profile.
<:blank:1120331253569302619><:am:1121668225839661076> **/remove:** Removes the liked song.
<:blank:1120331253569302619><:floppy_disk:1119915780931338280> **/collection:** Shows your liked songs collection.
<:config:1119915722534039612> **Config:**
<:blank:1120331253569302619><:mode:1119915805056966717> **/mode:** Switches between radio modes.
<:blank:1120331253569302619><:dj:1119915773742288917> **/djrole:** Sets which roles are considered DJs.
<:blank:1120331253569302619><:gear:1119915784756531331> **/settings:** Shows and configures server settings.
<:blank:1120331253569302619><:premium:1119915823964893214>  **/premium:** Shows information about Lofi Radio premium.
<:info:1119915789030535178> **Info:**
<:blank:1120331253569302619><:telegram:1119915847809515671> **/support:** Send us a message or [join](https://discord.gg/aromax-development-708565122188312579) our support server.
<:blank:1120331253569302619><:invite:1119915791521955970> **/invite:** [Invite](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands) Lofi Radio to your server.
`)

const b1 = new MessageButton().setLabel(`Play`).setCustomId(`play`).setEmoji(`1119915811415539722`).setStyle('SECONDARY').setDisabled(false)
        const b2 = new MessageButton().setLabel(`Stop`).setCustomId(`stop`).setEmoji(`1119915842893783052`).setStyle('SECONDARY').setDisabled(false)
        const b4 = new MessageButton() .setLabel(`Invite`)
      .setEmoji('1119915791521955970')
   .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
    .setStyle(`LINK`).setDisabled(false)


const b5 = new MessageButton().setLabel(`Play`).setCustomId(`play`).setEmoji(`1119915811415539722`).setStyle('SECONDARY').setDisabled(true)
        const b6 = new MessageButton().setLabel(`Stop`).setCustomId(`stop`).setEmoji(`1119915842893783052`).setStyle('SECONDARY').setDisabled(true)

    const drow = new MessageActionRow().addComponents(b5, b6, b4);

    const row = new MessageActionRow().addComponents(b1, b2, b4);

  let m =  await interaction.followUp({ embeds: [embed], components: [row] })


 const filter = i => {
        if (i.user.id === interaction.user.id) return true;
        else {
          i.reply({
            ephemeral: true,
            content: `Only **${interaction.user.tag}** can use this button, if you want then you've to run the command again.`,
          });
          return false;
        }
      }

 const collector = m.createMessageComponentCollector({ filter, componentType: 'BUTTON', time: 30000 });
    
  const played = new MessageEmbed()
                    .setColor("#DDBD86")
                    .setDescription(`
<:notes:1119915814733217843> Successfully joined and bound to ${interaction.member.voice.channel}.`)
    
    collector.on('end', async () => {
      if (!m) return;
      m.edit({ embeds: [embed], components: [drow] })
    });

    collector.on('collect', async i => {
      if (!i.deferred) await i.deferUpdate();

      if (i.customId === `play`) {
  if (interaction.guild.members.me.voice.channel) {
          if (interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId) {
            return await i
              .followUp({ embeds: [{
      color: '#DDBD86',
      description: `<:loud:1119915800535511070> You have to be in same voice channel to use this command.`
    }], ephemeral: true})
              .catch(() => { });
          }
        } else if (!i.member.voice.channel) {
        return await i
          .followUp({ embeds: [{
      color: '#DDBD86',
      description: `<:loud:1119915800535511070> You have to be connected to a voice channel to use this command.`
    }], ephemeral: true})
          .catch(() => { });
      } else {

const player = await client.manager.createPlayer({
      guildId: interaction.guildId,
      voiceId: interaction.member.voice.channelId,
      textId: interaction.channelId,
      deaf: true,
    });
const db = require('../../schema/station.js');
   



   
     const ress = await db.findOne(client.getGuildQuery(interaction.guildId));
     const station = ress && ress.Radio ? ress.Radio : "default";
     const stationFiles = {
       default: require('../../songs/default.json'),
       "Anime lo-fi": require('../../songs/anime.json'),
       "Sleep lo-fi": require('../../songs/sleep.json'),
       "Study lo-fi": require('../../songs/study.json'),
     };
     const stationSongs = stationFiles[station] || stationFiles.default;
     const result = await searchFirstResult(player, shuffle(stationSongs.words), interaction.user);

    if (!result || !result.tracks.length) return i.followUp({ content: 'No playable radio stream was found', ephemeral: true });
                      if (result.type === "PLAYLIST") for (let track of result.tracks) player.queue.add(track);
    else player.queue.add(result.tracks[0]);
await player.setVolume(DEFAULT_VOLUME);
if (!player.playing && !player.paused) await player.play();
         await i.followUp({ embeds: [played]});
              }
        }


      if (i.customId === `stop`) {
          
const player = client.manager.players.get(i.guild.id);
      if (interaction.guild.members.me.voice.channel) {
          if (interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId) {
            return await i
              .followUp({ embeds: [{
      color: '#DDBD86',
      description: `👋`
    }], ephemeral: true})
              .catch(() => { });
          }
        }  
        if (!i.member.voice.channel) {
        return await i
          .followUp({ embeds: [{
      color: '#DDBD86',
      description: `👋`
    }], ephemeral: true})
          .catch(() => { });
      }
        
if(player && player.queue.current) {
await player.destroy(interaction.guild.id);

await i.followUp({ embeds: [{
      color: '#DDBD86',
      description: `<:stop:1119915842893783052> Successfully disconnected from ${i.member.voice.channel}
 `
    }]})
} else {
   return await i
          .followUp({ embeds: [{
      color: '#DDBD86',
      description: `There is no player for this guild.`
    }], ephemeral: true})
}
      
        
      }

      

    });
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
