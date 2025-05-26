import { spawn } from "node:child_process";

import { engine_path } from "../../config.json";

const proc = spawn(engine_path, { stdio: ['pipe', 'pipe', 'pipe'] });

let resolveNextMove: (value: Object) => void;
let nextmove: Promise<Object>;

function getNextMove() {
    nextmove = new Promise<Object>((resolve) => {
        resolveNextMove = resolve;
    });
    return nextmove;
}

try {
    proc.stdout.on("data", (data: Buffer) => {
        const line = data.toString();

        console.log(line);
        
        const bestmoveLine = line.split("bestmove")[1];

        if(bestmoveLine) {
            const move = bestmoveLine.trim();
            resolveNextMove({
                "from" : `${move[0]}${move[1]}`,
                "to" : `${move[2]}${move[3]}`
            });
        }
    });
} catch (error) {
    console.log(`Failed to fetch stdout`);
    console.log(error);
}

function sendCommand(cmd: string) {
    try {
        console.log(cmd);
        
        proc.stdin.write(`${cmd}\n`);
    } catch (error) {
        console.log(`Failed to send command: ${cmd}`);
        console.log(error);
    }
}

export async function move() {
    try {
        sendCommand(`go`);  // egyelőre nem adunk meg extra promptokat.
        const move = await getNextMove();
        return move;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export function setPosition(fen: string) {
    try {
        sendCommand(`ucinewgame`);
        sendCommand(`position fen ${fen}`);
        return true;
    } catch (error) {
        console.log(`Failed to set position: ${fen}`);
        console.log(error);
        return false;
    }
}