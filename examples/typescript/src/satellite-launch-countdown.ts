export class SatelliteLaunch {
    public countDown: number = 0;
    public satelliteLocation: string = 'station';

    public setCountDown(seconds: number) {
        this.countDown = seconds;
    }

    public startCountDown() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.satelliteLocation = 'space';
                resolve('');
            }, Number(this.countDown) * 1000);
        });
    }

    public getSatelliteLocation() {
        return this.satelliteLocation;
    }
}
