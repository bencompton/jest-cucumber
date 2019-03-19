export class FormatterConsoleLogger {
  public log(logText: string) {
    process.stdout.write(logText);
  }
}
