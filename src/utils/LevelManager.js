import Phaser from "phaser";

class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.lastLevel = null;
        this.levels = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6'];
    }

    levelData = {
        level1: {key: 'level1', musicType: 'overground'},
        level2: {key: 'level2', musicType: 'overground'},
        level3: {key: 'level3', musicType: 'overground'},
        level4: {key: 'level4', musicType: 'overground'},
        level5: {key: 'level5', musicType: 'overground'},
        level6: {key: 'level6', musicType: 'dungeon'},
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

}

export default LevelManager;