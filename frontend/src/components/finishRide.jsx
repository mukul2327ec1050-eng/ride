import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const FinishRide = (props) => {

    const navigate = useNavigate()

    // async function endRide() {
    //     const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/end-ride`, {
    //         rideId: props.ride._id
    //     }, {
    //         headers: {
    //             Authorization: `Bearer ${localStorage.getItem('token')}`
    //         }
    //     })

    //     if (response.status === 200) {
    //         navigate('/captain-home')
    //     }
    // }

    const userName = props?.ride?.user?.fullname?.firstname || "User"
    const userLastName = props?.ride?.user?.fullname?.lastname || ""
    const userPhoto = props?.ride?.user?.photo || null
    const distance = props?.ride?.distance || "-"
    const pickupAddress = props?.ride?.pickup?.address || "-"
    const pickupLabel = props?.ride?.pickup?.label || "-"
    const destinationAddress = props?.ride?.destination?.address || "-"
    const destinationLabel = props?.ride?.destination?.label || "-"
    const paymentType = props?.ride?.paymentType || "-"
    const paymentAmount = props?.ride?.fare || "-"


    return (
        <div className="text-white">

            {/* DRAG HANDLE */}
            <div
                className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-5 cursor-pointer"
                onClick={() => props.setFinishRidePanel(false)}
            />

            {/* TITLE */}
            <h3 className="text-2xl font-semibold mb-6">
                Finish this Ride
            </h3>

            {/* USER CARD */}
            <div className="flex items-center justify-between p-4
                            bg-white/10 border border-white/10
                            rounded-xl backdrop-blur-md">

                <div className="flex items-center gap-3">

                    <div className="relative">
  {userPhoto ? (
    <img
      src={userPhoto}
      alt="user"
      className="h-12 w-12 rounded-full object-cover
                 border border-white/20 shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
    />
  ) : (
    <div
      className="h-12 w-12 rounded-full flex items-center justify-center
                 bg-white/10 border border-white/20
                 text-white font-semibold text-lg uppercase
                 shadow-[0_0_0_3px_rgba(255,255,255,0.05)]"
    >
      {userName.charAt(0)}
    </div>
  )}
</div>


                    <div>
                        <h2 className="text-lg font-medium">
                            {userName} {userLastName}
                        </h2>
                        <p className="text-xs text-gray-400">
                            Passenger
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-400">Distance</p>
                    <h5 className="text-lg font-bold text-green-400">
                        {distance} KM
                    </h5>
                </div>
            </div>

            {/* RIDE DETAILS */}
            <div className="mt-6 border-t border-white/10 pt-4">


                {/* Pickup */}
                <div className="flex items-start gap-4 py-3 border-b border-white/10">
                    <i className="ri-map-pin-user-fill text-green-400 text-lg"></i>
                    <div>
                        <p className="text-xs text-gray-400">Pickup</p>
                        <h3 className="text-sm">{pickupLabel}</h3>
                        <p className="text-xs text-gray-500">{pickupAddress}</p>
                    </div>
                </div>

                {/* Destination */}
                <div className="flex items-start gap-4 py-3 border-b border-white/10">
                    <i className="ri-map-pin-2-fill text-red-400 text-lg"></i>
                    <div>
                        <p className="text-xs text-gray-400">Destination</p>
                        <h3 className="text-sm">{destinationLabel}</h3>
                        <p className="text-xs text-gray-500">{destinationAddress}</p>
                    </div>
                </div>


                {/* Payment */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        <i className="ri-currency-line text-lg"></i>
                        <span className="text-sm text-gray-400">Payment</span>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-gray-400">{paymentType}</p>
                        <h3 className="text-lg font-semibold">₹{paymentAmount}</h3>
                    </div>
                </div>

            </div>

            {/* FINISH BUTTON */}
            <button
                // onClick={endRide}
                className="bg-green-600 hover:bg-green-500
                           w-full mt-6 text-white text-lg
                           font-semibold py-3 rounded-xl transition"
            >
                Finish Ride
            </button>

        </div>
    )
}

export default FinishRide
