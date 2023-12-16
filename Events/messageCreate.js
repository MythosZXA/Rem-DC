const prefixCommands = require('../prefixCommands.js');

module.exports = {
	name: 'messageCreate',
	many: true,
	execute(message, rem) {
		const consoleChannel = rem.serverChannels.get('console');
		
		console.log(`${message.author.username}: ${message.content}`);
		if (message.author.bot) return;		// rem sent a message, exit
		// const chatName = message.channel?.name ?? message.author.displayAvatarURL();
		// console.log(message.author.displayAvatarURL())
		// rem.io.to(chatName).emit('dcMsg', {
		// 	user: message.author,
		// 	content: message.content
		// });

		// dms to Rem
		if (!message.inGuild()) {
			consoleChannel.send(`${message.author.username.toUpperCase()}: ${message.content}`);
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