import { Events } from 'discord.js';
import { importDBToMemory } from '../sequelize.js';
import { getServerChannels } from '../channels.js';
import { checkBirthday } from '../Functions/specialDaysFunctions.js';
import { setupAPI, setupSocket } from '../express.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(rem) {
    // set up global variables
    const server = await rem.guilds.fetch(process.env.guildId);
    rem.remDB = await importDBToMemory();
    rem.serverChannels = await getServerChannels(server);

    // caches users for easier access
    server.members.fetch();
    
    // check for special days when tomorrow comes
    // specialDaysFunctions.checkHoliday(channels);
    checkBirthday(server, rem);

    // server
    setupAPI(rem);
    setupSocket(rem);

    console.log('Rem is awake!');
  }
};