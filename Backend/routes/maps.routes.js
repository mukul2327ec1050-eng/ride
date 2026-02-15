    const express = require('express');
    const router = express.Router();
    const mapsController = require('../controllers/maps.controller');
    const authMiddleware = require('../middlewares/auth.middleware');
    const { query } = require('express-validator');

    router.get('/get-coordinates',
        query('address').isString().isLength({ min: 1 }).withMessage('Address query parameter is required'),
        authMiddleware.authUser,
        mapsController.getCoordinates);



    router.get('/get-distance-time',
        query('origin').isString().isLength({ min: 1 }).withMessage('Origin query parameter is required'),
        query('destination').isString().isLength({ min: 1 }).withMessage('Destination query parameter is required'),
        authMiddleware.authUser,
        mapsController.getDistanceTime);



    router.get('/get-suggestions',
        query('input').isString().isLength({ min: 1 }).withMessage('Input query parameter is required'),
        authMiddleware.authUser,
        mapsController.getAutoCompleteSuggestions);






    module.exports = router;