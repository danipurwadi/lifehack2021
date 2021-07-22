// Import middlewares
import express from 'express';
import logger from 'morgan';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import routes
import userRouter from './routes/userRouter';

const app = express();

// Morgan middleware
app.use(logger('dev'));

// Parse request body
app.use(express.json({ limit: '5mb' }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '5mb',
        parameterLimit: 1000000
    })
);

//Set mongodb url and port from .env
dotenv.config();
const url = process.env.MONGO_URI;

//Set port
const port = process.env.PORT || 5000;

// Declare routes
app.use('/api/users', userRouter);

// Configure mongoose to avoid deprecation warnings
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Connect mongoose to server
if (process.env.IS_DEPLOYMENT == 'true') {
    mongoose
        .connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            authSource: process.env.MONGO_AUTH_SOURCE,
            user: process.env.MONGO_ADMIN_NAME,
            pass: process.env.MONGO_ADMIN_PASSWORD
        })
        .then(() => {
            console.log('Connected correctly to server');
        })
        .catch((err) => console.log(err));
} else {
    mongoose
        .connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        .then(() => {
            console.log('Connected correctly to server');
        })
        .catch((err) => console.log(err));
}

const server = http.createServer(app);

//Start the server
server.listen(port, () => {
    console.log(`Express server is listening on port ${port}!`);
});

//Export app for testing
module.exports = server;
export default app;