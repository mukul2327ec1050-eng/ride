const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const connectToDB = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const cookieParser = require('cookie-parser');
const rideRoutes = require('./routes/ride.routes');


connectToDB();

app.use(cookieParser());

app.use(cors({
  origin: [
        "https://8dx31940-5173.inc1.devtunnels.ms",
        "https://8dx31940-5000.inc1.devtunnels.ms",
    ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Hello World!');
}); 

app.use('/users', userRoutes);
app.use('/captains', captainRoutes); 
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);


module.exports = app;