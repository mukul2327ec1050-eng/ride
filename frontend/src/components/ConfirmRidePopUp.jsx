import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ConfirmRidePopUp = (props) => {
  const { ride, setRidePopupPanel, setConfirmRidePopupPanel } = props
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()

  if (!ride) return null

  const submitHander = async (e) => {
    e.preventDefault()

    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/rides/start-ride?rideId=${ride._id}&otp=${otp}`,
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )

    if (response.status === 200) {
      setConfirmRidePopupPanel(false)
      setRidePopupPanel(false)
      navigate('/captain-riding')
    }
  }

  return (
    <div className="text-white">

      {/* Drag Icon */}
      <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-5"></div>

      {/* Title */}
      <h3 className="text-2xl font-semibold mb-6">
        Confirm Ride to Start
      </h3>

      {/* USER CARD */}
      <div className="flex items-center justify-between p-4 
                      bg-white/10 border border-white/10 
                      rounded-xl backdrop-blur-md">

        <div className="flex items-center gap-3">

          {/* USER PHOTO OR FALLBACK */}
          {ride.user?.profileImage ? (
            <img
              className="h-12 w-12 rounded-full object-cover border border-white/20"
              src={ride.user.profileImage}
              alt="user"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold border border-white/20">
              {ride.user?.fullname?.firstname?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}

          <div>
            <h2 className="text-lg font-medium capitalize">
              {ride.user?.fullname?.firstname || "User"}
            </h2>
            <p className="text-xs text-gray-400">Passenger</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">Fare</p>
          <h5 className="text-lg font-bold text-green-400">
            ₹ {ride.fare}
          </h5>
        </div>
      </div>

      {/* RIDE DETAILS */}
      <div className="mt-6 border-t border-white/10 pt-4">

        <div className="flex items-start gap-4 py-3 border-b border-white/10">
          <i className="ri-map-pin-user-fill text-green-400 text-lg"></i>
          <div>
            <p className="text-xs text-gray-400">Pickup</p>
            <h3 className="text-sm">{ride.pickup?.address}</h3>
          </div>
        </div>

        <div className="flex items-start gap-4 py-3 border-b border-white/10">
          <i className="ri-map-pin-2-fill text-red-400 text-lg"></i>
          <div>
            <p className="text-xs text-gray-400">Destination</p>
            <h3 className="text-sm">{ride.destination?.address}</h3>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <i className="ri-currency-line text-lg"></i>
            <span className="text-sm text-gray-400">Payment</span>
          </div>
          <span className="text-sm font-medium">Cash</span>
        </div>

      </div>

      {/* OTP INPUT */}
      <form onSubmit={submitHander} className="mt-6">

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          type="text"
          className="bg-black border border-white/20 
                     px-5 py-4 text-lg rounded-xl 
                     w-full text-center tracking-widest
                     focus:outline-none focus:border-green-500 transition"
          placeholder="Enter OTP"
        />

        {/* START BUTTON */}
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-500 
                     w-full mt-5 text-white text-lg 
                     font-semibold py-3 rounded-xl transition"
        >
          Start Ride
        </button>

        {/* CANCEL BUTTON */}
        <button
          type="button"
          onClick={() => {
            setRidePopupPanel(false)
            setConfirmRidePopupPanel(false)
          }}
          className="mt-3 w-full bg-white/10 
                     border border-white/10 
                     text-white font-semibold 
                     py-3 rounded-xl hover:bg-white/20 transition"
        >
          Cancel
        </button>

      </form>
    </div>
  )
}

export default ConfirmRidePopUp
