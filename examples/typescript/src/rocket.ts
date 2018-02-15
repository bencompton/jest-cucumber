export class Rocket {
    public isInSpace: boolean = false;
    public boostersLanded: boolean = true;

    public launch() {
        this.isInSpace = true;
        this.boostersLanded = true;
    }
}