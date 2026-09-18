const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const planRoutes = require('./routes/plan');
const exerciseRoutes = require('./routes/exercise');
const trainingDayRoutes = require('./routes/trainingDay');
const workoutSessionRoutes = require('./routes/workoutSession');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);
app.use('/', planRoutes);
app.use('/', trainingDayRoutes);
app.use('/', exerciseRoutes);
app.use('/', workoutSessionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({ message: message, data: data });
});

mongoose.connect('mongodb+srv://mostafanasr67:Made2be%402@cluster0.lshfpb6.mongodb.net/cali?appName=Cluster0')
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(8080, () => console.log('Server running on port 8080'));
}).catch(err => {
    console.log('MongoDB connection error:', err);
});
