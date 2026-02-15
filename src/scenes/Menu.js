export default class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        // Background
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.scale.width, this.scale.height).setTint(0x444444);

        // Title
        this.add.text(this.scale.width / 2, 80, 'BINARY DMZ', {
            fontSize: '56px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, fill: true }
        }).setOrigin(0.5);

        this.difficulty = 'Rookie';
        this.mode = 'Unsigned';
        this.playerName = 'Pilot_01'; // Default

        this.createMenuOptions();

        // Player Name Input
        this.add.text(this.scale.width / 2, 530, 'PILOT NAME', { fontSize: '24px', fill: '#aaa' }).setOrigin(0.5);

        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.style = 'font-size: 24px; padding: 10px; width: 200px; text-align: center; border-radius: 5px; border: 2px solid #0f0; background-color: #000; color: #fff;';
        inputElement.value = this.playerName;
        inputElement.placeholder = 'Enter Name';

        const domElement = this.add.dom(this.scale.width / 2, 580, inputElement);
        domElement.addListener('input');
        domElement.on('input', (event) => {
            this.playerName = event.target.value;
            if (this.playerName.trim() === '') this.playerName = 'Pilot_01';
        });

        // Start Button
        const startBtn = this.add.text(this.scale.width / 2, 700, 'LAUNCH MISSION', {
            fontSize: '42px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#00aa00',
            padding: { x: 40, y: 15 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.startGame())
            .on('pointerover', () => startBtn.setStyle({ fill: '#ffff00', backgroundColor: '#00cc00' }))
            .on('pointerout', () => startBtn.setStyle({ fill: '#ffffff', backgroundColor: '#00aa00' }));
    }

    createMenuOptions() {
        // === Difficulty Column ===
        this.add.text(150, 180, 'DIFFICULTY', { fontSize: '28px', fill: '#aaa', fontStyle: 'bold' }).setOrigin(0.5);

        const difficulties = ['Rookie', 'Amateur', 'Pro', 'Insane'];
        this.diffButtons = [];

        difficulties.forEach((diff, index) => {
            const y = 240 + (index * 60);
            const btn = this.add.text(150, y, diff, { fontSize: '24px', fill: '#fff' })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.setDifficulty(diff));

            this.diffButtons.push({ name: diff, obj: btn });
        });

        // === Mode Column ===
        this.add.text(450, 180, 'GAME MODE', { fontSize: '28px', fill: '#aaa', fontStyle: 'bold' }).setOrigin(0.5);

        const modes = ['Unsigned', 'Twos Complement', 'Hexadecimal'];
        this.modeButtons = [];

        modes.forEach((mode, index) => {
            const y = 240 + (index * 60);
            // Wrap text if needed or adjust size
            let fontSize = '24px';
            if (mode === 'Twos Complement') fontSize = '20px';

            const btn = this.add.text(450, y, mode, { fontSize: fontSize, fill: '#fff' })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.setMode(mode));

            this.modeButtons.push({ name: mode, obj: btn });
        });

        this.updateSelection();
    }

    setDifficulty(diff) {
        this.difficulty = diff;
        this.updateSelection();
    }

    setMode(mode) {
        this.mode = mode;
        this.updateSelection();
    }

    updateSelection() {
        // Update Difficulty Buttons
        this.diffButtons.forEach(btn => {
            if (btn.name === this.difficulty) {
                btn.obj.setColor('#00ff00');
                btn.obj.setFontStyle('bold');
                btn.obj.setStroke('#ffffff', 1);
            } else {
                btn.obj.setColor('#ffffff');
                btn.obj.setFontStyle('normal');
                btn.obj.setStroke(null);
            }
        });

        // Update Mode Buttons
        this.modeButtons.forEach(btn => {
            if (btn.name === this.mode) {
                btn.obj.setColor('#00ff00');
                btn.obj.setFontStyle('bold');
                btn.obj.setStroke('#ffffff', 1);
            } else {
                btn.obj.setColor('#ffffff');
                btn.obj.setFontStyle('normal');
                btn.obj.setStroke(null);
            }
        });
    }

    startGame() {
        this.scene.start('Game', { difficulty: this.difficulty, mode: this.mode, playerName: this.playerName });
    }
}
