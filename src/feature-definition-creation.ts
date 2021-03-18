import { checkThatFeatureFileAndStepDefinitionsHaveSameScenarios } from './validation/scenario-validation';
import {
    ScenarioFromStepDefinitions,
    FeatureFromStepDefinitions,
    StepFromStepDefinitions,
    ParsedFeature, ParsedScenario,
    Options, ParsedScenarioOutline,
    ScenarioGroup
} from './models';
import {
    ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps,
    matchSteps,
} from './validation/step-definition-validation';
import { applyTagFilters } from './tag-filtering';

export type StepsDefinitionCallbackOptions = {
    defineStep: DefineStepFunction;
    given: DefineStepFunction;
    when: DefineStepFunction;
    then: DefineStepFunction;
    and: DefineStepFunction;
    but: DefineStepFunction;
    pending: () => void;
};

export type ScenariosDefinitionCallbackFunction = (defineScenario: DefineScenarioFunctionWithAliases) => void;

export type RulesDefinitionCallbackFunction = (defineRule: DefineRuleFunction) => void;

export type DefineRuleFunction = (
    ruleTitle: string,
    scenariosDefinitionCallback: ScenariosDefinitionCallbackFunction
) => void;

export type DefineScenarioFunction = (
    scenarioTitle: string,
    stepsDefinitionCallback: StepsDefinitionCallbackFunction,
    timeout?: number,
) => void;

export type DefineScenarioFunctionWithAliases = DefineScenarioFunction & {
    skip: DefineScenarioFunction;
    only: DefineScenarioFunction;
    concurrent: DefineScenarioFunction;
};

export type StepsDefinitionCallbackFunction = (options: StepsDefinitionCallbackOptions) => void;
export type DefineStepFunction = (stepMatcher: string | RegExp, stepDefinitionCallback: (...args: any[]) => any) => any;

const processScenarioTitleTemplate = (
    scenarioTitle: string,
    group: ScenarioGroup,
    options: Options,
    parsedScenario: ParsedScenario,
    parsedScenarioOutline: ParsedScenarioOutline,
) => {
    if (options && options.scenarioNameTemplate) {
        try {
            return  options && options.scenarioNameTemplate({
                featureTitle: group.title,
                scenarioTitle: scenarioTitle.toString(),
                featureTags: group.tags,
                scenarioTags: (parsedScenario || parsedScenarioOutline).tags
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

const getTestFunction = (skippedViaTagFilter: boolean, only: boolean, skip: boolean, concurrent: boolean) => {
    if (skip || skippedViaTagFilter) {
        return test.skip;
    } else if (only) {
        return test.only;
    } else if (concurrent) {
        return test.concurrent;
    } else {
        return test;
    }
};

const defineScenario = (
    scenarioTitle: string,
    scenarioFromStepDefinitions: ScenarioFromStepDefinitions,
    parsedScenario: ParsedScenario,
    only: boolean = false,
    skip: boolean = false,
    concurrent: boolean = false,
    timeout: number | undefined = undefined,
) => {
    const testFunction = getTestFunction(parsedScenario.skippedViaTagFilter, only, skip, concurrent);

    testFunction(scenarioTitle, () => {
        return scenarioFromStepDefinitions.steps.reduce((promiseChain, nextStep, index) => {
            const stepArgument = parsedScenario.steps[index].stepArgument;
            const matches = matchSteps(
                parsedScenario.steps[index].stepText,
                scenarioFromStepDefinitions.steps[index].stepMatcher
            );
            let matchArgs: string[] = [];

            if (matches && (matches as RegExpMatchArray).length) {
                matchArgs = (matches as RegExpMatchArray).slice(1);
            }

            const args = [ ...matchArgs, stepArgument ];

            return promiseChain.then(() => nextStep.stepFunction(...args));
        }, Promise.resolve());
    }, timeout);
};

const createDefineScenarioFunction = (
    featureFromStepDefinitions: FeatureFromStepDefinitions,
    parsedFeature: ScenarioGroup,
    options: Options,
    only: boolean = false,
    skip: boolean = false,
    concurrent: boolean = false,
) => {
    const defineScenarioFunction: DefineScenarioFunction = (
        scenarioTitle: string,
        stepsDefinitionFunctionCallback: StepsDefinitionCallbackFunction,
        timeout?: number,
    ) => {
        const scenarioFromStepDefinitions: ScenarioFromStepDefinitions = {
            title: scenarioTitle,
            steps: [],
        };

        featureFromStepDefinitions.scenarios.push(scenarioFromStepDefinitions);

        stepsDefinitionFunctionCallback({
            defineStep: createDefineStepFunction(scenarioFromStepDefinitions),
            given: createDefineStepFunction(scenarioFromStepDefinitions),
            when: createDefineStepFunction(scenarioFromStepDefinitions),
            then: createDefineStepFunction(scenarioFromStepDefinitions),
            and: createDefineStepFunction(scenarioFromStepDefinitions),
            but: createDefineStepFunction(scenarioFromStepDefinitions),
            pending: () => {
                // Nothing to do
            }
        });

        const parsedScenario = parsedFeature.scenarios
            .filter((s) => s.title.toLowerCase() === scenarioTitle.toLowerCase())[0];

        const parsedScenarioOutline = parsedFeature.scenarioOutlines
            .filter((s) => s.title.toLowerCase() === scenarioTitle.toLowerCase())[0];

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
            defineScenario(
                scenarioTitle,
                scenarioFromStepDefinitions,
                parsedScenario,
                only,
                skip,
                concurrent,
                timeout,
            );
        } else if (parsedScenarioOutline) {
            parsedScenarioOutline.scenarios.forEach((scenario) => {
                defineScenario(
                    (scenario.title || scenarioTitle),
                    scenarioFromStepDefinitions,
                    scenario,
                    only,
                    skip,
                    concurrent,
                    timeout,
                );
            });
        }
    };

    return defineScenarioFunction;
};

const createDefineScenarioFunctionWithAliases = (
    featureFromStepDefinitions: FeatureFromStepDefinitions,
    group: ScenarioGroup,
    options: Options
) => {
    const defineScenarioFunctionWithAliases = createDefineScenarioFunction(
        featureFromStepDefinitions,
        group,
        options
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).only = createDefineScenarioFunction(
        featureFromStepDefinitions,
        group,
        options,
        true,
        false,
        false,
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).skip = createDefineScenarioFunction(
        featureFromStepDefinitions,
        group,
        options,
        false,
        true,
        false,
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).concurrent = createDefineScenarioFunction(
        featureFromStepDefinitions,
        group,
        options,
        false,
        false,
        true,
    );

    return defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases;
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

const defineScenarioGroup = (
    group: ScenarioGroup,
    scenariosDefinitionCallback: ScenariosDefinitionCallbackFunction,
    options: Options,
) => {
    const featureFromDefinedSteps: FeatureFromStepDefinitions = {
        title: group.title,
        scenarios: [],
    };

    const parsedFeatureWithTagFiltersApplied = applyTagFilters(group, options.tagFilter);

    if (
        parsedFeatureWithTagFiltersApplied.scenarios.length === 0
            && parsedFeatureWithTagFiltersApplied.scenarioOutlines.length === 0
    ) {
        return;
    }

    scenariosDefinitionCallback(
        createDefineScenarioFunctionWithAliases(featureFromDefinedSteps, parsedFeatureWithTagFiltersApplied, options)
    );

    checkThatFeatureFileAndStepDefinitionsHaveSameScenarios(
        parsedFeatureWithTagFiltersApplied,
        featureFromDefinedSteps,
        options
    );
};

export function defineFeature(
    featureFromFile: ParsedFeature,
    scenariosDefinitionCallback: ScenariosDefinitionCallbackFunction
) {
    describe(featureFromFile.title, () => {
        defineScenarioGroup(featureFromFile, scenariosDefinitionCallback, featureFromFile.options);
    });
}

export function defineRuleBasedFeature(
    featureFromFile: ParsedFeature,
    rulesDefinitionCallback: RulesDefinitionCallbackFunction
) {
    describe(featureFromFile.title, () => {
        rulesDefinitionCallback((ruleText: string, callback: ScenariosDefinitionCallbackFunction) => {
            const matchingRules = featureFromFile.rules.filter(
                (rule) => rule.title.toLocaleLowerCase() === ruleText.toLocaleLowerCase()
            );
            if (matchingRules.length != 1) {
                throw new Error(`No matching rule found for '${ruleText}'"`);
            }

            describe(ruleText, () => {
                defineScenarioGroup(matchingRules[0], callback, featureFromFile.options);
            })
        });
    });
}
