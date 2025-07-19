class ZenMatch3 {
    constructor() {
        this.boardSize = 8;
        this.tileSize = 40; // 320px / 8 = 40px per tile
        this.canvas = null;
        this.ctx = null;
        
        // Two arrays for smooth transitions
        this.boardA = []; // Current positions
        this.boardB = []; // Target positions
        this.currentBoard = 'A'; // Track which array is current
        
        this.selectedTile = null;
        this.score = 0;
        this.matches = 0;
        this.level = 1;
        this.musicEnabled = true;
        this.soundEnabled = true;
        this.isPaused = false;
        this.isAnimating = false;
        
        // Block types - unlock progressively
        this.blockTypes = [
            { name: 'crystal', color: '#ff6b6b', unlocked: true },
            { name: 'flower', color: '#4ecdc4', unlocked: true },
            { name: 'star', color: '#feca57', unlocked: true },
            { name: 'moon', color: '#a8edea', unlocked: false },
            { name: 'sun', color: '#ff9a9e', unlocked: false },
            { name: 'heart', color: '#ff6b9d', unlocked: false }
        ];
        
        this.audioContext = null;
        this.backgroundMusic = null;
        this.currentMusicIndex = 0;
        this.musicTracks = [
            'music/Stellar Drift.mp3',
            'music/Stellar Drift (1).mp3',
            'music/Stellar Drift (2).mp3',
            'music/Stellar Drift (3).mp3',
            'music/Stellar Drift (4).mp3',
            'music/Stellar Drift (5).mp3',
            'music/Celestial Cascade.mp3',
            'music/Celestial Cascade (1).mp3'
        ];
        
        this.initializeGame();
        this.setupEventListeners();
        this.createAudioContext();
        // Don't start music automatically - wait for user interaction
    }
    
    initializeGame() {
        this.setupCanvas();
        this.createBoard();
        this.fillBoard();
        this.drawBoard();
        this.updateUI();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 320;
        this.canvas.height = 320;
    }
    
    createBoard() {
        this.boardA = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.boardB = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
    }
    
    getAvailableBlockTypes() {
        return this.blockTypes.filter(block => block.unlocked);
    }
    
    fillBoard() {
        const availableTypes = this.getAvailableBlockTypes();
        const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (currentBoard[row][col] === null) {
                    let blockType;
                    let attempts = 0;
                    
                    do {
                        blockType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                        attempts++;
                    } while (attempts < 10 && this.wouldCreateMatch(row, col, blockType));
                    
                    currentBoard[row][col] = blockType;
                }
            }
        }
    }
    
    wouldCreateMatch(row, col, blockType) {
        const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
        
        // Check horizontal match
        let horizontalCount = 1;
        // Check left
        for (let c = col - 1; c >= 0; c--) {
            if (currentBoard[row][c] && currentBoard[row][c].name === blockType.name) {
                horizontalCount++;
            } else {
                break;
            }
        }
        // Check right
        for (let c = col + 1; c < this.boardSize; c++) {
            if (currentBoard[row][c] && currentBoard[row][c].name === blockType.name) {
                horizontalCount++;
            } else {
                break;
            }
        }
        
        // Check vertical match
        let verticalCount = 1;
        // Check up
        for (let r = row - 1; r >= 0; r--) {
            if (currentBoard[r][col] && currentBoard[r][col].name === blockType.name) {
                verticalCount++;
            } else {
                break;
            }
        }
        // Check down
        for (let r = row + 1; r < this.boardSize; r++) {
            if (currentBoard[r][col] && currentBoard[r][col].name === blockType.name) {
                verticalCount++;
            } else {
                break;
            }
        }
        
        return horizontalCount >= 3 || verticalCount >= 3;
    }
    
    drawBoard() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all blocks
        const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (currentBoard[row][col] !== null) {
                    this.drawBlock(row, col, currentBoard[row][col]);
                }
            }
        }
    }
    
    drawBlock(row, col, blockType) {
        const x = col * this.tileSize;
        const y = row * this.tileSize;
        
        // Check if this block is selected
        const isSelected = this.selectedTile && this.selectedTile.row === row && this.selectedTile.col === col;
        
        // Draw block background
        this.ctx.fillStyle = blockType.color;
        this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        
        // Draw block border
        if (isSelected) {
            this.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            this.ctx.lineWidth = 3;
        } else {
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 1;
        }
        this.ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
        
        // Draw block symbol
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const symbols = {
            'crystal': '💎',
            'flower': '🌸',
            'star': '⭐',
            'moon': '🌙',
            'sun': '☀️',
            'heart': '💖'
        };
        
        this.ctx.fillText(symbols[blockType.name], x + this.tileSize/2, y + this.tileSize/2);
    }
    

    
    handleTileClick(row, col) {
        if (this.isPaused) return;
        
        if (this.selectedTile === null) {
            // First tile selection
            this.selectedTile = { row, col };
            this.playSound('select');
            this.drawBoard(); // Redraw to show selection
        } else {
            // Second tile selection
            if (this.selectedTile.row === row && this.selectedTile.col === col) {
                // Deselect same tile
                this.selectedTile = null;
                this.drawBoard();
                return;
            }
            
            if (this.isAdjacent(this.selectedTile, { row, col })) {
                this.swapTiles(this.selectedTile, { row, col });
            }
            
            this.selectedTile = null;
            this.drawBoard();
        }
    }
    
    isAdjacent(tile1, tile2) {
        const rowDiff = Math.abs(tile1.row - tile2.row);
        const colDiff = Math.abs(tile1.col - tile2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }
    
    swapTiles(tile1, tile2) {
        const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
        
        // Store original positions and blocks
        const block1 = currentBoard[tile1.row][tile1.col];
        const block2 = currentBoard[tile2.row][tile2.col];
        
        // Animation parameters
        const animationDuration = 500; // 0.5 seconds
        const delay = 200; // 0.2 seconds delay
        const startTime = Date.now();
        
        // Disable input during animation
        this.isAnimating = true;
        
        // Animate the swap
        const animateSwap = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            // Ease-in-out function
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // Calculate intermediate positions
            const x1 = tile1.col * this.tileSize + this.tileSize / 2;
            const y1 = tile1.row * this.tileSize + this.tileSize / 2;
            const x2 = tile2.col * this.tileSize + this.tileSize / 2;
            const y2 = tile2.row * this.tileSize + this.tileSize / 2;
            
            // Interpolate positions
            const currentX1 = x1 + (x2 - x1) * easeProgress;
            const currentY1 = y1 + (y2 - y1) * easeProgress;
            const currentX2 = x2 + (x1 - x2) * easeProgress;
            const currentY2 = y2 + (y1 - y2) * easeProgress;
            
            // Clear and redraw board
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw background
            this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw all blocks except the swapping ones
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (currentBoard[row][col] !== null && 
                        !((row === tile1.row && col === tile1.col) || 
                          (row === tile2.row && col === tile2.col))) {
                        this.drawBlock(row, col, currentBoard[row][col]);
                    }
                }
            }
            
            // Draw the swapping blocks at their animated positions
            this.drawBlockAtPosition(currentX1, currentY1, block1);
            this.drawBlockAtPosition(currentX2, currentY2, block2);
            
            if (progress < 1) {
                requestAnimationFrame(animateSwap);
            } else {
                // Animation complete - perform the actual swap
                currentBoard[tile1.row][tile1.col] = block2;
                currentBoard[tile2.row][tile2.col] = block1;
                
                // Check for matches after a small delay
                setTimeout(() => {
                    const matches = this.findMatches();
                    
                    if (matches.length > 0) {
                        this.playSound('match');
                        this.processMatches(matches);
                    } else {
                        // Animate swap back
                        this.animateSwapBack(tile1, tile2, block1, block2);
                    }
                    
                    this.isAnimating = false;
                }, delay);
            }
        };
        
        // Start animation after delay
        setTimeout(animateSwap, delay);
    }
    
    animateSwapBack(tile1, tile2, block1, block2) {
        const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
        
        // Animation parameters for swap back
        const animationDuration = 500; // 0.5 seconds
        const startTime = Date.now();
        
        // Animate the swap back
        const animateSwapBack = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            // Ease-in-out function
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // Calculate intermediate positions (reverse of original swap)
            const x1 = tile1.col * this.tileSize + this.tileSize / 2;
            const y1 = tile1.row * this.tileSize + this.tileSize / 2;
            const x2 = tile2.col * this.tileSize + this.tileSize / 2;
            const y2 = tile2.row * this.tileSize + this.tileSize / 2;
            
            // Interpolate positions (blocks moving back to original positions)
            const currentX1 = x2 + (x1 - x2) * easeProgress;
            const currentY1 = y2 + (y1 - y2) * easeProgress;
            const currentX2 = x1 + (x2 - x1) * easeProgress;
            const currentY2 = y1 + (y2 - y1) * easeProgress;
            
            // Clear and redraw board
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw background
            this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw all blocks except the swapping ones
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (currentBoard[row][col] !== null && 
                        !((row === tile1.row && col === tile1.col) || 
                          (row === tile2.row && col === tile2.col))) {
                        this.drawBlock(row, col, currentBoard[row][col]);
                    }
                }
            }
            
            // Draw the swapping blocks at their animated positions
            this.drawBlockAtPosition(currentX1, currentY1, block1);
            this.drawBlockAtPosition(currentX2, currentY2, block2);
            
            if (progress < 1) {
                requestAnimationFrame(animateSwapBack);
            } else {
                // Animation complete - perform the actual swap back
                currentBoard[tile1.row][tile1.col] = block1;
                currentBoard[tile2.row][tile2.col] = block2;
                
                this.playSound('invalid');
                this.drawBoard();
            }
        };
        
        // Start the swap back animation
        animateSwapBack();
    }
    
    drawBlockAtPosition(x, y, blockType) {
        const size = this.tileSize - 4;
        const halfSize = size / 2;
        
        // Draw block background
        this.ctx.fillStyle = blockType.color;
        this.ctx.fillRect(x - halfSize, y - halfSize, size, size);
        
        // Draw block border
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x - halfSize, y - halfSize, size, size);
        
        // Draw block symbol
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const symbols = {
            'crystal': '💎',
            'flower': '🌸',
            'star': '⭐',
            'moon': '🌙',
            'sun': '☀️',
            'heart': '💖'
        };
        
        this.ctx.fillText(symbols[blockType.name], x, y);
    }
    
    findMatches() {
        const matches = [];
        const visited = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
        
        // Find horizontal matches
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize - 2; col++) {
                if (!currentBoard[row][col]) continue;
                const currentType = currentBoard[row][col].name;
                let matchLength = 1;
                
                for (let c = col + 1; c < this.boardSize; c++) {
                    if (currentBoard[row][c] && currentBoard[row][c].name === currentType) {
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
                if (!currentBoard[row][col]) continue;
                const currentType = currentBoard[row][col].name;
                let matchLength = 1;
                
                for (let r = row + 1; r < this.boardSize; r++) {
                    if (currentBoard[r][col] && currentBoard[r][col].name === currentType) {
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
        // Calculate score
        const matchScore = matches.length * 10 + (matches.length > 3 ? (matches.length - 3) * 5 : 0);
        this.score += matchScore;
        this.matches += matches.length;
        
        // Show score popup
        this.showScorePopup(matchScore);
        
        // Create explosion particles for each matched block
        matches.forEach(match => {
            this.createExplosionParticles(match.row, match.col);
        });
        
        // Remove matched tiles after animation
        setTimeout(() => {
            // Remove matched blocks from board
            const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
            matches.forEach(match => {
                currentBoard[match.row][match.col] = null;
            });
            
            // Apply gravity to board
            this.applyGravity();
            
            // Fill empty spaces
            this.fillEmptySpaces();
            
            // Redraw board
            this.drawBoard();
            
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
        const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
        
        for (let col = 0; col < this.boardSize; col++) {
            // Collect non-null blocks from bottom to top
            const column = [];
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (currentBoard[row][col] !== null) {
                    column.push(currentBoard[row][col]);
                }
            }
            
            // Clear column
            for (let row = 0; row < this.boardSize; row++) {
                currentBoard[row][col] = null;
            }
            
            // Place blocks from bottom
            for (let i = 0; i < column.length; i++) {
                const newRow = this.boardSize - 1 - i;
                currentBoard[newRow][col] = column[i];
            }
        }
    }
    

    

    
    fillEmptySpaces() {
        const availableTypes = this.getAvailableBlockTypes();
        const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
        
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < this.boardSize; row++) {
                if (currentBoard[row][col] === null) {
                    const blockType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
                    currentBoard[row][col] = blockType;
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
        const currentBoard = this.currentBoard === 'A' ? this.boardA : this.boardB;
        
        // Replace some random blocks with the new type
        const replacements = Math.min(8, Math.floor(this.boardSize * this.boardSize * 0.1));
        for (let i = 0; i < replacements; i++) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);
            currentBoard[row][col] = newType;
        }
        
        this.drawBoard();
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
    
    createExplosionParticles(row, col) {
        console.log(`Creating explosion particles for block at row ${row}, col ${col}`);
        
        // Get canvas position relative to the page
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Calculate block center position on canvas
        const x = col * this.tileSize + this.tileSize / 2;
        const y = row * this.tileSize + this.tileSize / 2;
        
        // Convert to page coordinates
        const pageX = canvasRect.left + x;
        const pageY = canvasRect.top + y;
        
        console.log(`Canvas position: ${canvasRect.left}, ${canvasRect.top}`);
        console.log(`Block center: ${x}, ${y}`);
        console.log(`Page position: ${pageX}, ${pageY}`);
        
        // Color gradient from red to orange to yellow to white
        const colors = ['#ff0000', '#ff4400', '#ff8800', '#ffcc00', '#ffff00', '#ffff44', '#ffff88', '#ffffff'];
        
        // Create 20 particles for each block
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            
            // Random size between 2 and 6 pixels
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Random color from the gradient
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Position at block center on page
            particle.style.left = pageX + 'px';
            particle.style.top = pageY + 'px';
            
            // Random movement - particles burst in all directions
            const maxDistance = this.tileSize * 1.6; // Maximum distance for any direction
            const distance = Math.random() * maxDistance + 10; // Minimum 10px distance
            
            // Random angle for full 360-degree burst
            const angle = Math.random() * Math.PI * 2;
            const deltaX = Math.cos(angle) * distance;
            const deltaY = Math.sin(angle) * distance; // Can go up, down, left, right
            
            // Create unique animation name for each particle
            const animationName = `explosionParticle_${Date.now()}_${i}`;
            
            // Apply inline styles for dynamic animation
            Object.assign(particle.style, {
                position: 'absolute',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: '1000',
                opacity: '1',
                transform: 'translate(-50%, -50%)',
                animation: `${animationName} 1.5s ease-out forwards`
            });
            
            // Add custom CSS animation with unique name
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ${animationName} {
                    0% {
                        transform: translate(-50%, -50%) translate(0px, 0px);
                        opacity: 1;
                    }
                    50% {
                        transform: translate(-50%, -50%) translate(${deltaX * 0.5}px, ${deltaY * 0.5}px);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translate(-50%, -50%) translate(${deltaX}px, ${deltaY}px);
                        opacity: 0;
                    }
                }
            `;
            
            document.head.appendChild(style);
            
            document.getElementById('particle-container').appendChild(particle);
            
            // Remove particle and style after animation
            setTimeout(() => {
                particle.remove();
                style.remove();
            }, 1500);
        }
        
        console.log(`Created ${20} explosion particles`);
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
        // Canvas click handling
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleCanvasClick(e);
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            document.getElementById('pause-btn').textContent = this.isPaused ? '▶️' : '⏸️';
        });
        
        document.getElementById('music-btn').addEventListener('click', () => {
            this.musicEnabled = !this.musicEnabled;
            document.getElementById('music-btn').classList.toggle('muted', !this.musicEnabled);
            
            if (this.backgroundMusic) {
                if (this.musicEnabled) {
                    this.backgroundMusic.play();
                } else {
                    this.backgroundMusic.pause();
                }
            } else if (this.musicEnabled) {
                this.startBackgroundMusic();
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
    
    handleCanvasClick(event) {
        if (this.isPaused || this.isAnimating) return;
        
        // Start music on first user interaction
        if (this.musicEnabled && !this.backgroundMusic) {
            this.startBackgroundMusic();
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        
        if (col >= 0 && col < this.boardSize && row >= 0 && row < this.boardSize) {
            this.handleTileClick(row, col);
        }
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
        if (!this.musicEnabled) return;
        
        this.loadAndPlayMusic();
    }
    
    loadAndPlayMusic() {
        if (!this.musicEnabled) return;
        
        if (this.currentMusicIndex >= this.musicTracks.length) {
            this.currentMusicIndex = 0; // Loop back to start
        }
        
        const track = this.musicTracks[this.currentMusicIndex];
        this.backgroundMusic = new Audio(track);
        this.backgroundMusic.volume = 0.3; // Set volume to 30%
        this.backgroundMusic.loop = false; // Don't loop individual tracks
        
        // When one track ends, play the next
        this.backgroundMusic.addEventListener('ended', () => {
            this.currentMusicIndex++;
            this.loadAndPlayMusic();
        });
        
        // Handle errors
        this.backgroundMusic.addEventListener('error', (e) => {
            console.log('Error loading music:', e);
            this.currentMusicIndex++;
            setTimeout(() => this.loadAndPlayMusic(), 1000); // Wait before retrying
        });
        
        // Start playing
        this.backgroundMusic.play().catch(e => {
            console.log('Error playing music:', e);
            // Try next track if this one fails
            this.currentMusicIndex++;
            setTimeout(() => this.loadAndPlayMusic(), 1000); // Wait before retrying
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ZenMatch3();
});