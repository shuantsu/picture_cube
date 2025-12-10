# Picture Cube

A 3D Rubik's cube simulator with custom texture support and multiple visualization modes.

[![Youtube Video](media/video.png)](https://www.youtube.com/watch?v=OOUIykqF7zs)

![Stickers editor](media/thumb1.png)

![Mobile View](media/mobile.png)

## Setup

### Development
```bash
git clone https://github.com/shuantsu/picture_cube.git
cd picture-cube
pnpm install
pnpm dev
```

### Production Build
```bash
pnpm build
# Output: build/ folder
```

For detailed technical documentation, see [docs/README.md](docs/README.md)

## Features

- Create your own sticker mods with the Textures Editor, you can even create "impossible cubes" to annoy your friends
- 12 handcrafted textures already included
- Head tracking with video camera for cube movement with beautiful background parallax effect
- GiiKER Bluetooth cube support (more Bluetooth cubes planned in the future)
- Full solve history with "branching" feature allow for exploration of different solutions
- Extremely performant (600k movements per second are possible)
- Modern build system with Vite
- In constant development, more cool things are planned

## Live Demo

https://filipeteixeira.com.br/new/picturecube/