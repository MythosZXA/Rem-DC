export default {
  name: '/ping',
  type: 'get',
  execute(req, res) {
    res.status(200).send({});
  }
};