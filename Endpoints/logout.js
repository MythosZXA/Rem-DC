module.exports = {
	name: '/logout',
	type: 'post',
	execute(req, res, _, expressGlobal) {
		if (!req.cookies.rdcSID) {
			res.status(404).send('Session not found');
			return;
		}

		expressGlobal.sessions.delete(req.cookies.rdcSID);
		expressGlobal.admins.delete(req.cookies.rdcSID);
		res.send({});
	}
};