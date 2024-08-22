import { extractSID } from '../common.js';
import { table, hands } from './common.js';

export default {
  name: '/cards/reset',
  type: 'post',
  execute(req, res, rem) {
    // const SID = extractSID(req, res);
    // if (!SID) return;

    // if(!hands.get(SID)) return;

    table.length = 0;
    hands.clear();

    res.send({});
  }
}