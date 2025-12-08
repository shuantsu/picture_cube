# Picture Cube

A 3D Rubik's cube simulator with custom texture support and multiple visualization modes.

[![Youtube Video](media/video.png)](https://www.youtube.com/watch?v=OOUIykqF7zs)

![Stickers editor](media/thumb1.png)

![Mobile View](media/mobile.png)

## Setup

```bash
git clone https://github.com/shuantsu/picture_cube.git
cd picture-cube
php -S localhost:8000 -t dist/
```

## Features

- Create your own sticker mods with the Textures Editor, you can even create "impossible cubes" to annoy your friends
- 12 handcrafted textures already included
- Head tracking with video camera for cube movement with beautiful background paralax effect
- Giiker cube bluetooth cube support (more bluetooth cubes planned in the future)
- Full solve history with "branching" feature allow for exploration of different solutions
- Extremely performant (600k movements per seconds are possible)
- Under development. More cool things are planned, stay tuned!!

## Live Demo

https://filipeteixeira.com.br/new/picturecube/

## Usage

Open `localhost:8000` in your browser. Use the control panel to:
- Execute moves manually or via algorithm input
- Apply custom textures via JSON configuration
- Switch between visualization modes
- Load example texture configurations

Supports standard cube notation (R, U, F, L, B, D) with modifiers (', 2) and advanced moves (M, E, S, x, y, z, wide moves).