import React, { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import LiveTracking from '../components/LiveTracking'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const Riding = () => {

    const location = useLocation()
    const ride = location.state?.ride

    const panelRef = useRef(null)
    const [panelOpen, setPanelOpen] = useState(true)

    /* COORDINATES */
    const pickupCoords = ride?.pickup?.coordinates
        ? [ride.pickup.coordinates[1], ride.pickup.coordinates[0]]
        : null

    const destinationCoords = ride?.destination?.coordinates
        ? [ride.destination.coordinates[1], ride.destination.coordinates[0]]
        : null

    /* PANEL ANIMATION */
    useGSAP(() => {
        if (!panelRef.current) return

        gsap.to(panelRef.current, {
            y: panelOpen ? 0 : "100%",
            duration: 0.45,
            ease: "power3.out"
        })

    }, [panelOpen])

    return (
        <div className='h-screen relative overflow-hidden bg-black text-white'>

            {/* ================= MAP ================= */}
            <div className='absolute inset-0 z-0'>
                <LiveTracking pickup={pickupCoords} destination={destinationCoords} />
            </div>

            {/* IMPORTANT: allow map interaction */}
            <div className='absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 z-10 pointer-events-none'></div>

            {/* ================= TOGGLE BUTTON ================= */}
            <button
                onClick={() => setPanelOpen(prev => !prev)}
                className='fixed right-6 top-6 z-30 h-11 w-11 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center rounded-full hover:bg-white/20 transition'
            >
                <i className={`text-lg ri-${panelOpen ? 'close-line' : 'menu-line'}`}></i>
            </button>

            {/* ================= BOTTOM PANEL ================= */}
            <div
                ref={panelRef}
                className='absolute bottom-0 w-full z-20 px-5 pt-6 pb-8 bg-[#111111] rounded-t-[28px] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl pointer-events-auto'
            >

                {/* Drag Indicator */}
                <div className='w-10 h-1 bg-white/30 rounded-full mx-auto mb-5'></div>

                {/* Driver Info */}
                <div className='flex items-center justify-between'>
                    <img
                        className='h-14 w-20 object-cover rounded-xl border border-white/10'
                        src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
                        alt=""
                    />

                    <div className='text-right'>
                        <h2 className='text-lg font-semibold capitalize'>
                            {ride?.captain?.fullname?.firstname || "Driver"}
                        </h2>
                        <h4 className='text-xl font-bold -mt-1'>
                            {ride?.captain?.vehicle?.plate || "----"}
                        </h4>
                        <p className='text-sm text-gray-400'>
                            {ride?.captain?.vehicle?.vehicleType || ""}
                        </p>
                    </div>
                </div>

                {/* Ride Details */}
                <div className='flex flex-col items-center mt-6 w-full'>

                    <div className='flex items-center gap-5 p-4 border-b border-white/10 w-full'>
                        <i className="text-lg ri-map-pin-2-fill text-green-400"></i>
                        <div>
                            <h3 className='text-lg font-medium'>
                                {ride?.destination?.address}
                            </h3>
                        </div>
                    </div>

                    <div className='flex items-center gap-5 p-4 w-full'>
                        <i className="ri-currency-line text-lg text-white"></i>
                        <div>
                            <h3 className='text-lg font-semibold'>₹{ride?.fare}</h3>
                            <p className='text-sm text-gray-400'>Cash</p>
                        </div>
                    </div>

                </div>

                {/* Action */}
                <button className='w-full mt-6 bg-green-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition'>
                    Make a Payment
                </button>

            </div>
        </div>
    )
}

export default Riding
