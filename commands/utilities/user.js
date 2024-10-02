const { SlashCommandBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		const hasKickPermission = interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers);
		const rightsMessage = hasKickPermission ? "You have rights" : "You don't have rights here";
		await interaction.reply(`Ran By: ${interaction.user.username}\n\nUser Joined on:${interaction.member.joinedAt}.\n\n${rightsMessage}`);
	},
};
