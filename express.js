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
  origin : ['https://rem.mythzxa.com' , 'http://localhost:5174'],
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

  // loop through all endpoint files
  const epFiles = fs.readdirSync('./Endpoints', { recursive: true }).filter(file => file.endsWith('.js'));
  for (const fileName of epFiles) {
    // skip common.js
    if (fileName === 'common.js') continue;

    // set endpoint to run module's execute function
    const endpoint = require(`./Endpoints/${fileName}`);
    app[endpoint.type](endpoint.name, (req, res) => {
      try {
        endpoint.execute(req, res, rem);
      } catch (e) {
        console.log(e);
      }
    });
  }
}

function setupSocket(rem) {
  rem.io = io;

  io.on('connection', (socket) => {
    // validation
    const destinationID = socket.handshake.query.id;
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    if (!cookies || !destinationID) {
      return;
    }
    
    // create/join a room
    socket.join(destinationID);

    // log
    const username = expressGlobal.sessions.get(cookies.rdcSID)?.username ?? 'Guest';
    console.log(`${username} connected to room ${destinationID}`);

    // logic for connections that need initialization
    switch (destinationID) {
      case 'BubbleWrap':
        const wrapRoll = require('./SocketEvents/pop').wrapRoll;
        io.to('BubbleWrap').emit('newState', wrapRoll);
        break;
      default:
        break;
    }

    // loop through all socket files and set up event listeners
    const eventFiles = fs.readdirSync('./SocketEvents', { recursive: true }).filter(file => file.endsWith('.js'));
    for (const fileName of eventFiles) {
      const event = require(`./SocketEvents/${fileName}`);
      socket.on(event.event, (arg) => {
        try {
          event.execute(arg, rem, destinationID, username);
        } catch (e) {
          console.error(e);
        }
      });
    }
  });
}

module.exports = {
  setupAPI,
  setupSocket
};