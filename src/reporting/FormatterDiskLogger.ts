import { writeFileSync } from 'fs';

import { IFormatterLogger } from './FormatterLogger';

export class FormatterDiskLogger implements IFormatterLogger {
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
