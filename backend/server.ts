import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { ServerError } from './backend-types';
import process from 'process';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import mongoose from "mongoose";
import containerRouter from './routers/docker/containerRouter';
import imageRouter from './routers/docker/imageRouter';
import volumeRouter from './routers/docker/volumeRouter';
import networkRouter from './routers/docker/networkRouter';
import systemRouter from './routers/docker/systemRouter';
import configRouter from './routers/prometheus/configRouter';
import saveMetricsRouter from './routers/docker/saveMetricsRouter';
import metricsAlertService from './services/metricsAlertService';

// DO NOT USE CORS!
// It will mess up the ddClientRequest!

// const PORT = 3003;
let SOCKETFILE: string;
if (process.env.MODE === 'browser') {
  SOCKETFILE = '3000';
} else {
  SOCKETFILE = '/run/guest-services/backend.sock';

  // Resets the docker socket, prevents the issue of VM socket being in use error but not always
  try {
    fs.unlinkSync(SOCKETFILE);
    console.log('Deleted the UNIX file.');
  }
  catch (err) {
    console.log('Did not need to delete the UNIX socket file.');
  }
}

// CONNECTING MONGO:
// DO NOT CHANGE - SIGNED UP WITH DOCKETEER GMAIL!
// Uncomment if you want to host your scans in the MongoDB cloud account for Docketeer
// Database: docketeer - Collection: imagemodels
// const URI =
//   'mongodb+srv://docketeer:MaIQDkTCJlqyzWNu@docketeerextension.h4ubyyv.mongodb.net/';

/*
If your application inside the Docker container needs to connect to a service on the host machine (in this case, MongoDB),
you can't use localhost in the connection string. localhost inside a Docker container refers to the container itself, not the
host machine.

If you're using Docker Desktop for Mac, you can use host.docker.internal as the hostname to connect to your host machine.
So your MongoDB connection string would look something like this: mongodb://host.docker.internal:27017.
*/

// USE LOCAL HOST INSTEAD OF CLOUD ATLAS
const URI = 'mongodb://host.docker.internal:27017'

mongoose
  .connect(
    URI,
    {
      dbName: 'docketeer'
    }
  )
  .then(() => {
    console.log("Connected to Mongo DB.");
    // Initialize the metrics alert monitoring system
    // This service will continuously monitor Docker metrics and trigger alerts
    // when certain thresholds are exceeded (e.g., high CPU usage, memory consumption)
    metricsAlertService.startMonitoring();
  })
  .catch((err) => console.log(err));

/**
 *  "413 Request Entity Too Large" error
 *  Article: https://blog.hubspot.com/website/413-request-entity-too-large
 *  Need to add {limit: '50mb'} to increase the transfer limit (default is 10-15 mb)
 */

const app = express();
app.use(bodyParser.json({ limit: '50mb' })); // set file size limit to 50mb
app.use(cookieParser());
app.use(express.json({ limit: '50mb' })); // set file size limit to 50mb
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // set file size limit to 50mb

// Add CPU stress test endpoint
app.post('/api/test/cpu-stress', (req: Request, res: Response) => {
  const duration = parseInt(req.query.duration as string) || 30; // Duration in seconds
  const startTime = Date.now();
  
  // CPU-intensive operation
  const stressCPU = () => {
    const endTime = Date.now();
    if (endTime - startTime >= duration * 1000) {
      res.json({ message: `CPU stress test completed after ${duration} seconds` });
      return;
    }
    
    // Perform CPU-intensive calculations
    for (let i = 0; i < 1000000; i++) {
      Math.sqrt(Math.random() * 1000000);
    }
    
    // Continue the loop
    setImmediate(stressCPU);
  };
  
  console.log(`Starting CPU stress test for ${duration} seconds...`);
  stressCPU();
});

app.use('/api/docker/container', containerRouter);
app.use('/api/docker/image', imageRouter);
app.use('/api/docker/volume', volumeRouter);
app.use('/api/docker/network', networkRouter);
app.use('/api/docker/system', systemRouter);
app.use('/api/prometheus/config', configRouter);
app.use('/api/saveMetricsEntry', saveMetricsRouter);

// Catch-All Error Handler
app.use('/', (req: Request, res: Response): Response => {
  return res
    .status(404)
    .json({ error: 'Endpoint does not exist' });
});

// Global Error Handler
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: ServerError, req: Request, res: Response, next: NextFunction): Response => {
    const defaultErr: ServerError = {
      log: {err:'Express error handler caught unknown middleware error'},
      status: 500,
      message: 'internal server error: HELLLO',
    };

    const errorObj: ServerError = Object.assign({}, defaultErr, err);
    console.log(errorObj.log);
    return res.status(errorObj.status).json(errorObj.message);
  }
);

app.listen(SOCKETFILE, (): void => {
  console.log(`Listening on socket: ${SOCKETFILE}`);
});

// Graceful shutdown handlers for the metrics alert system
// These ensure that the monitoring service is properly stopped
// when the server receives termination signals
process.on('SIGTERM', () => {
  metricsAlertService.stopMonitoring();
  console.log('Stopped metrics monitoring');
});

process.on('SIGINT', () => {
  metricsAlertService.stopMonitoring();
  console.log('Stopped metrics monitoring');
});

module.exports = app;
