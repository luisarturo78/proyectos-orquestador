// ==========================================
// CONFIGURACION DE EXPRESS.
// ==========================================

const express = require('express');
const app = express();
app.use(express.json()); // Para leer el Body en Postman.

app.use(express.urlencoded({ extended: true }));

// ==========================================
// Configuracion de DOCKER.
// ==========================================

const Docker = require('dockerode');

// ==========================================
// 1. CONFIGURACIÓN DE CONEXIÓN (Paso 3)
// ==========================================

const docker = new Docker({ socketPath: '/var/run/docker.sock'});

// ==========================================
// 2. FUNCIONES DE ORQUESTACIÓN (Paso 4)
// ==========================================

async function checkDocker() {
    try {
        const info = await docker.version();
        console.log('Conectado a Docker Version:', info.version);
    } catch (err) {
        console.error('No se pudo conectar a Docker. Esta encendido?', err.message);
    }
}

// Paso 4A: Descargar una imagen.

async function pullImage (imagess) {
    console.log(`Descargando imagen: ${imagess}...`);
    const stream = await docker.pull(imagess);


// Esperamos a que la descarga termine.

    return new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err,res) => {
            if (err) return reject(err);
            console.log('Imagen descargada');
            resolve(res);
        });
    });
}

// Paso 4B: Crear e Iniciar un contenedor.

app.post('/api/containers/deploy', async (req, res) => {
    // 1. Extraer los datos que Postman nos manda en el body
    const { image, name } = req.body;

    try {
        // 2. Usamos la misma logica de Dockerode

        const stream = await docker.pull(image);
        await new Promise((resolve, reject) => {
            docker.modem.followProgress(stream, (err, result) => err ? reject(err) : resolve(result));
        });

        const container = await docker.createContainer({
            Image: image,
            Name: name,
            ExposedPorts: { '80/ tcp': {} },
            HostConfig: {PortBindings: { '80/tcp': [{ HostPort: '8080' }] } }
        });

        await container.start();

        // 3 Respondemos con exito a Postman con la solicitud recibida.
        res.status(201).json({ message: `Contenedor ${name} desplegado.`});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Paso 4C: Listar contenedores activos

app.get('/api/containers', async (req, res) => {

    try {
        const containers = await docker.listContainers();
        res.json(containers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// DEPLOY THE API
// ==========================================

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Orquestador API listo en http://localhost:${PORT}`);
});
