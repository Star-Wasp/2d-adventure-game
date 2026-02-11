import Phaser from "phaser";

class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.lastLevel = null;
        this.levels = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7', 'level8', 'level9', 'level10', 'level11', 'level12'];
    }

    levelData = {
        level1: {key: 'level1', musicType: 'overground'},
        level2: {key: 'level2', musicType: 'overground'},
        level3: {key: 'level3', musicType: 'overground'},
        level4: {key: 'level4', musicType: 'overground'},
        level5: {key: 'level5', musicType: 'overground'},
        level6: {key: 'level6', musicType: 'dungeon'},
        level7: {key: 'level7', musicType: 'interior'},
        level8: {key: 'level8', musicType: 'dungeon'},
        level9: {key: 'level9', musicType: 'overground'},
        level10: {key: 'level10', musicType: 'interior'},
        level11: {key: 'level11', musicType: 'overground'},
        level12: {key: 'level12', musicType: 'interior'},
    }

    getCurrentLevelKey() {
        return this.levels[this.currentLevel - 1];
    }

    getLastLevel() {
        return this.lastLevel;
    }

    setLastLevel(level) {
        this.lastLevel = level;
    }

    hasNextLevel() {
        return this.currentLevel < this.levels.length;
    }

    nextLevel() {
        if (this.hasNextLevel()) {
            this.lastLevel = this.getCurrentLevelKey();
          this.currentLevel += 1;  
          return true;
        } else {
            console.log("End of game!");
            return false;
        }
    }

    setLevel(levelKey) {
    if (this.levels.includes(levelKey)) {
        this.lastLevel = this.getCurrentLevelKey();
        this.currentLevel = this.levels.indexOf(levelKey) + 1;
        return true;
    } else {
        console.log("Level doesn't exist!")
        return false;
    }
}

 deathRespawn() {
    this.respawnLevel = 'level7';
    this.respawnX = 100;
    this.respawnY = 200;
 }

}

export default LevelManager;