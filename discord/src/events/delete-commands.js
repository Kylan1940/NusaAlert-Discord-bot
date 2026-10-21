require('dotenv').config();

const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function deleteCommands() {
    try {
        console.log('Deleting GLOBAL slash commands...');

        await rest.put(
            Routes.applicationCommands(process.env.APPLICATION_ID),
            { body: [] }
        );

        console.log('Global slash commands deleted.');
    } catch (error) {
        console.error('Failed to delete global commands:', error);
    }
}

deleteCommands();