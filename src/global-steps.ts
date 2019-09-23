import { isRegExp, isString } from 'util';

interface GlobalStep {
    stepMatcher: string | RegExp;
    stepFunction: () => any;
}

class Steps {
    list: GlobalStep[] = [];

    push(step: GlobalStep) {
        const { stepMatcher } = step;

        if (this.get(stepMatcher)) {
            throw new Error(`Existing global step with the name ${stepMatcher}`);
        }

        this.list.push(step);
    }

    get(input: GlobalStep["stepMatcher"]) {
        return this.list.find(item => {
            if (isRegExp(item.stepMatcher)) {
                return item.stepMatcher === input;
            }
            if (isString(item.stepMatcher)) {
                return item.stepMatcher.match(input);
            }
        });
    }
}

export const globalSteps = new Steps();

export function defineGlobalStep(stepMatcher: string | RegExp, stepFunction: () => any) {
    globalSteps.push({ stepMatcher, stepFunction });
}
