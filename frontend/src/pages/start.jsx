import { useState, useRef, useContext, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import axios from "axios";
import "remixicon/fonts/remixicon.css";

import LocationSearchPanel from "../components/locationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmedRide from "../components/ConfirmedRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import LiveTracking from "../components/LiveTracking";

import { SocketContext } from "../context/socketContext";
import { UserDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

const Start = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const WaitingForDriverRef = useRef(null);

  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState("");
  const [ride, setRide] = useState(null);

  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && socket?.current) {
      socket.current.emit("join", { userId: user._id, userType: "user" });
    }

    const onWaiting = (rideData) => {
      setRide(rideData);
      setWaitingForDriver(true);
      socket.current.emit("join-ride-room", { rideId: rideData._id });
    };

    const onRideStarted = (rideData) => {
      setWaitingForDriver(false);
      navigate("/riding", { state: { ride: rideData } });
    };

    socket.current?.on("waiting-for-driver", onWaiting);
    socket.current?.on("ride-started", onRideStarted);

    return () => {
      socket.current?.off("waiting-for-driver", onWaiting);
      socket.current?.off("ride-started", onRideStarted);
    };
  }, [socket, user, navigate]);

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions?input=${query}`,
        { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSuggestions(response.data.suggestions);
    } catch {}
  };

  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickup(value);
    value.trim() ? fetchSuggestions(value) : setSuggestions([]);
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    value.trim() ? fetchSuggestions(value) : setSuggestions([]);
  };

  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panelRef.current, { height: "70%", opacity: 1 });
      gsap.to(panelCloseRef.current, { opacity: 1 });
    } else {
      gsap.to(panelRef.current, { height: "0%" });
      gsap.to(panelCloseRef.current, { opacity: 0 });
    }
  }, [panelOpen]);

  useGSAP(() => {
    gsap.to(vehiclePanelRef.current, { transform: vehiclePanelOpen ? "translateY(0%)" : "translateY(120%)" });
  }, [vehiclePanelOpen]);

  useGSAP(() => {
    gsap.to(confirmRidePanelRef.current, { transform: confirmRidePanel ? "translateY(0%)" : "translateY(120%)" });
  }, [confirmRidePanel]);

  useGSAP(() => {
    gsap.to(WaitingForDriverRef.current, { transform: waitingForDriver ? "translateY(0%)" : "translateY(120%)" });
  }, [waitingForDriver]);

  useGSAP(() => {
    gsap.to(vehicleFoundRef.current, { transform: vehicleFound ? "translateY(0%)" : "translateY(120%)" });
  }, [vehicleFound]);

  async function findTrip() {
    setVehiclePanelOpen(true);
    setPanelOpen(false);

    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/rides/get-fare?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`,
      { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    setFare(response.data);
  }

  async function createRide() {
    await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/create`,
      { pickup, destination, vehicleType },
      { headers: { authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  }

  return (
    <div className="h-screen relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <LiveTracking />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />

      <div className="absolute left-7 top-6 z-20 text-white font-bold text-xl tracking-tight select-none">
        <span className="relative inline-block text-white font-bold text-2xl tracking-tight"><span className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-[2px] bg-white/40 rounded-full"></span>AaoChale</span>
      </div>

      <div className="flex flex-col justify-end h-screen absolute top-0 w-full z-20">
        <div className="relative px-5 pt-5 pb-6 bg-[#111111] rounded-t-[28px] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="w-10 h-1 bg-white rounded-full mx-auto mb-4"></div>

          <h5
            ref={panelCloseRef}
            onClick={() => setPanelOpen(false)}
            className="absolute right-5 top-5 text-gray-400 opacity-0 cursor-pointer"
          >
            <i className="ri-arrow-down-wide-line text-2xl"></i>
          </h5>

          <h4 className="text-2xl font-semibold tracking-tight">Where to?</h4>

          <div className="relative mt-5 space-y-3">
            {/* CURVED ROUTE VISUAL */}
            <svg
              className="absolute left-3 top-3 h-[88px] w-10 pointer-events-none"
              viewBox="0 0 40 100"
              fill="none"
            >
              <circle cx="20" cy="10" r="4" fill="#22c55e" />
              <path
                d="M20 14 Q35 45 20 76"
                stroke="#9ca3af"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
              <circle cx="20" cy="90" r="4" fill="#ef4444" />
            </svg>

            <input
              onClick={() => { setActiveField("pickup"); setPanelOpen(true); }}
              value={pickup}
              onChange={handlePickupChange}
              className="bg-[#1c1c1c] border border-white/10 pl-12 pr-4 py-3 rounded-xl w-full"
              placeholder="Enter pickup location"
            />

            <input
              onClick={() => { setActiveField("destination"); setPanelOpen(true); }}
              value={destination}
              onChange={handleDestinationChange}
              className="bg-[#1c1c1c] border border-white/10 pl-12 pr-4 py-3 rounded-xl w-full"
              placeholder="Enter destination"
            />
          </div>

          <button
            onClick={(e) => { e.preventDefault(); findTrip(); }}
            className="mt-5 w-full bg-white text-black font-semibold py-3 rounded-xl"
          >
            Search rides
          </button>
        </div>

        <div ref={panelRef} className="h-0 bg-[#111111] rounded-t-[28px] overflow-y-auto">
          <LocationSearchPanel
            suggestions={suggestions}
            setPanelOpen={setPanelOpen}
            setVehiclePanelOpen={setVehiclePanelOpen}
            setPickup={setPickup}
            setDestination={setDestination}
            activeField={activeField}
          />
        </div>
      </div>

      <div ref={vehiclePanelRef} className="fixed z-20 w-full bottom-0 px-4 pt-5 pb-7 bg-[#111111] rounded-t-[28px]">
        <VehiclePanel selectVehicle={setVehicleType} fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanelOpen={setVehiclePanelOpen} />
      </div>

      <div ref={confirmRidePanelRef} className="fixed z-20 w-full bottom-0 px-4 pt-5 pb-7 bg-[#111111] rounded-t-[28px]">
        <ConfirmedRide vehicleType={vehicleType} fare={fare} pickup={pickup} destination={destination} createRide={createRide} setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound} />
      </div>

      <div ref={vehicleFoundRef} className="fixed z-20 w-full bottom-0 px-4 pt-5 pb-7 bg-[#111111] rounded-t-[28px]">
        <LookingForDriver vehicleType={vehicleType} fare={fare} pickup={pickup} destination={destination} setVehicleFound={setVehicleFound} setConfirmRidePanel={setConfirmRidePanel} />
      </div>

      <div ref={WaitingForDriverRef} className="fixed z-20 w-full bottom-0 px-4 pt-5 pb-7 bg-[#111111] rounded-t-[28px]">
        <WaitingForDriver ride={ride} setVehicleFound={setVehicleFound} setWaitingForDriver={setWaitingForDriver} waitingForDriver={waitingForDriver} />
      </div>
    </div>
  );
};

export default Start;
