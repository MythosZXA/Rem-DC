module.exports = {
	name: '/logout',
	type: 'post',
	execute(req, res, _, expressGlobal) {
		if (!req.cookies.sessionID) {
			res.sendStatus(404);
			return;
		}

		expressGlobal.sessions.delete(req.cookies.sessionID);
		expressGlobal.admins.delete(req.cookies.sessionID);
		res.status(200).send({});
	}
};