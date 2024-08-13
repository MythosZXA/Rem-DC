import { exportMemoryToDB } from '../sequelize.js';

export default {
  name: 'uncaughtException',
  process: true,
  async execute(rem, err) {
    await exportMemoryToDB(rem);
    rem.io.disconnectSockets(true);
    
    console.error('Rem went down!', err);
    rem.destroy();
    process.exit();
  }
};