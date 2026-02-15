import React, { useRef, useState, useEffect, useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import LiveTracking from '../components/LiveTracking'
import { SocketContext } from '../context/socketContext'

const CaptainRiding = () => {

    const { socket } = useContext(SocketContext)
    const location = useLocation()
    const rideData = location.state?.ride

    /* ✅ SAFE PICKUP COORDS EXTRACTION */
    const pickupCoords = rideData?.pickup?.coordinates
        ? [rideData.pickup.coordinates[1], rideData.pickup.coordinates[0]]
        : null

    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const finishRidePanelRef = useRef(null)

    /* =====================================================
       1️⃣ JOIN RIDE ROOM (THIS WAS MISSING)
    ===================================================== */
    useEffect(() => {
        if (!socket?.current || !rideData?._id) return

        socket.current.emit("join-ride-room", {
            rideId: rideData._id
        })

        console.log("🔔 Captain joined ride room:", rideData._id)

    }, [socket, rideData])

    /* =====================================================
       2️⃣ LIVE GPS STREAM
    ===================================================== */
    useEffect(() => {
        if (!socket?.current || !rideData?._id) return

        const captainData = JSON.parse(localStorage.getItem("captain"))
        if (!captainData?._id) return

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                socket.current.emit("captain-location-update", {
                    userId: captainData._id,
                    userType: "captain",
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    rideId: rideData._id
                })
            },
            (err) => console.error("GPS error:", err),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 3000 }
        )

        return () => navigator.geolocation.clearWatch(watchId)

    }, [socket, rideData])

    /* =====================================================
       3️⃣ PANEL ANIMATION
    ===================================================== */
    useGSAP(() => {
        if (!finishRidePanelRef.current) return

        gsap.to(finishRidePanelRef.current, {
            y: finishRidePanel ? 0 : "100%"
        })
    }, [finishRidePanel])

    return (
        <div className='h-screen w-screen flex flex-col overflow-hidden'>

            {/* HEADER */}
            <div className='absolute top-0 left-0 w-full p-6 flex items-center justify-between z-20'>
                <img
                    className='w-16'
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                    alt="Uber"
                />
                <Link
                    to='/captain-home'
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full'
                >
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            {/* MAP */}
            <div className="flex-1 relative">
                <LiveTracking destination={pickupCoords} />
            </div>

            {/* BOTTOM PANEL */}
            <div
                className='h-[20%] min-h-[140px] p-6 flex items-center justify-between relative bg-yellow-400 pt-10 z-10'
                onClick={() => setFinishRidePanel(true)}
            >
                <h5 className='p-1 text-center w-[90%] absolute top-0'>
                    <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
                </h5>

                <h4 className='text-xl font-semibold'>4 KM away</h4>

                <button className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'>
                    Finish Ride
                </button>
            </div>

            {/* SLIDE PANEL */}
            <div
                ref={finishRidePanelRef}
                className='fixed left-0 bottom-0 w-full z-[500] translate-y-full bg-white px-3 py-10 pt-12'
            >
                <FinishRide setFinishRidePanel={setFinishRidePanel} />
            </div>

        </div>
    )
}

export default CaptainRiding
