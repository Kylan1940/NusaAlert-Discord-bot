require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');

const eventHandler = require('./handlers/eventHandler');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ], 
  partials: [Partials.Channel] 
});

client.once('clientReady', (c) => {
  console.log(`${c.user.tag} is online.`);

  client.user.setPresence({
    activities: [{
      name: '/setgempa | kylan1940.netlify.app',
      type: ActivityType.Watching
    }],
    status: 'online'
  });
});

eventHandler(client);

client.login(process.env.TOKEN);