const mapsService = require('../services/maps.service');
const { validationResult } = require('express-validator');

module.exports.getCoordinates = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } 


    const address = req.query.address;
    if (!address) {
        return res.status(400).json({ error: 'Address query parameter is required' });
    }
    try {
        const coordinates = await mapsService.getAddressCoordinates(address);
        res.status(200).json({ coordinates });
    } catch (error) {
        res.status(404).json({ message: 'Coordinates not found' });
    }   
};



module.exports.getDistanceTime = async (req, res, next) => {
    const errors = validationResult(req);   
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const origin = req.query.origin;
    const destination = req.query.destination;
    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and Destination query parameters are required' });
    }
    try {
        const result = await mapsService.getDistanceTime(origin, destination);
        res.status(200).json({ distance: result.distance, duration: result.duration });
    } catch (error) {
        res.status(404).json({ message: 'Route not found' });
    }
};



module.exports.getAutoCompleteSuggestions = async (req, res, next) => {
    const errors = validationResult(req);   
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const input = req.query.input;
    if (!input) {
        return res.status(400).json({ error: 'Input query parameter is required' });
    }
    try {
        const suggestions = await mapsService.getAutoCompleteSuggestions(input);
        res.status(200).json({ suggestions });
    } catch (error) {
    console.error('❌ Suggestion error:', error.message);
    res.status(500).json({ message: error.message });
}
  
};           