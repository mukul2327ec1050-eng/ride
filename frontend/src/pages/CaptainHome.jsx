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

  /* ---------------- SOCKET ---------------- */

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

  /* ---------------- CONFIRM RIDE ---------------- */

  async function confirmRide(otp) {
    if (!ride || !captain) return

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
        { rideId: ride._id, captainId: captain._id, otp },
        { headers: { authorization: `Bearer ${localStorage.getItem('token')}` } }
      )

      const confirmedRide = res.data

      if (socket?.current) {
        socket.current.emit('ride-confirmed-by-captain', {
          rideId: confirmedRide._id,
          userId: confirmedRide?.user?._id || confirmedRide?.userId
        })
      }

      setRidePopupPanel(false)
      setConfirmRidePopupPanel(false)

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

  /* ---------------- GSAP ---------------- */

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
    <div className="h-screen w-screen relative overflow-hidden bg-black text-white">

      {/* MAP */}
      <div className="absolute inset-0 z-0">
        <LiveTracking />
      </div>

      {/* GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 z-10 pointer-events-none" />

      {/* HEADER */}
      <div className="absolute p-6 top-0 flex items-center justify-between w-full z-30">
        <div className="flex items-center gap-3">
          <div className="h-6 w-[3px] bg-white/70 rounded-full"></div>
          <span className="text-2xl font-bold tracking-tight z-10">AaoChale</span>
        </div>

        <Link
          to="/captain-home"
          className="h-10 w-10 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center rounded-full hover:bg-white/20 transition"
        >
          <i className="text-lg ri-logout-box-r-line"></i>
        </Link>
      </div>

      {/* CAPTAIN INFO CARD (FIXED VISIBILITY) */}
      <div className="absolute bottom-6 w-full px-6 z-30">
  <div className="
      bg-[#111111]/95 
      backdrop-blur-xl 
      border border-white/10 
      rounded-2xl 
      shadow-[0_10px_40px_rgba(0,0,0,0.9)]
      text-white
      [&_*]:text-white
      [&_svg]:text-white
  ">
    <CaptainDetails />
  </div>
</div>


      {/* RIDE POPUP */}
      <div
        ref={ridePopupPanelRef}
        className="fixed w-full z-40 bottom-0 translate-y-full
                   bg-[#111111] text-black px-5 pt-6 pb-8
                   rounded-t-[28px] border-t border-white/10
                   shadow-[0_-10px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl"
      >
        <RidePopUp
          ride={ride}
          setRidePopupPanel={setRidePopupPanel}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          confirmRide={confirmRide}
          onAccept={handleAccept}
        />
      </div>

      {/* CONFIRM POPUP */}
      <div
        ref={confirmRidePopupPanelRef}
        className="fixed w-full h-screen z-50 bottom-0 translate-y-full
                   bg-[#111111] text-white px-5 pt-6 pb-8
                   rounded-t-[28px] border-t border-white/10
                   shadow-[0_-10px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl"
      >
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
