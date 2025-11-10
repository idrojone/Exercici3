import dotenv from 'dotenv';
import http from 'http';
import { createApp } from './server/app';
import { Server } from 'socket.io';
import { connectDB } from './config/db';

dotenv.config();

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGO_URI || '')
    .then(() => {
        server.listen(PORT, () => console.log(`Server funcionando en el puerto ${PORT}`));
    })
    .catch((err) => {
        console.error('Fallo al conectarse al mongo', err);
        process.exit(1);
    });