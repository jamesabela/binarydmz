export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init(data) {
        this.difficulty = data.difficulty || 'Rookie';
        this.mode = data.mode || 'Unsigned';
        this.playerName = data.playerName || 'Pilot_01';
    }

    create() {
        this.score = 0;

        // Music Setup
        if (!this.sound.get('music')) {
            this.music = this.sound.add('music', { loop: true, volume: 0.5 });
        } else {
            this.music = this.sound.get('music');
        }

        if (!this.registry.get('musicMuted') && !this.music.isPlaying) {
            this.music.play();
        }

        this.isFirstRound = true;
        this.tutorialElements = [];
        this.hasPressedAnything = false;

        this.binaryCounter = 0;
        this.rects = [];
        this.bitValues = [128, 64, 32, 16, 8, 4, 2, 1];
        this.rectFill = [0, 0, 0, 0, 0, 0, 0, 0]; // 0 or bitValue

        // Background
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.scale.width, this.scale.height);

        // GUI
        this.createGUI();

        // Laser Hazard
        this.laserY = this.scale.height - 200;
        this.laserGraphics = this.add.graphics();
        this.laserGraphics.lineStyle(4, 0xff0000, 1);
        this.laserGraphics.lineBetween(0, this.laserY, this.scale.width, this.laserY);

        // Laser Glow/Pulse
        this.tweens.add({
            targets: this.laserGraphics,
            alpha: { from: 1, to: 0.5 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Spaceship (initially hidden, will likely need to reset on startRound)
        this.spaceship = this.add.image(this.scale.width / 2, -100, 'ship_1');
        this.spaceship.setDisplaySize(150, 200); // Approximate size from Lua

        // Rectangles (Bits)
        this.createBitRectangles();

        // Game Logic Setup based on Difficulty
        this.setupDifficulty();

        // Setup Keyboard Controls (Keys 1-8)
        this.setupKeyboardControls();

        // Load High Score
        this.highScore = parseInt(localStorage.getItem(`highScore_${this.difficulty}_${this.mode}`)) || 0;
        this.add.text(this.scale.width - 20, 20, 'Best ' + this.highScore, { fontSize: '24px', fill: '#aaa', backgroundColor: '#000000', padding: { x: 5, y: 5 } }).setOrigin(1, 0);

        // Quit to Menu Button
        this.add.text(this.scale.width - 20, 60, 'Quit to Menu', { fontSize: '20px', fill: '#ff0000', backgroundColor: '#330000', padding: { x: 5, y: 5 } })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.music) this.music.stop();
                this.scene.start('Menu');
            });

        // Start Round
        this.startRound();
    }

    createGUI() {
        const textStyle = { fontSize: '32px', fill: '#fff' };

        // Binary Counter (User's current sum)
        this.binaryCounterText = this.add.text(20, 30, '0', textStyle);

        // Target Number
        this.add.text(20, 90, 'Target', textStyle);
        this.targetText = this.add.text(20, 130, '0', { fontSize: '32px', fill: '#0f0' });

        // Score
        this.add.text(20, 200, 'Score', textStyle);
        this.scoreText = this.add.text(20, 240, '0', textStyle);

        // Music Toggle
        const isMuted = this.registry.get('musicMuted') || false;
        this.musicToggleText = this.add.text(20, 290, isMuted ? '🔇' : '🔊', { fontSize: '48px' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.toggleMusic());
    }

    toggleMusic() {
        const isMuted = !this.registry.get('musicMuted');
        this.registry.set('musicMuted', isMuted);

        if (isMuted) {
            this.music.stop();
            this.musicToggleText.setText('🔇');
        } else {
            this.music.play();
            this.musicToggleText.setText('🔊');
        }
    }

    createBitRectangles() {
        const startX = 100; // Starting X close to right
        const gap = 50;
        const y = this.scale.height - 100;

        for (let i = 0; i < 8; i++) {
            let bitVal = this.bitValues[i];
            let x = 100 + (i * 55); // Spacing

            let rect = this.add.rectangle(x, y, 46, 50, 0xff0000)
                .setInteractive()
                .on('pointerdown', () => this.toggleBit(i));

            let text = this.add.text(x, y + 40, '0', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

            this.rects.push({ rect, text, value: bitVal, index: i });

            // Label above/below
            this.add.text(x, y - 40, bitVal.toString(), { fontSize: '16px', fill: '#aaa' }).setOrigin(0.5);
        }
    }

    setupDifficulty() {
        this.shipSpeed = 10000; // ms
        this.randomRange = 255;
        this.scoreLevel = 10;
        this.shipSpeedLevel = 250;
        this.showBinarySums = true;

        if (this.difficulty === 'Rookie') {
            this.randomRange = 16;
            this.shipSpeed = 30000;
        } else if (this.difficulty === 'Amateur') {
            this.randomRange = 128;
            this.shipSpeed = 25000;
        } else if (this.difficulty === 'Pro') {
            this.randomRange = 255;
            this.shipSpeed = 20000;
            this.showBinarySums = false;
        } else if (this.difficulty === 'Insane') {
            this.randomRange = 255;
            this.shipSpeed = 10000;
            this.showBinarySums = false;
        }

        if (this.mode === 'Twos Complement') {
            if (this.difficulty === 'Rookie') {
                this.twosComplementMin = -8;
                this.randomRange = 7;
            } else if (this.difficulty === 'Amateur') {
                this.twosComplementMin = -64;
                this.randomRange = 63;
            } else {
                this.twosComplementMin = -128;
                this.randomRange = 127;
            }
        } else if (this.mode === 'Hexadecimal') {
            this.scoreLevel *= 1.5;
        }

        this.binaryCounterText.setVisible(this.showBinarySums);
    }

    toggleBit(index) {
        this.hasPressedAnything = true;
        this.clearTutorial();

        let bitObj = this.rects[index];
        if (this.rectFill[index] === 0) {
            this.rectFill[index] = bitObj.value;
            bitObj.rect.setFillStyle(0x0000ff); // Blue when active
            bitObj.text.setText('1');
        } else {
            this.rectFill[index] = 0;
            bitObj.rect.setFillStyle(0xff0000); // Red when inactive
            bitObj.text.setText('0');
        }

        this.updateBinaryCounter();
        this.checkMatch();
    }

    updateBinaryCounter() {
        this.binaryCounter = this.rectFill.reduce((a, b) => a + b, 0);
        this.binaryCounterText.setText(this.binaryCounter);
    }

    setupKeyboardControls() {
        // Map keys '1' through '8' (KeyCodes 49-56) to toggle bits
        this.input.keyboard.on(`keydown-ONE`, () => this.toggleBit(0));
        this.input.keyboard.on(`keydown-TWO`, () => this.toggleBit(1));
        this.input.keyboard.on(`keydown-THREE`, () => this.toggleBit(2));
        this.input.keyboard.on(`keydown-FOUR`, () => this.toggleBit(3));
        this.input.keyboard.on(`keydown-FIVE`, () => this.toggleBit(4));
        this.input.keyboard.on(`keydown-SIX`, () => this.toggleBit(5));
        this.input.keyboard.on(`keydown-SEVEN`, () => this.toggleBit(6));
        this.input.keyboard.on(`keydown-EIGHT`, () => this.toggleBit(7));

        // Also add keyboard support to toggle music (M key)
        this.input.keyboard.on('keydown-M', () => this.toggleMusic());
    }

    startRound() {
        this.hasPressedAnything = false;
        this.clearTutorial();

        // Reset bits
        for (let i = 0; i < 8; i++) {
            this.rectFill[i] = 0;
            this.rects[i].rect.setFillStyle(0xff0000);
            this.rects[i].text.setText('0');
        }
        this.updateBinaryCounter();

        // New Target
        do {
            if (this.mode === 'Twos Complement') {
                this.targetNumber = Phaser.Math.Between(this.twosComplementMin, this.randomRange);
            } else {
                this.targetNumber = Phaser.Math.Between(1, this.randomRange);
            }
        } while (this.targetNumber === 0);

        // Display Target
        if (this.mode === 'Hexadecimal') {
            this.targetText.setText(this.targetNumber.toString(16).toUpperCase());
        } else {
            this.targetText.setText(this.targetNumber);
        }

        // Internal Target for matching (Two's Complement logic)
        this.matchTarget = this.targetNumber;
        if (this.targetNumber < 0) {
            this.matchTarget = 256 + this.targetNumber;
        }

        // Reset Ship
        this.spaceship.y = -100;
        this.spaceship.setVisible(true);

        // Randomize Ship Texture
        const shipVariant = Phaser.Math.Between(1, 6);
        this.spaceship.setTexture(`ship_${shipVariant}`);

        if (this.spaceshipTween) this.spaceshipTween.stop();

        this.spaceshipTween = this.tweens.add({
            targets: this.spaceship,
            y: this.laserY - (this.spaceship.displayHeight / 2),
            duration: this.shipSpeed,
            onComplete: () => {
                this.gameOver();
            }
        });

        if (this.isFirstRound) {
            this.time.delayedCall(this.shipSpeed / 2, () => {
                if (!this.hasPressedAnything && this.isFirstRound) {
                    this.showTutorial();
                }
            });
        }
    }

    showTutorial() {
        let remaining = this.matchTarget;
        for (let i = 0; i < 8; i++) {
            let bitVal = this.bitValues[i];
            if (remaining >= bitVal) {
                remaining -= bitVal;
                let rectObj = this.rects[i].rect;

                // Pulse Rectangle
                let twInfo = this.tweens.add({
                    targets: rectObj,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    yoyo: true,
                    repeat: -1,
                    duration: 400
                });

                // Bouncing Arrow
                let arrowText = this.add.text(rectObj.x, rectObj.y - 70, '▼', { fontSize: '24px', fill: '#ffff00' }).setOrigin(0.5);
                let textTw = this.tweens.add({
                    targets: arrowText,
                    y: rectObj.y - 60,
                    yoyo: true,
                    repeat: -1,
                    duration: 400
                });

                this.tutorialElements.push({
                    stop: () => {
                        twInfo.stop();
                        textTw.stop();
                        arrowText.destroy();
                    }
                });
            }
        }
    }

    clearTutorial() {
        if (this.tutorialElements && this.tutorialElements.length > 0) {
            this.tutorialElements.forEach(el => el.stop());
            this.tutorialElements = [];

            // Re-normalize scales
            this.rects.forEach(obj => {
                obj.rect.setScale(1);
            });
        }
    }

    checkMatch() {
        if (this.binaryCounter === this.matchTarget) {
            this.isFirstRound = false;
            this.clearTutorial();

            if (!this.registry.get('musicMuted')) {
                this.sound.play('success');
            }
            this.score += this.scoreLevel;
            this.scoreText.setText(this.score);

            // Speed up
            this.shipSpeed = Math.max(1000, this.shipSpeed - this.shipSpeedLevel);

            if (this.spaceshipTween) this.spaceshipTween.stop();

            // Visual feedback: Match text color or something?
            // For now, simple delay before restart
            this.time.delayedCall(500, () => {
                this.startRound();
            });
        }
    }

    gameOver() {
        this.isFirstRound = false;
        this.clearTutorial();
        this.spaceship.setVisible(false);

        // Explosions at laser line
        const ex1 = this.add.sprite(this.spaceship.x, this.laserY, 'explosion');
        ex1.play('explode');

        // Update High Score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(`highScore_${this.difficulty}_${this.mode}`, this.highScore);
            this.add.text(this.scale.width / 2, this.scale.height / 2 - 80, 'NEW HIGH SCORE!', { fontSize: '32px', fill: '#ff0' }).setOrigin(0.5);
        }

        this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', { fontSize: '64px', fill: '#f00' }).setOrigin(0.5);
        this.add.text(this.scale.width / 2, this.scale.height / 2 + 80, 'Score: ' + this.score, { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        // Restart Button
        const restartBtn = this.add.text(this.scale.width / 2, this.scale.height / 2 + 180, 'MAIN MENU', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#00aa00',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.start('Menu');
            });

        // Download Certificate Button
        const pdfBtn = this.add.text(this.scale.width / 2, this.scale.height / 2 + 260, 'DOWNLOAD CERTIFICATE', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#0000aa',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.downloadReport());
    }

    getImageDataURL(key) {
        const texture = this.textures.get(key);
        const source = texture.getSourceImage();

        if (source) {
            const canvas = document.createElement('canvas');
            canvas.width = source.width;
            canvas.height = source.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(source, 0, 0);
            return canvas.toDataURL('image/png');
        }
        return null;
    }

    downloadReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        const date = new Date().toLocaleString();

        // 1. Add Background
        const bgData = this.getImageDataURL('certificate_bg');
        if (bgData) {
            try {
                doc.addImage(bgData, 'PNG', 0, 0, width, height);
            } catch (e) {
                console.error("BG Add Error", e);
            }
        }

        let yPos = 60; // Start lower to clear top border

        // 2. Headings
        doc.setTextColor(0, 150, 0); // Darker Neon Green for readability
        doc.setFont("helvetica", "bold");

        doc.setFontSize(32); // Slightly smaller
        doc.text("BINARY DMZ", width / 2, yPos, { align: 'center' });
        yPos += 12;

        doc.setFontSize(20); // Slightly smaller
        doc.text("MISSION COMPLETION CERTIFICATE", width / 2, yPos, { align: 'center' });
        yPos += 25;

        // 3. Pilot Info
        doc.setTextColor(0, 0, 0); // BLACK
        doc.setFontSize(26);
        doc.text(`Pilot: ${this.playerName}`, width / 2, yPos, { align: 'center' });
        yPos += 20;

        // 4. Consolidated Stats (Dark Grey)
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(16);

        const stats = [
            `Date: ${date}`,
            `Difficulty: ${this.difficulty}  |  Mode: ${this.mode}`,
            `Final Score: ${this.score}  (High Score: ${this.highScore})`
        ];

        stats.forEach(line => {
            doc.text(line, width / 2, yPos, { align: 'center' });
            yPos += 10;
        });

        // 6. Footer (New Record text removed)

        // 7. Game URL (Positioned relative to stats to keep it compact)
        yPos += 15;
        doc.setTextColor(0, 255, 255); // Cyan
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Play at: https://jamesabela.github.io/binarydmz/", width / 2, yPos, { align: 'center' });

        doc.save(`BinaryDMZ_Certificate_${this.playerName}.pdf`);
    }
}
