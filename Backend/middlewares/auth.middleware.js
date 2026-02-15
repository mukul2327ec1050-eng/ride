const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const blacklistedTokenModel = require('../models/blacklistToken.model'); 
const captainModel = require('../models/captain.model');

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });           // token nhi mila
    }

    const isBlacklisted = await blacklistedTokenModel.findOne({ token: token });

    if(isBlacklisted){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id)              // id se verify krenge == > mila to user me store krdenge

        req.user = user;

        return next();

    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}


module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });           // token nhi mila
    }       
    const isBlacklisted = await blacklistedTokenModel.findOne({ token: token });
    if(isBlacklisted){
        return res.status(401).json({ message: 'Unauthorized' });
    }   
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id)              // id se verify krenge == > mila to user me store krdenge
        req.captain = captain;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
} 