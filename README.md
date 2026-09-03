# 📘 INFORME TÉCNICO: USO DE PROMESAS EN EL JUEGO "NYAN CAT AVENTURA"

**Elaborado por:** Michelle Juliana Betancurt Barrros - Valentina Bladón Veléz 
**Fecha:** 06/09/2026  
**Versión del juego:** 1.0  

---

## 1. INTRODUCCIÓN

El juego **"Nyan Cat Aventura"** es una plataforma educativa diseñada para enseñar conceptos fundamentales de **JavaScript asíncrono**, específicamente **Promesas**, **Async/Await** y manejo de peticiones HTTP.

Aunque el código del motor del juego (gráficos, físicas, colisiones) **no utiliza promesas directamente**, su estructura de niveles (módulos) incluye un sistema de preguntas tipo quiz que evalúa el conocimiento del jugador sobre estos temas. Cada módulo aborda una técnica distinta relacionada con promesas, y el jugador debe responder correctamente para avanzar.

Este informe detalla **todas las promesas y conceptos asíncronos** que se abordan en los 10 módulos del juego, explicando su funcionamiento, propósito y ejemplos prácticos.

---

## 2. TECNOLOGÍAS UTILIZADAS

El juego fue desarrollado íntegramente con tecnologías web estándar, sin frameworks externos, lo que garantiza ligereza y compatibilidad con cualquier navegador moderno.

### 2.1 Lenguajes y Estándares
- **HTML5**: Estructura semántica del juego (pantallas, contenedores, botones, canvas).
- **CSS3**: Estilos visuales, animaciones (fondo arcoíris, título brillante), diseño responsive y controles táctiles.
- **JavaScript (ES6+)**: Lógica completa del juego, manejo de eventos, físicas, colisiones, sistema de quizzes y control de audio.

### 2.2 APIs y Características del Navegador
- **Canvas 2D API**: Renderizado de gráficos en tiempo real (personajes, plataformas, estrellas, efectos).
- **Web Audio API**: Reproducción de efectos de sonido y música de fondo (archivos `.mp3` y `.wav`).
- **DOM API**: Manipulación dinámica del HTML para mostrar/ocultar pantallas y actualizar estadísticas.
- **Eventos de teclado y táctiles**: Soporte para jugar tanto en PC (teclado) como en móviles (botones táctiles).
- **RequestAnimationFrame**: Bucle de animación principal para un rendimiento óptimo y sincronizado con la frecuencia de actualización de la pantalla.

### 2.3 Estructura de Archivos
- **index.html**: Contiene la estructura HTML, enlaces a CSS y JS.
- **style.css**: Todos los estilos, incluyendo diseño responsivo y apariencia Nyan Cat.
- **app.js**: Lógica completa del juego (motor, físicas, colisiones, audio, sistema de módulos y quiz).
- **Archivos de audio**: `musica.mp3`, `salto.mp3`, `punto.mp3`, `impacto.mp3`, `gameover.mp3` (efectos y música).

### 2.4 Principios de Diseño
- **Responsive Web Design**: Adaptación automática a cualquier tamaño de pantalla (escritorio, tablet, móvil).
- **Mobile First**: Controles táctiles visibles solo en dispositivos con pantalla táctil.
- **Interfaz Intuitiva**: Barra de estadísticas (módulo, vidas, XP), botón de música, pantallas de inicio, victoria y alertas.
- **Estilo Nyan Cat**: Colores vibrantes, arcoíris, estrellas, luna y personaje pixelart.

---

## 3. LISTA DE PROMESAS Y CONCEPTOS ABORDADOS

| Módulo | Concepto Principal | Descripción |
|--------|-------------------|-------------|
| 1 | `fetch()` y estados de una Promesa | Uso básico de `fetch()` para obtener datos de una API. |
| 2 | Promesas con arrays | Procesamiento de respuestas que devuelven listas (arrays). |
| 3 | `Promise.all()` | Ejecutar múltiples promesas en paralelo y esperar todas. |
| 4 | `Promise.allSettled()` | Esperar todas las promesas, sin importar si fallan o se cumplen. |
| 5 | `Promise.race()` | Competir entre promesas, la primera en resolverse gana. |
| 6 | `Promise.any()` | Obtener la primera promesa que se cumpla exitosamente. |
| 7 | Máquina de Estados | IDLE, PENDING, FULFILLED, REJECTED. |
| 8 | `async` / `await` | Sintaxis moderna para trabajar con promesas. |
| 9 | `getUserMedia()` | Promesa para acceder a la cámara. |
| 10 | `Geolocation.getCurrentPosition()` | Promesa para obtener la ubicación. |

---

## 4. EXPLICACIÓN DETALLADA DE CADA CONCEPTO

### 🧩 Módulo 1 – Mi Primera Promesa (fetch + estados)
- **Promesa usada:** `fetch(url)`
- **Explicación:** `fetch()` devuelve una **promesa** que se resuelve cuando la respuesta del servidor está disponible. Una promesa puede estar en tres estados:
  - **Pending (pendiente):** aún no se ha completado.
  - **Fulfilled (cumplida):** la operación fue exitosa.
  - **Rejected (rechazada):** ocurrió un error.
- **Ejemplo en el juego:** Se pregunta qué significa que una promesa esté en "pendiente" – la respuesta correcta es que está esperando la respuesta de Internet.

### 🧩 Módulo 2 – Promesa con una Lista
- **Promesa usada:** `fetch()` seguido de `response.json()`
- **Explicación:** Cuando se obtienen varios elementos (ej. lista de usuarios), el resultado es un **array** que puede recorrerse con bucles (`forEach`, `map`). La promesa se resuelve con los datos, y luego se procesan.
- **Ejemplo en el juego:** Pregunta por qué podemos recorrer la respuesta con un bucle – porque recibimos un array.

### 🧩 Módulo 3 – Promise.all()
- **Método estático:** `Promise.all([promesa1, promesa2, ...])`
- **Explicación:** Toma un array de promesas y devuelve una **única promesa** que se resuelve cuando **todas** las promesas se resuelven. Si **una falla**, toda la promesa se rechaza.
- **Ejemplo en el juego:** Se pregunta qué sucede si una de las tres operaciones falla – todo el conjunto falla y se va al `catch()`.

### 🧩 Módulo 4 – Promise.allSettled()
- **Método estático:** `Promise.allSettled([...])`
- **Explicación:** Similar a `all()`, pero **no se rechaza** si alguna promesa falla. Devuelve un array con objetos que indican el estado (`fulfilled` o `rejected`) y el valor/razón de cada una.
- **Ejemplo en el juego:** Ventaja principal – poder revisar cuáles terminaron con éxito y cuáles fallaron.

### 🧩 Módulo 5 – Promise.race()
- **Método estático:** `Promise.race([promesa1, promesa2])`
- **Explicación:** Devuelve una promesa que se resuelve o rechaza **tan pronto como una de las promesas del array se resuelva o rechace**. Se usa para timeouts.
- **Ejemplo en el juego:** Si un temporizador gana, la petición tardó demasiado y se lanza un error/aviso.

### 🧩 Módulo 6 – Promise.any()
- **Método estático:** `Promise.any([...])`
- **Explicación:** Devuelve la **primera promesa que se cumple exitosamente**. Ignora los rechazos mientras haya al menos una promesa exitosa.
- **Diferencia con `race()`:** `race()` se resuelve con la primera que termine (éxito o error); `any()` solo con la primera exitosa.
- **Ejemplo en el juego:** Se pregunta la diferencia – `any()` busca el primer resultado exitoso.

### 🧩 Módulo 7 – La Máquina de Estados
- **Concepto:** Estados de una promesa:
  - **IDLE:** aún no se ha iniciado.
  - **PENDING:** en curso.
  - **FULFILLED:** resuelta con éxito.
  - **REJECTED:** falló.
- **Ejemplo en el juego:** Pregunta qué estado representa cuando ya mostramos la información → **FULFILLED**.

### 🧩 Módulo 8 – async y await
- **Palabras clave:** `async` (declara función asíncrona) y `await` (pausa hasta que la promesa se resuelva).
- **Ventaja:** Código asíncrono **secuencial y legible**, evitando "callback hell" y encadenamientos excesivos de `.then()`.
- **Ejemplo en el juego:** Se pregunta la ventaja principal – permite leer el código de forma más limpia.

### 🧩 Módulo 9 – Encender la Cámara (getUserMedia)
- **API usada:** `navigator.mediaDevices.getUserMedia({ video: true })`
- **Explicación:** Devuelve una **promesa** que se resuelve con un flujo de medios (stream) de la cámara. El navegador pide permiso porque es un recurso privado y sensible.
- **Ejemplo en el juego:** Se pregunta por qué pide permiso – por seguridad.

### 🧩 Módulo 10 – Mi Ubicación (Geolocalización)
- **API usada:** `navigator.geolocation.getCurrentPosition()`
- **Explicación:** Puede convertirse a promesa. Devuelve la posición del dispositivo con **latitud** y **longitud**.
- **Ejemplo en el juego:** Se pregunta qué datos clave obtenemos – latitud y longitud.

---

## 5. APLICACIÓN EN EL JUEGO

El juego utiliza estos conceptos en su **sistema de quizzes**. Cuando el jugador recoge una estrella (power-up), se activa un quiz correspondiente al módulo actual.

- Si acierta → gana experiencia, avanza al siguiente módulo, aumenta la dificultad.
- Si falla → pierde una vida.

Así se refuerza el aprendizaje de cada concepto de promesas de manera interactiva.

---

