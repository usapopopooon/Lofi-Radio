const MusicBot = require("./structures/MusicClient.js");
const config = require("./config.js");

const tokens = config.tokens.length ? config.tokens : [config.token].filter(Boolean);

if (!tokens.length) {
  console.error("No Discord bot token found. Set TOKEN for one bot or TOKENS/BOT_TOKENS for multiple bots.");
  process.exit(1);
}

const clients = tokens.map((token, index) => {
  const client = new MusicBot({
    token,
    botIndex: index + 1,
    multiBot: tokens.length > 1,
  });

  client._loadPlayer()
  client._loadClientEvents()
  client._loadNodeEvents()
  client._loadPlayerEvents()
  client._loadSlashCommands()
  client.connect()

  return client;
});

module.exports = clients; 

process.on('unhandledRejection', (reason, p) => {
    console.log(reason, p);
});

process.on('uncaughtException', (err, origin) => {
    console.log(err, origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(err, origin);
});

process.on('multipleResolves', (type, promise, reason) => {
    console.log(type, promise, reason);
});

require('node:http')
  .createServer((_, res) =>
    res.end(
      `Developed by DIWAS ATREYA\nBots: ${clients.length}`,
    ),
  )
  .listen(process.env.PORT || 8080);
