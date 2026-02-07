import Phaser from "phaser";
import Preload from "./scenes/Preload";
import MenuScene from "./scenes/MenuScene";
import Play from "./scenes/Play";


const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    }
  },
  scene: [Preload, MenuScene, Play]
};

new Phaser.Game(config);