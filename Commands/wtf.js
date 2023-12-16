const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const emojiCharacters = require('../emojiCharacters');

async function execute(interaction) {
	const message = interaction.options._hoistedOptions[0].message;
  await message.react(emojiCharacters['w']);
  await message.react(emojiCharacters['t']);
  await message.react(emojiCharacters['f']);

	interaction.reply({
		content: 'Reacted',
		ephemeral: true
	});
}

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('Wtf')
		.setType(3),
	execute,
};