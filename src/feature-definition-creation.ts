import { checkThatFeatureFileAndStepDefinitionsHaveSameScenarios } from './validation/scenario-validation';
import { ScenarioFromStepDefinitions, FeatureFromStepDefinitions, StepFromStepDefinitions, ParsedFeature, ParsedScenario } from './models';
import { ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps, matchSteps } from './validation/step-definition-validation';

export type StepsDefinitionCallbackOptions = {
    defineStep: DefineStepFunction;
    given: DefineStepFunction;
    when: DefineStepFunction;
    then: DefineStepFunction;
    pending: () => void;
};

export type ScenariosDefinitionCallbackFunction = (defineScenario: DefineScenarioFunction) => void;
export type DefineScenarioFunction = (scenarioTitle: string, stepsDefinitionCallback: StepsDefinitionCallbackFunction) => void;
export type StepsDefinitionCallbackFunction = (options: StepsDefinitionCallbackOptions) => void;
export type DefineStepFunction = (stepMatcher: string | RegExp, stepDefinitionCallback: (...args: any[]) => any) => any;

const checkForPendingSteps = (scenarioFromStepDefinitions: ScenarioFromStepDefinitions) => {
    let scenarioPending = false;
        
    scenarioFromStepDefinitions.steps.forEach(step => {
        try {
            if (step.stepFunction.toString().indexOf('pending()') !== -1) {
                const pendingTest = new Function(`
                    let isPending = false;

                    const pending = function () {
                        isPending = true;
                    };

                    (${step.stepFunction})();

                    return isPending;
                `)

                scenarioPending = pendingTest();
            } else {

            }
        } catch (err) {
            //Ignore
        }
    });

    return scenarioPending;
};

const defineScenario = (scenarioFromStepDefinitions: ScenarioFromStepDefinitions, parsedScenario: ParsedScenario) => {
    test(parsedScenario.title, () => {
        return scenarioFromStepDefinitions.steps.reduce((promiseChain, nextStep, index) => {
            const stepArgument = parsedScenario.steps[index].stepArgument;
            const matches = matchSteps(parsedScenario.steps[index].stepText, scenarioFromStepDefinitions.steps[index].stepMatcher);
            let matchArgs: string[] = [];

            if (matches && (<RegExpMatchArray>matches).length) {
                matchArgs = (<RegExpMatchArray>matches).slice(1);
            }

            const args = [...matchArgs, stepArgument];

            return promiseChain.then(() => nextStep.stepFunction(...args));
        }, Promise.resolve());
    });
};

const createDefineScenarioFunction = (featureFromStepDefinitions: FeatureFromStepDefinitions, parsedFeature: ParsedFeature) => {
    return (scenarioTitle: string, stepsDefinitionFunctionCallback: StepsDefinitionCallbackFunction) => {
        const scenarioFromStepDefinitions: ScenarioFromStepDefinitions = {
            title: scenarioTitle,
            steps: []
        };

        featureFromStepDefinitions.scenarios.push(scenarioFromStepDefinitions);

        stepsDefinitionFunctionCallback({
            defineStep: createDefineStepFunction(scenarioFromStepDefinitions),
            given: createDefineStepFunction(scenarioFromStepDefinitions),
            when:  createDefineStepFunction(scenarioFromStepDefinitions),
            then:  createDefineStepFunction(scenarioFromStepDefinitions),
            pending: () => {}
        });

        const parsedScenario = parsedFeature.scenarios.filter(s => s.title === scenarioTitle)[0];
        const parsedScenarioOutline = parsedFeature.scenarioOutlines.filter(s => s.title === scenarioTitle)[0];

        const options = parsedFeature.options;

        ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps(options, parsedScenario || parsedScenarioOutline, scenarioFromStepDefinitions);

        if (checkForPendingSteps(scenarioFromStepDefinitions)) {
            xtest(scenarioTitle);
        } else if (parsedScenario) {
            defineScenario(scenarioFromStepDefinitions, parsedScenario);
        } else if (parsedScenarioOutline) {
            parsedScenarioOutline.scenarios.forEach(scenario => {
                defineScenario(scenarioFromStepDefinitions, scenario);
            });
        }
    };
};

const createDefineStepFunction = (scenarioFromStepDefinitions: ScenarioFromStepDefinitions) => {
    return (stepMatcher: string | RegExp, stepFunction: () => any) => {
        const stepDefinition: StepFromStepDefinitions = {
            stepMatcher,
            stepFunction
        };

        scenarioFromStepDefinitions.steps.push(stepDefinition);
    };
};

export function defineFeature (featureFromFile: ParsedFeature, scenariosDefinitionCallback: ScenariosDefinitionCallbackFunction) {
    const featureFromDefinedSteps: FeatureFromStepDefinitions = {
        title: featureFromFile.title,
        scenarios: []
    };

    scenariosDefinitionCallback(
        createDefineScenarioFunction(featureFromDefinedSteps, featureFromFile)
    );

    checkThatFeatureFileAndStepDefinitionsHaveSameScenarios(featureFromFile, featureFromDefinedSteps);
}