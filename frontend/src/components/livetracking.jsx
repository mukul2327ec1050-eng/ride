import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useState, useContext } from "react";
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

const Follow = ({ pos }) => {
  const map = useMap();
  useEffect(() => { if (pos) map.flyTo(pos, 16, { duration: 0.7 }); }, [pos]);
  return null;
};

export default function LiveTracking() {

  const { socket } = useContext(SocketContext);
  const [userPos, setUserPos] = useState(null);
  const [captainPos, setCaptainPos] = useState(null);
  const [route, setRoute] = useState(null);

  /* USER GPS */
  useEffect(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      p => setUserPos([p.coords.latitude, p.coords.longitude]),
      () => console.log("GPS denied"),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  /* CAPTAIN SOCKET */
  useEffect(() => {
    if (!socket?.current) return;

    const handler = ({ lat, lng }) => setCaptainPos([lat, lng]);
    socket.current.on("captain-location-update", handler);
    return () => socket.current.off("captain-location-update", handler);
  }, [socket]);

  const focus = captainPos || userPos;

  if (!focus) {
    return <div className="w-full h-full flex items-center justify-center bg-black text-white">Getting GPS location...</div>;
  }

  return (
    <MapContainer center={focus} zoom={16} style={{ height: "100%", width: "100%" }} zoomControl={false}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

      {userPos && <Marker position={userPos} />}
      {captainPos && <Marker position={captainPos} />}
      {route && <Polyline positions={route} pathOptions={{ color: "#111", weight: 5 }} />}

      <Follow pos={focus}/>
    </MapContainer>
  );
}
