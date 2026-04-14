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

async function deployContainer(imagess, containerName) {
    try {
        await pullImage(imagess); // Aseguramos que la imagen existe.

        const container = await docker.createContainer({
            Image: imagess,
            name: containerName,
            ExposedPorts: { '80/tcp': {} }, // Puertos que usa el contenedor.
            HostConfig: {
                PortBindings: { '80/tcp': [{ HostPort: '8080'}] } // Mapeamos al 8080 de nuestra PC.
            }
        });

        await container.start();
        console.log(`Contenedor ${containerName} desplegado en http://localhost:8080`);
    } catch (err) {
        console.error('Error al desplegar:', err.message);
    }
}

// Paso 4C: Listar contenedores activos

async function listRunningContainers() {
    try {
        const containers = await docker.listContainers();
        console.log('Contenedores activos:');
        if (containers.length === 0) {
            console.log('No hay contenedores corriendo en este momento.');

        } else {
            containers.forEach (c => {
                console.log(`   -${c.Names[0]} (Imagen: ${c.Image}) | Estado: ${c.State}`);
            });

        }
    } catch (err) {
        console.error('Error al listar contenedores:', err.message);
    }
}

// ==========================================
// 3. ZONA DE PRUEBAS (Ejecucion)
// ==========================================
// Vamos a crear una función principal para probar que todo funcione en orden.

async function iniciarPrueba() {
    console.log('Iniciando prueba del orquestador...');

    // 1. Primero vemos que hay encendido.
    await listRunningContainers();

    // 2.Intentamos desplegar un contenedor de Nginx.
    console.log("\n--- Iniciando despliegue ---");
    await deployContainer('nginx:latest', 'mi-servidor-web');
    
    // 3. Volvemos a listar para confirmar que ahora si esta encendido.
    console.log("\n--- Estado final ---");
    await listRunningContainers();
}

// Ejecutar la prueba

iniciarPrueba();