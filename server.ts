import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// when using next.js as middleware, we need to initialize it
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  expressApp.use(cors());
  expressApp.use(express.json());

  // Socket.io logic
  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('join-video', (videoId) => {
      socket.join(`video-${videoId}`);
      console.log(`User ${socket.id} joined video ${videoId}`);
    });

    socket.on('leave-video', (videoId) => {
      socket.leave(`video-${videoId}`);
      console.log(`User ${socket.id} left video ${videoId}`);
    });

    socket.on('send-comment', (data) => {
      // data: { videoId, userId, userName, text }
      const comment = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString()
      };
      io.to(`video-${data.videoId}`).emit('new-comment', comment);
    });

    socket.on('update-live-products', (data) => {
      // data: { videoId, productIds }
      io.to(`video-${data.videoId}`).emit('live-products-updated', data.productIds);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  // Handle all other routes with Next.js
  expressApp.all('{*path}', (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
