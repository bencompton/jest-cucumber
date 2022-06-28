import { loadFeatures, autoBindSteps } from 'jest-cucumber';
import { SatelliteLaunch } from '../../src/satellite-launch-countdown';

export const countDownSteps = ({ given, and, when, then }) => {
    
    given(/^I have set a "(.*)" seconds countdown for my satellite$/, (countDownSeconds) => {
        const satelliteLaunch = new SatelliteLaunch();
        satelliteLaunch.setCountDown(countDownSeconds)
        
        // Jest concurrent execution is still experimental due to which beforeEach, afterEach annotations doesnt work. Hence using Jest's setState to pass values between test steps
        expect.setState({satelliteLaunch})
    });

    when('I start the countdown', () => {
        return new Promise((resolve, reject)=> {
            resolve(expect.getState().satelliteLaunch.startCountDown())
        })
    });

    then('my satellite should be launched to space on countdown completion', () => {
        expect(expect.getState().satelliteLaunch.getSatelliteLocation()).toBe('space');
    });
};

const features = loadFeatures('./specs/features/auto-binding-concurrent/*.feature');

autoBindSteps(features, [ countDownSteps ], true);
