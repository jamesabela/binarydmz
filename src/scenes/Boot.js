export default class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load images
        this.load.image('background', 'assets/background.jpg');
        this.load.image('intro_cartoon', 'assets/intro_cartoon.png');
        this.load.image('certificate_bg', 'assets/certificate_bg.png');
        this.load.image('intro_cartoon', 'assets/intro_cartoon.png');

        // Load ship variants
        this.load.image('ship_1', 'assets/ship_1.png');
        this.load.image('ship_2', 'assets/ship_2.png');
        this.load.image('ship_3', 'assets/ship_3.png');
        this.load.image('ship_4', 'assets/ship_4.png');
        this.load.image('ship_5', 'assets/ship_5.png');
        this.load.image('ship_6', 'assets/ship_6.png');

        // Load explosion sprite sheet
        this.load.spritesheet('explosion', 'assets/expl.png', {
            frameWidth: 256,
            frameHeight: 256
        });

        // Load intro pictures
        for (let i = 1; i <= 12; i++) {
            this.load.image(`Picture${i}`, `assets/Picture${i}.png`);
        }

        // Load audio
        this.load.audio('success', 'assets/success.wav');
    }

    create() {
        // Create explosion animation
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 178 }),
            frameRate: 60,
            hideOnComplete: true
        });

        this.scene.start('Intro');
    }
}
