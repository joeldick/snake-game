# Snake Game

A classic Snake game available in two versions:
- **Web Version**: HTML5 Canvas + JavaScript (recommended for easy sharing)
- **Desktop Version**: Python + Pygame

## Features

- Classic snake gameplay with arrow key or WASD controls
- Score tracking
- Collision detection with walls and self
- Pause functionality (Space bar)
- Game over screen with restart option
- Responsive design (web version)
- Clean, modular code structure

## Web Version (Recommended)

### Quick Start (Web)

1. Install Node dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   Open the printed local URL (usually http://localhost:5173) and start playing.

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview the production build locally:
   ```bash
   npm run preview
   ```

### Features
- No installation required (just open in browser)
- Responsive design works on desktop and mobile
- Beautiful modern UI with gradients and animations
- Smooth gameplay at 60fps
- Easy to deploy to any web hosting service

## Desktop Version (Python)

The desktop (Python/Pygame) version was removed when the project migrated to the JavaScript/web version. If you need the Python variant back, we can restore it from Git history or re-add it on request.

## Controls

- **Arrow Keys** or **WASD**: Move the snake
- **Space**: Pause/Resume game
- **R**: Restart game (on game over screen)
- **ESC**: Quit game (on game over screen)

## Game Rules

- Control the snake to eat red food pellets
- Each food pellet increases your score by 10 points
- The snake grows longer each time it eats food
- Avoid hitting the walls or the snake's own body
- The game ends when the snake collides with a wall or itself

## Project Structure

```
snake-game/
├── index.html       # Web version - main HTML file
├── game.js          # Web version - game logic and rendering
├── package.json     # Project metadata and scripts (dev server, build)
├── src/             # Canonical web source (HTML, JS)
├── dist/            # Production build output (generated)
├── .gitignore       # Git ignore rules
└── README.md        # This file
```

## Deployment Options

### Web Deployment (Easy)
The web version can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Surge.sh
- Firebase Hosting

Simply upload the `index.html`, `game.js`, and any assets.

### Desktop Distribution
The Python version can be packaged using:
- PyInstaller
- cx_Freeze
- py2exe (Windows)
- py2app (macOS)

## Customization

You can customize the game by modifying the constants in `config.py`:

- Window size and grid dimensions
- Colors
- Frame rate (game speed)
- Initial snake length
- And more!

## Development

The code is organized into separate modules for easy maintenance and extension:

- **main.py**: Contains the main game loop and Pygame initialization
- **game.py**: Handles game state, input processing, and rendering coordination
- **snake.py**: Manages snake movement, growth, and collision detection
- **food.py**: Handles food generation and rendering
- **config.py**: Centralizes all game configuration constants

Feel free to modify and extend the web version. If you want the Python desktop version restored, say so and I can resurrect it from git history or re-add it.

## Future Enhancements

Some ideas for extending the game:
- High score system with persistent storage
- Different difficulty levels
- Sound effects and music
- Multiple food types with different point values
- Power-ups and special abilities
- Menu system
- Better graphics and animations