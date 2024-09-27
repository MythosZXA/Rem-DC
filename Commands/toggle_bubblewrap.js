import { SlashCommandBuilder } from "discord.js";
import WRModule from '../SocketEvents/pop.js';

let intervalID;
const SIZE = WRModule.SIZE;

export default {
  data: new SlashCommandBuilder()
    .setName('toggle_bubblewrap')
    .setDescription('Toggle a randomizer for popping the bubble wrap'),
  execute(interaction, rem) {
    if (intervalID) {
      clearInterval(intervalID);
      intervalID = null;
    } else {
      intervalID = setInterval(() => {
        const randomInt = Math.floor(Math.random() * 400);
        const y = ~~(randomInt / SIZE);
        const x = randomInt % SIZE;
        WRModule.execute({ y, x }, null, rem);
      }, 1000);
    }

    interaction.reply({ 
      content: `Randomizer ${intervalID ? 'on' : 'off'}`,
      ephemeral: true 
    });
  }
};