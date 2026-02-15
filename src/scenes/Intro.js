export default class Intro extends Phaser.Scene {
    constructor() {
        super('Intro');
    }

    create() {
        // Display the cartoon strip
        this.introImage = this.add.image(this.scale.width / 2, this.scale.height / 2, 'intro_cartoon');

        // Scale to fit width, maintain aspect ratio
        const scale = this.scale.width / this.introImage.width;
        this.introImage.setScale(scale);

        // Make the whole screen clickable to advance
        this.input.on('pointerdown', () => {
            this.scene.start('Menu');
        });

        // Add instructions text at the bottom
        this.add.text(this.scale.width / 2, this.scale.height - 30, 'Click anywhere to continue...', {
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
    }
}
