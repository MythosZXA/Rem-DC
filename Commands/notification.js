import { SlashCommandBuilder } from "discord.js";

function set(interaction) {
  const resolver = interaction.options;
  const hour = resolver.get('hour').value;
  const minute = resolver.get('minute').value;
  const message = resolver.get('message')?.value;
  
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
    const subcommandName = interaction.options._subcommand;
    this[subcommandName]?.(interaction, rem);
  }
};