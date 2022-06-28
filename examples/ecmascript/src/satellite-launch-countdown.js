export class SatelliteLaunch {
    constructor() {
        this.countDown = 0;
        this.satelliteLocation = 'station'
    }

    setCountDown(seconds) {
        this.countDown = seconds
    }

    startCountDown() {
        return new Promise((resolve, reject) =>{
            setTimeout(()=>{
                this.satelliteLocation = 'space'
                resolve()
            }, Number(this.countDown)* 1000)
        })
    }

    getSatelliteLocation() {
        return this.satelliteLocation
    }
}
