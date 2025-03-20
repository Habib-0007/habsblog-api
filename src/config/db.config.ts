import mongoose from 'mongoose';
import { env } from './env.config';

const { MONGODB_URI } = env;

export const connectDB = () => {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('Database successfully connected'))
    .catch((err) => {
      console.log(`You have this error ${err}`);
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    });

  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
  });

  process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

  function gracefulExit() {
    mongoose.connection.close(true);
  }
};
