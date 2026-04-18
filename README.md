# 🐳 API Orquestador de Docker (Mini Kubernetes)

Una API REST construida con Node.js y Express que se comunica directamente con el motor de Docker en tu máquina local. Permite automatizar la descarga de imágenes, el despliegue de nuevos contenedores y el monitoreo de los contenedores activos, todo a través de peticiones HTTP.

## ✨ Características Principales

* **Despliegue Automatizado:** Descarga imágenes (pull) y levanta contenedores automáticamente mediante una sola petición HTTP.
* **Monitoreo de Contenedores:** Consulta en tiempo real todos los contenedores activos en el sistema.
* **Comunicación Nativa:** Utiliza `dockerode` para conectarse directamente al socket de Unix de Docker (`/var/run/docker.sock`), operando sin intermediarios.

## 🛠️ Tecnologías Utilizadas

* **Node.js + Express:** Creación del servidor web y manejo de rutas API.
* **Dockerode:** Librería cliente para la API remota/local de Docker.

---

## ⚙️ Requisitos Previos

Para que esta API funcione, necesitas tener instalado y configurado lo siguiente en la máquina donde se ejecuta:

1. [Node.js](https://nodejs.org/).
2. [Docker Desktop](https://www.docker.com/) (o Docker Engine en Linux) **encendido y en ejecución**.
3. **(Usuarios de Linux):** El usuario que ejecuta la API debe tener permisos para acceder al socket de Docker. Puedes solucionar esto ejecutando el servidor con `sudo` o añadiendo tu usuario al grupo `docker`.

---

## 📦 Instalación

1. Navega hasta la carpeta del proyecto en tu terminal.
2. Instala las dependencias necesarias ejecutando:

```bash
npm install express dockerode
