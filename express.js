const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const fs = require('fs');

const app = express();
const cors = require('cors');
const httpServer = createServer(app);
const io = new Server(httpServer, {});
httpServer.listen(process.env.PORT);
// app.listen(process.env.PORT);
const corsConfig = {
	credentials: true,
	headers: ['Content-Type', 'Accept'],
  origin : ['http://rem.mythzxa.com:5174' , 'http://localhost:5174'],
  methods: ["GET", "POST"]
};
app.use(cors(corsConfig));
app.options('*', cors(corsConfig));
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
		console.log(`${cookies.nickname} connected`);

		// join room for specific connections
		if (socket.handshake.query.chatName) {
			const chatName = socket.handshake.query.chatName;
			socket.join(chatName);
			socket.on('remMsg', async (dm) => {
				const destinationName = dm.chatName;
				const server = await rem.guilds.fetch('773660297696772096');
				const serverMember = server.members.cache.find(member => 
					member.nickname === destinationName);
				if (serverMember) {
					serverMember.send(dm.content);
				} else {
					rem.serverChannels.get(destinationName).send(dm.content);
				}
			});
		}

		socket.on('disconnect', () => {
			console.log(`${cookies.nickname} disconnected`);
		});
	});
}

module.exports = {
	setupAPI,
	setupSocket
};