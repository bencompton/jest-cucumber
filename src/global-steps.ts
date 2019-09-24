import { StepFromStepDefinitions } from './models';

class Steps {
    list: StepFromStepDefinitions[] = [];

    push(step: StepFromStepDefinitions) {
        const { stepMatcher } = step;

        const isAlreadyAdded = this.list.some(
            step => String(step.stepMatcher) === String(stepMatcher),
        );

        if (isAlreadyAdded) {
            throw new Error(`Existing global step with the name ${stepMatcher}`);
        }

        this.list.push(step);
    }

    get(title: StepFromStepDefinitions["stepMatcher"]) {
        let params;

        const found = this.list.find((step) => {
            if (typeof title === 'string') {
                const matches = title.match(step.stepMatcher);

                if (matches) {
                    params = matches.slice(1);
                    return true;
                }
            }

            if (title instanceof RegExp) {
                return String(title) === String(step.stepMatcher);
            }

            return false;
        });

        if (!found) {
            throw Error(`${title} : was not defined in Steps file`);
        }

        return found.stepFunction.bind(this, ...params);
    }
}

export const globalSteps = new Steps();

export function defineGlobalStep(
    stepMatcher: StepFromStepDefinitions["stepMatcher"],
    stepFunction: StepFromStepDefinitions["stepFunction"]
) {
    globalSteps.push({ stepMatcher, stepFunction });
}
