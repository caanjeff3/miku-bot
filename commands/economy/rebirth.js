const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rebirth')
        .setDescription('Rebirth to gain a multiplier on income'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const baseCost = 10000;
        const multiplierIncrease = 0.1;

        let usersData;
        try {
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (error) {
            usersData = {};
        }

        // Initialize the user if they don't exist or set missing fields to default values
        if (!usersData[userId]) {
            usersData[userId] = { money: 100, rebirths: 0, multiplier: 1 };
        } else {
            // Ensure 'rebirths' and 'multiplier' fields are not null or undefined
            usersData[userId].rebirths = usersData[userId].rebirths ?? 0;
            usersData[userId].multiplier = usersData[userId].multiplier ?? 1;
        }

        const userMoney = usersData[userId].money;
        const userRebirths = usersData[userId].rebirths;
        const rebirthCost = Math.round(baseCost * Math.pow(1.3, userRebirths)); // Rounded to nearest whole number

        if (userMoney < rebirthCost) {
            return interaction.reply(`You need at least $${rebirthCost} to rebirth! You currently have $${userMoney}.`);
        }

        usersData[userId].money = 0;
        usersData[userId].rebirths += 1;
        usersData[userId].multiplier += multiplierIncrease;

        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

        const nextRebirthCost = Math.round(baseCost * Math.pow(1.3, usersData[userId].rebirths)); // Rounded for the next rebirth
        return interaction.reply(`You have rebirthed! Your new income multiplier is x${usersData[userId].multiplier}. It will cost $${nextRebirthCost} for the next rebirth.`);
    },
};
