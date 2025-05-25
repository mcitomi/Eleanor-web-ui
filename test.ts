import { join } from "node:path";
import { spawn } from "node:child_process";

console.log("Hello via Bun!");

const path = join(import.meta.dir, "..", "Eleanor", "Eleanor");

console.log(path);

async function main() {
    const proc = spawn(path, {stdio: ['pipe', 'pipe', 'ignore']});

    proc.stdin.write("go wtime 120000\n");

    proc.stdout.on('data', (data) => {
        console.log(`SOR: ${data}`);
        if(data.includes("bestmove")) {
            proc.stdin.write("listmoves\n");
        }
    });

    proc.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });   

}

main();