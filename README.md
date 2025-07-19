# Hacking Mini Game

A challenging hacking-themed puzzle game that can be played offline as a Progressive Web App (PWA).

## Features

### 🎮 Core Gameplay
- **8x8 Grid**: Classic match 3 mechanics with smooth animations
- **Progressive Unlocking**: Start with 3 block types, unlock more as you progress
- **Zen Mode**: Focus on relaxation rather than time pressure or lives
- **Cascade Effects**: Matches create satisfying chain reactions

### 🌟 Block Types (6 Special Kinds)
1. **💎 Crystal Blocks** (Available from start)
2. **🌸 Flower Blocks** (Available from start)  
3. **⭐ Star Blocks** (Available from start)
4. **🌙 Moon Blocks** (Unlocked at 100 matches)
5. **☀️ Sun Blocks** (Unlocked at 200 matches)
6. **💖 Heart Blocks** (Unlocked at 300 matches)

### 🎵 Audio Experience
- **Background Music**: Peaceful ambient melodies using Web Audio API
- **Sound Effects**: Satisfying audio feedback for matches, selections, and level ups
- **Audio Controls**: Toggle music and sound effects independently

### 📱 Progressive Web App (PWA)
- **Offline Play**: Works completely offline once installed
- **Installable**: Can be installed on home screen like a native app
- **Fast Loading**: Cached resources for instant startup
- **Mobile Optimized**: Responsive design for all devices
- **Touch Controls**: Smooth touch interactions with haptic-like feedback

### ✨ Visual Effects
- **Particle Systems**: Colorful particles burst from matched blocks
- **Smooth Animations**: Satisfying visual feedback for all interactions
- **Gradient Backgrounds**: Beautiful color schemes for a zen atmosphere
- **Score Popups**: Visual feedback for scoring

## How to Play

1. **Select a Block**: Tap any block to select it (it will glow)
2. **Swap with Adjacent**: Tap an adjacent block to swap positions
3. **Make Matches**: Create lines of 3 or more identical blocks
4. **Watch Magic Happen**: Matched blocks disappear with particle effects
5. **Gravity Effect**: Blocks fall down to fill empty spaces
6. **Chain Reactions**: New matches can form automatically
7. **Unlock New Blocks**: Reach match milestones to unlock new block types

## Scoring System

- **Basic Match**: 10 points per block
- **Bonus Points**: Extra points for matches longer than 3 blocks
- **Cascade Bonus**: Additional points for chain reactions
- **Level Progression**: Level increases every 1000 points

## Progressive Unlocking

- **Start**: 3 block types (Crystal, Flower, Star)
- **100 Matches**: Moon blocks unlock 🌙
- **200 Matches**: Sun blocks unlock ☀️
- **300 Matches**: Heart blocks unlock 💖

## Controls

- **⏸️ Pause**: Pause/resume the game
- **🎵 Music**: Toggle background music
- **🔊 Sound**: Toggle sound effects

## Technical Features

- **Web Audio API**: High-quality procedural audio
- **CSS Grid**: Responsive layout system
- **Touch Events**: Optimized for mobile devices
- **Particle Effects**: Dynamic visual feedback
- **Progressive Enhancement**: Works on older browsers

## Getting Started

### Web Browser
Simply open `index.html` in a web browser on any modern device. The game will automatically start and adapt to your screen size.

### Install as PWA
1. Open the game in Chrome, Edge, or Safari
2. Look for the install prompt or use the browser menu
3. Click "Install" to add to your home screen
4. The game will now work offline!

### Offline Features
- Once installed, the game works completely offline
- All resources are cached for fast loading
- Progress is saved locally
- No internet connection required after installation

## Technical Features

- **Service Worker**: Handles offline caching and network requests
- **Web App Manifest**: Enables installation and app-like experience
- **Web Audio API**: High-quality procedural audio
- **CSS Grid**: Responsive layout system
- **Touch Events**: Optimized for mobile devices
- **Particle Effects**: Dynamic visual feedback
- **Progressive Enhancement**: Works on older browsers

## PWA Features

- **Offline First**: Works without internet connection
- **Fast Loading**: Cached resources load instantly
- **Installable**: Add to home screen like a native app
- **Background Sync**: Handles offline actions when connection returns
- **Push Notifications**: Ready for future notification features

Enjoy your hacking adventure! 🎮✨
