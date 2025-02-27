import { Events } from 'discord.js';
import * as prefixCommands from '../prefixCommands.js';

export default {
  name: Events.MessageCreate,
  many: true,
  execute(message, rem) {
    const consoleChannel = rem.serverChannels.get('console');
    console.log(`${message.author.username}: ${message.content}`);
    // rem sent a message
    if (message.author.id === message.client.user.id) {
      // determine destination name
      const destinationName = message.channel.isDMBased() ? message.channel.recipient.displayName : message.channel.name;
      if (destinationName !== 'console') {
        consoleChannel.send(`[To ${destinationName}] ${message.content}`);
      }
      return;
    }

    const destinationID = message.inGuild() ? message.channel.id : message.author.id;
    rem.io.to(destinationID).emit('dcMsg', {
      avatarURL: message.author.displayAvatarURL(),
      content: message.content
    });

    // dms to Rem
    if (!message.inGuild()) {
      consoleChannel.send(`[From ${message.author.username.toUpperCase()}] ${message.content}`);
    }

    // misc responses
    if (message.content.toLowerCase().includes('thanks rem')) {
      if (message.author.id === process.env.toan) {
        const remhehe = rem.emojis.cache.find(emoji => emoji.name === 'remhehe');
        message.channel.send(`${remhehe}`);
      } else {
        message.channel.send('You\'re welcome!');
      }
      return;
    } else if (message.content.includes('🙁')) {
      message.react('🙁');
      return;
    }

    const arg = message.content.split(' ');
    // check if message is a prefix command
    if (arg[0].toLowerCase() != 'rem,') return;
    prefixCommands[arg[1].toLowerCase()]?.(message, arg);
  }
};