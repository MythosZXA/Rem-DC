import { exportMemoryToDB } from '../sequelize.js';

export default {
  name: 'SIGTERM',
  process: true,
  async execute(rem) {
    await exportMemoryToDB(rem);

    console.log('Rem is going to sleep!');
    rem.destroy();
    process.exit();
  }
};