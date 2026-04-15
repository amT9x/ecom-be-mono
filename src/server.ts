import dotevn from 'dotenv';
import { connectDB } from "./loaders/loader.db.js"
import { buildApp } from "./app.js";

dotevn.config({quiet: true});

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 3001;

const startServer = async () => {
  await connectDB();
  const app = buildApp();

  try {
    await app.listen({host: HOST, port: PORT});
    console.log(`Server is running on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

startServer();
