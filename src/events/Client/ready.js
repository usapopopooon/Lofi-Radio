module.exports ={
name: "ready",
run: async (client) => {
    client.logger.log(`${client.user.username} online!`, "ready");
    client.logger.log(`Bot application id: ${client.user.id}`, "ready");
    client.logger.log(`Ready on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users`, "ready");
   
    let statuses = ['/play & /help', `/station & /help`];
    const updatePresence = () => {
  	let status = statuses[Math.floor(Math.random()*statuses.length)];
        client.user.setPresence({
            activities: [
                {
                    name: status,
                    type: "LISTENING"
                }
            ],
            status: process.env.PRESENCE_STATUS || "online"
        });
    };
    updatePresence();
    setInterval(updatePresence, 10000)
 }
};
