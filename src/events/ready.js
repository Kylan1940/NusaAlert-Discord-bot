const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

module.exports = {
    name: 'clientReady',
    once: true,

    async execute(client) {
        console.log(`${client.user.tag} is online.`);

        const commands = [];

        const commandsPath = path.join(__dirname, '../commands');
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }
        }

        const rest = new REST({ version: '10' })
            .setToken(process.env.TOKEN);

        try {
            console.log('Registering GLOBAL slash commands...');

            await rest.put(
                Routes.applicationCommands(process.env.APPLICATION_ID),
                { body: commands }
            );

            console.log('Global commands registered.');
        } catch (error) {
            console.error('Failed to register global commands:', error);
        }
    }
};