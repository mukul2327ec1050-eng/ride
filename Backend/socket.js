const { Server } = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');

let io;

/**
 * Initialize Socket.IO
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "https://8dx31940-5173.inc1.devtunnels.ms",
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // ============================
    // JOIN (USER / CAPTAIN)
    // ============================
    socket.on('join', async ({ userId, userType }) => {
      try {
        if (!userId || !userType) return;

        if (userType === 'user') {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        }

        if (userType === 'captain') {
          await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
        }

        console.log(`✅ ${userType} ${userId} joined with socket ${socket.id}`);
      } catch (err) {
        console.error('❌ join error:', err);
      }
    });

    // ============================
    // JOIN RIDE ROOM (fallback)
    // ============================
    socket.on('join-ride-room', ({ rideId }) => {
      if (!rideId) return;
      const roomName = `ride_${rideId}`;
      socket.join(roomName);
      console.log(`🔔 ${socket.id} joined room ${roomName}`);
    });

    // ============================
    // CAPTAIN ACCEPTED RIDE
    // ============================
    socket.on('captain-accepted', async ({ rideId, userId }) => {
      try {
        if (!rideId || !userId) return;

        const ride = await rideModel
          .findById(rideId)
          .select('+otp')
          .populate('user captain');

        if (!ride) {
          console.warn('⚠️ Ride not found');
          return;
        }

        const user = await userModel.findById(userId).select('socketId');

        if (user?.socketId) {
          io.to(user.socketId).emit('waiting-for-driver', ride);
          console.log('📨 waiting-for-driver → user');
        } else {
          io.to(`ride_${rideId}`).emit('waiting-for-driver', ride);
          console.log('📨 waiting-for-driver → room fallback');
        }
      } catch (err) {
        console.error('❌ captain-accepted error:', err);
      }
    });

    // ============================
    // RIDE CONFIRMED BY CAPTAIN
    // ============================
    // ============================
// RIDE CONFIRMED BY CAPTAIN
// ============================
socket.on('ride-confirmed-by-captain', async ({ rideId, userId }) => {
  try {
    if (!rideId) return;

    // 🔥 FETCH FULL RIDE WITH COORDINATES
    const fullRide = await rideModel
      .findById(rideId)
      .populate('user captain')
      .lean();

    if (!fullRide) {
      console.warn('⚠️ Ride not found while confirming');
      return;
    }

    // get user socket
    const user = await userModel.findById(fullRide.user._id).select('socketId');

    // 🚀 SEND FULL RIDE (NOT JUST ID)
    if (user?.socketId) {
      io.to(user.socketId).emit('ride-confirmed', fullRide);
      console.log('📨 ride-confirmed → user (FULL RIDE SENT)');
    } else {
      io.to(`ride_${rideId}`).emit('ride-confirmed', fullRide);
      console.log('📨 ride-confirmed → room fallback (FULL RIDE SENT)');
    }

  } catch (err) {
    console.error('❌ ride-confirmed error:', err);
  }
});


    // ============================
    // CAPTAIN LOCATION UPDATE
    // ============================
    // ============================
// CAPTAIN LOCATION UPDATE
// ============================
socket.on('captain-location-update', async ({ userId, userType, lat, lng, rideId }) => {

  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    lat < -90 || lat > 90 ||
    lng < -180 || lng > 180
  ) {
    console.warn('⚠️ Invalid location data');
    return;
  }

  try {

    // 1️⃣ Update DB (your original logic preserved)
    if (userType === 'captain') {
      await captainModel.findByIdAndUpdate(userId, {
        location: {
          type: 'Point',
          coordinates: [lng, lat], // lng first
        },
        status: 'active',
      });
    }

    // 2️⃣ Emit live location to ride room (for passenger map)
    // 2️⃣ Emit live location to ride room + captain himself


    
if (rideId) {
  io.to(`ride_${rideId}`).emit('captain-location-update', { lat, lng });

  // CRITICAL: send back to captain so map can render
  socket.emit('captain-location-update', { lat, lng });

} else {
  io.emit('captain-location-update', { lat, lng });
}





  } catch (err) {
    console.error('❌ location update error:', err);
  }
});


    // ============================
    // DISCONNECT → CLEAN SOCKET ID
    // ============================
    socket.on('disconnect', async () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);

      try {
        await userModel.updateOne({ socketId: socket.id }, { socketId: null });
        await captainModel.updateOne({ socketId: socket.id }, { socketId: null });
        console.log('🧹 Cleared socketId from DB');
      } catch (err) {
        console.error('❌ disconnect cleanup error:', err);
      }
    });
  });
};

/**
 * Emit event directly to a socketId
 * Used from controllers (start-ride, cancel, etc.)
 */
const sendMessageToSocketId = (socketId, event, payload) => {
  if (!io || !socketId) return;
  console.log(`🚀 Sending message to socketId ${socketId}`);
  console.log(`📨 ${event} → ${socketId}`);
  io.to(socketId).emit(event, payload);
};

module.exports = {
  initializeSocket,
  sendMessageToSocketId,
  getIO: () => io,
};

