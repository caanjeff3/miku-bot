const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    cooldown: 1,
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll a dice and bet an amount of money. Roll a 6 or 1 to win.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of money to bet')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const betAmount = interaction.options.getInteger('amount');

        let usersData;
        try {
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (error) {
            usersData = {};
        }

        if (!usersData[userId]) {
            usersData[userId] = { money: 100 };
        }

        const currentMoney = usersData[userId].money;

        if (betAmount <= 0 || betAmount > currentMoney) {
            return interaction.reply(`Invalid bet amount. You have ${currentMoney} money available.`);
        }

        const roll = Math.floor(Math.random() * 6) + 1;

        let newBalance;
        if (roll === 1 || roll === 6) {
            newBalance = currentMoney + betAmount;
            interaction.reply(`You rolled a ${roll}! You win! Your new balance is: ${newBalance}`);
        } else {
            newBalance = currentMoney - betAmount;
            interaction.reply(`You rolled a ${roll}. You lose! Your new balance is: ${newBalance}`);
        }

        usersData[userId].money = newBalance;
        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
    },
};