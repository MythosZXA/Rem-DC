const specialDaysFunctions = require('../Functions/specialDaysFunctions');

module.exports = {
	name: 'ready',
	once: true,
	async execute(rem) {
		// set up global variables
		const server = await rem.guilds.fetch('773660297696772096');
		rem.remDB = await require('../sequelize').importDBToMemory();
		rem.serverChannels = await require('../channels').getServerChannels(server);

		// caches users for easier access
		server.members.fetch();
		
		// check for special days when tomorrow comes
		// specialDaysFunctions.checkHoliday(channels);
		specialDaysFunctions.checkBirthday(server, rem);

		// palia
		require('../Functions/palia').setupResetTimer(rem);

		// server
		require('../express').setupAPI(rem);
		require('../express').setupSocket(rem);

		console.log('Rem is online.');
	}
};