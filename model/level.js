
import * as math from 'mathjs'

export class Coin {
    constructor(x, y, bad) {
        this.x = x;
        this.y = y;
        this.bad = bad;
        this.collected = false;
    }

    collect() {
        if(!this.collected) {
            this.collected = true;
        }
    }

    reset() {
        this.collected = false;
    }
}

export class Level {
    constructor(id, gridSize, fuel, animationSpeed, coinCount, coins) {
        this.id = id;
        this.gridSize = gridSize;
        this.fuel = fuel;
        this.animationSpeed = animationSpeed;
        this.coinCount = coinCount;
        this.coins = coins;
    }

    checkError(expression) {

        try {
            var xPos = math.evaluate(expression, {x : 0})
        }
        catch (error) {
            return true;
        }
        
        // Too high
        if (xPos > this.gridSize) {
            return true;
        }
        
        // Too low
        if (xPos < 0) {
            return true;
        } 
        
        if(expression.length == 0) {
          return true;
        }

        try {
            math.evaluate(expression, {x: 1});
        }
        catch (e) {
            return true;
        }
        return false;
    }


    async checkWin(expression) {
        let coins = this.coins;
        this.coins.forEach(coin => {
            coin.collected = false;            
        });
        
        let won = false;
        let dead = false;
        if(this.checkError(expression)) {
            return false;
        }

        let x = 0;
        let y = math.evaluate(expression, {x: x});
        let derivative = math.derivative(expression, 'x').evaluate({ x: x });
        let timeOutCountdown = 9999;
        let collected = 0;
        while(!dead && !won && timeOutCountdown > 0) {
            timeOutCountdown -= 1;  //Make sure we don't get stuck forever
            //Check dead
            if (x < 0 || x > this.gridSize || y > this.gridSize || y < 0) {
                dead = true;
                continue;
            }
      
            // Change trajectory direction if there is fuel
            if(this.fuel > 0) {
                var dy = math.derivative(expression, 'x').evaluate({ x: x });
            }
            // If no fuel left, continue trajectory
            else {
                var dy = derivative;
            }
      
            
            // Get x and y speed of player based on derivitive of the expression
            const ySpd = math.sin(math.atan(dy));
            const xSpd = math.cos(math.atan(dy));
      
            // Move player based on the speed
            x += xSpd * this.animationSpeed;
            y += ySpd * this.animationSpeed;
            derivative = dy; // Update the derivative for the next frame
            
            // Check if player is colliding with a coin
            this.coins.forEach(coin => {
                const distance = Math.sqrt(Math.pow(coin.x - x, 2) + Math.pow(coin.y - y, 2));
                if (distance <= 0.3 && !coin.collected) {
                    if(!coin.bad) {
                        coin.collect();
                        collected += 1;
                    }
                    else {
                        dead = true;
                    }
                }
            });

            //You win if you get at least as many coins as specified
            if(collected >= this.coinCount) {
                won = true;
            }
        }
        return won;
    }
};

function convertOldToNew(oldLevels) {
    const newLevels = [];
  
    for (const idStr in oldLevels) {
      const id = parseInt(idStr, 10);
      const data = oldLevels[id];
  
      // data.level is an array of [x, y, collected, deadly]
      const coinsArray = data.level.map(([x, y, , deadly]) => {
        // We ignore the 'collected' value since all coins start uncollected
        return new Coin(x, y, deadly);
      });
  
      const levelInstance = new Level(
            id,
            data.gridSize,
            data.originalFuel,
            data.animationSpeed,
            data.coinCount,
            coinsArray
        );
  
      newLevels.push(levelInstance);
    }
  
    return newLevels;
}

export const LevelList = convertOldToNew({
        
    0: {
      gridSize: 6,
      originalFuel: 32,
      animationSpeed: 0.08,
      coinCount: 3,
      level: [
        [1, 3, false, false], // x, y, collected, deadly
        [3, 3, false, false],
        [5, 3, false, false],
      ]
    },

    1: {
      gridSize: 8,
      originalFuel: 100,
      animationSpeed: 0.12,
      coinCount: 3,
      level: [
        [2, 2, false, false], // x, y, collected, deadly
        [4, 4, false, false],
        [6, 6, false, false],
      ]
    },

    2: {
      gridSize: 12,
      originalFuel: 100,
      animationSpeed: 0.12,
      coinCount: 3,
      level: [
        [1, 2, false, false], // x, y, collected, deadly
        [3, 6, false, false],
        [5, 10, false, false],
      ]
    },

    // x/2 + 1
    3: {
      gridSize: 8,
      originalFuel: 32,
      animationSpeed: 0.08,
      coinCount: 3,
      level: [
        [2, 2, false, false],
        [4, 3, false, false],
        [6, 4, false, false],
      ]
    },

    // 8-x
    4: {
      gridSize: 8,
      originalFuel: 32,
      animationSpeed: 0.08,
      coinCount: 1,
      level: [
        [4, 6, false, true],
        [5, 5, false, true],
        [6, 4, false, true],
        [4, 4, false, false],
      ]
    },

    5: {
      gridSize: 6,
      originalFuel: 50,
      animationSpeed: 0.1,
      coinCount: 1,
      level: [
        [3, 3, false, false],
        [1, 3, false, true],
        [5, 3, false, true],
        [2, 2, false, true],
        [2, 4, false, true],
        [4, 4, false, true],
        [4, 2, false, true],
        [3, 5, false, true],
        [3, 1, false, true],
      ]
    },
    
    // x^2
    6: {
      gridSize: 6,
      originalFuel: 35,
      animationSpeed: 0.07,
      coinCount: 3,
      level: [
        [1, 1, false, false],
        [1.75, 3, false, false],
        [2.3, 5, false, false],
      ]
    },

    // 3x^0.52
    7: {
      gridSize: 12,
      originalFuel: 100,
      animationSpeed: 0.1,
      coinCount: 2,
      level: [
        [1, 3.5, false, false],
        [8, 8.5, false, true],
        [11, 11, false, false],
      ]
    },

    // 0.02x^5
    8: {
      gridSize: 6,
      originalFuel: 50,
      animationSpeed: 0.1,
      coinCount: 2,
      level: [
        [3, 3, false, false],
        [1, 3, false, true],
        [5, 3, false, true],
        [2, 2, false, true],
        [2, 4, false, true],
        [4, 4, false, true],
        [4, 2, false, true],
        [3, 5, false, false],
      ]
    },

    // 12-3x^0.5
    // 5.5+3.3cos(.39x)
    9: {
      gridSize: 12,
      originalFuel: 50,
      animationSpeed: 0.1,
      coinCount: 2,
      level: [
        [1, 8.5, false, false],
        [3, 5, false, true],
        [11, 1, false, false],
        [4, 6.5, false, true],
      ]
    },

    // sin(0.8x)+6
    10: {
      gridSize: 12,
      originalFuel: 100,
      animationSpeed: 0.13,
      coinCount: 2,
      level: [
        [2, 6, false, true],
        [4, 6, false, false],
        [6, 6, false, true],
        [8, 6, false, false],
        [10, 6, false, true],
      ]
    },

    // 3sin(0.1x^1.65)+6
    // 7+(.8x-1.8)*sin(.37x)
    11: {
      gridSize: 12,
      originalFuel: 100,
      animationSpeed: 0.13,
      coinCount: 3,
      level: [
        [2, 7, false, false],
        [5.5, 9, false, false],
        [10.5, 3, false, false],
        [2, 8, false, true],
        [5.5, 7.5, false, true],
        [10.5, 4, false, true],
      ]
    },

    //4/(1+e^-(x-4)^2)
    //NOT sin(1.2x)+3.2
    12: {
      gridSize: 8,
      originalFuel: 50,
      animationSpeed: 0.13,
      coinCount: 3,
      level: [
      [1, 3.5, false, true],
      [1, 4.5, false, true],
      [.5, 3.5, false, true],
      [.5, 4.5, false, true],
      [1.5, 3.5, false, true],
      [1.5, 4.5, false, true],
      [3, 3, false, false],
      [4, 2, false, false],
      [5, 3, false, false],
      // [6, 4, false, false],

      // [6.25, 4.25, false, false],
      // [6.5, 4, false, false],
      // [6.75, 4.25, false, false],
      // [7, 4, false, false],

      [2, 1, false, true],
      [2, 1.5, false, true],
      [2, 2, false, true],
      [2, 2.5, false, true],
      [2, 3, false, true],
      [2, 3.5, false, true],
      [2, 4.5, false, true],
      [1, 3.5, false, true],
      [1, 4.5, false, true],
      [2, 5, false, true],
      [2, 5.5, false, true],
      [2, 6, false, true],
      [2, 6.5, false, true],
      [2, 0.5, false, true],
      [2, 0, false, true],
      [2, 7, false, true],
      [2, 7.5, false, true],
      [2, 8, false, true],

      [6, 1.5, false, true],
      [6, 2, false, true],
      [6, 2.5, false, true],
      [6, 3, false, true],
      [6, 3.5, false, true],
      [6, 4.5, false, true],
      [6, 5, false, true],
      [6, 5.5, false, true],
      [6, 6, false, true],
      [6, 6.5, false, true],
      [6, 0.5, false, true],
      [6, 0, false, true],
      [6, 7, false, true],
      [6, 7.5, false, true],
      [6, 8, false, true],
      [6, 1, false, true],
      ]
    },
  });