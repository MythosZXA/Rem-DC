module.exports = {
	name: '/textChannels',
	type: 'get',
	async execute(req, res, rem, expressGlobal) {
		if (expressGlobal.admins.has(req.cookies.sessionID)) {
			const server = await rem.guilds.fetch('773660297696772096');
			const channels = await server.channels.fetch();
			const textChannels = channels.filter(channel => channel.type === 'GUILD_TEXT');
			res.send( textChannels );
		} else {
			res.sendStatus(401);
		}
	}
};