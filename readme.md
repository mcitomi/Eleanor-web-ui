# Eleanor WEB UI 
A lightweight web interface for the Eleanor chess engine, built with Bun, React, and TypeScript.

<img src="https://imgur.com/cU8FNr4.png" alt="Cute cat playing chess" title="Cute cat playing chess" width="200px">

### ♟️ Features
- It manages multiple concurrent sessions by spawning isolated UCI engine child processes per user.

- Each session tracks activity, handles custom FEN positions, and auto-terminates after inactivity, providing efficient and scalable real-time chess play via a simple REST API.

#### Updates

- "Eleanor starts the round" method added. ~ v.0.2.6.

## 🚀 Installation
- Download and setup the [Eleanor engine](https://github.com/rektdie/Eleanor).
- Clone [this repo](https://github.com/mcitomi/Eleanor-web-ui) to your computer.
- Configurate your [`config.json`](https://github.com/mcitomi/Eleanor-web-ui).
- Download the [Bun runtime](https://bun.sh/).
- Install the dependencies with `bun install`.
- Run the application with `bun start`.

## ✨ Config

- Paste your path to the config file. (The path should point to the built binary file /exe)

```json
{
    "port" : 3000,  // http port number
    "engine_path" : "/mnt/d/Codes/2025/Eleanor-web-ui/Eleanor/Eleanor", // Eleanor engine binary path
    "maxInstanceSize" : 1   // Maximum number of simultaneous game sessions
}
```

## 🗒️ Plans
- ✅ Sounds.
- Log informations screen.
- Time control.
- Player number / server load indicator.
- Benchmarks tab etc.
- Match history / replays.
- Better UX / UI. ~ "Your turn" etc.

#### upcoming bug fixes:
- When the user leaves the page and returns, traces of the last step are lost.
- Make the chessboard bigger in phone view.
- "ha kijelölsz egy bábut, sárgával jelezve van, hogy hova tud lépni. Ez nagyszerű, de ha a motor gondolkodása közben jelölsz ki figurát, majd idők közben lép egyet a bot, akkor továbbra is fogod a bábut, de nem jelenik meg a sárga jelölés, hogy hova tudsz lépni"

### 🤖 Version numbering system:
> MAJOR.MINOR.FEATURE.FIX

- **MAJOR**: An important, far-reaching change or innovation.
- **MINOR**: Less important, but still significant changes.
- **FEATURE**: Add a new function or command.
- **FIX**: Bug fixes, optimization.