module.exports = {
	name: '/serverMembers',
	type: 'get',
	async execute(req, res, rem, expressGlobal) {
		if (expressGlobal.admins.has(req.cookies.sessionID)) {
			const server = await rem.guilds.fetch('773660297696772096');
			const members = server.members.cache;
			const realMembers = members.filter(member => !member.user.bot);
			res.send({ remAvatarURL: rem.user.displayAvatarURL(), members: realMembers });
		} else {
			res.sendStatus(401);
		}
	}
};