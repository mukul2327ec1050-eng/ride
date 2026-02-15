import React, { createContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const socket = useRef(null);

  useEffect(() => {
    // prevent multiple connections (React StrictMode fix)
    if (!socket.current) {
      socket.current = io("https://8dx31940-4000.inc1.devtunnels.ms", {
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000
      });

      socket.current.on("connect", () => {
        console.log("✅ Connected:", socket.current.id);
      });

      socket.current.on("disconnect", (reason) => {
        console.log("❌ Disconnected:", reason);
      });

      socket.current.on("connect_error", (err) => {
        console.log("❌ Connect error:", err.message);
      });
    }

    // 🚫 DO NOT DISCONNECT HERE
    // React strict mode unmounts immediately in dev
    return () => {};
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
