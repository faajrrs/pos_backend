const Hapi = require('@hapi/hapi');
const routes = require('./Routes'); // Import file routes

const init = async () => {
    const server = Hapi.server({
        port: 5000, // Gunakan port yang berbeda dari frontend (misal: 5000)
        host: 'localhost',
        routes: {
            cors: {
                origin: ['http://localhost:3000'], // Izinkan akses dari frontend React Anda
            },
        },
    });

    server.route(routes); // Aktifkan baris ini

    await server.start();
    console.log(`Server Hapi.js berjalan di ${server.info.uri}`);
};

init();









// const Hapi = require('@hapi/hapi');
// const routes = require('./Routes');

// const init = async () => {

//     const server = Hapi.server({
//         port: 5000,
//         host: 'localhost',
//         routes: {
//             cors: {
//                 origin: ['http://localhost:3000'], // Izinkan akses dari frontend React Anda
//             },
//         },
//     });

//     server.route(routes);

//     await server.start();
//     console.log(`Server berhasil berjalan di ${server.info.uri}`);
// };

// init();