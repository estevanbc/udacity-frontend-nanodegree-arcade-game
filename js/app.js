/**
 * class to configure the a range
 */
class Range {
    constructor({ min = 0, max = 400 } = {}) {
        this.min = min;
        this.max = max;
    }
}

/**
 * class to configure the bounds of movements
 */
class MovementBounds {
    constructor({ x = new Range(), y = new Range() } = {}) {
        this.x = x;
        this.y = y;
    }
}

/**
 * class to configure the size of steps
 */
class MovementStepSize {
    constructor({ x = 100, y = 82 } = {}) {
        this.x = x;
        this.y = y;
    }
}

/**
 * class to configure the movements
 */
class MovementConfiguration {     
    constructor({ bounds = new MovementBounds() } = {}) {
        this.bounds = bounds;
    }
}

/**
 * class to configure the size of chacacter
 */
class CharacterSize {     
    constructor({ height = 0, width = 0 } = {}) {
        this.height = height;
        this.width = width;
    }
}

/**
 * class to configure the offset of chacacter sprite for collision check
 */
class SpriteOffset {     
    constructor({ x = 0, y = 0 } = {}) {
        this.x = x;
        this.y = y;
    }
}

/**
 * base class to define a character
 */
class Character {
    constructor({ 
            // movement configuration
            movement = new MovementConfiguration(), 
            // The size (width and height) of our characters
            size = new CharacterSize(),
            // The image/sprite for our characters, this uses
            // a helper we've provided to easily load images 
            sprite = '', 
            // offset of sprite to collision check
            offset = new SpriteOffset() 
        } = {}) {
        this.movement = movement;
        this.size = size;
        this.sprite = sprite;
        this.offset = offset;
        this.stepSize = new MovementStepSize();
    }

    // Checks if the movement of character exceed the bounds
    isValidMovement(x, y) {
        return y >= this.movement.bounds.y.min 
            && y <= this.movement.bounds.y.max 
            && x >= this.movement.bounds.x.min 
            && x <= this.movement.bounds.x.max;
    }

    // Draw the character on the screen, required method for game
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

}

// Enemies our player must avoid
class Enemy extends Character {
    
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    constructor({ sprite, size, offset } = {}) {
        super({ 
            movement: new MovementConfiguration({ 
                bounds: new MovementBounds({ 
                    y: { min: 60, max: 225 }, 
                    x: { max: 482, min: -82 } 
                })
            }), sprite, size, offset
        });
        this.resetPosition();
    }

    // set the enemy's position to initial position
    resetPosition() {
        this.y = this.randomYPosition();
        this.x = -80;
        this.velocity = this.randomVelocity();
    }

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    update(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.x += this.velocity * dt;

        if (!this.isValidMovement(this.x, this.y)) {
            this.resetPosition();
        }

        this.checkCollision();        
    }    

    // random the position between the enemy's movement bounds
    randomYPosition() {
        return random(this.movement.bounds.y.min, this.movement.bounds.y.max, this.stepSize.y) - 21;
    }

    // random the enemy's velocity
    randomVelocity() {
        return random(50, 200, 10);
    }

    // checks the enemy collided with the player
    checkCollision() {
        if (player) {
            if ((this.x + this.offset.x) < ((player.x + player.offset.x) + player.size.width) &&
                ((this.x + this.offset.x) + this.size.width) > (player.x + player.offset.x) &&
                (this.y + this.offset.y) < ((player.y + player.offset.y) + player.size.height) &&
                ((this.y + this.offset.y) + this.size.height) > (player.y + player.offset.y + 20)) {
                player.reset();
            }
        }
    }    
    
};

/**
 * class to define the Bug enemy character
 */
class Bug extends Enemy {
    constructor() {
        super({ 
            sprite: 'images/enemy-bug.png', 
            size: new CharacterSize({ height: 70, width: 100 }), 
            offset: new SpriteOffset({ x: 0, y: 75 }) 
        });
    }
}

/**
 * class to define the player character
 */
class Player extends Character {

    constructor() {
        super({ 
            movement: new MovementConfiguration({ 
                bounds: new MovementBounds({ 
                    y: new Range({ min: -25, max: 385 })
                })
            }), 
            sprite: 'images/char-boy.png', 
            offset: new SpriteOffset({ x: 15, y: 62 }),
            size: new CharacterSize({ width: 72, height: 80 })
        });     
        this.reset();
        
    }

    // Update the player's position
    update() {
        
    }

    // resets the match
    reset() {
        this.wins = 0;
        this.goToInitialPosition();
    }

    // draw things related to the player
    render() {
        super.render();
        this.renderWins();
    }

    // draw the wins amount
    renderWins() {
        ctx.font = 'bold 45px Courier';
        ctx.textAlign = 'right';
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.fillText(`Wins: ${this.wins}`, 500, 40);
        ctx.strokeText(`Wins: ${this.wins}`, 500, 40);
    }

    // set the player's position to initial
    goToInitialPosition() {
        this.x = 200;
        this.y = this.movement.bounds.y.max;
    }    

    // handle the player's keyboard input
    handleInput(direction) {
        switch (direction) {
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
        }
        
        this.checkWins();
    }

    // set the position to the next above with it don't exceed the bounds
    moveUp() {
        if (this.isValidMovement(this.x, this.y - this.stepSize.y)) {
            this.y -= this.stepSize.y;        
        }
    }

    // set the position to the next below with it don't exceed the bounds
    moveDown() {
        if (this.isValidMovement(this.x, this.y + this.stepSize.y)) {
            this.y += this.stepSize.y;
        }
    }

    // set the position to the next on the left with it don't exceed the bounds
    moveLeft() {
        if (this.isValidMovement(this.x - this.stepSize.x, this.y)) {
            this.x -= this.stepSize.x;
        }
    }

    // set the position to the next on the right with it don't exceed the bounds
    moveRight() {
        if (this.isValidMovement(this.x + this.stepSize.x, this.y)) {
            this.x += this.stepSize.x;
        }
    }

    // checks with the player wins
    checkWins() {
        if (this.isOnTheWater()){
            this.incrementWins();
            this.goToInitialPosition();
        }
    }

    // return with the player's position is on the water
    isOnTheWater() {
        return this.y <= 0;
    }

    // increments the wins amount
    incrementWins() {
        this.wins += 1;        
    }

}

// function to return a number between a range
function random(min, max, multiple = 1) {
    return (Math.round((Math.random()*(max-min)+min)/multiple)*multiple);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();
var allEnemies = [];

allEnemies.push(new Bug());
allEnemies.push(new Bug());
allEnemies.push(new Bug());

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
