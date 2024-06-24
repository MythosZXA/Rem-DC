module.exports = {
	name: '/ping',
	type: 'get',
	execute(req, res, _, expressGlobal) {
		res.status(200).send({});
	}
};