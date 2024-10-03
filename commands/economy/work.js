const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn money'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const baseIncome = 100;

        let usersData;
        try {
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (error) {
            usersData = {};
        }

        if (!usersData[userId]) {
            usersData[userId] = { money: 100, rebirths: 0, multiplier: 1 };
        }

        const multiplier = usersData[userId].multiplier || 1;
        const earnedMoney = Math.round(baseIncome * multiplier); // Rounded to nearest whole number

        // Update the user's money
        usersData[userId].money += earnedMoney;
        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

        return interaction.reply(`You worked and earned $${earnedMoney}. Your total balance is now $${usersData[userId].money}.`);
    },
};