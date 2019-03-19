import { writeFileSync } from 'fs';

export class FormatterDiskLogger {
    private path: string;
    private logs: string[];

    constructor(path: string) {
        this.path = path;
        this.logs = [];
    }

    public log(logText: string) {
        this.logs.push(logText);
    }

    public save() {
        writeFileSync(this.path, this.logs.join('\n'), 'utf8');
    }
}
