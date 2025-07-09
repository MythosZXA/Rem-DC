import { SlashCommandBuilder } from "discord.js";
import crypto from 'crypto';

function set(interaction, rem) {
  // get input values
  const resolver = interaction.options;
  const hr = resolver.get('hour').value;
  const min = resolver.get('minute').value;
  const msg = resolver.get('message')?.value ?? 'Reminder';
  const dateNotif = new Date();
  dateNotif.setHours(hr, min, 0);

  // set notification timer if it is later today
  const now = new Date();
  if (dateNotif.getTime() > now.getTime()) {
    // get user schedule
    const userID = interaction.user.id;
    let mapUserSchedule = rem.schedules.get(userID);
    if (!mapUserSchedule) {
      mapUserSchedule = new Map();
      rem.schedules.set(userID, mapUserSchedule);
    }

    // add notification to schedule
    const uuid = crypto.randomUUID();
    mapUserSchedule.set(uuid, {
      uuid,
      time: dateNotif.getTime(),
      message: msg
    });

    // notification
    const cd = dateNotif.getTime() - now.getTime();
    setTimeout(() => {
      interaction.user.send(`${msg}`);
      // remove from schedule when expired
      mapUserSchedule.delete(uuid);
    }, cd);

    // confirmation
    interaction.reply({
      content: 'Notification Set',
      ephemeral: true
    });
  }
  // don't set
  else {
    interaction.reply({
      content: 'Cannot set a notification in the past!',
      ephemeral: true
    });
  }
}

function remove(interaction) {
  
}

export default {
  data: new SlashCommandBuilder()
    .setName('notification')
    .setDescription('Set a time to be notified of an event')
    .addSubcommand(subcommand =>
      subcommand.setName('set')
        .setDescription('Set a notification')
        .addNumberOption(option =>
          option.setName('hour')
            .setDescription('Military hour CST')
            .setRequired(true)
            .setMaxValue(23)
            .setMinValue(0))
        .addNumberOption(option =>
          option.setName('minute')
            .setDescription('Minute')
            .setRequired(true)
            .setMaxValue(59)
            .setMinValue(0))
        .addStringOption(option =>
          option.setName('message')
            .setDescription('Message attached to the notification'))),
  set,
  remove,
  execute(interaction, rem) {
    const subcommandName = interaction.options.getSubcommand();
    this[subcommandName]?.(interaction, rem);
  }
};