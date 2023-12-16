// discord.js api								https://discord.js.org/#/
// discord.js guide							https://discordjs.guide/#before-you-begin

// enable environment variables
require('dotenv').config();
// eslint-disable-next-line no-unused-vars
const { INET } = require('sequelize');
// discord client
const rem = require('./discord').setupRem();
// set commands
const fs = require('fs');
const { default: Collection } = require('@discordjs/collection');
rem.commands = new Collection();
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./Commands/${file}`);
	rem.commands.set(command.data.name, command);
}

// start up
rem.login(process.env.token);
// event listeners
const eventFiles = fs.readdirSync('./Events').filter(file => file.endsWith('.js'));
for (const fileName of eventFiles) {
	const event = require(`./Events/${fileName}`);
	if (event.once) {		// discord "ready" event
		rem.once(event.name, async (...args) => {
			await event.execute(...args);
		});
	} else if (event.many) {		// other discord events
		rem.on(event.name, (...args) => event.execute(...args, rem));
	} else {		// node process events
		process.on(event.name, (...args) => event.execute(rem, ...args));
	}
}

module.exports = {
	rem
};