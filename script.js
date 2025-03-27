window.onload = function() {
  // Canvas setup
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", () => {
    // For simplicity, restart the game on resize.
    resetGame();
    resizeCanvas();
  });
  
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  let frames = 0;
  let gameSpeed = 1;
  let gravity = 0.15;
  let gameOver = false;

  // Load images
  const backgroundImg = new Image();
  backgroundImg.src = "assets/background.png";

  const birdImg = new Image();
  birdImg.src = "assets/ghibli_bird.png";

  const pipeNorthImg = new Image();
  pipeNorthImg.src = "assets/pipe_top.png";

  const pipeSouthImg = new Image();
  pipeSouthImg.src = "assets/pipe_bottom.png";

  // Bird object definition
  const bird = {
    x: 50,
    y: 150,
    width: 67,
    height: 69.8,
    velocity: 0,
    jump: 4.6,
    draw: function() {
      ctx.drawImage(birdImg, this.x, this.y, this.width, this.height);
    },
    update: function() {
      this.velocity += gravity;
      this.y += this.velocity;
      // Check if the bird hits the bottom of the canvas
      if (this.y + this.height >= canvasHeight) {
        gameOver = true;
      }
    },
    flap: function() {
      this.velocity = -this.jump;
    }
  };

  // Pipe constructor (each pipe pair is one object)
  function Pipe() {
    this.gap = canvasHeight/3; // vertical gap between top and bottom pipes
    this.top = Math.random() * (canvasHeight / 2);
    this.bottom = canvasHeight - (this.top + this.gap);
    this.x = canvasWidth;
    this.width = 50;
    this.speed = gameSpeed;
    this.passed = false;
    
    this.draw = function() {
      // Draw top pipe
      ctx.drawImage(pipeNorthImg, this.x, 0, this.width, this.top);
      // Draw bottom pipe
      ctx.drawImage(pipeSouthImg, this.x, canvasHeight - this.bottom, this.width, this.bottom);
    };

    this.update = function() {
      this.x -= this.speed;
    };
  }

  let pipes = [];
  let pipeInterval = canvasWidth / 3; // new pipe every 90 frames
  let score = 0;

  // Event listeners for controls
  document.addEventListener("keydown", function(e) {
    if (e.code === "Space" || e.key === " ") {
      bird.flap();
      if (gameOver) {
        resetGame();
      }
    }
  });

  canvas.addEventListener("click", function() {
    bird.flap();
    if (gameOver) {
      resetGame();
    }
  });

  canvas.addEventListener("touchstart", function() {
    bird.flap();
    if (gameOver) {
      resetGame();
    }
  });

  // Reset the game state
  function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    frames = 0;
    score = 0;
    gameOver = false;
    draw();
  }

  // Collision detection between bird and pipes
  function checkCollision(pipe) {
    // Check horizontal collision and vertical overlap with top or bottom pipe
    if (bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > canvasHeight - pipe.bottom)) {
      return true;
    }
    return false;
  }

  // Main game loop
  function draw() {
    // Draw the background
    ctx.drawImage(backgroundImg, 0, 0, canvasWidth, canvasHeight);

    // Create new pipes at regular intervals
    if (frames % pipeInterval === 0) {
      pipes.push(new Pipe());
    }

    // Loop through pipes to draw, update, and check collisions
    for (let i = 0; i < pipes.length; i++) {
      let pipe = pipes[i];
      pipe.draw();
      pipe.update();

      // Collision check
      if (checkCollision(pipe)) {
        gameOver = true;
      }

      // Score update: bird passed the pipe if its right side is behind the bird
      if (!pipe.passed && pipe.x + pipe.width < bird.x) {
        pipe.passed = true;
        score++;
      }
    }

    // Remove pipes that have gone off-screen
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    // Update and draw the bird
    bird.update();
    bird.draw();

    // Draw the score
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 25);

    // Game over screen
    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#FFF";
      ctx.font = "40px Arial";
      ctx.fillText("Game Over", canvasWidth / 2 - 100, canvasHeight / 2);
      ctx.font = "20px Arial";
      ctx.fillText("Press Space or Click to Restart", canvasWidth / 2 - 140, canvasHeight / 2 + 40);
      return;
    }

    frames++;
    requestAnimationFrame(draw);
  }

  // Start the game loop
  draw();
};
