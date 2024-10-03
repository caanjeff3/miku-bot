const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Started deleting all application (/) commands for Guild ${guildId}.`);

        // Get all commands first
        const commands = await rest.get(
            Routes.applicationGuildCommands(clientId, guildId)
        );

        if (commands.length === 0) {
            console.log('No commands to delete.');
            return;
        }

        // Loop through all commands and delete each one
        for (const command of commands) {
            await rest.delete(
                Routes.applicationGuildCommand(clientId, guildId, command.id)
            );
            console.log(`Deleted command ${command.name} (ID: ${command.id})`);
        }

        console.log(`Successfully deleted all application (/) commands for Guild ${guildId}.`);
    } catch (error) {
        console.error(error);
    }
})();
