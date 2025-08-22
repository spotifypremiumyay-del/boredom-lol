// Game variables
let balloons = [];
let scr = 0;
let targetScore = 20; // Changed to 20 balloons
let animProp = { animate: false };
let health = 5;
let ctx;
let canvasWidth;
let canvasHeight;
let spawnRate = 1500;
let spawnRateOfDescent = 2;
let lastSpawn = -1;

// Gift box variables
let merrywrap;
let box;
let step = 1;
let stepMinutes = [2000, 2000, 1000, 1000];

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize gift box
    initGiftBox();
    // Initialize snowfall
    initSnowfall();
});

// Gift box functionality
function initGiftBox() {
    merrywrap = document.getElementById("merrywrap");
    box = merrywrap.getElementsByClassName("giftbox")[0];
    
    if (box) {
        console.log("Gift box found, adding click listener");
        box.addEventListener("click", openBox, false);
        
        // Also add hover effect for better UX
        box.addEventListener("mouseenter", function() {
            box.style.transform = "scale(1.05)";
        });
        
        box.addEventListener("mouseleave", function() {
            box.style.transform = "scale(1)";
        });
    } else {
        console.error("Gift box element not found!");
    }
}

function stepClass(step) {
    merrywrap.className = 'merrywrap';
    merrywrap.className = 'merrywrap step-' + step;
}

function openBox() {
    console.log("Gift box clicked! Current step:", step);
    
    if (step === 1) {
        box.removeEventListener("click", openBox, false); 
    }  
    stepClass(step); 
    
    if (step === 2) { 
        // Launch confetti when gift opens and show game after animation
        console.log("Launching confetti and preparing game at step 2");
        launchConfetti();
        
        // Show game screen after the box animation completes
        setTimeout(() => {
            document.getElementById('merrywrap').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            initializeGame();
        }, 1000);
        return;
    }     
    
    setTimeout(openBox, stepMinutes[step - 1]);
    step++;  
}

// Snowfall effect
function initSnowfall() {
    const canvas = document.getElementById('snowfall');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const snowflakes = [];
    const numberOfSnowflakes = 100;
    
    // Create snowflakes
    for (let i = 0; i < numberOfSnowflakes; i++) {
        snowflakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 4 + 1,
            speed: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.3
        });
    }
    
    function animateSnowfall() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        snowflakes.forEach(flake => {
            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            ctx.fill();
            
            // Move snowflake
            flake.y += flake.speed;
            flake.x += Math.sin(flake.y * 0.01) * 0.5;
            
            // Reset snowflake when it goes off screen
            if (flake.y > canvas.height) {
                flake.y = -10;
                flake.x = Math.random() * canvas.width;
            }
        });
        
        requestAnimationFrame(animateSnowfall);
    }
    
    animateSnowfall();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Initialize game after gift is opened
function initializeGame() {
    ctx = document.getElementById('canvas').getContext('2d');
    canvasWidth = ctx.canvas.width;
    canvasHeight = ctx.canvas.height;

    // Game control event listeners
    document.getElementById('start').addEventListener('click', function(){
        if (animProp.animate) {
            document.getElementById('start').value = "Start";
            animProp.animate = false;
        } else {
            document.getElementById('start').value = "Stop";
            animProp.animate = true;
            const time = Date.now();
            startGameLoop();
        }
    });

    document.getElementById('reset').addEventListener('click', function(){
        resetGame();
    });

    // Canvas click handler for popping balloons
    ctx.canvas.addEventListener('mousedown', function(event){
        const rect = ctx.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        for (let i = 0; i < balloons.length; i++){ 
            const balloon = balloons[i];
            if((mouseY > balloon.y) && (mouseY < (balloon.y + 60)) && 
               (mouseX > balloon.x) && (mouseX < (balloon.x + 40))){
                // Create pop effect
                createPopEffect(mouseX, mouseY);
                // Remove balloon and update score
                balloons.splice(i, 1);
                scr++;
                document.getElementById('scr').innerHTML = "Score: " + scr;
                break;
            }
        }
    });
}

// Create visual pop effect
function createPopEffect(x, y) {
    const popEffect = document.createElement('div');
    popEffect.className = 'pop-effect';
    popEffect.style.left = (x - 20) + 'px';
    popEffect.style.top = (y - 20) + 'px';
    document.body.appendChild(popEffect);
    
    setTimeout(() => {
        popEffect.remove();
    }, 300);
}

// Balloon creation function
function addBalloon(){
    const x = Math.random() * (canvasWidth - 40);
    const y = canvasHeight;
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    balloons.push({
        x: x,
        y: y,
        color: randomColor,
        width: 40,
        height: 60
    });
}

// Draw balloon function using CSS-style graphics
function drawBalloon(balloon) {
    const { x, y, color, width, height } = balloon;
    
    // Balloon body (oval)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, 2 * Math.PI);
    
    // Gradient fill
    const gradient = ctx.createRadialGradient(x + width/3, y + height/3, 0, x + width/2, y + height/2, width/2);
    gradient.addColorStop(0, getBalloonColor(color, 'light'));
    gradient.addColorStop(1, getBalloonColor(color, 'dark'));
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Balloon outline
    ctx.strokeStyle = getBalloonColor(color, 'dark');
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Balloon string
    ctx.beginPath();
    ctx.moveTo(x + width/2, y + height);
    ctx.lineTo(x + width/2, y + height + 20);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
}

// Get balloon colors
function getBalloonColor(color, shade) {
    const colors = {
        red: { light: '#ff6b6b', dark: '#e55555' },
        blue: { light: '#74b9ff', dark: '#0984e3' },
        green: { light: '#55efc4', dark: '#00b894' },
        yellow: { light: '#fdcb6e', dark: '#e17055' },
        purple: { light: '#a29bfe', dark: '#6c5ce7' },
        orange: { light: '#fd79a8', dark: '#e84393' }
    };
    return colors[color][shade];
}

// Main game loop
function startGameLoop() {
    lastSpawn = Date.now();
    animate();
}

function animate() {
    if (animProp.animate) {
        const time = Date.now();
        
        // Spawn new balloons
        if(time > (lastSpawn + spawnRate)) {
            lastSpawn = time;
            addBalloon();
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Update and draw balloons
        for (let i = balloons.length - 1; i >= 0; i--) { 
            const balloon = balloons[i];
            balloon.y -= spawnRateOfDescent;
            
            // Draw balloon
            drawBalloon(balloon);

            // Check if balloon reached top
            if(balloon.y <= -balloon.height){
                balloons.splice(i, 1);
                health -= 1;
                scr = Math.max(0, scr - 5); // Don't go below 0
                document.getElementById('health').innerHTML = "Life: " + health;
                document.getElementById('scr').innerHTML = "Score: " + scr;
            }
        }

        // Check game over conditions
        if(health <= 0){
            animProp.animate = false;
            gameOverDisplay(false);
        }

        if(scr >= targetScore){
            animProp.animate = false;
            gameOverDisplay(true);
        }

        requestAnimationFrame(animate);
    }
}

// Game over display
function gameOverDisplay(win = false) {
    const msg = document.getElementById("gameMessage");
    msg.style.display = "block";
    document.getElementById('start').value = "Start";
    
    if(win){
        msg.innerHTML = "🎉 HAPPY BIRTHDAY! 🎉<br>You Won!";
        msg.className = "win";
        launchWinConfetti();
    } else {
        msg.innerHTML = "💀 Game Over! 💀<br>Try Again!";
        msg.className = "lose";
    }
}

// Reset game function
function resetGame() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    document.getElementById('start').value = "Start";
    animProp.animate = false;
    balloons = [];
    scr = 0;
    health = 5;
    document.getElementById('health').innerHTML = "Life: 5";
    document.getElementById('scr').innerHTML = "Score: 0";
    document.getElementById('gameMessage').style.display = "none";
}

// Enhanced confetti function for gift opening
function launchConfetti() {
    const container = document.getElementById('confettiContainer');
    
    // Create multiple bursts of confetti
    for(let burst = 0; burst < 3; burst++) {
        setTimeout(() => {
            for(let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                
                // Random starting position across the top
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                
                // Random animation duration
                const duration = 3 + Math.random() * 3;
                confetti.style.animationDuration = duration + 's';
                
                // Random delay for staggered effect
                confetti.style.animationDelay = Math.random() * 2 + 's';
                
                container.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.remove();
                    }
                }, (duration + 2) * 1000);
            }
        }, burst * 300);
    }
}

// Confetti for winning the game
function launchWinConfetti() {
    const container = document.getElementById('confettiContainer');
    
    for(let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.innerHTML = ['🎉', '🎊', '⭐', '✨', '🎈'][Math.floor(Math.random() * 5)];
        confetti.style.fontSize = '20px';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-20px';
        
        const duration = 4 + Math.random() * 2;
        confetti.style.animationDuration = duration + 's';
        confetti.style.animationDelay = Math.random() * 1 + 's';
        
        container.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, (duration + 1) * 1000);
    }
}