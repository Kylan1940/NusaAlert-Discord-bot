const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} is online.`);

    const commands = [];
    const commandFiles = fs
      .readdirSync(path.join(__dirname, '../commands'))
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);
      commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
      console.log('Registering slash commands...');

      // GUILD COMMAND
      await rest.put(
        Routes.applicationGuildCommands(
          client.user.id,
          process.env.GUILD_ID
        ),
        { body: commands }
      );

      console.log('Slash command registered.');
    } catch (error) {
      console.error(error);
    }
  }
};