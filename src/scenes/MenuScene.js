import BaseScene from "./BaseScene";

class MenuScene extends BaseScene {
    constructor() {
        super('MenuScene', {
            width: 600,
            height: 600,
            fontSize: 160,
            fontColor: 'rgb(18, 107, 18)',
            canGoBack: false,
            backgroundKey: 'menu-bg',
            backgroundScale: 1
        })

        this.menu = [
            {scene: 'Play', text: 'Play'},
            {scene: null, text: 'Exit'},
        ]
    }

    create() {
        super.create();

        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
    }

    setupMenuEvents(menuItem) {
        const textGO = menuItem.textGO;
        textGO.setInteractive();

        textGO.on('pointerover', () => {
            textGO.setStyle({
                fill: 'rgb(4, 193, 4)'
            })
        })

        textGO.on('pointerout', () => {
            textGO.setStyle({
                fill: this.fontOptions.fill
            })
        })

        textGO.on('pointerup', () => {
            if (menuItem.scene) {
                this.registry.set('startedFromMenu', true);
                this.scene.start(menuItem.scene);
            } else if (menuItem.text === 'Exit') {
                this.game.destroy(true);
            }
        })
    }

}

export default MenuScene;