/**
 * It fetches all the channels in a server and returns a map of channel names to channel objects
 * @param server - the server that you want to get the channels from
 * @returns a Map of channel names and channel objects
 */
async function getServerChannels(server) {
	const channels = new Map();
	const serverChannels = await server.channels.fetch();
	serverChannels.forEach(channel => {
		const channelName = channel.name;
		channels.set(channelName, channel);
	});

	return channels;
}

module.exports = {
	getServerChannels
};