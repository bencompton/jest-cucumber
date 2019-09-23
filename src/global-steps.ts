interface GlobalStep {
    stepMatcher: string | RegExp;
    stepFunction: () => any;
}

class Steps {
    list: GlobalStep[] = [];

    push(step: GlobalStep) {
        const { stepMatcher } = step;

        const isAlreadyAdded = this.list.some(
            step => String(step.stepMatcher) === String(stepMatcher),
        );

        if (isAlreadyAdded) {
            throw new Error(`Existing global step with the name ${stepMatcher}`);
        }

        this.list.push(step);
    }

    get(title: string) {
        let params;

        const found = this.list.find((step) => {
            const matches = title.match(step.stepMatcher);

            if (matches) {
                params = matches.slice(1);
                return true;
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

export function defineGlobalStep(stepMatcher: string | RegExp, stepFunction: () => any) {
    globalSteps.push({ stepMatcher, stepFunction });
}
