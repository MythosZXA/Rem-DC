const { SlashCommandBuilder } = require('@discordjs/builders');

function execute(interaction) {
	if (interaction.user.id != process.env.toan) {
		interaction.reply({
			content: 'You do not have permission to use this command',
			ephemeral: true,
		});
		return;
	}
	try {
		const deleteAmount = interaction.options.getNumber('amount', true);
		interaction.channel.bulkDelete(deleteAmount);
		interaction.reply({
			content: 'Deleted',
			ephemeral: true,
		});
	} catch(error) {
		interaction.reply({
			content: 'I can only clear between 1-100 messages that are not older than 2 weeks',
			ephemeral: true,
		});
		console.log(error);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clear multiple messages (Restricted)')
		.addNumberOption(option =>
			option.setName('amount')
				.setDescription('Number of messages to delete')
				.setRequired(true)
		),
	execute
};