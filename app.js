let bird, cursors, road, scoreText, gameStarted = false, gameOver = false;
let columnGroup;
let score = 0;

document.getElementById('start-btn').addEventListener('click', () => {
  game = new Phaser.Game(config);
  document.getElementById('start-btn').style.display = 'none';
});

document.getElementById('restart-btn').addEventListener('click', () => {
  game.destroy(true);
  document.getElementById('restart-btn').style.display = 'none';
  document.getElementById('start-btn').style.display = 'block';
  score = 0;
  gameStarted = false;
  gameOver = false;
});

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

function preload() {
  this.load.image("background", "assets/background.png");
  this.load.image("road", "assets/road.png");
  this.load.image("column", "assets/column.png");
  this.load.spritesheet("bird", "assets/bird.png", {
    frameWidth: 64,
    frameHeight: 96,
  });
}

function create() {
  this.add.image(0, 0, "background").setOrigin(0).setDisplaySize(config.width, config.height);

  const road = this.physics.add.staticImage(config.width / 2, config.height - 20, 'road').setScale(2).refreshBody();

  bird = this.physics.add.sprite(150, config.height / 2, 'bird').setScale(1.5).setCollideWorldBounds(true);
  bird.body.setAllowGravity(false);

  cursors = this.input.keyboard.createCursorKeys();

  this.input.on('pointerdown', flap, this);
  this.input.keyboard.on('keydown-SPACE', flap, this);
  this.input.keyboard.on('keydown-UP', flap, this);

  columnGroup = this.physics.add.group();

  this.time.addEvent({
    delay: 1500,
    callback: spawnColumns,
    callbackScope: this,
    loop: true
  });

  this.physics.add.collider(bird, columnGroup, () => endGame(this), null, this);
  this.physics.add.collider(bird, road, () => endGame(this), null, this);

  scoreText = this.add.text(20, 20, "Score: 0", {
    fontSize: '24px',
    fill: '#fff',
    backgroundColor: '#000',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  if (!gameStarted || gameOver) return;

  columnGroup.getChildren().forEach((column) => {
    column.x -= 2;

    if (!column.scored && column.isScoringPipe && column.x + column.width < bird.x) {
      column.scored = true;
      score++;
      scoreText.setText("Score: " + score);
    }

    if (column.x < -column.width) {
      column.destroy();
    }
  });
}

function flap() {
  if (gameOver) return;

  if (!gameStarted) {
    bird.body.setAllowGravity(true);
    gameStarted = true;
  }

  bird.setVelocityY(-350);
}

function spawnColumns() {
  if (!gameStarted || gameOver) return;

  const gapHeight = 100; // 👈 Change this to increase/decrease the gap
  const pipeWidth = 80;

  // Calculate a safe vertical position for the gap
  const minGapY = 100;
  const maxGapY = config.height - 100 - gapHeight;
  const gapY = Phaser.Math.Between(minGapY, maxGapY);

  // Create and flip the top pipe so it points down
  const topPipe = columnGroup.create(config.width + pipeWidth, gapY, 'column');
  topPipe.setOrigin(0.5, 1)
         .setFlipY(true)
         .setImmovable(true)
         .setDepth(1)
         .refreshBody();
  topPipe.body.allowGravity = false;
  topPipe.isScoringPipe = true;

  // Create the bottom pipe to start after the gap
  const bottomPipe = columnGroup.create(config.width + pipeWidth, gapY + gapHeight, 'column');
  bottomPipe.setOrigin(0.5, 0)
            .setImmovable(true)
            .setDepth(1)
            .refreshBody();
  bottomPipe.body.allowGravity = false;
  bottomPipe.isScoringPipe = false;
}
