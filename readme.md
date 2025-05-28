# Eleanor WEB UI 
A lightweight web interface for the Eleanor chess engine, built with Bun, React, and TypeScript.
It manages multiple concurrent sessions by spawning isolated UCI engine child processes per user.
Each session tracks activity, handles custom FEN positions, and auto-terminates after inactivity, providing efficient and scalable real-time chess play via a simple REST API.

<img src="https://imgur.com/cU8FNr4.png" alt="Cute cat playing chess" title="Cute cat playing chess" width="200px">

## 🚀 Installation
- Download and setup the Eleanor engine from https://github.com/rektdie/Eleanor.
- Clone this repo to your computer.
- Configurate your `config.json`.
- Download the Bun runtime. https://bun.sh/
- Install the dependencies with `bun install`.
- Run the application with `bun start`.

## ✨ Config

- Paste your path to the config file. (The path should point to the built binary file /exe)

```json
{
    "port" : 3000,
    "engine_path" : "/mnt/d/Codes/2025/Eleanor-web-ui/Eleanor/Eleanor",
    "maxInstanceSize" : 1
}
```

## 🗒️ Plans
- Sounds.
- Log informations screen.
- Time control.