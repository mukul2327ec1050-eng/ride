import React, { useContext } from 'react'
import { CaptainDataContext } from '../context/captainContext'

const CaptainDetails = () => {

    const { captain } = useContext(CaptainDataContext)

   return (
  <div className="bg-[#111111] text-white rounded-2xl p-5 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">

    {/* PROFILE ROW */}
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-4">
        <img
          className="h-14 w-14 rounded-full object-cover border border-white/20"
          src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"
          alt=""
        />

        <div>
          <h2 className="text-lg font-semibold">
            {captain?.fullname?.firstname}
          </h2>
          <p className="text-sm text-gray-400">
            {captain?.vehicle?.vehicleType}
          </p>
        </div>
      </div>

      <div className="text-right">
        <h3 className="text-2xl font-bold">
          ₹ 192.45
        </h3>
        <p className="text-sm text-gray-400">Earned</p>
      </div>
    </div>

    {/* STATS CARD */}
    <div className="mt-6 bg-[#1a1a1a] border border-white/10 rounded-xl p-5 flex justify-between">

      <div className="text-center flex-1">
        <i className="ri-time-line text-xl text-green-500"></i>
        <h3 className="text-lg font-semibold mt-1">10.2</h3>
        <p className="text-xs text-gray-400">Hours Online</p>
      </div>

      <div className="text-center flex-1">
        <i className="ri-roadster-fill text-xl text-yellow-500"></i>
        <h3 className="text-lg font-semibold mt-1">25</h3>
        <p className="text-xs text-gray-400">Trips</p>
      </div>

      <div className="text-center flex-1">
        <i className="ri-star-fill text-xl text-yellow-400"></i>
        <h3 className="text-lg font-semibold mt-1">4.9</h3>
        <p className="text-xs text-gray-400">Rating</p>
      </div>

    </div>
  </div>
)

}

export default CaptainDetails
