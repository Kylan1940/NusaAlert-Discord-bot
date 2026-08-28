const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
    console.log('Registering GLOBAL slash commands...');

    await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
    );

    console.log('Global commands registered.');
} catch (error) {
    console.error('Failed to register commands:', error);
}