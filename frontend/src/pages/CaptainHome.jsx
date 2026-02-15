import React, { useRef, useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopup'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import LiveTracking from '../components/LiveTracking'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SocketContext } from '../context/socketContext'
import { CaptainDataContext } from '../context/captainContext'
import axios from 'axios'

const CaptainHome = () => {

  const navigate = useNavigate()

  const [ridePopupPanel, setRidePopupPanel] = useState(false)
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false)
  const [ride, setRide] = useState(null)

  const ridePopupPanelRef = useRef(null)
  const confirmRidePopupPanelRef = useRef(null)

  const { socket } = useContext(SocketContext)
  const { captain } = useContext(CaptainDataContext)

  // SOCKET JOIN + RIDE LISTENER + LOCATION UPDATES
  useEffect(() => {
    if (!captain || !socket?.current) return

    socket.current.emit('join', {
      userId: captain._id,
      userType: 'captain',
    })

    const handleNewRide = (data) => {
      setRide(data)
      setRidePopupPanel(true)
    }

    socket.current.on('new-ride-request', handleNewRide)

    const sendLocation = () => {
      if (!navigator?.geolocation) return

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          socket.current.emit('captain-location-update', {
            userId: captain._id,
            userType: 'captain',
            lat: latitude,
            lng: longitude,
          })
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      )
    }

    sendLocation()
    const locationInterval = setInterval(sendLocation, 10000)

    return () => {
      clearInterval(locationInterval)
      socket.current.off('new-ride-request', handleNewRide)
    }
  }, [captain, socket])

  // 🔥 IMPORTANT CHANGE HERE


  async function confirmRide(otp) {
  if (!ride || !captain) return

  try {
    // 🚀 IMPORTANT: capture backend response
    const res = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
      { rideId: ride._id, captainId: captain._id, otp },
      { headers: { authorization: `Bearer ${localStorage.getItem('token')}` } }
    )

    const confirmedRide = res.data   // <-- THIS IS THE REAL RIDE WITH COORDINATES

    // notify user
    if (socket?.current) {
      socket.current.emit('ride-confirmed-by-captain', {
        rideId: confirmedRide._id,
        userId: confirmedRide?.user?._id || confirmedRide?.userId
      })
    }

    setRidePopupPanel(false)
    setConfirmRidePopupPanel(false)

    // 🚀 NOW NAVIGATE WITH FULL RIDE
    navigate('/captain-riding', {
      state: { ride: confirmedRide }
    })

  } catch (err) {
    console.error('confirmRide error:', err)
  }
}






  function handleAccept(selectedRide = ride) {
    if (!selectedRide || !captain || !socket?.current) return

    socket.current.emit('captain-accepted', {
      rideId: selectedRide._id,
      captainId: captain._id,
      userId: selectedRide?.user?._id || selectedRide?.userId || null,
      captainName: captain?.fullname?.firstname || captain?.name,
      vehicle: captain?.vehicle || null,
      plate: captain?.plate || null,
      otp: selectedRide?.otp || null,
    })

    setRidePopupPanel(false)
    setConfirmRidePopupPanel(true)
  }

  // GSAP
  useGSAP(() => {
    gsap.to(ridePopupPanelRef.current, {
      transform: ridePopupPanel ? 'translateY(0%)' : 'translateY(100%)',
    })
  }, [ridePopupPanel])

  useGSAP(() => {
    gsap.to(confirmRidePopupPanelRef.current, {
      transform: confirmRidePopupPanel ? 'translateY(0%)' : 'translateY(100%)',
    })
  }, [confirmRidePopupPanel])

  return (
    <div className="h-screen w-screen relative overflow-hidden">

      {/* MAP BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <LiveTracking />
      </div>

      {/* HEADER */}
      <div className="absolute p-6 top-0 flex items-center justify-between w-full z-20">
        <img className="w-16" src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
        <Link to="/captain-home" className="h-10 w-10 bg-white flex items-center justify-center rounded-full">
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>

      {/* BOTTOM DETAILS PANEL */}
      <div className="absolute bottom-0 w-full p-6 z-10">
        <CaptainDetails />
      </div>

      {/* Ride Popup */}
      <div ref={ridePopupPanelRef} className="fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-10 pt-12">
        <RidePopUp
          ride={ride}
          setRidePopupPanel={setRidePopupPanel}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          confirmRide={confirmRide}
          onAccept={handleAccept}
        />
      </div>

      {/* Confirm Ride Popup */}
      <div ref={confirmRidePopupPanelRef} className="fixed w-full h-screen z-40 bottom-0 translate-y-full bg-white px-3 py-10 pt-12">
        <ConfirmRidePopUp
          ride={ride}
          confirmRide={confirmRide}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          setRidePopupPanel={setRidePopupPanel}
        />
      </div>

    </div>
  )
}

export default CaptainHome
