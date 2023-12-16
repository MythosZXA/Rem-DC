module.exports = {
	name: '/logout',
	type: 'post',
	execute(req, res, _, expressGlobal) {
		expressGlobal.sessions.delete(req.cookies.sessionID);
		expressGlobal.admins.delete(req.cookies.sessionID);
		res.sendStatus(200);
	}
};