import { checkThatFeatureFileAndStepDefinitionsHaveSameScenarios } from './validation/scenario-validation';
import {
    ScenarioFromStepDefinitions,
    FeatureFromStepDefinitions,
    StepFromStepDefinitions,
    ParsedFeature, ParsedScenario,
    Options, ParsedScenarioOutline,
} from './models';
import {
    ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps,
    matchSteps,
} from './validation/step-definition-validation';

export type StepsDefinitionCallbackOptions = {
    defineStep: DefineStepFunction;
    given: DefineStepFunction;
    when: DefineStepFunction;
    then: DefineStepFunction;
    pending: () => void;
};

export type ScenariosDefinitionCallbackFunction = (defineScenario: DefineScenarioFunction) => void;
export type DefineScenarioFunction = (
    scenarioTitle: string,
    stepsDefinitionCallback: StepsDefinitionCallbackFunction,
) => void;
export type StepsDefinitionCallbackFunction = (options: StepsDefinitionCallbackOptions) => void;
export type DefineStepFunction = (stepMatcher: string | RegExp, stepDefinitionCallback: (...args: any[]) => any) => any;

const processScenarioTitleTemplate = (
    scenarioTitle: string,
    parsedFeature: ParsedFeature,
    options: Options,
    parsedScenario: ParsedScenario,
    parsedScenarioOutline: ParsedScenarioOutline,
) => {
    if (options && options.scenarioNameTemplate) {
        try {
            return options && options.scenarioNameTemplate({
                featureTitle: parsedFeature.title,
                scenarioTitle: scenarioTitle.toString(),
                featureTags: parsedFeature.tags,
                scenarioTags: (parsedScenario || parsedScenarioOutline).tags,
            });
        } catch (err) {
            throw new Error(
                // tslint:disable-next-line:max-line-length
                `An error occurred while executing a scenario name template. \nTemplate:\n${options.scenarioNameTemplate}\nError:${err.message}`,
            );
        }
    }

    return scenarioTitle;
};

const checkForPendingSteps = (scenarioFromStepDefinitions: ScenarioFromStepDefinitions) => {
    let scenarioPending = false;

    scenarioFromStepDefinitions.steps.forEach((step) => {
        try {
            if (step.stepFunction.toString().indexOf('pending()') !== -1) {
                const pendingTest = new Function(`
                    let isPending = false;

                    const pending = function () {
                        isPending = true;
                    };

                    (${step.stepFunction})();

                    return isPending;
                `);

                scenarioPending = pendingTest();
            }
        } catch (err) {
            // Ignore
        }
    });

    return scenarioPending;
};

const defineScenario = (
    scenarioTitle: string,
    scenarioFromStepDefinitions: ScenarioFromStepDefinitions,
    parsedScenario: ParsedScenario,
) => {
    test(scenarioTitle, () => {
        return scenarioFromStepDefinitions.steps.reduce((promiseChain, nextStep, index) => {
            const stepArgument = parsedScenario.steps[index].stepArgument;
            const matches = matchSteps(
                parsedScenario.steps[index].stepText,
                scenarioFromStepDefinitions.steps[index].stepMatcher,
            );
            let matchArgs: string[] = [];

            if (matches && (matches as RegExpMatchArray).length) {
                matchArgs = (matches as RegExpMatchArray).slice(1);
            }

            const args = [...matchArgs, stepArgument];

            return promiseChain.then(() => nextStep.stepFunction(...args));
        }, Promise.resolve());
    });
};

const createDefineScenarioFunction = (
    featureFromStepDefinitions: FeatureFromStepDefinitions,
    parsedFeature: ParsedFeature,
) => {
    return (scenarioTitle: string, stepsDefinitionFunctionCallback: StepsDefinitionCallbackFunction) => {
        const scenarioFromStepDefinitions: ScenarioFromStepDefinitions = {
            title: scenarioTitle,
            steps: [],
        };

        featureFromStepDefinitions.scenarios.push(scenarioFromStepDefinitions);

        stepsDefinitionFunctionCallback({
            defineStep: createDefineStepFunction(scenarioFromStepDefinitions),
            given: createDefineStepFunction(scenarioFromStepDefinitions),
            when:  createDefineStepFunction(scenarioFromStepDefinitions),
            then:  createDefineStepFunction(scenarioFromStepDefinitions),
            pending: () => {
                // Nothing to do
            },
        });

        const parsedScenario = parsedFeature.scenarios.filter((s) => s.title === scenarioTitle)[0];
        const parsedScenarioOutline = parsedFeature.scenarioOutlines.filter((s) => s.title === scenarioTitle)[0];

        const options = parsedFeature.options;

        scenarioTitle = processScenarioTitleTemplate(
            scenarioTitle,
            parsedFeature,
            options,
            parsedScenario,
            parsedScenarioOutline,
        );

        ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps(
            options,
            parsedScenario || parsedScenarioOutline,
            scenarioFromStepDefinitions,
        );

        if (checkForPendingSteps(scenarioFromStepDefinitions)) {
            xtest(scenarioTitle, () => {
                // Nothing to do
            }, undefined);
        } else if (parsedScenario) {
            defineScenario(scenarioTitle, scenarioFromStepDefinitions, parsedScenario);
        } else if (parsedScenarioOutline) {
            parsedScenarioOutline.scenarios.forEach((scenario) => {
                defineScenario((scenario.title || scenarioTitle), scenarioFromStepDefinitions, scenario);
            });
        }
    };
};

const createDefineStepFunction = (scenarioFromStepDefinitions: ScenarioFromStepDefinitions) => {
    return (stepMatcher: string | RegExp, stepFunction: () => any) => {
        const stepDefinition: StepFromStepDefinitions = {
            stepMatcher,
            stepFunction,
        };

        scenarioFromStepDefinitions.steps.push(stepDefinition);
    };
};

export function defineFeature(
    featureFromFile: ParsedFeature,
    scenariosDefinitionCallback: ScenariosDefinitionCallbackFunction) {
    const featureFromDefinedSteps: FeatureFromStepDefinitions = {
        title: featureFromFile.title,
        scenarios: [],
    };

    describe(featureFromFile.title, () => {
        scenariosDefinitionCallback(
            createDefineScenarioFunction(featureFromDefinedSteps, featureFromFile),
        );

        checkThatFeatureFileAndStepDefinitionsHaveSameScenarios(featureFromFile, featureFromDefinedSteps);
    });
}
