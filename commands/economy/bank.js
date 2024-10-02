const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('bank')
        .setDescription('gets your current money'),
    async execute(interaction) {
        const userId = interaction.user.id;

        let usersData;
        try {
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (error) {
            usersData = {};
        }

        if (!usersData[userId]) {
            usersData[userId] = { money: 100 };
            fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
            return interaction.reply(`You are a new user! You currently have: $100`);
        } else {
            const currentMoney = usersData[userId].money;
            return interaction.reply(`You have: $${currentMoney}`);
        }
    },
};