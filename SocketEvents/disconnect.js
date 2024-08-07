module.exports = {
  event: 'disconnect',
  async execute(reason, rem, destinationID, username) {
    console.log(`${username} disconnected from room ${destinationID}`);
  }
};