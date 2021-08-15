// console.log(gsap);

//Initializing the variables
const friction = 0.99;
const canvas = document.getElementById('myCanvas');
const context = canvas.getContext("2d");
const score = document.getElementById('score');
const start = document.getElementById('startGame');
const game = document.getElementById('game');
const final = document.getElementById('final_Score');
const sound = document.getElementById('sound')
const bg = document.getElementById('bg')
const end = document.getElementById('end')
const rules = document.getElementById('rules')
const content = document.getElementById('rules-content');
const end_audio = new Audio("sounds/end.mpeg");
const hit = new Audio("sounds/hit.mp3");
let animation;

//Canvas dimension
canvas.width = innerWidth;
canvas.height = innerHeight;

//Player class
class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
    }
}

//Initializing player variable
let player = new Player(
    canvas.width / 2,
    canvas.height / 2 - 25,
    25,
    'white'
);

//Initializing arrays
let projectiles = [];
let enemies = [];
let particles = [];
let score_count = 0;

//Projectile class(for the balls used to kill the enemies)
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
    }
    change() {
        // console.log('change');
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

//Opponent class(for the enemies which attack)
class Opponent {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
    }
    change() {
        // console.log('change');
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

//Particle class(for the enemies being destroyed in parts)
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        context.save();
        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.restore();
    }
    change() {
        // console.log('change');
        this.draw();
        this.velocity.x = this.velocity.x * friction;
        this.velocity.y = this.velocity.y * friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01
    }
}

// const projectile = new Projectile(canvas.width / 2, canvas.height / 2-25, 5, 'blue', { x: 1, y: 1 })
// const projectiles = [projectile];

//For replaying the game
function init() {
    player = new Player(canvas.width / 2, canvas.height / 2 - 25, 25, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score_count = 0;
    score.innerHTML = score_count;
    final.innerHTML = score_count;
    content.style.display = "none";
}

// function random_color() {
//     var a = Math.floor(Math.random() * 256);
//     var b = Math.floor(Math.random() * 256);
//     var c = Math.floor(Math.random() * 256);
//     var bgColor = "rgb(" + a + "," + b + "," + c + ")";
//     console.log(bgColor);
// }

function opponent() {
    setInterval(() => {
        //console.log('opponent')
        //For only opponents to come randomly from anywhere with same radius
        // const x = Math.random() * canvas.width;
        // const y = Math.random() * canvas.height;

        //For opponents to come randomly from anywhere with different radius
        let radius = Math.random() * (40 - 10) + 10; //means 10 to 40 value of  r
        let x, y;

        //For opponents to come from corners
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        // let a = Math.random * 256;
        // let b = Math.random * 256;
        // let c = Math.random * 256;
        // const color = 'rgb(${Math.random() * 256},${Math.random() * 360}va,b,c)'; Gives only white

        const color = `hsl(${Math.random() * 360},50%,50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
        const velocity = { x: Math.cos(angle), y: Math.sin(angle) };
        enemies.push(new Opponent(x, y, radius, color, velocity));
    }, 1000)
}

//Animation-Splitting of opponent into particles on being shot

function animate() {
    // console.log('Animation');
    animation = requestAnimationFrame(animate);
    context.fillStyle = 'rgba(0,0,0,.08)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.change();
        }
    });

    // console.log(player);
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.change();
        if (projectile.x - projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1);
            }, 0)
        }
    })
    enemies.forEach((enemy, index) => {
        enemy.change();
        //To avoid flash after hitting
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        //End of game
        if (dist - enemy.radius - player.radius < .01) {
            console.log('end game')
            end_audio.play();
            cancelAnimationFrame(animation);
            game.style.display = 'flex';
            final.innerHTML = score_count;
            // background.pause();
            // background.currentTime = 0;
            content.style.display = "none";
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if (distance - enemy.radius - projectile.radius < 1) {
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, { x: (Math.random() - 0.5) * (Math.random() * 5), y: (Math.random() - 0.5) * (Math.random() * 5) }))
                }
                if (enemy.radius - 15 > 5) {
                    console.log('hit')
                    score_count += Math.floor(enemy.radius);
                    score.innerHTML = score_count;
                    gsap.to(enemy, {
                        radius: enemy.radius - 15
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0)
                    hit.play();
                } else {
                    setTimeout(() => {
                        score_count += Math.floor(2.5 * enemy.radius);
                        score.innerHTML = score_count;
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                        hit.play();
                    }, 0)
                }
            }
        })
    })
}


addEventListener('click', function(e) {
    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);
    const velocity = { x: Math.cos(angle) * 3, y: Math.sin(angle) * 3 };
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2 - 25, 8, 'white', velocity))
});

//When clicked on 'start game' button
start.addEventListener('click', () => {
    console.log('start');
    init();
    animate();
    opponent();
    i = 1;
    end_audio.pause();
    end_audio.currentTime = 0;
    game.style.display = 'none';
    content.style.display = 'none';
})

//For rules 
rules.addEventListener('click', function(e) {
    content.style.display = 'block';
});
content.addEventListener('click', function(e) {
    content.style.display = 'none';
});

//Background music
// var background = new Audio('sounds/bg_music.mpeg')
// if (typeof background.loop == 'boolean') {
//     background.loop = true;
// } else {
//     background.addEventListener('ended', function() {
//         this.currentTime = 0;
//         this.play();
//     }, false);
// }
// function playAudio() {
//     console.log('play');
//     background.play();
//     end_audio.pause();
// }
