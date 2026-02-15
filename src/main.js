import Boot from './scenes/Boot.js';
import Intro from './scenes/Intro.js';
import Menu from './scenes/Menu.js';
import Game from './scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true
    },
    scene: [
        Boot,
        Intro,
        Menu,
        Game
    ]
};

const game = new Phaser.Game(config);
