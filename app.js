const express = require('express');
const cors = require('cors');
// const morgan = require('morgan');

const loadRoutes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

// Enable CORS
app.use(cors());

// Parse JSON body
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (dev mode)
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

/*
|--------------------------------------------------------------------------
| Load All Routes Automatically
|--------------------------------------------------------------------------
*/
loadRoutes(app);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/
app.use(errorMiddleware);

module.exports = app;