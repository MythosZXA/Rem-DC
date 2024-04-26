module.exports = {
	name: '/messageHistory',
	type: 'post',
	async execute(req, res, rem, expressGlobal) {
		if (expressGlobal.admins.has(req.cookies.sessionID) || req.body.bypassCode === process.env.admin) {
			const server = await rem.guilds.fetch('773660297696772096');
			const destinationID = req.body.id;
			let channel;

			const guildMember = server.members.cache.find(member => member.id === destinationID);
			// get dm channel if user is found
			if (guildMember) { channel = await guildMember.createDM(); }
			// get text channel if user isn't found
			else { channel = [...rem.serverChannels.values()].find(channel => channel.id === destinationID); }

			// format the response depending on dm/channel
			let messageHistory = await channel.messages.fetch({ limit: 30 });
			messageHistory = [...messageHistory.values()];
			res.send(messageHistory.map(message => ({
				rem: message.author.bot,
				avatarURL: message.author.avatarURL(),
				content: message.content
			})));
		} else {
			res.sendStatus(401);
		}
	}
};