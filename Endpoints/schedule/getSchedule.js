import { extractSID, getSessUser } from '../common.js';
import notification from '../../Commands/notification.js';

export default {
  name: '/schedule/getSchedule',
  type: 'get',
  async execute(req, res, rem) {
    const SID = extractSID(req, res);
    if (!SID) return;

    const sessUser = getSessUser(SID, res, rem.express);
    if (!sessUser) return;

    const userSchedule = rem.schedules.get(sessUser.id) ?? new Map();
    res.send([...userSchedule.values()]);
  }
};