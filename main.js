const canvas = document.getElementById("gameArea");
const ctx = canvas.getContext("2d");

const livesbar = document.getElementById("lives");
const scorebar = document.getElementById("score");
const startPage = document.querySelector(".startPage");
const startBtn = document.getElementById("startGame");
const gameOverPage = document.querySelector(".gameOver");
const instruction = document.getElementById("text");
const restart = document.getElementById("restart");
const right = document.getElementById("right");
const left = document.getElementById("left");
const down = document.getElementById("down");
const up = document.getElementById("up");

//? sounds
const music = new Audio("music/bg.mp3");
const dotEat = new Audio("music/pacdotEating.mp3");
const ghostEating = new Audio("music/ghostEating.mp3");
const ghostChange = new Audio("music/scaredGhost.mp3");
const loss = new Audio("music/gameover.mp3");
music.loop = "true";
music.volume = 0.6;
dotEat.volume = 0.8;
ghostChange.loop = "true";

//? variables
let wallArray = [];
let pacdotArray = [];
let powerDotArray = [];
let voidArray = [];
let ghostArray = [];
let animation;
let tileSize;
let pacman;
let lives = ['❤️','❤️','❤️'];
let score = 0;
let speed = 0;
let keyPressed;

//? pacman map
const map = [
    ['+','-','-','-','-','-','-','-','-','-','?','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','?','-','-','-','-','-','-','-','-','-','-','-','/'],
    ['|','5','0','0','0','0','0','0','0','0','|','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','|','0','0','0','0','0','0','0','0','0','0','5','|'],
    ['|','0','[',']','0','[','-','-',']','0','v','0','[','-','-','-','-','/','0','=','0','+','-','-',']','0','v','0','[','-','-',']','0','[','-','-',']','0','|'],
    ['|','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','|','0','0','0','|','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','|'],
    ['*','-','-','/','0','+','-',']','0','+','-','/','0','+','-',']','0','*','-','-','-','%','0','+','-',']','0','+','-',']','0','+','-','/','0','+','-','-','%'],
    ['2','2','2','|','0','|','1','1','0','|','2','|','0','|','1','1','3','2','2','2','2','2','9','|','1','1','0','|','1','1','0','|','2','|','0','|','2','2','2'],
    ['[','-','-','%','0','*','-','/','0','{','-','}','0','{','-',']','0','+',']','2','[','/','0','{','-',']','0','{','-',']','0','{','-','%','0','*','-','-',']'],
    ['2','2','2','2','0','1','1','|','0','|','1','|','0','|','0','0','0','|','6','2','12','|','0','|','1','1','0','|','1','1','0','|',',','1','0','2','2','2','2'],
    ['[','-','-','/','0','[','-','%','0','v','1','v','0','v','0','^','0','*','-','-','-','%','0','*','-',']','0','*','-',']','0','v','1','=','0','+','-','-',']'],
    ['2','2','2','|','0','0','0','0','0','0','0','0','0','0','0','|','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','|','2','2','2'],
    ['+','-','-','%','0','[','-','?','-','-','-',']','0','^','0','*','-','-','/','0','[','-','-','-','-','-',']','0','+','-','-','-','-',']','0','*','-','-','/'],
    ['|','0','0','0','0','0','0','|','0','0','0','0','0','|','0','0','0','0','|','0','0','0','0','0','0','4','0','0','|','0','0','0','0','0','0','0','0','0','|'],
    ['|','0','[','-','-',']','0','v','0','[','-','/','0','*','-','-',']','0','v','0','^','0','[','-','-','-','-','-','%','0','[','-','-','-','-','-',']','0','|'],
    ['|','5','0','0','0','0','0','0','0','0','0','|','0','0','0','0','0','0','0','0','|','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','5','|'],
    ['*','-','-','-','-','-','-','-','-','-','-',':','-','-','-','-','-','-','-','-',':','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','%']
];

//? creating images for map
function createImage(src) {
    const image = new Image();
    image.src = src;
    return image;
}

//? setting the size of map
function canvasArea() {
    if (window.innerWidth < 800) {
        canvas.width = Math.floor(window.innerWidth - 20);
        tileSize = Math.floor((window.innerWidth - 20) / map[0].length);
    } else {
        canvas.width = Math.floor(window.innerWidth - 300);
        tileSize = Math.floor(canvas.width / map[0].length);
    }
    canvas.height = tileSize * map.length;
    init();
    pacmanAndGhosts();
}

//? creating boundary
function Wall(x, y, side, image) {
    this.x = x;
    this.y = y;
    this.side = side;
    this.image = image;

    this.drawBoundary = function () {
        ctx.drawImage(this.image, this.x , this.y, this.side, this.side);
    };
}

//? creating pacdots
function Pacdot(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    this.drawPacdot = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.closePath();
    }
}

//? creating power dots
function Powerdot(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.frames = 0;

    this.drawPowerdot = function () {
        if (this.frames >= 5) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius*0.2, 0, Math.PI * 2, false);
            ctx.fillStyle = "yellow";
            ctx.fill();
            ctx.closePath();
        }
        else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.3, 0, Math.PI * 2, false);
            ctx.fillStyle = "hotpink";
            ctx.fill();
            ctx.closePath();
        }
    }

    this.updatePowerdot = function () {
        this.drawPowerdot();
        this.frames++;
        if (this.frames === 10) { this.frames = 0; }
    }
}

//? creating pacman
function Pacman(x, y, side, {image}) {
    this.x = x;
    this.y = y;
    this.side = side;
    this.image = image;
    this.velocity = {
        x: 0,
        y: 0
    };
    this.frames = 0;
    this.key = "right";

    this.drawPacman = function () {
        if (this.key === "right") { ctx.drawImage(this.image.right, 32 * this.frames, 0, 32, 32, this.x, this.y, this.side, this.side) }
        else if (this.key === "left") { ctx.drawImage(this.image.left, 32 * this.frames, 0, 32, 32, this.x, this.y, this.side, this.side) }
        else if (this.key === "down") { ctx.drawImage(this.image.down, 32 * this.frames, 0, 32, 32, this.x, this.y, this.side, this.side) }
        else if (this.key === "up") { ctx.drawImage(this.image.up, 32 * this.frames, 0, 32, 32, this.x, this.y, this.side, this.side) }
    };

    this.updatePacman = function () {
        this.drawPacman();

        if (this.frames > 15) { this.frames = 0; }
        else if (this.velocity.x === 0 && this.velocity.y === 0) { this.frames = 5 }
        else { this.frames++; }

        if(this.x+this.side/2 >= tileSize*map[0].length){
            this.x = -this.side/2;
        }else if(this.x + this.side/2 < 0){
            this.x = tileSize*map[0].length - this.side/2;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;
    };
}

//? creating ghosts
function Ghosts(x,y,side,{velocity},{image}){
    this.x = x;
    this.y = y;
    this.side = side;
    this.image = image;
    this.velocity = velocity;
    this.ghostFrames = 0;
    this.counter = 0;
    this.scared = false;

    this.drawGhosts = function() {
        if(this.scared){ctx.drawImage(this.image.scared, 30*this.ghostFrames, 0, 30, 30, this.x, this.y, this.side, this.side)}
        else if(this.velocity.x === -speed){ctx.drawImage(this.image.left, 30*this.ghostFrames, 0, 30, 30, this.x, this.y, this.side, this.side)}
        else if(this.velocity.y === -speed){ctx.drawImage(this.image.top, 30*this.ghostFrames, 0, 30, 30, this.x, this.y, this.side, this.side)}
        else if(this.velocity.y === speed){ctx.drawImage(this.image.bottom, 30*this.ghostFrames, 0, 30, 30, this.x, this.y, this.side, this.side)}
        else{ctx.drawImage(this.image.right, 30*this.ghostFrames, 0, 30, 30, this.x, this.y, this.side, this.side)}
    };

    this.updateGhosts = function() {
        this.drawGhosts();
        
        if(this.counter%5 === 0){this.ghostFrames++;}
        if(this.ghostFrames === 15){
            this.ghostFrames = 0;
            this.counter = 0;
        }
        this.counter++;  
        
        if(this.x+this.side/2 >= tileSize*map[0].length){
            this.x = -this.side/2;
        }else if(this.x + this.side/2 < 0){
            this.x = tileSize*map[0].length - this.side/2;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;
    };
}

function Void(x,y,side){
    this.x = x;
    this.y = y;
    this.side = side;

    this.drawVoid = function () {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.side, this.side);
    }
}

function init() {
    wallArray = [];
    pacdotArray = [];
    powerDotArray = [];
    let radius = tileSize / 2;
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            switch (map[i][j]) {
                case '-':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/horizontal-pipe.png')));
                    break;

                case '|':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/vertical-pipe.png')));
                    break;

                case '+':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/top-left-corner-pipe.png')));
                    break;

                case '*':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/bottom-left-corner-pipe.png')));
                    break;
                    
                case '/':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/top-right-corner-pipe.png')));
                    break;

                case '%':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/bottom-right-corner-pipe.png')));
                    break;

                case '[':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/left-end-pipe.png')));
                    break;

                case ']':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/right-end-pipe.png')));
                    break;

                case '^':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/top-end-pipe.png')));
                    break;

                case 'v':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/bottom-end-pipe.png')));
                    break;

                case '{':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/left-three-joint-pipe.png')));
                    break;

                case '}':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/right-three-joint-pipe.png')));
                    break;

                case ':':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/bottom-three-joint-pipe.png')));
                    break;

                case '?':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/top-three-joint-pipe.png')));
                    break;

                case '=':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/box-pipe.png')));
                    break;

                case ',':
                    wallArray.push(new Wall(tileSize * j, tileSize * i, tileSize, createImage('images/l-joint-pipe.png')));
                    break;

                case '0':
                    pacdotArray.push(new Pacdot(
                        (tileSize * j) + radius,
                        (tileSize * i) + radius,
                        radius * 0.2
                    ));
                    break;

                case '1':
                    voidArray.push(new Void(
                        (tileSize * j),
                        (tileSize * i),
                        tileSize
                    ));
                    break;

                case '5':
                    powerDotArray.push(new Powerdot(
                        (tileSize * j) + radius,
                        (tileSize * i) + radius,
                        radius 
                    ));
                    break;

                default:
                    break;
            }
        }
    }
}

function pacmanAndGhosts(){
    ghostArray = [];
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            switch (map[i][j]) {
                case '3':
                    ghostArray.push(new Ghosts(
                        tileSize * j + (tileSize * 0.05), tileSize * i + (tileSize * 0.05), tileSize * 0.9,
                        {velocity: {x:-speed,y:0}},
                        {image: {
                            scared:createImage('images/scaredGhost.png'),
                            left:createImage('images/ghost layer red left.png'),
                            right:createImage('images/ghost layer red right.png'),
                            top:createImage('images/ghost layer red up.png'),
                            bottom:createImage('images/ghost layer red down.png')
                        }}
                    ))
                    break;

                case '6':
                    ghostArray.push(new Ghosts(
                        tileSize * j + (tileSize * 0.05), tileSize * i + (tileSize * 0.05), tileSize * 0.9,
                        {velocity: {x:speed,y:0}},
                        {image: {
                            scared:createImage('images/scaredGhost.png'),
                            left:createImage('images/ghost layer pink left.png'),
                            right:createImage('images/ghost layer pink right.png'),
                            top:createImage('images/ghost layer pink up.png'),
                            bottom:createImage('images/ghost layer pink down.png')
                        }}
                    ))
                    break;

                case '9':
                    ghostArray.push(new Ghosts(
                        tileSize * j + (tileSize * 0.05), tileSize * i + (tileSize * 0.05), tileSize * 0.9,
                        {velocity: {x:speed,y:0}},
                        {image: {
                            scared:createImage('images/scaredGhost.png'),
                            left:createImage('images/ghost layer yellow left.png'),
                            right:createImage('images/ghost layer yellow right.png'),
                            top:createImage('images/ghost layer yellow up.png'),
                            bottom:createImage('images/ghost layer yellow down.png')
                        }}
                    ))
                    break;

                case '12':
                    ghostArray.push(new Ghosts(
                        tileSize * j + (tileSize * 0.05), tileSize * i + (tileSize * 0.05), tileSize * 0.9,
                        {velocity: {x:-speed,y:0}},
                        {image: {
                            scared:createImage('images/scaredGhost.png'),
                            left:createImage('images/ghost layer blue left.png'),
                            right:createImage('images/ghost layer blue right.png'),
                            top:createImage('images/ghost layer blue up.png'),
                            bottom:createImage('images/ghost layer blue down.png')
                        }}
                    ))
                    break;

                case '4':
                    pacman = new Pacman(tileSize * j + (tileSize * 0.05), tileSize * i + (tileSize * 0.05), tileSize * 0.9,
                        {image:{
                            right:createImage('images/pacmanRight.png'),
                            left:createImage('images/pacmanLeft.png'),
                            up:createImage('images/pacmanUp.png'),
                            down:createImage('images/pacmanDown.png')
                        }}        
                    
                    );
                    break;
                
                default:
                    break;
            }
        }
    }
}

function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

//? detecting collision of pacman/ghosts with walls
function objectWallCollision(object, wall, speedX, speedY) {
    return ((object.x + speedX <= wall.x + wall.side) && (object.x + object.side + speedX >= wall.x) && (object.y + object.side + speedY >= wall.y) && (object.y + speedY <= wall.y + wall.side));
}

//? checking pacman sides collisions
function sideChecker(a, b) {
    for (let i = 0; i < wallArray.length; i++) {
        if ((pacman.x + a <= wallArray[i].x + wallArray[i].side) && (pacman.x + pacman.side + a >= wallArray[i].x) && (pacman.y + pacman.side + b >= wallArray[i].y) && (pacman.y + b <= wallArray[i].y + wallArray[i].side)) {
            return true;
        }
    }
    return false;
}

//? checking ghosts paths
function pathChecker(collisions){
    if(collisions.length === 2){
        if((collisions[0] === 'up' && collisions[1] === 'down') || (collisions[0] === 'down' && collisions[1] === 'up') || (collisions[0] === 'left' && collisions[1] === 'right') || (collisions[0] === 'right' && collisions[1] === 'left')){
            return false;
        }
        else{
            return true;
        }
    }
    else{
        return true;
    }
}

//? main function
function gameEngine() {
    animation = window.requestAnimationFrame(gameEngine);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    //? checking loss/Win condition
    if(lives.length === 0){
        window.cancelAnimationFrame(animation);
        gameOverPage.style.visibility = "visible";
        instruction.innerHTML = "GAME OVER";
    }
    else if(pacdotArray.length === 0 && powerDotArray.length === 0){
        window.cancelAnimationFrame(animation);
        gameOverPage.style.visibility = "visible";
        instruction.innerHTML = "YOU WIN";
    }

    switch (keyPressed) {
        case "ArrowUp":
            if (sideChecker(0, -speed)) { break; }
            pacman.velocity.x = 0;
            pacman.velocity.y = -speed;
            pacman.key = "up";
            break;

        case "ArrowLeft":
            if (sideChecker(-speed, 0)) { break; }
            pacman.velocity.x = -speed;
            pacman.velocity.y = 0;
            pacman.key = "left";
            break;

        case "ArrowRight":
            if (sideChecker(speed, 0)) { break; }
            pacman.velocity.x = speed;
            pacman.velocity.y = 0;
            pacman.key = "right";
            break;

        case "ArrowDown":
            if (sideChecker(0, speed)) { break; }
            pacman.velocity.x = 0;
            pacman.velocity.y = speed;
            pacman.key = "down";
            break;

        default:
            break;
    }

    voidArray.forEach((v) => {
        v.drawVoid();
    })

    wallArray.forEach((e) => {
        e.drawBoundary();

        if (objectWallCollision(pacman, e, pacman.velocity.x, pacman.velocity.y)) {
            pacman.velocity.x = 0;
            pacman.velocity.y = 0;
        }
    });

    for(let i = pacdotArray.length-1; i>=0; i--){
        pacdotArray[i].drawPacdot();
        if (getDistance(pacdotArray[i].x, pacdotArray[i].y, pacman.x + (pacman.side / 2), pacman.y + (pacman.side / 2)) <= pacdotArray[i].radius+(pacman.side/2)) {
            pacdotArray.splice(i, 1);
            score += 5;
            scorebar.innerHTML = score;
            dotEat.play();
            setTimeout(() => {
                dotEat.currentTime = "0";
            }, 25);
        }
    }

    for(let i = powerDotArray.length-1; i >= 0; i--){
        powerDotArray[i].updatePowerdot();
        if (getDistance(powerDotArray[i].x, powerDotArray[i].y, pacman.x + (pacman.side / 2), pacman.y + (pacman.side / 2)) <= powerDotArray[i].radius+(pacman.side/2)) {
            powerDotArray.splice(i, 1);
            score += 50;
            scorebar.innerHTML = score;
            music.volume = "0.3";
            ghostChange.play();
            ghostArray.forEach((g) =>{
                g.scared = true;
                setTimeout(() => {
                    g.scared = false;
                    ghostChange.pause();
                    music.volume = "0.6";
                }, 7000);
            })
        }
    }

    pacman.updatePacman();

    ghostArray.forEach((ghost) => {
        ghost.updateGhosts();

        //? checking ghosts collision with pacman
        if(!ghost.scared && getDistance(ghost.x + (ghost.side/2), ghost.y + (ghost.side/2), pacman.x + (pacman.side / 2), pacman.y + (pacman.side / 2)) <= tileSize/2){
            window.cancelAnimationFrame(animation);
            lives.splice(lives.length-1, 1);
            livesbar.innerHTML = lives;
            music.pause();
            music.currentTime = "0";
            setTimeout(() => {
                ghostArray = [];
                speed = 0;
                loss.play();
                gameEngine();
                setTimeout(() => {
                    pacmanAndGhosts();
                    music.play();
                }, 3500);
                setTimeout(() => {
                    speed = canvas.width/(6.5*60);
                }, 7000);
            }, 500);
        }
        else if(ghost.scared && getDistance(ghost.x + (ghost.side/2), ghost.y + (ghost.side/2), pacman.x + (pacman.side / 2), pacman.y + (pacman.side / 2)) <= tileSize/1.5){
            score += 200;
            scorebar.innerHTML = score;
            window.cancelAnimationFrame(animation);
            ghost.velocity.x = 0;
            ghost.velocity.y = 0;
            ghost.scared = false;
            music.pause();
            ghostChange.pause();
            ghostEating.play();
            setTimeout(() => {
                ghost.x = tileSize*18;
                ghost.y = tileSize*7;
                ghostChange.play();
                music.play();
                gameEngine();
            }, 500);
            setTimeout(() => {
                ghost.velocity.x = speed;
            }, 3000);
        }

        //? adding movement in ghosts
        const collisions = [];
        wallArray.forEach((wall) => {
            if(!collisions.includes('right') && objectWallCollision(ghost, wall, speed, 0)){
                collisions.push('right');
            }
            if(!collisions.includes('left') && objectWallCollision(ghost, wall, -speed, 0)){
                collisions.push('left');
            }
            if(!collisions.includes('up') && objectWallCollision(ghost, wall, 0, -speed)){
                collisions.push('up');
            }
            if(!collisions.includes('down') && objectWallCollision(ghost, wall, 0, speed)){
                collisions.push('down');
            }
        })
        voidArray.forEach((v) => {
            if(!collisions.includes('right') && objectWallCollision(ghost, v, speed, 0)){
                collisions.push('right');
            }
            if(!collisions.includes('left') && objectWallCollision(ghost, v, -speed, 0)){
                collisions.push('left');
            }
            if(!collisions.includes('up') && objectWallCollision(ghost, v, 0, -speed)){
                collisions.push('up');
            }
            if(!collisions.includes('down') && objectWallCollision(ghost, v, 0, speed)){
                collisions.push('down');
            }
        })
        
        if(pathChecker(collisions)){
            const ways = ['left','right','up','down']

            const pathways = ways.filter((w) => {
                return !collisions.includes(w);
            })
            
            const direction = pathways[Math.floor(Math.random() * pathways.length)];
        
            switch (direction) {
                case 'right':
                    ghost.velocity.x = speed;
                    ghost.velocity.y = 0;
                    break;

                case 'left':
                    ghost.velocity.x = -speed;
                    ghost.velocity.y = 0;
                    break;

                case 'up':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = -speed;
                    break;

                case 'down':
                    ghost.velocity.x = 0;
                    ghost.velocity.y = speed;
                    break;
            }
        }
    })
}

window.addEventListener("resize", () => { canvasArea(); });
canvasArea();
gameEngine();

startBtn.addEventListener('click', () => {
    music.play();
    startPage.style.visibility = "hidden";
    setTimeout(() => {
        speed = canvas.width/(6.5*60);
    }, 5000);
})

restart.addEventListener('click', () => {
    music.currentTime = "0";
    music.play();
    canvasArea();
    gameOverPage.style.visibility = "hidden";
    lives = ['❤️','❤️','❤️'];
    score = 0;
    gameEngine();
    livesbar.innerHTML = lives;
    scorebar.innerHTML = score;
    setTimeout(() => {
        speed = canvas.width/(6.5*60);
    }, 5000);
})

window.addEventListener('keydown', ({ key }) => {
    keyPressed = key;
})

left.addEventListener('touchstart', () => {
    keyPressed = "ArrowLeft";
})
right.addEventListener('touchstart', () => {
    keyPressed = "ArrowRight";
})
up.addEventListener('touchstart', () => {
    keyPressed = "ArrowUp";
})
down.addEventListener('touchstart', () => {
    keyPressed = "ArrowDown";
})