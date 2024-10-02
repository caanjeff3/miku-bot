const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the richest players'),
    async execute(interaction) {
        let usersData;
        try {
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (error) {
            usersData = {};
        }

        const sortedUsers = Object.keys(usersData)
            .sort((a, b) => usersData[b].money - usersData[a].money)
            .slice(0, 10);

        // Fetch usernames of the sorted user IDs
        const leaderboard = await Promise.all(
            sortedUsers.map(async (userId, index) => {
                const user = await interaction.client.users.fetch(userId);
                return `${index + 1}. ${user.username}: $${usersData[userId].money}`;
            })
        );

        return interaction.reply(`**Top Players:**\n${leaderboard.join('\n')}`);
    },
};
