import { Events } from "discord.js";

export default {
  name: Events.UserUpdate,
  many: true,
  execute(oldUser, newUser, rem) {
    
  }
};