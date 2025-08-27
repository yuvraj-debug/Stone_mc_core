const { REST, Routes } = require('discord.js');
require('dotenv').config();

// Configuration
const CLIENT_ID = process.env.CLIENT_ID; // Your bot's client ID
const GUILD_ID = process.env.GUILD_ID; // Optional: Specific guild ID to delete guild commands
const TOKEN = process.env.DISCORD_TOKEN; // Your bot token

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function deleteCommands() {
    try {
        console.log('Starting to delete all application commands...');

        // Delete global commands
        const globalCommands = await rest.get(Routes.applicationCommands(CLIENT_ID));
        console.log(`Found ${globalCommands.length} global commands to delete.`);

        for (const command of globalCommands) {
            await rest.delete(Routes.applicationCommand(CLIENT_ID, command.id));
            console.log(`Deleted global command: ${command.name} (ID: ${command.id})`);
        }

        // Delete guild-specific commands if GUILD_ID is provided
        if (GUILD_ID) {
            const guildCommands = await rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID));
            console.log(`Found ${guildCommands.length} guild commands to delete.`);

            for (const command of guildCommands) {
                await rest.delete(Routes.applicationGuildCommand(CLIENT_ID, GUILD_ID, command.id));
                console.log(`Deleted guild command: ${command.name} (ID: ${command.id})`);
            }
        }

        console.log('Successfully deleted all commands!');
    } catch (error) {
        console.error('Error deleting commands:', error);
    }
}

deleteCommands();