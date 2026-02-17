const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");
const rideModel = require("../models/ride.model");
const sendMessageToSocketId = require("../socket").sendMessageToSocketId;
const { getIO } = require("../socket");

module.exports.createRide = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user found in request" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, pickup, destination, vehicleType } = req.body;

  try {
    const ride = await rideService.createRide({
      userId: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    const pickupCoords = await mapService.getAddressCoordinates(pickup);
    console.log("📍 Pickup coordinates:", pickupCoords);

    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoords,
      1000,
    );
    console.log("🚕 Captains in radius:", captainsInRadius);

    ride.otp = ""; // Hide OTP in response

    const rideWithUser = await rideModel.findById(ride._id).populate("user");

    captainsInRadius.forEach((captain) => {
      console.log("📨 Sending ride request to:", captain.socketId);

      sendMessageToSocketId(captain.socketId, "new-ride-request", rideWithUser);
    });

    res.status(201).json({
      ride,
      pickupCoords,
      captainsInRadius,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    return res.status(200).json(fare);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { rideId, otp } = req.body;
  try {
    const ride = await rideService.confirmRide({
      rideId,
      otp,
      captain: req.captain,
    });

    sendMessageToSocketId(ride.user.socketId, "ride-confirmed", ride);

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;
  console.log("Received start-ride request for rideId:", rideId, "with OTP:", otp);

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    // ✅ GET IO AT RUNTIME (THIS IS CRITICAL)
    const { getIO } = require("../socket");
    const io = getIO();

    // 1️⃣ Emit to room (if joined)
    io.to(`ride_${ride._id}`).emit("ride-started", ride);

    // 2️⃣ Emit directly to user socket (GUARANTEED DELIVERY)
    console.log(
      "📨 Sending 'ride-started' to user socketId:",
      ride.user.socketId,
    );

    console.log("🚀 Emitting to socketId:", ride.user.socketId, "with data:", ride);
    
    if (ride.user?.socketId) {
      io.to(ride.user.socketId).emit("ride-started", ride);
    }

    const populatedRide = await rideModel
      .findById(ride._id)
      .populate("user")
      .populate("captain")
      .lean();

    res.status(200).json(populatedRide);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
