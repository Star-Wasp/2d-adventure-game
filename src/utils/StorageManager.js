export function saveLevel(levelNumber) {
    localStorage.setItem('currentLevel', levelNumber)
}

export function getSavedLevel() {
    const level = localStorage.getItem('currentLevel')
    return level ? parseInt(level) : 1;
}

export function saveCheckpoint(x, y, levelKey) {
    const checkpointData = JSON.stringify({
       coordinateX: x,
       coordinateY: y,
       level: levelKey
    });
    localStorage.setItem('checkpoint', checkpointData);
}

export function getSavedCheckpoint() {
    const checkpointData = localStorage.getItem('checkpoint');
    return checkpointData ? JSON.parse(checkpointData) : null;
}

export function savePlayerData(health, coins) {
    localStorage.setItem('playerHealth', health);
    localStorage.setItem('coins', coins);
}

export function getSavedPlayerHealth() {
    const health = localStorage.getItem('playerHealth')
        return health ? parseInt(health) : 100;
}

export function getSavedCoins() {
    const coins = localStorage.getItem('coins');
    return coins ? parseInt(coins) : 0;
}