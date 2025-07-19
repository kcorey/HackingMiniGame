class ZenMatch3 {
    constructor() {
        this.boardSize = 8;
        this.board = [];
        this.selectedTile = null;
        this.score = 0;
        this.matches = 0;
        this.level = 1;
        this.musicEnabled = true;
        this.soundEnabled = true;
        this.isPaused = false;
        
        // Block types - unlock progressively
        this.blockTypes = [
            { name: 'crystal', class: 'block-crystal', unlocked: true },
            { name: 'flower', class: 'block-flower', unlocked: true },
            { name: 'star', class: 'block-star', unlocked: true },
            { name: 'moon', class: 'block-moon', unlocked: false },
            { name: 'sun', class: 'block-sun', unlocked: false },
            { name: 'heart', class: 'block-heart', unlocked: false }
        ];
        
        this.audioContext = null;
        this.backgroundMusic = null;
        
        this.initializeGame();
        this.setupEventListeners();
        this.createAudioContext();
        this.startBackgroundMusic();
    }
    
    initializeGame() {
        this.createBoard();
        this.fillBoard();
        this.renderBoard();
        this.updateUI();
    }
    
    createBoard() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
    }
    
    getAvailableBlockTypes() {
        return this.blockTypes.filter(block => block.unlocked);
    }
    
    fillBoard() {
        const availableTypes = this.getAvailableBlockTypes();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    let blockType;
                    let attempts = 0;
                    
                    do {
                        blockType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                        attempts++;
                    } while (attempts < 10 && this.wouldCreateMatch(row, col, blockType));
                    
                    this.board[row][col] = blockType;
                }
            }
        }
    }
    
    wouldCreateMatch(row, col, blockType) {
        // Check horizontal match
        let horizontalCount = 1;
        // Check left
        for (let c = col - 1; c >= 0; c--) {
            if (this.board[row][c] && this.board[row][c].name === blockType.name) {
                horizontalCount++;
            } else {
                break;
            }
        }
        // Check right
        for (let c = col + 1; c < this.boardSize; c++) {
            if (this.board[row][c] && this.board[row][c].name === blockType.name) {
                horizontalCount++;
            } else {
                break;
            }
        }
        
        // Check vertical match
        let verticalCount = 1;
        // Check up
        for (let r = row - 1; r >= 0; r--) {
            if (this.board[r][col] && this.board[r][col].name === blockType.name) {
                verticalCount++;
            } else {
                break;
            }
        }
        // Check down
        for (let r = row + 1; r < this.boardSize; r++) {
            if (this.board[r][col] && this.board[r][col].name === blockType.name) {
                verticalCount++;
            } else {
                break;
            }
        }
        
        return horizontalCount >= 3 || verticalCount >= 3;
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        
        // Clear the board (only called at game start)
        gameBoard.innerHTML = '';
        
        // Create tiles for all blocks
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== null) {
                    const tile = document.createElement('div');
                    tile.className = `tile ${this.board[row][col].class}`;
                    tile.dataset.row = row;
                    tile.dataset.col = col;
                    
                    tile.addEventListener('click', (e) => this.handleTileClick(e));
                    tile.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        this.handleTileClick(e);
                    });
                    
                    gameBoard.appendChild(tile);
                }
            }
        }
    }
    
    updateBoard() {
        // Update existing tiles without recreating them - NEVER clear the DOM
        const gameBoard = document.getElementById('game-board');
        const existingTiles = gameBoard.querySelectorAll('.tile');
        
        // Create a map of existing tiles by position
        const tileMap = new Map();
        existingTiles.forEach(tile => {
            const row = parseInt(tile.dataset.row);
            const col = parseInt(tile.dataset.col);
            tileMap.set(`${row},${col}`, tile);
        });
        
        // Update or create tiles as needed
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const key = `${row},${col}`;
                const existingTile = tileMap.get(key);
                
                if (this.board[row][col] !== null) {
                    if (existingTile) {
                        // Update existing tile
                        existingTile.className = `tile ${this.board[row][col].class}`;
                    } else {
                        // Create new tile
                        const tile = document.createElement('div');
                        tile.className = `tile ${this.board[row][col].class}`;
                        tile.dataset.row = row;
                        tile.dataset.col = col;
                        
                        tile.addEventListener('click', (e) => this.handleTileClick(e));
                        tile.addEventListener('touchstart', (e) => {
                            e.preventDefault();
                            this.handleTileClick(e);
                        });
                        
                        gameBoard.appendChild(tile);
                    }
                } else {
                    // Remove tile if it exists and position is now empty
                    if (existingTile) {
                        existingTile.remove();
                    }
                }
            }
        }
    }
    
    handleTileClick(event) {
        if (this.isPaused) return;
        
        const tile = event.target;
        const row = parseInt(tile.dataset.row);
        const col = parseInt(tile.dataset.col);
        
        if (this.selectedTile === null) {
            // First tile selection
            this.selectedTile = { row, col };
            tile.classList.add('selected');
            this.playSound('select');
        } else {
            // Second tile selection
            const prevTile = document.querySelector('.tile.selected');
            if (prevTile) prevTile.classList.remove('selected');
            
            if (this.selectedTile.row === row && this.selectedTile.col === col) {
                // Deselect same tile
                this.selectedTile = null;
                return;
            }
            
            if (this.isAdjacent(this.selectedTile, { row, col })) {
                this.swapTiles(this.selectedTile, { row, col });
            }
            
            this.selectedTile = null;
        }
    }
    
    isAdjacent(tile1, tile2) {
        const rowDiff = Math.abs(tile1.row - tile2.row);
        const colDiff = Math.abs(tile1.col - tile2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    swapTiles(tile1, tile2) {
        // Get the DOM elements for the tiles
        const tile1Element = document.querySelector(`[data-row="${tile1.row}"][data-col="${tile1.col}"]`);
        const tile2Element = document.querySelector(`[data-row="${tile2.row}"][data-col="${tile2.col}"]`);
        
        if (!tile1Element || !tile2Element) return;
        
        // Store original positions
        const rect1 = tile1Element.getBoundingClientRect();
        const rect2 = tile2Element.getBoundingClientRect();
        
        // Calculate the distance to move
        const deltaX = rect2.left - rect1.left;
        const deltaY = rect2.top - rect1.top;
        
        // Add animation classes
        tile1Element.classList.add('swapping');
        tile2Element.classList.add('swapping');
        
        // Animate the swap
        tile1Element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        tile2Element.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
        
        // After animation completes, perform the actual swap
        setTimeout(() => {
            // Swap tiles in board
            const temp = this.board[tile1.row][tile1.col];
            this.board[tile1.row][tile1.col] = this.board[tile2.row][tile2.col];
            this.board[tile2.row][tile2.col] = temp;
            
            // Reset transform and remove animation classes
            tile1Element.style.transform = '';
            tile2Element.style.transform = '';
            tile1Element.classList.remove('swapping');
            tile2Element.classList.remove('swapping');
            
            // Check for matches
            const matches = this.findMatches();
            
            if (matches.length > 0) {
                this.playSound('match');
                this.processMatches(matches);
            } else {
                // Swap back if no matches
                this.board[tile2.row][tile2.col] = this.board[tile1.row][tile1.col];
                this.board[tile1.row][tile1.col] = temp;
                this.playSound('invalid');
                
                // Animate the swap back
                setTimeout(() => {
                    tile1Element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                    tile2Element.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
                    
                    setTimeout(() => {
                        tile1Element.style.transform = '';
                        tile2Element.style.transform = '';
                        this.renderBoard();
                    }, 300);
                }, 100);
            }
            
            this.renderBoard();
        }, 300);
    }
    
    findMatches() {
        const matches = [];
        const visited = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        
        // Find horizontal matches
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize - 2; col++) {
                const currentType = this.board[row][col].name;
                let matchLength = 1;
                
                for (let c = col + 1; c < this.boardSize; c++) {
                    if (this.board[row][c].name === currentType) {
                        matchLength++;
                    } else {
                        break;
                    }
                }
                
                if (matchLength >= 3) {
                    for (let c = col; c < col + matchLength; c++) {
                        if (!visited[row][c]) {
                            matches.push({ row, col: c });
                            visited[row][c] = true;
                        }
                    }
                }
            }
        }
        
        // Find vertical matches
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize - 2; row++) {
                const currentType = this.board[row][col].name;
                let matchLength = 1;
                
                for (let r = row + 1; r < this.boardSize; r++) {
                    if (this.board[r][col].name === currentType) {
                        matchLength++;
                    } else {
                        break;
                    }
                }
                
                if (matchLength >= 3) {
                    for (let r = row; r < row + matchLength; r++) {
                        if (!visited[r][col]) {
                            matches.push({ row: r, col });
                            visited[r][col] = true;
                        }
                    }
                }
            }
        }
        
        return matches;
    }
    
    processMatches(matches) {
        // Add matching animation and create particle effects
        matches.forEach(match => {
            const tile = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`);
            if (tile) {
                tile.classList.add('matching');
                this.createDestructionParticles(tile);
            }
        });
        
        // Calculate score
        const matchScore = matches.length * 10 + (matches.length > 3 ? (matches.length - 3) * 5 : 0);
        this.score += matchScore;
        this.matches += matches.length;
        
        // Show score popup
        this.showScorePopup(matchScore);
        
        // Remove matched tiles after animation
        setTimeout(() => {
            // Remove matched blocks from board
            matches.forEach(match => {
                this.board[match.row][match.col] = null;
            });
            
            // Apply gravity to board
            this.applyGravity();
            
            // Fill empty spaces
            this.fillEmptySpaces();
            
            // Update board
            this.updateBoard();
            
            // Check for more matches (cascade effect)
            setTimeout(() => {
                const newMatches = this.findMatches();
                if (newMatches.length > 0) {
                    this.processMatches(newMatches);
                } else {
                    this.checkLevelUp();
                }
            }, 100);
        }, 300);
        
        this.updateUI();
    }
    
    applyGravity() {
        // Simple gravity: move blocks down to fill empty spaces
        for (let col = 0; col < this.boardSize; col++) {
            // Collect non-null blocks from bottom to top
            const column = [];
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] !== null) {
                    column.push(this.board[row][col]);
                }
            }
            
            // Clear column
            for (let row = 0; row < this.boardSize; row++) {
                this.board[row][col] = null;
            }
            
            // Place blocks from bottom
            for (let i = 0; i < column.length; i++) {
                const newRow = this.boardSize - 1 - i;
                this.board[newRow][col] = column[i];
            }
        }
    }
    

    

    
    fillEmptySpaces() {
        const availableTypes = this.getAvailableBlockTypes();
        
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize; row++) {
                if (this.board[row][col] === null) {
                    const blockType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                    this.board[row][col] = blockType;
                }
            }
        }
    }
    
    checkLevelUp() {
        let newBlocksUnlocked = false;
        
        // Unlock moon blocks at 100 matches
        if (this.matches >= 100 && !this.blockTypes[3].unlocked) {
            this.blockTypes[3].unlocked = true;
            newBlocksUnlocked = true;
            this.showUnlockMessage('🌙 Moon blocks unlocked!');
        }
        
        // Unlock sun blocks at 200 matches
        if (this.matches >= 200 && !this.blockTypes[4].unlocked) {
            this.blockTypes[4].unlocked = true;
            newBlocksUnlocked = true;
            this.showUnlockMessage('☀️ Sun blocks unlocked!');
        }
        
        // Unlock heart blocks at 300 matches
        if (this.matches >= 300 && !this.blockTypes[5].unlocked) {
            this.blockTypes[5].unlocked = true;
            newBlocksUnlocked = true;
            this.showUnlockMessage('💖 Heart blocks unlocked!');
        }
        
        if (newBlocksUnlocked) {
            this.playSound('levelup');
            // Gradually introduce new blocks
            setTimeout(() => {
                this.addNewBlocksToBoard();
            }, 2000);
        }
        
        // Update level based on score
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.playSound('levelup');
        }
    }
    
    addNewBlocksToBoard() {
        const availableTypes = this.getAvailableBlockTypes();
        const newType = availableTypes[availableTypes.length - 1];
        
        // Replace some random blocks with the new type
        const replacements = Math.min(8, Math.floor(this.boardSize * this.boardSize * 0.1));
        for (let i = 0; i < replacements; i++) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);
            this.board[row][col] = newType;
        }
        
        this.renderBoard();
    }
    
    showUnlockMessage(message) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = message;
        popup.style.left = '50%';
        popup.style.top = '30%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.fontSize = '1.5em';
        popup.style.color = '#ffd700';
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 2000);
    }
    
    showScorePopup(points) {
        const gameBoard = document.getElementById('game-board');
        const rect = gameBoard.getBoundingClientRect();
        
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = (rect.left + rect.width / 2) + 'px';
        popup.style.top = (rect.top + rect.height / 2) + 'px';
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    createDestructionParticles(tile) {
        const rect = tile.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Gradient color palette from bright red to orange to yellow to white
        const colors = [
            '#ff0000', // Bright red
            '#ff1a00', '#ff3300', '#ff4d00', '#ff6600', // Red-orange
            '#ff8000', '#ff9900', '#ffb300', '#ffcc00', // Orange
            '#ffe600', '#ffff00', '#ffff1a', '#ffff33', // Yellow
            '#ffff4d', '#ffff66', '#ffff80', '#ffff99', // Light yellow
            '#ffffb3', '#ffffcc', '#ffffe6', '#ffffff'  // White
        ];
        
        // Create 20+ particles with dynamic properties
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            
            // Random size between 2-8px
            const size = Math.random() * 6 + 2;
            
            // Random color from gradient palette
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Random angle for outward burst (0-360 degrees)
            const angle = Math.random() * Math.PI * 2;
            
            // Calculate tile size to limit particle distance to 0.8 of next block (80% of tile size)
            const tileSize = rect.width; // Assuming square tiles
            const maxDistance = tileSize * 0.8; // 80% of tile size
            
            // Random distance for burst (limited to maxDistance)
            const distance = Math.random() * maxDistance + 16; // 16px minimum (80% of 20px)
            
            // Calculate final position
            const finalX = Math.cos(angle) * distance;
            const finalY = Math.sin(angle) * distance;
            
            // Random upward drift (proportional to distance)
            const upwardDrift = Math.random() * (maxDistance * 0.3) + (maxDistance * 0.1);
            
            // Create unique animation name for each particle
            const animationName = `destructionParticle_${Date.now()}_${i}`;
            
            // Apply inline styles for dynamic animation
            Object.assign(particle.style, {
                position: 'absolute',
                left: centerX + 'px',
                top: centerY + 'px',
                width: size + 'px',
                height: size + 'px',
                backgroundColor: color,
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: '1000',
                opacity: '1',
                filter: 'blur(0px)',
                transform: 'translate(-50%, -50%)',
                animation: `${animationName} 0.8s ease-out forwards` // Slower animation
            });
            
            // Add custom CSS animation with unique name
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ${animationName} {
                    0% {
                        transform: translate(-50%, -50%) translate(0px, 0px);
                        opacity: 1;
                        filter: blur(0px);
                    }
                    20% {
                        transform: translate(-50%, -50%) translate(${finalX * 0.2}px, ${finalY * 0.2 - upwardDrift * 0.2}px);
                        opacity: 0.9;
                        filter: blur(0.5px);
                    }
                    40% {
                        transform: translate(-50%, -50%) translate(${finalX * 0.4}px, ${finalY * 0.4 - upwardDrift * 0.4}px);
                        opacity: 0.7;
                        filter: blur(1px);
                    }
                    60% {
                        transform: translate(-50%, -50%) translate(${finalX * 0.6}px, ${finalY * 0.6 - upwardDrift * 0.6}px);
                        opacity: 0.5;
                        filter: blur(1.5px);
                    }
                    80% {
                        transform: translate(-50%, -50%) translate(${finalX * 0.8}px, ${finalY * 0.8 - upwardDrift * 0.8}px);
                        opacity: 0.3;
                        filter: blur(2px);
                    }
                    100% {
                        transform: translate(-50%, -50%) translate(${finalX}px, ${finalY - upwardDrift}px);
                        opacity: 0;
                        filter: blur(3px);
                    }
                }
            `;
            
            document.head.appendChild(style);
            
            // Add to particle container
            document.getElementById('particle-container').appendChild(particle);
            
            // Remove particle and style after animation
            setTimeout(() => {
                particle.remove();
                style.remove();
            }, 800); // Match the animation duration
        }
    }
    
    createParticles(tile) {
        const rect = tile.getBoundingClientRect();
        const colors = ['#ff6b6b', '#4ecdc4', '#feca57', '#ff9ff3', '#a8edea'];
        
        // Create more particles for a more dramatic effect
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';
            particle.style.width = (Math.random() * 4 + 3) + 'px';
            particle.style.height = (Math.random() * 4 + 3) + 'px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random direction and distance for more natural crumbling
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 80 + 40;
            const deltaX = Math.cos(angle) * distance;
            const deltaY = Math.sin(angle) * distance;
            
            particle.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            
            document.getElementById('particle-container').appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('matches').textContent = this.matches;
        document.getElementById('level').textContent = this.level;
        
        // Update progress bar
        let nextMilestone = 100;
        if (this.matches >= 200) nextMilestone = 300;
        else if (this.matches >= 100) nextMilestone = 200;
        
        const progress = (this.matches % 100) / 100 * 100;
        const matchesNeeded = nextMilestone - this.matches;
        
        document.getElementById('progress-fill').style.width = progress + '%';
        document.getElementById('matches-needed').textContent = Math.max(0, matchesNeeded);
        
        if (this.matches >= 300) {
            document.querySelector('.progress-label').textContent = 'All blocks unlocked!';
            document.getElementById('progress-fill').style.width = '100%';
        }
    }
    
    setupEventListeners() {
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            document.getElementById('pause-btn').textContent = this.isPaused ? '▶️' : '⏸️';
        });
        
        document.getElementById('music-btn').addEventListener('click', () => {
            this.musicEnabled = !this.musicEnabled;
            document.getElementById('music-btn').classList.toggle('muted', !this.musicEnabled);
            
            if (this.backgroundMusic) {
                if (this.musicEnabled) {
                    this.backgroundMusic.start();
                } else {
                    this.backgroundMusic.stop();
                }
            }
        });
        
        document.getElementById('sound-btn').addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            document.getElementById('sound-btn').classList.toggle('muted', !this.soundEnabled);
        });
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        let frequency, duration;
        
        switch (type) {
            case 'match':
                frequency = 523.25; // C5
                duration = 0.3;
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                break;
            case 'select':
                frequency = 440; // A4
                duration = 0.1;
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                break;
            case 'invalid':
                frequency = 220; // A3
                duration = 0.2;
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                break;
            case 'levelup':
                // Play a chord
                this.playChord([523.25, 659.25, 783.99], 0.8); // C5, E5, G5
                return;
        }
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playChord(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + duration);
            }, index * 100);
        });
    }
    
    startBackgroundMusic() {
        if (!this.audioContext || !this.musicEnabled) return;
        
        // Simple ambient background music
        const playNote = (frequency, startTime, duration) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, startTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.05, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };
        
        // Peaceful melody loop
        const melody = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale
        
        const playMelody = () => {
            if (!this.musicEnabled) return;
            
            const now = this.audioContext.currentTime;
            melody.forEach((note, index) => {
                playNote(note, now + index * 0.5, 0.8);
            });
            
            setTimeout(playMelody, 8000); // Repeat every 8 seconds
        };
        
        // Start after a short delay
        setTimeout(playMelody, 1000);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ZenMatch3();
});