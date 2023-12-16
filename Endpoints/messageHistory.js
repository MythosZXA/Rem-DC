module.exports = {
	name: '/messageHistory',
	type: 'post',
	async execute(req, res, rem, expressGlobal) {
		if (expressGlobal.admins.has(req.cookies.sessionID)) {
			const server = await rem.guilds.fetch('773660297696772096');
			const chatName = req.body.chatName;
			let channel;

			const serverMember = server.members.cache.find(member => member.displayName === chatName);
			// get dm channel if user is found
			if (serverMember) { channel = await serverMember.user.createDM(); }
			// get text channel if user isn't found
			else { channel = rem.serverChannels.get(chatName); }

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