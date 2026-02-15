import  { useState, useRef} from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import axios from "axios";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/locationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmedRide from "../components/ConfirmedRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import { SocketContext } from "../context/socketContext";
import { useContext, useEffect } from "react";
import { UserDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

const Start = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeField, setActiveField] = useState(null); // ✅ track which input user is typing in
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

  const { sendMessage, receiveMessage } = useContext(SocketContext);
  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);



  const navigate = useNavigate();





  
 useEffect(() => {
  if (user && socket?.current) {
    socket.current.emit("join", {
      userId: user._id,
      userType: "user",
    });
  }

  const onWaiting = (rideData) => {
  console.log("🚕 Captain accepted ride:", rideData);

  setRide(rideData);
  setWaitingForDriver(true);

  socket.current.emit("join-ride-room", {
    rideId: rideData._id,
  });
};


  // const onRideStarted = (rideData) => {
  //   console.log("🏁 Ride started:", rideData);
  //   setWaitingForDriver(false);
  //   navigate("/riding");

  // }; 
  
const onRideStarted = (rideData) => {
  console.log("🏁 Ride started:", rideData);
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

   





  // ✅ Fetch suggestions
  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions?input=${query}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };


  

  // ✅ Input handlers
  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickup(value);
    if (value.trim()) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    if (value.trim()) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  // ✅ GSAP animations
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
    gsap.to(vehiclePanelRef.current, {
      transform: vehiclePanelOpen ? "translateY(0%)" : "translateY(120%)",
    });
  }, [vehiclePanelOpen]);

  useGSAP(() => {
    gsap.to(confirmRidePanelRef.current, {
      transform: confirmRidePanel ? "translateY(0%)" : "translateY(120%)",
    });
  }, [confirmRidePanel]);

  useGSAP(() => {
    gsap.to(WaitingForDriverRef.current, {
      transform: waitingForDriver ? "translateY(0%)" : "translateY(120%)",
    });
  }, [waitingForDriver]);

  useGSAP(() => {
    gsap.to(vehicleFoundRef.current, {
      transform: vehicleFound ? "translateY(0%)" : "translateY(120%)",
    });
  }, [vehicleFound]);

  async function findTrip() {
    try {
      setVehiclePanelOpen(true);
      setPanelOpen(false);

      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/rides/get-fare?pickup=${encodeURIComponent(
          pickup
        )}&destination=${encodeURIComponent(destination)}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("🚗 Fare response:", response.data);

      // ✅ Save the fare data to state
      setFare(response.data);
    } catch (error) {
      console.error(
        "❌ Error fetching fare:",
        error.response?.data || error.message
      );
    }
  }

  async function createRide() {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/create`,
      {
        pickup,
        destination,
        vehicleType,
      },
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log(response.data);
  }

  return (
    <div className="h-screen relative overflow-hidden">
      <img
        className="w-16 absolute left-6 top-6"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt="Logo"
      />
      <div className="h-screen w-screen">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt="Background"
        />
      </div>

      {/* Input Section */}
      <div className="flex flex-col justify-end h-screen absolute top-0 w-full">
        <div className="relative  p-5 bg-white">
          <h5
            ref={panelCloseRef}
            onClick={() => setPanelOpen(false)}
            className="absolute right-3 top-3 text-2xl opacity-0 cursor-pointer"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className="text-2xl font-semibold">Find a trip</h4>
          <form>
            <div className="line absolute h-16 w-[3.5px] top-[38%] left-[11%] bg-gray-700 rounded-full"></div>

            {/* Pickup Input */}
            <input
              onClick={() => {
                setActiveField("pickup");
                setPanelOpen(true);
              }}
              value={pickup}
              onChange={handlePickupChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-5"
              type="text"
              placeholder="Add a pick-up Location"
            />

            {/* Destination Input */}
            <input
              onClick={() => {
                setActiveField("destination");
                setPanelOpen(true);
              }}
              value={destination}
              onChange={handleDestinationChange}
              className="bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3"
              type="text"
              placeholder="Enter your destination"
            />
            <button
              onClick={(e) => {
                e.preventDefault(); // ⛔ stop the form reload
                findTrip(); // ✅ manually trigger your logic
              }}
              className="bg-black text-white px-4 py-2 rounded-lg mt-3 w-full"
            >
              Find Trip
            </button>
          </form>
        </div>

        {/* Suggestion Panel */}
        <div ref={panelRef} className="h-0 bg-white overflow-y-auto">
          <LocationSearchPanel
            suggestions={suggestions}
            setPanelOpen={setPanelOpen}
            setVehiclePanelOpen={setVehiclePanelOpen}
            setPickup={setPickup}
            setDestination={setDestination}
            activeField={activeField} // ✅ pass active field
          />
        </div>
      </div>

      {/* Other Panels */}
      <div
        ref={vehiclePanelRef}
        className="fixed z-10 w-full bottom-0 px-3 py-6 bg-white"
      >
        <VehiclePanel
          selectVehicle={setVehicleType}
          fare={fare}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanelOpen={setVehiclePanelOpen}
        />
      </div>

      <div
        ref={confirmRidePanelRef}
        className="fixed z-10 w-full bottom-0 px-3 py-6 bg-white"
      >
        <ConfirmedRide
          vehicleType={vehicleType}
          fare={fare}
          pickup={pickup}
          destination={destination}
          createRide={createRide}
          // passenger={passenger}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehicleFound={setVehicleFound}
        />
      </div>

      <div
        ref={vehicleFoundRef}
        className="fixed z-10 w-full bottom-0 px-3 py-6 bg-white"
      >
        <LookingForDriver
          vehicleType={vehicleType}
          fare={fare}
          pickup={pickup}
          destination={destination}
          setVehicleFound={setVehicleFound}
          setConfirmRidePanel={setConfirmRidePanel}
        />
      </div>

      <div
        ref={WaitingForDriverRef}
        className="fixed z-10 w-full bottom-0 px-3 py-6 bg-white"
      >
        <WaitingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver} />
      </div>
    </div>
  );
};

export default Start;
