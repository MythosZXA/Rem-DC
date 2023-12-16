module.exports = {
	name: '/paliaUpdate',
	type: 'post',
	execute(req, res, rem) {
		// parse data from request
		const userID = req.cookies.discordID;
		const villagerID = req.body.villagerID;
		const giftNumber = req.body.giftNumber;

		// update db
		const giftInfo = rem.remDB.get('palia_gifts').find(giftInfo => giftInfo.user_id === userID && giftInfo.villager_id === villagerID);
		if (giftInfo) {
			switch (giftNumber) {
				case 0:
					giftInfo['gifted'] = giftInfo['gifted'] === 1 ? 0 : 1;
					break;
				case 1:
				case 2:
				case 3:
				case 4:
					giftInfo[`gift${giftNumber}`] = giftInfo[`gift${giftNumber}`] === 1 ? 0 : 1;
					break;
			}
			res.sendStatus(200);
		} else {
			res.sendStatus(400);
		}
	}
};