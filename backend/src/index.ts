import 'dotenv/config';
import http from 'http';
import { createApp } from './server/app';
import { Server as IOServer } from 'socket.io';
import { connectDB } from './config/db';
import { initSockets } from './sockets';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? 'localhost';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

async function start() {
    const app = createApp(); 
    const server = http.createServer(app);

    const io = new IOServer( server, {
        cors: {
            origin: CLIENT_ORIGIN,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    try {
        await connectDB(process.env.MONGO_URI)

        await initSockets(io);

        server.listen(PORT, HOST, () => console.log(`Server funcionando en http://${HOST}:${PORT}`));
    } catch (error) {
        console.error('Fallo al iniciar el servidor:', error);
        process.exit(1);
    }
}

start();


// const app = createApp();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });



// const PORT = Number(process.env.PORT || 4000);
// const HOST = process.env.HOST || '127.0.0.1'; 

// connectDB(process.env.MONGO_URI || '')
//         .then(() => {
//                 initSockets(io);

//                 server.listen(PORT, HOST, () => console.log(`Server funcionando en http://${HOST}:${PORT}`));
//         })
//         .catch((err) => {
//                 console.error('Fallo al conectarse al mongo', err);
//                 process.exit(1);
//         });