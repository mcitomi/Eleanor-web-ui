# Eleanor WEB UI 
A minimalist web ui for the Eleanor chess engine.

> Currently, only a "Selfhosted" version has been made, which means that everyone has to download the web app and engine to their own home computer and then run it.

## 🚀 Installation
- Download and setup the Eleanor engine from https://github.com/rektdie/Eleanor.
- Clone this repo to your computer.
- Configurate your `config.json`.
- Download the Bun runtime. https://bun.sh/
- Move to the "Selfhosted" folder. `cd Selfhosted`.
- Install the dependencies with `bun install`.
- Run the application with `bun start`.

## ✨ Config

- Paste your path to the config file. (The path should point to the built binary file /exe)

```json
{
    "port" : 3000,
    "engine_path" : "/mnt/d/Codes/2025/Eleanor-web-ui/Eleanor/Eleanor"
}
```

### ⚠️ Currently only tested on linux ⚠️