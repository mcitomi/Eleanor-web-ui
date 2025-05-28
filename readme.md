# Eleanor WEB UI 
A lightweight web interface for the Eleanor chess engine, built with Bun, React, and TypeScript.

### ♟️ Features
- It manages multiple concurrent sessions by spawning isolated UCI engine child processes per user.

- Each session tracks activity, handles custom FEN positions, and auto-terminates after inactivity, providing efficient and scalable real-time chess play via a simple REST API.

<img src="https://imgur.com/cU8FNr4.png" alt="Cute cat playing chess" title="Cute cat playing chess" width="200px">

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
- Sounds.
- Log informations screen.
- Time control.
- When the user leaves the page and returns, traces of the last step are lost.
- Player number / server load indicator.
- Benchmarks tab etc.
- Match history / replays.
- Better UX / UI.