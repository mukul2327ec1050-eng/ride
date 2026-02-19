import React from 'react'


const RidePopUp = (props) => {
    return (
  <div className="text-white">

    {/* drag handle */}
    <h5 className='p-1 text-center w-[93%] absolute top-0'>
      <i className="text-3xl text-white/70 ri-arrow-down-wide-line"></i>
    </h5>

    <h3 className='text-2xl font-semibold mb-5 mt-3'>New Ride Available!</h3>

    {/* USER CARD */}
    {/* USER CARD */}
<div className='flex items-center justify-between p-3 bg-white/10 border border-white/10 rounded-xl mt-4 backdrop-blur-md'>

  <div className='flex items-center gap-3'>

    {/* USER PHOTO OR FALLBACK */}
    {props.ride?.user?.profileImage || props.ride?.user?.photo || props.ride?.user?.avatar ? (
      <img
        className='h-12 w-12 rounded-full object-cover border border-white/20'
        src={
          props.ride?.user?.profileImage ||
          props.ride?.user?.photo ||
          props.ride?.user?.avatar
        }
        alt="user"
      />
    ) : (
      <div className='h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold border border-white/20'>
        {props.ride?.user?.fullname?.firstname?.charAt(0)?.toUpperCase() || "U"}
      </div>
    )}

    <div>
      <h2 className='text-lg font-medium text-white'>
        {props.ride?.user?.fullname?.firstname || "Rider"}
      </h2>
      <p className='text-xs text-gray-400'>Passenger</p>
    </div>

  </div>

  <h5 className='text-lg font-semibold text-green-400'>{Math.floor(props.ride?.distance/1000) + " Km" || "0.0 KM"}</h5>

</div>


    {/* DETAILS */}
    <div className='flex gap-2 flex-col items-center'>
      <div className='w-full mt-5'>

        {/* PICKUP */}
        <div className='flex items-center gap-5 p-3 border-b border-white/10'>
          <i className="ri-map-pin-user-fill text-green-400 text-xl"></i>
          <div>
            <h3 className='text-lg font-medium text-white'>Pickup</h3>
            <p className='text-sm -mt-1 text-gray-400'>{props.ride?.pickup?.address}</p>
          </div>
        </div>

        {/* DESTINATION */}
        <div className='flex items-center gap-5 p-3 border-b border-white/10'>
          <i className="ri-map-pin-2-fill text-red-400 text-xl"></i>
          <div>
            <h3 className='text-lg font-medium text-white'>Destination</h3>
            <p className='text-sm -mt-1 text-gray-400'>{props.ride?.destination?.address}</p>
          </div>
        </div>

        {/* FARE */}
        <div className='flex items-center gap-5 p-3'>
          <i className="ri-currency-line text-xl text-white"></i>
          <div>
            <h3 className='text-lg font-medium text-white'>₹{props.ride?.fare}</h3>
            <p className='text-sm -mt-1 text-gray-400'>Cash</p>
          </div>
        </div>

      </div>

      {/* BUTTONS */}
      <div className='mt-5 w-full flex items-center justify-between gap-4'>

        <button
          onClick={() => {
            props.setConfirmRidePopupPanel(true)
            props.setRidePopupPanel(false)
            if (props.onAccept) props.onAccept(props.ride)
          }}
          className='bg-green-600 hover:bg-green-500 w-full text-white font-semibold p-3 rounded-xl transition'
        >
          Accept
        </button>

        <button
          onClick={() => props.setRidePopupPanel(false)}
          className='w-full bg-white/10 border border-white/15 text-white font-semibold p-3 rounded-xl hover:bg-white/20 transition'
        >
          Ignore
        </button>

      </div>
    </div>
  </div>
)

}

export default RidePopUp