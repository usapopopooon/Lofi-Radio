const { Client, Intents, Collection } = require("discord.js");
const { Kazagumo, Plugins } = require("kazagumo");
const  mongoose  = require('mongoose');
const { readdirSync } = require("fs");
const shoukakuOptions = require("../utils/options");
const { Connectors } = require("shoukaku");
const Spotify = require("kazagumo-spotify")
const baseConfig = require("../config.js");

class MusicBot extends Client {
  static mongodbConnection;

  constructor(options = {}) {
    super({
      shards: "auto",
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false
      },
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
      ]
    });
    this.botIndex = options.botIndex || 1;
    this.multiBot = Boolean(options.multiBot);
    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.config = { ...baseConfig, token: options.token || baseConfig.token };
    this.owner = this.config.ownerID;
    this.prefix = this.config.prefix;
    this.embedColor = this.config.embedColor;
    this.aliases = new Collection();
    this.logger = require("../utils/logger.js");
    this.emoji = require("../utils/emoji.json");
    this.anime = require("../songs/anime.json")
    this.token = this.config.token;
    this.manager
    this._connectMongodb();
  }

  // _loadPlayer() {
  //   const Spotify = {
  //     spotify: {
  //       clientId: this.config.SpotifyID,
  //       clientSecret: this.config.SpotifySecret
  //     },
  //     defaultSearchEngine: "youtube_music"
  //   };
  //   this.Kazagumo = new Kazagumo(this, this.config.nodes, shoukakuOptions );
  //   return this.Kazagumo;
  // };

  _loadPlayer() {
    this.manager = new Kazagumo({
      plugins: [
        new Spotify({
          clientId: this.config.SpotifyID,
          clientSecret: this.config.SpotifySecret,
          playlistPageLimit: 3, // optional ( 100 tracks per page )
          albumPageLimit: 4, // optional ( 50 tracks per page )
          searchLimit: 10, // optional ( track search limit. Max 50 )
          searchMarket: 'IN', // optional || default: US ( Enter the country you live in. [ Can only be of 2 letters. For eg: US, IN, EN ] )//
        }),
        new Plugins.PlayerMoved(this),
      ],
      defaultSearchEngine: "youtube",
      send: (guildId, payload) => {
        const guild = this.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      }
    }, new Connectors.DiscordJS(this), this.config.nodes, shoukakuOptions);
    return this.manager;
  }

  getGuildQuery(guildId) {
    const clientId = this.user?.id;
    const query = {};
    if (guildId) query.Guild = guildId;
    if (!clientId) return query;
    if (this.multiBot && this.botIndex > 1) return { ...query, ClientId: clientId };
    return { ...query, $or: [{ ClientId: clientId }, { ClientId: { $exists: false } }] };
  }

  getGuildCreateData(guildId, data = {}) {
    return {
      ClientId: this.user?.id,
      Guild: guildId,
      ...data,
    };
  }

  getUserQuery(userId, data = {}) {
    const clientId = this.user?.id;
    const query = { UserId: userId, ...data };
    if (!clientId) return query;
    if (this.multiBot && this.botIndex > 1) return { ...query, ClientId: clientId };
    return { ...query, $or: [{ ClientId: clientId }, { ClientId: { $exists: false } }] };
  }

  getUserCreateData(userId, data = {}) {
    return {
      ClientId: this.user?.id,
      UserId: userId,
      ...data,
    };
  }

  getAutoReconnectQuery(guildId) {
    return this.getGuildQuery(guildId);
  }


  _loadClientEvents() {
    readdirSync("./src/events/Client").forEach(file => {
      const event = require(`../events/Client/${file}`);
      let eventName = file.split(".")[0];
      this.logger.log(`Loading Events Client ${eventName}`, "event");
      this.on(event.name, (...args) => event.run(this, ...args));
console.clear()
    });
  };
  /**
   * Node Manager Events 
   */
  _loadNodeEvents() {
    readdirSync("./src/events/Node").forEach(file => {
      const event = require(`../events/Node/${file}`);
      let eventName = file.split(".")[0];
      this.logger.log(`Loading Events Lavalink  ${eventName}`, "event");
      this.manager.shoukaku.on(event.name, (...args) => event.run(this, ...args));
    });
  };
  /**
   * Player Manager Events
   */
  _loadPlayerEvents() {
    readdirSync("./src/events/Players").forEach(file => {
      const event = require(`../events/Players/${file}`);
      let eventName = file.split(".")[0];
      this.logger.log(`Loading Events Players ${eventName}`, "event");
      this.manager.on(event.name, (...args) => event.run(this, ...args));
    });
  };
  /**
   * Import all commands
   */

  /**
   * SlashCommands 
   */
  _loadSlashCommands() {
    const data = [];
    readdirSync("./src/slashCommands").forEach((dir) => {
      const slashCommandFile = readdirSync(`./src/slashCommands/${dir}/`).filter((files) => files.endsWith(".js"));

      for (const file of slashCommandFile) {
        const slashCommand = require(`../slashCommands/${dir}/${file}`);

        if (!slashCommand.name) return console.error(`slashCommandNameError: ${slashCommand.split(".")[0]} application command name is required.`);

        if (!slashCommand.description) return console.error(`slashCommandDescriptionError: ${slashCommand.split(".")[0]} application command description is required.`);

        this.slashCommands.set(slashCommand.name, slashCommand);
        this.logger.log(`[ / ] Slash Command Loaded: ${slashCommand.name}`, "cmd");
        data.push(slashCommand);
      }
    });
    this.on("ready", async () => {
      try {
        const guilds = [...this.guilds.cache.values()];

        if (!guilds.length) {
          await this.application.commands.set(data);
          this.logger.log("Successfully Loaded All Global Slash Commands", "cmd");
          return;
        }

        await this.application.commands.set([]);
        const registered = await Promise.all(guilds.map((guild) => guild.commands.set(data)));
        registered.forEach((commands, index) => {
          const guild = guilds[index];
          const summary = commands.map((command) => `/${command.name}:${command.id}`).join(", ");
          this.logger.log(`Registered guild commands for ${guild.name} [${guild.id}]: ${summary}`, "cmd");
        });
        this.logger.log(`Successfully Loaded Slash Commands on ${guilds.length} guild${guilds.length > 1 ? "s" : ""}`, "cmd");
      } catch (e) {
        console.log(e);
      }
    });
  }
  async _connectMongodb() {
    if (MusicBot.mongodbConnection) return MusicBot.mongodbConnection;
    if (!this.config.mongourl) {
      this.logger.log("[DB] MONGO_URI is not set", "error");
      return null;
    }

    const dbOptions = {
      useNewUrlParser: true,
      autoIndex: false,
      connectTimeoutMS: 1000,
      family: 4,
      useUnifiedTopology: true,
    };
    mongoose.set('strictQuery', true);
    MusicBot.mongodbConnection = mongoose.connect(this.config.mongourl, dbOptions);
    mongoose.Promise = global.Promise;
    mongoose.connection.on("connected", () => {
      this.logger.log("[DB] DATABASE CONNECTED", "ready");
    });
    mongoose.connection.on("err", (err) => {
      this.logger.log(`[DB]Mongoose connection error: \n ${err.stack}`, "error");
    });
    mongoose.connection.on("disconnected", () => {
      this.logger.log("[DB]Mongoose disconnected", "error");
    });
    return MusicBot.mongodbConnection;
  }
  connect() {
    if (!this.token) throw new Error(`Missing Discord bot token for bot #${this.botIndex}`);
    return super.login(this.token);
  };
};

module.exports = MusicBot;
