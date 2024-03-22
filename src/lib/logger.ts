/**
 * Creates & maintains the log
*/

import * as fs from 'fs';
import * as path from 'path';

const reset = "\x1b[0m"
const COLORS = {
    red: (text: string) => `\x1b[31m ${text} ${reset}`,
    green: (text: string) => `\x1b[32m ${text} ${reset}`,
    yellow: (text: string) => `\x1b[33m ${text} ${reset}`,
    blue: (text: string) => `\x1b[34m ${text} ${reset}`,
    magenta: (text: string) => `\x1b[35m ${text} ${reset}`,
}

class Logger {
    private filename: string =  "logger"
    public baseDir: string;
    public logginTerminal: boolean = true;

    constructor() {
        this.baseDir = path.join(__dirname, '../../');
    }

    info(...args: any) {
        let log = `[${new Date().toISOString()}] [INFO] - ${args.reduce((p: any, c: any) => p + c)}`
        if (this.logginTerminal) {
            console.log(COLORS.green(log))
        }
        this.write(log);
    }

    warn(...args: any) {
        let log = `[${new Date().toISOString()}] [WARN] - ${args.reduce((p: any, c: any) => p + c)}`
        if (this.logginTerminal) {
            console.log(COLORS.yellow(log))
        }
        this.write(log);
    }

    debug(...args: any){
        let log = `[${new Date().toISOString()}] [DEBUG] - ${args.reduce((p: any, c: any) => p + c)}`
        if (this.logginTerminal) {
            console.log(COLORS.magenta(log))
        }
        this.write(log)
    }

    error(...args: any) {
        let log = `[${new Date().toISOString()}] [ERROR] - ${args.reduce((p: any, c: any) => p + c)}`
        if (this.logginTerminal) {
            console.log(COLORS.red(log))
        }
        this.write(log);
    }

    private write(data: string) {
        let file = this.baseDir.concat(this.getFilename());
        try {
            if (!fs.existsSync(this.baseDir)) {
                fs.mkdirSync(this.baseDir, { recursive: true })
            }

            fs.appendFileSync(file, data + "\n");
        } catch (err) {
            console.error(err)
        }
    }

    private getFilename() {
        return `${this.filename}.log`
    }
}

export default new Logger;
