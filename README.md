# 🎮 GameBalls - Juego de Evasión

Un emocionante juego 2D de supervivencia donde controlas una bola azul que debe evitar el contacto con bolas enemigas rojas. ¡Sobrevive el mayor tiempo posible!

![GameBalls Screenshot](https://via.placeholder.com/800x400/1e3c72/ffffff?text=GameBalls+-+Juego+de+Evasi%C3%B3n)

## 🎯 Objetivo del Juego

El objetivo principal es **sobrevivir el mayor tiempo posible** evitando colisionar con las bolas enemigas rojas que aparecen constantemente en la pantalla.

## 🎮 Cómo Jugar

### Controles
- **Flechas del teclado**: Mueve tu bola azul en todas las direcciones
  - ⬆️ Flecha arriba: Mover hacia arriba
  - ⬇️ Flecha abajo: Mover hacia abajo
  - ⬅️ Flecha izquierda: Mover hacia la izquierda
  - ➡️ Flecha derecha: Mover hacia la derecha

### Reglas del Juego

1. **Supervivencia**: Evita que tu bola azul toque cualquier bola enemiga roja
2. **Movimiento libre**: Puedes moverte libremente por toda la pantalla
3. **Colisión = Game Over**: Si tocas una bola enemiga, el juego termina inmediatamente

## 📈 Sistema de Dificultad Progresiva

El juego se vuelve más desafiante con el tiempo:

- **Nuevos enemigos**: Cada 10 segundos aparece una nueva bola enemiga
- **Aumento de velocidad**: Cada 15 segundos, la velocidad de las bolas enemigas aumenta
- **Fondo animado**: El fondo se mueve y rota gradualmente para añadir distracción visual
- **Efectos visuales**: Partículas y efectos de iluminación que incrementan la intensidad

## ✨ Características Especiales

### 🎵 Efectos de Sonido
- Sonidos al rebotar las bolas enemigas contra las paredes
- Efectos sonoros cuando aparecen nuevos enemigos
- Sonido de colisión al perder
- Sonido de celebración al establecer un nuevo récord
- **Control de sonido**: Puedes activar/desactivar el sonido haciendo clic en "Sonido: ON/OFF"

### 🎁 Power-ups (Opcional)
Ocasionalmente aparecen power-ups especiales que te ayudan:

- **⏰ Ralentizar Tiempo**: Reduce la velocidad de los enemigos por 3 segundos
- **💥 Destruir Enemigo**: Elimina aleatoriamente una bola enemiga de la pantalla

### 📊 Sistema de Puntuación
- **Contador de tiempo**: Muestra cuántos segundos has sobrevivido
- **Mejor puntuación**: Se guarda automáticamente tu mejor tiempo
- **Nuevo récord**: Celebración especial cuando superas tu mejor marca
- **Estadísticas en tiempo real**: Número de enemigos y multiplicador de velocidad

## 🎨 Características Visuales

- **Diseño moderno**: Interfaz colorida y atractiva con gradientes y efectos de transparencia
- **Animaciones suaves**: Transiciones y efectos visuales fluidos
- **Efectos de partículas**: Explosiones y efectos cuando colisionas o destruyes enemigos
- **Iluminación dinámica**: Las bolas tienen efectos de brillo y sombras
- **Fondo animado**: Patrón de movimiento sutil que añade dinamismo
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## 🚀 Cómo Ejecutar el Juego

1. **Clona o descarga** este repositorio
2. **Abre** el archivo `index.html` en tu navegador web
3. **Haz clic** en "Comenzar Juego" para empezar
4. **¡Disfruta jugando!**

### Requisitos Técnicos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Soporte para HTML5 Canvas
- Audio Web API (opcional, para efectos de sonido)

## 📁 Estructura del Proyecto

```
gameballs/
├── index.html      # Estructura HTML del juego
├── style.css       # Estilos y animaciones CSS
├── game.js         # Lógica principal del juego
└── README.md       # Documentación (este archivo)
```

## 🎯 Consejos para Jugar

1. **Mantente en movimiento**: No te quedes estático, siempre busca espacios abiertos
2. **Observa los patrones**: Las bolas enemigas rebotan de manera predecible
3. **Usa los bordes**: A veces es más seguro estar cerca de las paredes
4. **Aprovecha los power-ups**: Úsalos estratégicamente cuando tengas muchos enemigos
5. **Concéntrate**: El fondo animado puede ser distractivo, mantén la vista en las bolas
6. **Practica**: Cada partida te ayudará a mejorar tu tiempo de reacción

## 🏆 Desafíos

- **Principiante**: Sobrevive 30 segundos
- **Intermedio**: Sobrevive 60 segundos
- **Avanzado**: Sobrevive 120 segundos
- **Experto**: Sobrevive 300 segundos (5 minutos)
- **Maestro**: ¡Supera los 600 segundos (10 minutos)!

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura del juego
- **CSS3**: Estilos, animaciones y efectos visuales
- **JavaScript ES6+**: Lógica del juego, física, colisiones
- **Canvas API**: Renderizado 2D de gráficos
- **Web Audio API**: Efectos de sonido
- **LocalStorage**: Persistencia de puntuaciones

## 📝 Notas de Desarrollo

- El juego utiliza `requestAnimationFrame` para animaciones suaves
- Sistema de colisión circular preciso
- Física de rebote realista para las bolas enemigas
- Gestión eficiente de memoria con limpieza de objetos
- Código modular y orientado a objetos

## 🎮 ¡Diviértete Jugando!

Este juego fue diseñado para ser simple pero adictivo. ¿Puedes batir tu propio récord? ¡Comparte tu mejor tiempo con amigos y desafíalos a superarte!

---

**Desarrollado con ❤️ para la diversión y el entretenimiento** 