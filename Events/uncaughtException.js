module.exports = {
	name: 'uncaughtException',
	process: true,
	async execute(rem, err) {
		await require('../sequelize').exportMemoryToDB(rem);
		rem.io.disconnectSockets(true);
		
		console.error('Rem went down!', err);
		rem.destroy();
		process.exit();
	}
};