const axios = require('axios');
const captainModel = require('../models/captain.model');

// ✅ Reusable headers (Nominatim blocks generic headers like "MyApp/1.0")
const NOMINATIM_HEADERS = {
    'User-Agent': 'AaoChaleApp/1.0 (yourname@gmail.com)',
    'Accept-Language': 'en'
};


// 🟢 1. Get coordinates from address (Nominatim)
module.exports.getAddressCoordinates = async (address) => {
    if (!address?.trim()) {
        throw new Error('Address is required');
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    try {
        const response = await axios.get(url, { headers: NOMINATIM_HEADERS });

        if (!response.data || response.data.length === 0) {
            throw new Error(`No coordinates found for "${address}"`);
        }

        const location = response.data[0];
        return {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lon)
        };
    } catch (error) {
        throw new Error(`Error fetching coordinates for "${address}": ${error.message}`);
    }
};


// 🟡 2. Get distance & duration between two addresses (Nominatim + OSRM)
module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin?.trim() || !destination?.trim()) {
        throw new Error('Origin and Destination are required');
    }

    try {
        // Step 1️⃣: Get coordinates for origin & destination from Nominatim
        const [originData, destData] = await Promise.all([
            axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(origin)}&format=json&limit=1`, { headers: NOMINATIM_HEADERS }),
            axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`, { headers: NOMINATIM_HEADERS })
        ]);

        if (!originData.data.length || !destData.data.length) {
            throw new Error('Invalid origin or destination');
        }

        const o = originData.data[0];
        const d = destData.data[0];

        // ✅ Optional delay to prevent 403 rate limit
        await new Promise(r => setTimeout(r, 500));

        // Step 2️⃣: Call OSRM Routing API using coordinates (lon,lat)
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${o.lon},${o.lat};${d.lon},${d.lat}?overview=false`;
        const response = await axios.get(osrmUrl, { headers: NOMINATIM_HEADERS });

        if (response.status === 403) {
            throw new Error('403 Forbidden: OSRM or Nominatim blocked the request (too many requests or missing User-Agent)');
        }

        if (!response.data || response.data.code !== 'Ok' || !response.data.routes.length) {
            throw new Error('No route found between the specified locations');
        }

        const route = response.data.routes[0];
        return {
            distance: route.distance, // meters
            duration: route.duration  // seconds
        };
    } catch (error) {
        throw new Error(`Error fetching distance and time: ${error.message}`);
    }
};


// 🟢 3. Autocomplete for locations
module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input?.trim() || input.trim().length < 3) {
    return [];  // Prevent Nominatim from being spammed
}


    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5`;

    try {
        await new Promise(r => setTimeout(r, 300)); // 300–500ms recommended  and to avoid rate limit

        const response = await axios.get(url, { headers: NOMINATIM_HEADERS });

        if (!response.data || response.data.length === 0) {
            return [];
        }

        return response.data.map(item => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
        }));
    } catch (error) {
        throw new Error(`Error fetching suggestions: ${error.message}`);
    }
};


// 🟣 4. Find captains within radius (GeoSpatial Query)
module.exports.getCaptainsInTheRadius = async (location, radiusInKm) => {
    if (!location?.lat || !location?.lng) {
        throw new Error('Location must include lat and lng');
    }

    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [location.lng, location.lat],
                    radiusInKm / 6378.1 // Earth radius in km
                ]
            }
        }
    });

    console.log(`✅ Found ${captains.length} captains within ${radiusInKm} km`);
    return captains;
};
    