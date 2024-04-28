const { createServer } = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const fs = require('fs');

const express = require('express');
const cors = require('cors');
const app = express();
const httpServer = createServer(app);
httpServer.listen(process.env.PORT);
// app.listen(process.env.PORT);
const corsConfig = {
	credentials: true,
	headers: ['Content-Type', 'Accept'],
  origin : ['http://rem.mythzxa.com:5174' , 'http://localhost:5174'],
  methods: ["GET", "POST"]
};
const io = new Server(httpServer, { cors: corsConfig });
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src'));
app.use(cookieParser());

const expressGlobal = {
	sessions: new Map(),
	admins: new Set()
};

async function setupAPI(rem) {
	rem.express = expressGlobal;

	// Loop through all endpoint files and set them up
	const endpoints = fs.readdirSync('./Endpoints').filter(file => file.endsWith('.js'));
	for (const fileName of endpoints) {
		const endpoint = require(`./Endpoints/${fileName}`);
		app[endpoint.type](endpoint.name, (req, res) => endpoint.execute(req, res, rem, expressGlobal));
	}
}

function setupSocket(rem) {
	// attach io as a global
	rem.io = io;

	io.on('connection', (socket) => {
		const cookies = cookie.parse(socket.handshake.headers.cookie);
		const destinationID = socket.handshake.query.id;
		
		if (socket.handshake.query.id) {
			// create/join a room
			socket.join(destinationID);
			// log
			console.log(`${cookies.dcUsername} connected to chat ${destinationID}`);

			// set up up listener for messages from client
			socket.on('remMsg', async (dm) => {
				const server = await rem.guilds.fetch(process.env.guildId);
				const serverMember = server.members.cache.find(member => member.id === destinationID);
				if (serverMember) {
					serverMember.send(dm.content);
				} else {
					const textChannel = [...rem.serverChannels.values()].find(channel => channel.id === destinationID);
					textChannel.send(dm.content);
				}
			});
		}

		// leave/destroy room
		socket.on('disconnect', () => {
			console.log(`${cookies.dcUsername} disconnected from chat ${destinationID}`);
		});
	});
}

module.exports = {
	setupAPI,
	setupSocket
};