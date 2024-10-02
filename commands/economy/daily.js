const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    cooldown: 86400,  // 24-hour cooldown
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    async execute(interaction) {
        const userId = interaction.user.id;

        let usersData;
        try {
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (error) {
            usersData = {};
        }

        // Initialize user with 100 if they don't exist
        if (!usersData[userId]) {
            usersData[userId] = { money: 100 };
        }

        const dailyReward = 500;
        usersData[userId].money += dailyReward;
        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

        return interaction.reply(`You've claimed your daily reward of $${dailyReward}. Your new balance is: $${usersData[userId].money}`);
    },
};