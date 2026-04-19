import dotevn from 'dotenv';
import { connectDB } from "../app/loaders/db.loader.js";
import { buildApp } from "./app.js";
import { systemLogger } from '../infrastructure/logger/system.logger.js';

dotevn.config({quiet: true});

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 3001;

const startServer = async () => {
  await connectDB();
  const app = buildApp();

  try {
    await app.listen({host: HOST, port: PORT});
    systemLogger.info(
      { host: HOST, port: PORT },
      "Server is running"
    )
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();
