const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    cooldown: 300,  // 5-minute cooldown
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work and earn a random amount of money between $100 and $300'),
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

        // Random amount between 100 and 300
        const randomAmount = Math.floor(Math.random() * (300 - 100 + 1)) + 100;

        // Add the random amount to the user's total money
        usersData[userId].money += randomAmount;
        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

        return interaction.reply(`You worked and earned $${randomAmount}! Your new balance is: $${usersData[userId].money}`);
    },
};