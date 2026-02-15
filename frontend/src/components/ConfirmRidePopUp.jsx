import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ConfirmRidePopUp = (props) => {
  const { ride, setRidePopupPanel, setConfirmRidePopupPanel } = props
  const [otp, setOtp] = useState('')




    const navigate = useNavigate();



  // Guard: if ride not yet available, don't crash UI
  if (!ride) {
    return null
  }

  const submitHander = async (e) => {
    e.preventDefault();

    const response =  await axios.post('/api/captain/start-ride', {
      rideId: ride._id,
      otp: otp,
    }, {    
        headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    if(response.status === 200){
        setConfirmRidePopupPanel(false);
        setRidePopupPanel(false);

        navigate('/captain-riding');

    }
  }

  return (
    <div>
      <h5 className="p-1 text-center w-[93%] absolute top-0">
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <h3 className="text-2xl font-semibold mb-5">
        Confirm this ride to Start
      </h3>

      <div className="flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-4">
        <div className="flex items-center gap-3">
          <img
            className="h-12 rounded-full object-cover w-12"
            src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..."
            alt=""
          />
          <h2 className="text-xl font-bold capitalize">
            {ride.user?.fullname?.firstname || 'User'}
          </h2>
        </div>
        
      </div>

      <div className="flex gap-2 justify-between flex-col items-center">
        <div className="w-full mt-5">
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-map-pin-user-fill"></i>
            <h3 className="text-lg font-medium">{ride.pickup?.address}</h3>
          </div>

          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill"></i>
            <h3 className="text-lg font-medium">{ride.destination?.address}</h3>
          </div>

          <div className="flex items-center gap-5 p-3">
            <i className="ri-currency-line"></i>
            
           <div className='flex items-center justify-between w-full'>
            <p className="text-sm -mt-1 text-gray-600 ">Cash</p>
            <h5 className="text-lg font-bold ">₹ {ride.fare}</h5>
            </div>
          </div>
           

        </div>

        <div className="mt-6 w-full">
          <form onSubmit={submitHander}>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              className="bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full mt-3 mb-8"
              placeholder="Enter OTP"
            />

            {/* ⛔ LINK NOT CHANGED */}
            <Link
              to="/captain-riding"
              onClick={() => {
                setConfirmRidePopupPanel(true)
                setRidePopupPanel(false)
              }}
              className="bg-green-600 w-full flex justify-center text-white text-lg font-semibold p-2 px-10 rounded-lg"
            >
              Start
            </Link>

            <button
              type="button"
              onClick={() => {
                setRidePopupPanel(false)
                setConfirmRidePopupPanel(false)
              }}
              className="mt-3 w-full bg-red-600 text-white font-semibold text-lg p-2 px-10 rounded-lg"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ConfirmRidePopUp
