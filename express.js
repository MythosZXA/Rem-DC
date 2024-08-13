import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import cookie from 'cookie';
import fs from 'fs';

import express from 'express';
import cors from 'cors';
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

export async function setupAPI(rem) {
  rem.express = expressGlobal;

  // loop through all endpoint files
  const epFiles = fs.readdirSync('./Endpoints', { recursive: true }).filter(file => file.endsWith('.js'));
  for (const fileName of epFiles) {
    // skip common.js
    if (fileName === 'common.js') continue;

    // set endpoint to run module's execute function
    const endpoint = (await import(`./Endpoints/${fileName}`)).default;
    app[endpoint.type](endpoint.name, (req, res) => {
      try {
        endpoint.execute(req, res, rem);
      } catch (e) {
        console.log(e);
      }
    });
  }
}

export function setupSocket(rem) {
  rem.io = io;

  io.on('connection', async (socket) => {
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
        const wrapRoll = (await import('./SocketEvents/pop.js')).default.wrapRoll;
        io.to('BubbleWrap').emit('newState', wrapRoll);
        break;
      default:
        break;
    }

    // loop through all socket files and set up event listeners
    const eventFiles = fs.readdirSync('./SocketEvents', { recursive: true }).filter(file => file.endsWith('.js'));
    for (const fileName of eventFiles) {
      const event = (await import(`./SocketEvents/${fileName}`)).default;
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