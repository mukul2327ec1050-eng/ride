import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useState, useContext } from "react";
import L from "leaflet";
import { SocketContext } from "../context/socketContext";
import "leaflet/dist/leaflet.css";

/* ---------------- FIX MARKER ICON ---------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------------- FOLLOW CAPTAIN WHEN FREE ---------------- */
const FollowCaptain = ({ position, navigating, routeReady }) => {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    // While navigating — let route control camera
    if (navigating && routeReady) return;

    map.flyTo(position, 16, { duration: 0.7 });
  }, [position, navigating, routeReady]);

  return null;
};

/* ---------------- FIT ROUTE ---------------- */
const FitRoute = ({ route }) => {
  const map = useMap();

  useEffect(() => {
    if (!route) return;
    const bounds = L.latLngBounds(route);
    map.fitBounds(bounds, { padding: [70, 70] });
  }, [route]);

  return null;
};

export default function LiveTracking({ destination }) {
  const { socket } = useContext(SocketContext);

  const [position, setPosition] = useState(null);
  const [route, setRoute] = useState(null);

  const navigating = !!destination;

  /* ------------ CAPTAIN LIVE LOCATION ------------ */
  useEffect(() => {
    if (!socket?.current) return;

    const handler = ({ lat, lng }) => {
      setPosition([lat, lng]);
    };

    socket.current.on("captain-location-update", handler);

    return () => socket.current.off("captain-location-update", handler);
  }, [socket]);

  /* ------------ ROUTE FETCH (REAL FIX) ------------ */
  useEffect(() => {
    if (!destination || !position) return;

    let cancelled = false;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${position[1]},${position[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
        );

        const data = await res.json();

        if (!cancelled && data.routes?.length) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRoute(coords);
        }

      } catch (e) {
        console.log("Route error:", e);
      }
    };

    fetchRoute();

    return () => {
      cancelled = true;
    };

  }, [destination, position]);

  /* ------------ WAIT FOR GPS ------------ */
  if (!position) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200">
        <p className="text-gray-600 text-sm">Getting GPS location...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Captain Marker */}
        <Marker position={position} />

        {/* Destination Marker */}
        {destination && <Marker position={destination} />}

        {/* Route */}
        {route && (
          <>
            <Polyline positions={route} pathOptions={{ color: "#111", weight: 5 }} />
            <FitRoute route={route} />
          </>
        )}

        <FollowCaptain position={position} navigating={navigating} routeReady={!!route} />
      </MapContainer>
    </div>
  );
}
