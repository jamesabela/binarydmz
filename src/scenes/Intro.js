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

        // Create Watch Video Button
        const videoButton = this.add.container(this.scale.width / 2 - 120, this.scale.height - 100);

        const videoBg = this.add.graphics();
        videoBg.fillStyle(0xFF0000, 1); // Red for YouTube
        videoBg.fillRoundedRect(-100, -30, 200, 60, 15);
        videoButton.add(videoBg);

        const videoText = this.add.text(0, 0, 'WATCH VIDEO', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        videoButton.add(videoText);

        videoButton.setSize(200, 60);
        videoButton.setInteractive({ useHandCursor: true });

        videoButton.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            window.open('https://www.youtube.com/watch?v=wMZcatDovow', '_blank');
        });

        // Hover effect for Video Button
        videoButton.on('pointerover', () => {
            videoBg.clear();
            videoBg.fillStyle(0xCC0000, 1); // Darker Red
            videoBg.fillRoundedRect(-100, -30, 200, 60, 15);
        });
        videoButton.on('pointerout', () => {
            videoBg.clear();
            videoBg.fillStyle(0xFF0000, 1);
            videoBg.fillRoundedRect(-100, -30, 200, 60, 15);
        });

        // Create Start Game Button
        const gameButton = this.add.container(this.scale.width / 2 + 120, this.scale.height - 100);

        const gameBg = this.add.graphics();
        gameBg.fillStyle(0x00AA00, 1); // Green for Go/Start
        gameBg.fillRoundedRect(-100, -30, 200, 60, 15);
        gameButton.add(gameBg);

        const gameText = this.add.text(0, 0, 'START GAME', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        gameButton.add(gameText);

        gameButton.setSize(200, 60);
        gameButton.setInteractive({ useHandCursor: true });

        gameButton.on('pointerdown', (pointer, localX, localY, event) => {
            event.stopPropagation();
            this.scene.start('Menu');
        });

        // Hover effect for Game Button
        gameButton.on('pointerover', () => {
            gameBg.clear();
            gameBg.fillStyle(0x008800, 1); // Darker Green
            gameBg.fillRoundedRect(-100, -30, 200, 60, 15);
        });
        gameButton.on('pointerout', () => {
            gameBg.clear();
            gameBg.fillStyle(0x00AA00, 1);
            gameBg.fillRoundedRect(-100, -30, 200, 60, 15);
        });

        // Make the background clickable to advance as a fallback
        this.introImage.setInteractive();
        this.introImage.on('pointerdown', () => {
            this.scene.start('Menu');
        });
    }
}

