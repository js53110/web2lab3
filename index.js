const canvas = document.getElementById("asteroids");

const stopwatchCanvas = document.getElementById("stopwatch");
const stopwatchContext = stopwatchCanvas.getContext("2d");

const startScreen = document.getElementById("welcome");
const gameOver = document.getElementById("gameover");
const startButton = document.getElementById("start");
const restartButton = document.getElementById("restart");

const bestscore = document.getElementById("bestscore");
const currentscore = document.getElementById("currentscore");

let besttime = 0;
localStorage.setItem("bestScore", besttime);

startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameOver.style.display = "none";
  startGame();
  startStopwatch();
});

restartButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameOver.style.display = "none";
  asteroids = [];
  resetPlayer();
  resetStopwatch();
  startGame();
  startStopwatch();
});

let startTime;
let elapsedTime = 0;
let isRunning = false;

canvas.height = window.innerHeight - 20;
canvas.width = window.innerWidth - 20;

const c = canvas.getContext("2d");

class Player {
  constructor({ position, velocity, size }) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
  }

  draw() {
    c.fillStyle = "red";
    c.shadowColor = "white";
    c.shadowBlur = 10;

    c.fillRect(
      this.position.x - this.size.width / 2,
      this.position.y - this.size.height / 2,
      this.size.height,
      this.size.width
    );
  }

  update() {
    this.draw();

    this.position.x += this.velocity.x;
    if (this.position.x > window.innerWidth) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = window.innerWidth;
    }

    this.position.y += this.velocity.y;
    if (this.position.y > window.innerHeight) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = window.innerHeight;
    }
  }
}

class Asteroid {
  constructor({ position, velocity, size, color }) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
    this.color = color;
  }

  draw() {
    c.fillStyle = this.color;
    c.strokeStyle = "black";
    c.lineWidth = 5;
    c.shadowColor = "white";
    c.shadowBlur = 10;

    c.strokeRect(this.position.x, this.position.y, this.size, this.size);
    c.fillRect(this.position.x, this.position.y, this.size, this.size);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

let player = new Player({
  position: { x: canvas.width / 2, y: canvas.height / 2 },
  velocity: { x: 0, y: 0 },
  size: { height: 50, width: 50 },
});

function resetPlayer() {
  player = new Player({
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 },
    size: { height: 50, width: 50 },
  });
}

player.draw();

const keys = {
  keyup: {
    pressed: false,
  },
  keydown: {
    pressed: false,
  },
  keyleft: {
    pressed: false,
  },
  keyright: {
    pressed: false,
  },
};

let asteroids = [];

function resetCanvas() {
  c.fillStyle = "black";
  c.fillRect(10, 10, window.innerWidth - 20, window.innerHeight - 20);
}

function startGame() {
  let intervalId = window.setInterval(() => {
    const index = Math.floor(Math.random() * 4);

    let x, y;
    let vx, vy;

    let size = 70 * Math.random() + 10;

    switch (index) {
      case 0: // left
        x = 0 - size;
        y = 20 + Math.random() * (canvas.height - 40 - size);
        vx = Math.round(Math.random()) + 1;
        vy = Math.round(Math.random());
        break;
      case 1: // right
        x = canvas.width + size;
        y = 20 + Math.random() * (canvas.height - 40 - size);
        vx = -(Math.round(Math.random()) + 1);
        vy = Math.round(Math.random());
        break;
      case 2: // up
        x = 20 + Math.random() * (canvas.width - 40 - size);
        y = 0 - size;
        vx = Math.round(Math.random());
        vy = Math.round(Math.random()) + 1;
        break;
      case 3: // down
        x = 20 + Math.random() * (canvas.width - 40 - size);
        y = canvas.height + size;
        vx = Math.round(Math.random());
        vy = -(Math.round(Math.random()) + 1);
        break;
    }
    var randomGrey = Math.floor(Math.random() * 256);
    var rgbGrey = `rgb(${randomGrey},${randomGrey},${randomGrey})`;
    asteroids.push(
      new Asteroid({
        position: {
          x: x,
          y: y,
        },
        velocity: { x: vx, y: vy },
        size,
        color: rgbGrey,
      })
    );
  }, 300);

  function rectanglesCollision(player, asteroid) {
    const xCollision =
      player.position.x - player.size.width / 2 - asteroid.size <
        asteroid.position.x &&
      player.position.x + player.size.width / 2 > asteroid.position.x;

    const yCollision =
      player.position.y - player.size.height / 2 <
        asteroid.position.y + asteroid.size &&
      player.position.y > asteroid.position.y - player.size.height / 2;

    return xCollision && yCollision;
  }

  animate();

  function animate() {
    const animationId = window.requestAnimationFrame(animate);
    c.shadowBlur = 0;
    c.fillStyle = "black";
    c.fillRect(0, 0, window.innerWidth - 20, window.innerHeight - 20);

    player.update();

    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      asteroid.update();

      if (rectanglesCollision(player, asteroid)) {
        window.cancelAnimationFrame(animationId);
        window.clearInterval(intervalId);
        stopStopwatch();
        gameOver.style.display = "grid";
        console.log(bestscore);

        let currentBestScore = localStorage.getItem("bestScore");
        if (elapsedTime > currentBestScore) {
          localStorage.setItem("bestScore", elapsedTime);
          currentBestScore = elapsedTime;
        }

        let minutes = Math.floor(elapsedTime / (1000 * 60));
        let seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
        let milliseconds = elapsedTime % 1000;

        let formattedMinutes = padWithZero(minutes, 2);
        let formattedSeconds = padWithZero(seconds, 2);
        let formattedMilliseconds = padWithZero(milliseconds, 3);

        let time =
          formattedMinutes +
          ":" +
          formattedSeconds +
          ":" +
          formattedMilliseconds;

        minutes = Math.floor(currentBestScore / (1000 * 60));
        seconds = Math.floor((currentBestScore % (1000 * 60)) / 1000);
        milliseconds = currentBestScore % 1000;

        formattedMinutes = padWithZero(minutes, 2);
        formattedSeconds = padWithZero(seconds, 2);
        formattedMilliseconds = padWithZero(milliseconds, 3);

        currentBestScore =
          formattedMinutes +
          ":" +
          formattedSeconds +
          ":" +
          formattedMilliseconds;

        currentBestScore =
          bestscore.innerHTML = `Current best time: ${currentBestScore}`;
        currentscore.innerHTML = `Your time: ${time}`;
      }

      if (
        asteroid.position.x + asteroid.size < 0 ||
        asteroid.position.x - asteroid.size > canvas.width ||
        asteroid.position.y - asteroid.size > canvas.height ||
        asteroid.position.y + asteroid.size < 0
      ) {
        asteroids.splice(i, 1);
      }
    }

    if (keys.keyright.pressed) {
      if (player.velocity.x == 0) {
        player.velocity.x = 1;
      }
      if (player.velocity.x < 0) {
        player.velocity.x *= 0.75; //uspori ako ide u kotnra smjeru
      } else if (player.velocity.x < 4) {
        player.velocity.x *= 1.25; //akceleracija do 3
      }
      if (player.velocity.x > -0.5 && player.velocity.x < 0) {
        player.velocity.x = 0.9;
      }
    }

    if (keys.keyleft.pressed) {
      if (player.velocity.x == 0) {
        player.velocity.x = -1;
      }
      if (player.velocity.x > 0) {
        player.velocity.x *= 0.75; //uspori ako ide u kotnra smjeru
      } else if (player.velocity.x > -4) {
        player.velocity.x *= 1.25; //akceleracija do 3
      }
      if (player.velocity.x < 0.5 && player.velocity.x > 0) {
        player.velocity.x = -0.9;
      }
    }

    if (keys.keyup.pressed) {
      if (player.velocity.y == 0) {
        player.velocity.y = -1;
      }
      if (player.velocity.y > 0) {
        player.velocity.y *= 0.75; //uspori ako ide u kotnra smjeru
      } else if (player.velocity.y > -4) {
        player.velocity.y *= 1.25; //akceleracija do 3
      }
      if (player.velocity.y < 0.5 && player.velocity.y > 0) {
        player.velocity.y = -0.9;
      }
    }

    if (keys.keydown.pressed) {
      if (player.velocity.y == 0) {
        player.velocity.y = 1;
      }
      if (player.velocity.y < 0) {
        player.velocity.y *= 0.75; //uspori ako ide u kotnra smjeru
      } else if (player.velocity.y < 4) {
        player.velocity.y *= 1.25; //akceleracija do 3
      }
      if (player.velocity.y > -0.5 && player.velocity.y < 0) {
        player.velocity.y = 0.9;
      }
    }

    if (!keys.keydown.pressed && !keys.keyup.pressed) {
      player.velocity.y *= 0.95;
      if (player.velocity.y < 0.3 && player.velocity.y > -0.3) {
        player.velocity.y = 0;
      }
    }

    if (!keys.keyleft.pressed && !keys.keyright.pressed) {
      player.velocity.x *= 0.95;
      if (player.velocity.x < 0.3 && player.velocity.x > -0.3) {
        player.velocity.x = 0;
      }
    }
  }
}

window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowUp":
      keys.keyup.pressed = true;
      break;
    case "ArrowDown":
      keys.keydown.pressed = true;
      break;
    case "ArrowLeft":
      keys.keyleft.pressed = true;
      break;
    case "ArrowRight":
      keys.keyright.pressed = true;
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowUp":
      keys.keyup.pressed = false;
      break;
    case "ArrowDown":
      keys.keydown.pressed = false;
      break;
    case "ArrowLeft":
      keys.keyleft.pressed = false;
      break;
    case "ArrowRight":
      keys.keyright.pressed = false;
      break;
  }
});

function startStopwatch() {
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now() - elapsedTime;
    updateStopwatch();
  }
}

function stopStopwatch() {
  if (isRunning) {
    isRunning = false;
    elapsedTime = Date.now() - startTime;
  }
}

function resetStopwatch() {
  isRunning = false;
  elapsedTime = 0;
  updateStopwatch();
}

function updateStopwatch() {
  stopwatchContext.clearRect(0, 0, canvas.width, canvas.height);

  if (isRunning) {
    elapsedTime = Date.now() - startTime;
    requestAnimationFrame(updateStopwatch);
  }

  const minutes = Math.floor(elapsedTime / (1000 * 60));
  const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
  const milliseconds = elapsedTime % 1000;

  const formattedMinutes = padWithZero(minutes, 2);
  const formattedSeconds = padWithZero(seconds, 2);
  const formattedMilliseconds = padWithZero(milliseconds, 3);

  stopwatchContext.fillStyle = "white";
  stopwatchContext.font = "30px Arial";
  stopwatchContext.textAlign = "center";
  stopwatchContext.fillText(
    `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`,
    stopwatchCanvas.width / 2,
    stopwatchCanvas.height / 2
  );
}

function padWithZero(number, length) {
  let str = number.toString();
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}
