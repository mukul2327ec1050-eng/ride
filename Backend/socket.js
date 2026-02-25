const { Server } = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const rideModel = require("./models/ride.model");

let io;

/* ===================================================
   INITIALIZE SOCKET
=================================================== */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://aao-chale.vercel.app",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    /* ===================================================
       JOIN USER / CAPTAIN
    =================================================== */
    socket.on("join", async ({ userId, userType }) => {
      try {
        if (!userId || !userType) return;

        socket.userId = userId;
        socket.userType = userType;

        if (userType === "user") {
          await userModel.findByIdAndUpdate(userId, {
            socketId: socket.id,
          });
        }

        if (userType === "captain") {
          await captainModel.findByIdAndUpdate(userId, {
            socketId: socket.id,
            status: "active",
          });
        }

        console.log(`✅ ${userType} joined → ${userId}`);
      } catch (err) {
        console.error("❌ join error:", err);
      }
    });

    /* ===================================================
       JOIN RIDE ROOM
    =================================================== */
    socket.on("join-ride-room", ({ rideId }) => {
      if (!rideId) return;

      const room = `ride_${rideId}`;
      socket.join(room);

      console.log(`🔔 ${socket.id} joined ${room}`);
    });

    /* ===================================================
       CAPTAIN ACCEPTED RIDE
    =================================================== */
    socket.on("captain-accepted", async ({ rideId, captainId }) => {
      try {
        if (!rideId || !captainId) return;

        const ride = await rideModel
          .findByIdAndUpdate(
            rideId,
            {
              captain: captainId,
              status: "accepted",
            },
            { new: true }
          )
          .populate("user captain");

        if (!ride) {
          console.warn("⚠️ Ride not found");
          return;
        }

        const user = await userModel
          .findById(ride.user._id)
          .select("socketId");

        if (user?.socketId) {
          io.to(user.socketId).emit("waiting-for-driver", ride);
          console.log("📨 waiting-for-driver → user");
        }

        console.log("✅ Captain assigned to ride");
      } catch (err) {
        console.error("❌ captain-accepted error:", err);
      }
    });

    /* ===================================================
       ⭐ RIDE CONFIRMED (OTP FIX INCLUDED)
    =================================================== */
    socket.on("ride-confirmed-by-captain", async ({ rideId }) => {
      try {
        if (!rideId) return;

        // ⭐ FIX → include OTP
        const ride = await rideModel
          .findById(rideId)
          .select("+otp")
          .populate("user captain")
          .lean();

        if (!ride) {
          console.warn("⚠️ Ride not found");
          return;
        }

        const user = await userModel
          .findById(ride.user._id)
          .select("socketId");

        if (user?.socketId) {
          io.to(user.socketId).emit("ride-confirmed", ride);
        } else {
          io.to(`ride_${rideId}`).emit("ride-confirmed", ride);
        }

        console.log("📨 ride-confirmed sent with OTP:", ride.otp);
      } catch (err) {
        console.error("❌ ride-confirmed error:", err);
      }
    });

    /* ===================================================
       CAPTAIN LOCATION UPDATE
    =================================================== */
    socket.on(
      "captain-location-update",
      async ({ userId, lat, lng, rideId }) => {
        try {
          if (
            typeof lat !== "number" ||
            typeof lng !== "number" ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
          ) {
            console.warn("⚠️ Invalid coordinates");
            return;
          }

          await captainModel.findByIdAndUpdate(userId, {
            location: {
              type: "Point",
              coordinates: [lng, lat],
            },
            status: "active",
          });

          if (rideId) {
            const room = `ride_${rideId}`;

            io.to(room).emit("captain-location-update", { lat, lng });

            // send back to captain too
            socket.emit("captain-location-update", { lat, lng });
          }

        } catch (err) {
          console.error("❌ location update error:", err);
        }
      }
    );

    /* ===================================================
       DISCONNECT CLEANUP
    =================================================== */
    socket.on("disconnect", async () => {
      console.log(`❌ Disconnected: ${socket.id}`);

      try {
        if (socket.userType === "user") {
          await userModel.updateOne(
            { socketId: socket.id },
            { socketId: null }
          );
        }

        if (socket.userType === "captain") {
          await captainModel.updateOne(
            { socketId: socket.id },
            {
              socketId: null,
              status: "offline",
            }
          );
        }

        console.log("🧹 Socket cleaned");
      } catch (err) {
        console.error("❌ disconnect cleanup error:", err);
      }
    });
  });
};

/* ===================================================
   GLOBAL SOCKET EMITTER
=================================================== */
const sendMessageToSocketId = (socketId, event, payload) => {
  if (!io || !socketId) return;

  console.log(`📨 ${event} → ${socketId}`);
  io.to(socketId).emit(event, payload);
};

module.exports = {
  initializeSocket,
  sendMessageToSocketId,
  getIO: () => io,
};