import {  ContextMenuCommandBuilder } from '@discordjs/builders';
import emojiCharacters from '../emojiCharacters.js';

export default {
  data: new ContextMenuCommandBuilder()
    .setName('Wtf')
    .setType(3),
  async execute(interaction) {
    const message = interaction.options._hoistedOptions[0].message;
    await message.react(emojiCharacters['w']);
    await message.react(emojiCharacters['t']);
    await message.react(emojiCharacters['f']);

    interaction.reply({
      content: 'Reacted',
      ephemeral: true
    });
  }
};