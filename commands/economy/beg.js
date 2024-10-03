const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    cooldown: 150,  // 2 minutes 30 seconds
    data: new SlashCommandBuilder()
        .setName('beg')
        .setDescription('Beg for money and receive a random amount between $50 and $200, affected by your multiplier'),
    async execute(interaction) {
        const userId = interaction.user.id;

        let usersData;
        try {
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (error) {
            usersData = {};
        }

        if (!usersData[userId]) {
            usersData[userId] = { money: 100, multiplier: 1 };
        }

        const userMultiplier = usersData[userId].multiplier || 1;

        const randomAmount = Math.floor(Math.random() * (200 - 50 + 1)) + 50;

        const totalAmount = Math.floor(randomAmount * userMultiplier);

        usersData[userId].money += Math.round(totalAmount);
        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

        return interaction.reply(`You begged and received $${totalAmount} (including your multiplier)! Your new balance is: $${usersData[userId].money}`);
    },
};
