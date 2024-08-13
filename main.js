// discord.js api								https://discord.js.org/#/
// discord.js guide							https://discordjs.guide/#before-you-begin

import 'dotenv/config';
import rem from './discord.js';
import fs from 'fs';

// set commands
import { Collection } from '@discordjs/collection';
rem.commands = new Collection();
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
(async () => {
  for (const file of commandFiles) {
    const command = (await import(`./Commands/${file}`)).default;
    rem.commands.set(command.data.name, command);
  }
})();

// event listeners
const eventFiles = fs.readdirSync('./Events').filter(file => file.endsWith('.js'));
(async () => {
  for (const fileName of eventFiles) {
    const event = (await import(`./Events/${fileName}`)).default;
    if (event.once) {		// discord "ready" event
      rem.once(event.name, async (...args) => {
        await event.execute(...args);
      });
    } else if (event.many) {		// other discord events
      rem.on(event.name, (...args) => {
        try {
          event.execute(...args, rem);
        } catch (e) {
          console.log(e);
        }
      });
    } else {		// node process events
      process.on(event.name, (...args) => event.execute(rem, ...args));
    }
  }
})();

// start up
rem.login(process.env.token);