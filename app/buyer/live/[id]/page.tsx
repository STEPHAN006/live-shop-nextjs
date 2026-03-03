'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, Eye, VideoOff } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export default function BuyerLiveViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const streamId = String(id ?? '');
    if (!streamId) return;

    const socket = io();
    socketRef.current = socket;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (!stream) return;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => undefined);
      }
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      const broadcasterId = (pc as any)._broadcasterId as string | undefined;
      if (!broadcasterId) return;
      socket.emit('candidate', { to: broadcasterId, candidate: event.candidate, streamId });
    };

    socket.emit('watcher', streamId);

    socket.on('offer', async ({ sdp, broadcasterId }: { streamId: string; sdp: any; broadcasterId: string }) => {
      (pc as any)._broadcasterId = broadcasterId;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { streamId, broadcasterId, sdp: answer });
      setConnected(true);
    });

    socket.on('candidate', async ({ candidate }: { from: string; candidate: any }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // ignore
      }
    });

    socket.on('stream-ended', () => {
      setInfoTitle('Stream ended');
      setInfoMessage('The live stream has ended.');
      setInfoOpen(true);
      setConnected(false);
    });

    return () => {
      try {
        pc.close();
      } catch {
        // ignore
      }
      pcRef.current = null;

      socket.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Modal
        open={infoOpen}
        title={infoTitle}
        onClose={() => setInfoOpen(false)}
        footer={
          <button
            type="button"
            onClick={() => {
              setInfoOpen(false);
              router.push('/buyer/feed');
            }}
            className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
          >
            Back to feed
          </button>
        }
      >
        <p className="text-sm text-zinc-600 leading-relaxed">{infoMessage}</p>
      </Modal>

      <Link
        href="/buyer/feed"
        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Feed
      </Link>

      <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-200">
        <video ref={videoRef} playsInline controls className="w-full h-full object-contain" />

        {!connected ? (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <VideoOff size={32} />
              </div>
              <p className="text-white font-bold">Connecting to live stream...</p>
              <p className="text-xs text-zinc-400">Stream ID: {String(id)}</p>
            </div>
          </div>
        ) : null}

        <div className="absolute top-4 left-4 flex items-center gap-3">
          <span className="live-badge">Live</span>
          <span className="bg-black/40 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
            <Eye size={14} /> LIVE
          </span>
        </div>
      </div>
    </div>
  );
}
