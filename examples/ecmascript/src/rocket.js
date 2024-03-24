export class Rocket {
  constructor() {
    this.isInSpace = false;
    this.boostersLanded = true;
  }

  launch() {
    this.isInSpace = true;
    this.boostersLanded = true;
  }
}
