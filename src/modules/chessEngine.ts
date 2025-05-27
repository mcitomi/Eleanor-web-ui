import { spawn, ChildProcessWithoutNullStreams } from "node:child_process";
import { engine_path, maxInstanceSize } from "../../config.json";

type Move = {
    from: string;
    to: string;
    promotion?: string;
};

type EngineInstance = {
    proc: ChildProcessWithoutNullStreams;
    lastUsedTimeStamp: number;
    getNextMove: () => Promise<Move>;
    sendCommand: (cmd: string) => void;
    setPosition: (fen: string) => void;
    move: () => Promise<Move>;
    newGame: () => void;
    userId: string;
    engineId: string;
};

export const engines = new Map<string, EngineInstance>();

const getTimeStamp = () => Math.floor(Date.now() / 1000);

setInterval(() => {
    engines.forEach(engine => {
        if(engine.lastUsedTimeStamp < (getTimeStamp() - 600)) {
            stopEngineForUser(engine.userId);
        }
    });
}, 30000);

export function initEngineForUser(userId: string): EngineInstance {
    
    if (engines.has(userId)) {
        const session = engines.get(userId)!;

        console.log(session.lastUsedTimeStamp);

        session.lastUsedTimeStamp = getTimeStamp();
        return session;
    };

    console.log(engines.size);
    if(engines.size >= maxInstanceSize) {
        throw new Error("Currently, the entire server capacity is occupied. Try again later...");
    }

    const proc = spawn(engine_path, { stdio: ['pipe', 'pipe', 'pipe'] });

    let resolveMove: ((move: Move) => void) | null = null;

    proc.stdout.on("data", (data: Buffer) => {
        const text = data.toString();
        const bestMoveMatch = text.match(/bestmove\s([a-h][1-8])([a-h][1-8])([qrbn]?)/);
        if (bestMoveMatch && resolveMove) {
            const [, from, to, promo] = bestMoveMatch;
            resolveMove({ from, to, promotion: promo || "q" });
            resolveMove = null;
        }
    });

    const sendCommand = (cmd: string) => {
        proc.stdin.write(`${cmd}\n`);
    };

    const getNextMove = () => new Promise<Move>((resolve) => { resolveMove = resolve; });

    const engine: EngineInstance = {
        proc,
        lastUsedTimeStamp: getTimeStamp(),
        getNextMove,
        sendCommand,
        setPosition: (fen: string) => {
            sendCommand(`position fen ${fen}`);
        },
        move: async () => {
            sendCommand("go wtime 80000 btime 80000");
            return await getNextMove();
        },
        newGame: () => {
            sendCommand("ucinewgame");
        },
        userId: userId,
        engineId: Bun.randomUUIDv7("base64")
    };

    engines.set(userId, engine);
    return engine;
}

export function stopEngineForUser(userId: string) {
    const engine = engines.get(userId);
    if (engine) {
        engine.proc.kill();
        engines.delete(userId);
    }
}
