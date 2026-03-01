const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const commandFiles = fs
      .readdirSync(path.join(__dirname, '../commands'))
      .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);

      if (interaction.commandName === command.data.name) {
        await command.execute(interaction);
      }
    }
  }
};