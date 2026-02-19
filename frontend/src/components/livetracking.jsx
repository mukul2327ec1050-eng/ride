import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useState, useContext, useRef } from "react";
import L from "leaflet";
import { SocketContext } from "../context/socketContext";
import "leaflet/dist/leaflet.css";

/* FIX MARKER ICON */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* CAMERA FOLLOW */
const Follow = ({ pos }) => {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, 16, { duration: 0.7 });
  }, [pos]);
  return null;
};

export default function LiveTracking({ pickup = null, destination = null }) {

  const { socket } = useContext(SocketContext);

  const [userPos, setUserPos] = useState(null);
  const [captainPos, setCaptainPos] = useState(null);
  const [route, setRoute] = useState(null);

  const gpsStarted = useRef(false);

  const isRideMode = pickup && destination;

  /* ================= GET INITIAL LOCATION (CRITICAL) ================= */
  useEffect(() => {
    if (!navigator.geolocation || isRideMode) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
      },
      (err) => console.log("Initial GPS blocked:", err),
      { enableHighAccuracy: true }
    );
  }, [isRideMode]);

  /* ================= LIVE GPS TRACKING ================= */
  useEffect(() => {
    if (!navigator.geolocation || isRideMode) return;
    if (gpsStarted.current) return;

    gpsStarted.current = true;

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => console.log("GPS denied"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [isRideMode]);

  /* ================= CAPTAIN SOCKET ================= */
  useEffect(() => {
    if (!socket?.current || !isRideMode) return;

    const handler = ({ lat, lng }) => setCaptainPos([lat, lng]);
    socket.current.on("captain-location-update", handler);

    return () => socket.current.off("captain-location-update", handler);
  }, [socket, isRideMode]);

  /* ================= ROUTE FETCH ================= */
  useEffect(() => {
    if (!pickup || !destination) return;

    const getRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
        );

        const data = await res.json();

        if (data.routes?.length) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRoute(coords);
        }
      } catch (e) {
        console.log("Route fetch failed", e);
      }
    };

    getRoute();
  }, [pickup, destination]);

  /* ================= MAP FOCUS ================= */
  const focus = isRideMode
    ? pickup
    : (captainPos || userPos);

  if (!focus) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        Getting your location...
      </div>
    );
  }

  return (
    <MapContainer
      center={focus}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* LIVE MODE */}
      {!isRideMode && userPos && <Marker position={userPos} />}
      {!isRideMode && captainPos && <Marker position={captainPos} />}

      {/* RIDE MODE */}
      {isRideMode && <Marker position={pickup} />}
      {isRideMode && <Marker position={destination} />}
      {isRideMode && route && (
  <>
    {/* shadow */}
    <Polyline
      positions={route}
      pathOptions={{ color: "#000000", weight: 10, opacity: 0.25 }}
    />

    {/* main route */}
    <Polyline
      positions={route}
      pathOptions={{ color: "#3B82F6", weight: 6, opacity: 0.95 }}
    />
  </>
)}


      <Follow pos={focus} />
    </MapContainer>
  );
}
