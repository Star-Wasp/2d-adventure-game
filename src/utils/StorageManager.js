export function saveLevel(levelNumber) {
    localStorage.setItem('currentLevel', levelNumber)
}

export function getSavedLevel() {
    const level = localStorage.getItem('currentLevel')
    return level ? parseInt(level) : 1;
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