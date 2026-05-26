# Registro Civil de Mascotas (Evaluación Node.js)

Este es el proyecto final para la evaluación del Ministerio de las Mascotas (Gobierno de Chile). Es un sistema básico para registrar mascotas y asociarlas al RUT de su dueño usando un servidor en Node.js y conectando todo con un frontend usando Axios.

## ¿Qué hace el proyecto?

### Backend (Node.js)
El servidor está en `server.js` y maneja una "base de datos" local en un archivo JSON (`mascotas.json`). 
Soporta las siguientes rutas en la API (`/api/mascotas`):
* **GET general:** Muestra todas las mascotas que están registradas.
* **GET por nombre:** Si pasas `?nombre=bobby`, busca y te devuelve solo esa mascota.
* **GET por rut:** Si pasas `?rut=12345678-9`, te muestra todos los animalitos que le pertenecen a ese RUT.
* **POST:** Recibe los datos desde el formulario del frontend y agrega la mascota al archivo JSON.
* **DELETE por nombre:** Borra a una mascota específica usando su nombre.
* **DELETE por rut:** Borra de una sola vez todas las mascotas que estén asociadas a ese RUT de dueño.

### Frontend (Interfaz)
El archivo `index.html` tiene un diseño simple con los formularios para interactuar con el servidor. 

## Estructura de archivos

* `server.js` -> Código del servidor HTTP y las rutas de la API.
* `index.html` -> La página web con los formularios y las peticiones.
* `mascotas.json` -> El archivo de texto donde se guardan los datos.
* `package.json` -> Configuración del proyecto.

## Cómo hacerlo funcionar

1. Abre la carpeta del proyecto en tu terminal.
2. Levanta el servidor ejecutando:
   node server.js