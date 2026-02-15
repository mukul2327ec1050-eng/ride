const { get } = require('mongoose');
const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto');
const { sendMessageToSocketId } = require('../socket');

async function getFare(pickup, destination, vehicleType) {
  if (!pickup || !destination) {
    throw new Error('Pickup and destination are required');
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  const baseFare = { auto: 30, car: 50, moto: 20 };
  const perKmRate = { auto: 10, car: 15, moto: 8 };
  const perMinuteRate = { auto: 2, car: 3, moto: 1.5 };

  const fare = {
    auto: Math.round(baseFare.auto + ((distanceTime.distance / 1000) * perKmRate.auto) + ((distanceTime.duration / 60) * perMinuteRate.auto)),
    car: Math.round(baseFare.car + ((distanceTime.distance / 1000) * perKmRate.car) + ((distanceTime.duration / 60) * perMinuteRate.car)),
    moto: Math.round(baseFare.moto + ((distanceTime.distance / 1000) * perKmRate.moto) + ((distanceTime.duration / 60) * perMinuteRate.moto))
  };


  return fare;
}
module.exports.getFare = getFare;

 function getOtp(length) {
  function generateOtp(length){
    const otp = crypto.randomInt(10**(length-1), 10**length).toString();
    return otp;
  }
  return generateOtp(length);
}


module.exports.createRide = async ({ userId, pickup, destination, vehicleType }) => {
  if (!userId || !pickup || !destination || !vehicleType) {
    throw new Error('All fields are required to create a ride');
  }

  const fare = await getFare(pickup, destination, vehicleType);
  const otp = Math.floor(1000 + Math.random() * 9000); // ✅ generate random OTP

  const ride = new rideModel({
    user: userId,
    pickup,
    destination,
    otp:getOtp(6), 
    fare: fare[vehicleType],
    
  });

  await ride.save();
  return ride;
};
    

module.exports.createRide = async ({ userId, pickup, destination, vehicleType }) => {

  if (!userId || !pickup || !destination || !vehicleType) {
    throw new Error('All fields are required to create a ride');
  }

  // 1️⃣ Convert address → coordinates
  const pickupCoords = await mapService.getAddressCoordinates(pickup);
  const destinationCoords = await mapService.getAddressCoordinates(destination);

  if (!pickupCoords || !destinationCoords) {
    throw new Error("Could not find coordinates");
  }

  // 2️⃣ Fare calculation
  const fare = await getFare(pickup, destination, vehicleType);

  // 3️⃣ Generate OTP
  const otp = getOtp(6);

  // 4️⃣ Save in CORRECT schema structure
  const ride = await rideModel.create({
    user: userId,

    pickup: {
      address: pickup,
      coordinates: [pickupCoords.lng, pickupCoords.lat],
    },

    destination: {
      address: destination,
      coordinates: [destinationCoords.lng, destinationCoords.lat],
    },

    fare: fare[vehicleType],
    otp,
  });

  return ride;
};






module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error('Ride ID and OTP are required to start a ride');
  }   

  console.log("Starting ride:", rideId, "with OTP:", otp);
  const ride = await rideModel.findById(rideId).select('+otp').populate('user');
  if(!ride) {
    throw new Error('Ride not found');
  }
  if (ride.otp !== otp) {
    throw new Error('Invalid OTP');
  }
  await rideModel.findByIdAndUpdate(rideId, { status: 'ongoing', captain: captain._id });

  // sendMessageToSocketId(ride.user.socketId,{
  //   event: 'ride-started',
  //   data: ride
  // });

//   sendMessageToSocketId(
//   ride.user.socketId,
//   "ride-started",
//   ride
// );


  return ride;

}