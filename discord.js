const { Client } = require('discord.js');

function setupRem() {
	return new Client({
		intents: [
			'GUILDS',
			'GUILD_MEMBERS',
			'GUILD_EMOJIS_AND_STICKERS',
			'GUILD_VOICE_STATES',
			'GUILD_PRESENCES',
			'GUILD_MESSAGES',
			'DIRECT_MESSAGES',
		],
		partials: ['CHANNEL']
	});
}

module.exports = {
	setupRem
};