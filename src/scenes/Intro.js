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

        // Create a container for the play button
        const playButton = this.add.container(this.scale.width / 2, this.scale.height / 2);

        // Play button background (semi-transparent circle)
        const playBg = this.add.graphics();
        playBg.fillStyle(0x000000, 0.5);
        playBg.fillCircle(0, 0, 50);
        playButton.add(playBg);

        // Play button arrow (white triangle)
        const playArrow = this.add.graphics();
        playArrow.fillStyle(0xffffff, 1);
        playArrow.beginPath();
        playArrow.moveTo(-15, -25);
        playArrow.lineTo(25, 0);
        playArrow.lineTo(-15, 25);
        playArrow.closePath();
        playArrow.fillPath();
        playButton.add(playArrow);

        // Make the container interactive
        playButton.setSize(100, 100);
        playButton.setInteractive({ useHandCursor: true });

        // Add hover effect
        playButton.on('pointerover', () => {
            playBg.clear();
            playBg.fillStyle(0x000000, 0.7);
            playBg.fillCircle(0, 0, 50);
            playArrow.clear();
            playArrow.fillStyle(0xffff00, 1); // Turn yellow on hover
            playArrow.beginPath();
            playArrow.moveTo(-15, -25);
            playArrow.lineTo(25, 0);
            playArrow.lineTo(-15, 25);
            playArrow.closePath();
            playArrow.fillPath();
        });

        playButton.on('pointerout', () => {
            playBg.clear();
            playBg.fillStyle(0x000000, 0.5);
            playBg.fillCircle(0, 0, 50);
            playArrow.clear();
            playArrow.fillStyle(0xffffff, 1);
            playArrow.beginPath();
            playArrow.moveTo(-15, -25);
            playArrow.lineTo(25, 0);
            playArrow.lineTo(-15, 25);
            playArrow.closePath();
            playArrow.fillPath();
        });

        // Click handler
        playButton.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation(); // Prevent the scene click from triggering
            window.open('https://www.youtube.com/shorts/wMZcatDovow', '_blank');
        });

        // Make the whole screen clickable to advance (existing code, moved down)
        // We modify the existing background click to be on the introImage instead, 
        // OR we just keep the scene click but use stopPropagation on the button.
        // The previous code had: this.input.on('pointerdown', ...) which catches all scene clicks.
        // event.stopPropagation() on the game object should work if the scene input listener is set correctly.

        // HOWEVER, Phaser's `this.input.on` is a global input listener for the scene. 
        // Game object `pointerdown` events fire BEFORE the global scene `pointerdown`.
        // But `stopPropagation` in Phaser works a bit differently. 
        // Actually, if I make the background image interactive, I can handle clicks on it separately.

        // Let's make the background image interactive for the "continue" action, instead of the whole scene.
        this.introImage.setInteractive();
        this.introImage.on('pointerdown', () => {
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
