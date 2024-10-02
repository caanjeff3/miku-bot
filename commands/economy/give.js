const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Give money to a user')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user you want to give money to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of money to give')
                .setRequired(true)),
    async execute(interaction) {
        const giverId = interaction.user.id;
        const targetUser = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        const adminId = '478167845910609931';  // The authorized Discord ID

        // Check if the user is authorized to give money
        if (giverId !== adminId) {
            return interaction.reply("You are not authorized to give money.");
        }

        let usersData;
        try {
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (error) {
            usersData = {};
        }

        // Initialize the target user with 100 if they don't exist
        if (!usersData[targetUser.id]) {
            usersData[targetUser.id] = { money: 100 };
        }

        // Add the given amount to the target user's money
        usersData[targetUser.id].money += amount;
        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

        return interaction.reply(`${targetUser.username} has received $${amount}. Their new balance is $${usersData[targetUser.id].money}.`);
    },
};