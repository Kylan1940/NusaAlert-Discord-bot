const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} is online.`);

    const commands = [];
    const commandPath = path.join(__dirname, '../commands');

    const commandFiles = fs
      .readdirSync(commandPath)
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);
      commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
      if (process.env.NODE_ENV === 'production') {
        console.log('Registering GLOBAL slash commands...');

        await rest.put(
          Routes.applicationCommands(client.user.id),
          { body: commands }
        );

        console.log('Global commands registered.');
      } else {
        console.log('Registering GUILD slash commands (DEV MODE)...');

        await rest.put(
          Routes.applicationGuildCommands(
            client.user.id,
            process.env.GUILD_ID
          ),
          { body: commands }
        );

        console.log('Guild commands registered.');
      }
    } catch (error) {
      console.error('Failed to register commands:', error);
    }
  },
};