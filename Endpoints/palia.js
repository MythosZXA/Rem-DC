module.exports = {
	name: '/palia',
	type: 'get',
	execute(req, res, rem) {
		// get villager info
		const villagers = rem.remDB.get('palia_villagers');
		// get user's palia info
		const userID = req.cookies.discordID;
		const giftInfo = rem.remDB.get('palia_gifts').filter(giftInfo => giftInfo.user_id === userID);
		// create default palia info if user had none
		if (!giftInfo.length) {
			villagers.forEach(villager => {
				giftInfo.push({
					user_id: userID,
					villager_id: villager.id,
					gifted: 0,
					gift1: 0,
					gift2: 0,
					gift3: 0,
					gift4: 0
				});
			});

			// add default info to db
			rem.remDB.get('palia_gifts').push(...giftInfo);
		}

		res.send({ villagers: villagers, giftInfo: giftInfo });
	}
};