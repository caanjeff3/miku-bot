const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Bet an amount and play a hand of blackjack')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('Amount of money to bet')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const betAmount = interaction.options.getInteger('bet');

        let usersData;
        try {
            usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
        } catch (error) {
            usersData = {};
        }

        if (!usersData[userId]) {
            usersData[userId] = { money: 100 };
        }

        const userMoney = usersData[userId].money;

        if (betAmount > userMoney) {
            return interaction.reply(`You don't have enough money to place that bet. Your current balance is: $${userMoney}`);
        }

        const drawCard = () => Math.floor(Math.random() * 11) + 1;

        const calculateTotal = (hand) => {
            let total = hand.reduce((a, b) => a + b, 0);
            if (total > 21 && hand.includes(11)) {
                total -= 10;
            }
            return total;
        };

        let playerHand = [drawCard(), drawCard()];
        let dealerHand = [drawCard(), drawCard()];

        let playerTotal = calculateTotal(playerHand);
        let dealerTotal = calculateTotal(dealerHand);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('hit')
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('stand')
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Danger),
            );

        await interaction.reply({
            content: `**Your Hand:** ${playerHand.join(', ')} (Total: ${playerTotal})\n**Dealer's Hand:** ${dealerHand[0]}, ?`,
            components: [row]
        });

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'hit') {
                playerHand.push(drawCard());
                playerTotal = calculateTotal(playerHand);

                if (playerTotal > 21) {
                    usersData[userId].money -= betAmount;
                    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
                    await i.update({
                        content: `**Your Hand:** ${playerHand.join(', ')} (Total: ${playerTotal})\n**Dealer's Hand:** ${dealerHand.join(', ')} (Total: ${dealerTotal})\nYou busted! You lost $${betAmount}. Your new balance is: $${usersData[userId].money}`,
                        components: []
                    });
                    collector.stop();
                } else {
                    await i.update({
                        content: `**Your Hand:** ${playerHand.join(', ')} (Total: ${playerTotal})\n**Dealer's Hand:** ${dealerHand[0]}, ?`,
                        components: [row]
                    });
                }
            } else if (i.customId === 'stand') {
                while (dealerTotal < 17 || (dealerTotal === 17 && dealerHand.includes(11))) {
                    dealerHand.push(drawCard());
                    dealerTotal = calculateTotal(dealerHand);
                }

                if (dealerTotal > 21 || playerTotal > dealerTotal) {
                    usersData[userId].money += betAmount;
                    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
                    await i.update({
                        content: `**Your Hand:** ${playerHand.join(', ')} (Total: ${playerTotal})\n**Dealer's Hand:** ${dealerHand.join(', ')} (Total: ${dealerTotal})\nYou won! You gained $${betAmount}. Your new balance is: $${usersData[userId].money}`,
                        components: []
                    });
                } else if (playerTotal === dealerTotal) {
                    await i.update({
                        content: `**Your Hand:** ${playerHand.join(', ')} (Total: ${playerTotal})\n**Dealer's Hand:** ${dealerHand.join(', ')} (Total: ${dealerTotal})\nIt's a tie! Your balance remains the same: $${usersData[userId].money}`,
                        components: []
                    });
                } else {
                    usersData[userId].money -= betAmount;
                    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
                    await i.update({
                        content: `**Your Hand:** ${playerHand.join(', ')} (Total: ${playerTotal})\n**Dealer's Hand:** ${dealerHand.join(', ')} (Total: ${dealerTotal})\nYou lost! You lost $${betAmount}. Your new balance is: $${usersData[userId].money}`,
                        components: []
                    });
                }
                collector.stop();
            }
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: `Time's up! You took too long to respond. Your balance remains: $${usersData[userId].money}`,
                    components: []
                });
            }
        });
    },
};
