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

    const broadcastersByStreamId = (io as any)._broadcastersByStreamId as Map<string, string> | undefined;
    if (!broadcastersByStreamId) {
      (io as any)._broadcastersByStreamId = new Map<string, string>();
    }

    socket.on('join-video', (videoId) => {
      socket.join(`video-${videoId}`);
      console.log(`User ${socket.id} joined video ${videoId}`);
    });

    socket.on('leave-video', (videoId) => {
      socket.leave(`video-${videoId}`);
      console.log(`User ${socket.id} left video ${videoId}`);
    });

    socket.on('send-comment', (data) => {
      // New format (preferred): { comment: { id, video_id, user_id, user_name, text, created_at } }
      // Legacy format (fallback): { videoId, userId, userName, text }
      const incoming = (data as any)?.comment;
      if (incoming?.id && incoming?.video_id) {
        io.to(`video-${incoming.video_id}`).emit('new-comment', incoming);
        return;
      }

      const videoId = (data as any)?.videoId;
      if (!videoId) return;

      const comment = {
        id: Math.random().toString(36).substr(2, 9),
        video_id: videoId,
        user_id: (data as any)?.userId,
        user_name: (data as any)?.userName,
        text: (data as any)?.text,
        created_at: new Date().toISOString(),
      };
      io.to(`video-${videoId}`).emit('new-comment', comment);
    });

    socket.on('update-live-products', (data) => {
      // data: { videoId, productIds }
      io.to(`video-${data.videoId}`).emit('live-products-updated', data.productIds);
    });

    // WebRTC signaling for live streams
    socket.on('broadcaster', (streamId: string) => {
      if (!streamId) return;
      (io as any)._broadcastersByStreamId.set(streamId, socket.id);
      (socket.data as any).isBroadcaster = true;
      (socket.data as any).streamId = streamId;
      socket.join(`live-${streamId}`);
      console.log(`Broadcaster ${socket.id} started stream ${streamId}`);
    });

    socket.on('watcher', (streamId: string) => {
      if (!streamId) return;
      socket.join(`live-${streamId}`);
      const broadcasterId = (io as any)._broadcastersByStreamId.get(streamId);
      if (broadcasterId) {
        io.to(broadcasterId).emit('watcher', { streamId, watcherId: socket.id });
      }
    });

    socket.on('offer', (payload: { streamId: string; watcherId: string; sdp: any }) => {
      if (!payload?.watcherId) return;
      io.to(payload.watcherId).emit('offer', { streamId: payload.streamId, sdp: payload.sdp, broadcasterId: socket.id });
    });

    socket.on('answer', (payload: { streamId: string; broadcasterId: string; sdp: any }) => {
      if (!payload?.broadcasterId) return;
      io.to(payload.broadcasterId).emit('answer', { streamId: payload.streamId, sdp: payload.sdp, watcherId: socket.id });
    });

    socket.on('candidate', (payload: { to: string; candidate: any; streamId?: string }) => {
      if (!payload?.to) return;
      io.to(payload.to).emit('candidate', { from: socket.id, candidate: payload.candidate, streamId: payload.streamId });
    });

    socket.on('disconnect', () => {
      // Cleanup if broadcaster
      const map: Map<string, string> = (io as any)._broadcastersByStreamId;
      const streamId = (socket.data as any)?.streamId as string | undefined;
      const isBroadcaster = Boolean((socket.data as any)?.isBroadcaster);

      // React Strict Mode / fast reconnects can trigger a disconnect immediately after connect.
      // Add a short grace period before notifying viewers that the stream ended.
      if (isBroadcaster && streamId && map.get(streamId) === socket.id) {
        map.delete(streamId);
        setTimeout(() => {
          const current = map.get(streamId);
          if (!current) {
            io.to(`live-${streamId}`).emit('stream-ended', { streamId });
          }
        }, 1200);
      } else {
        for (const [sid, broadcasterId] of map.entries()) {
          if (broadcasterId === socket.id) {
            map.delete(sid);
            setTimeout(() => {
              const current = map.get(sid);
              if (!current) {
                io.to(`live-${sid}`).emit('stream-ended', { streamId: sid });
              }
            }, 1200);
          }
        }
      }
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
