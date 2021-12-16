import { checkThatFeatureFileAndStepDefinitionsHaveSameScenarios } from './validation/scenario-validation';
import { Feature, Scenario, Rule, Options, ScenarioOutline } from './models';
import { ensureThereAreNoMissingSteps as ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps, matchSteps } from './validation/step-definition-validation';
import { applyTagFilters } from './tag-filtering';
import { generateStepCode } from './code-generation/step-generation';
import { generateScenarioCode } from './code-generation/scenario-generation';

export type StepsDefinitionCallbackOptions = {
    defineStep: DefineStepFunction;
    given: DefineStepFunction;
    when: DefineStepFunction;
    then: DefineStepFunction;
    and: DefineStepFunction;
    but: DefineStepFunction;
    pending: () => void;
};

export type FeatureDefinitionCallbackFunction = (defineScenarioOrRule: DefineFeatureFunctions) => void;

export type RulesDefinitionCallbackFunction = (defineScenario: DefineScenarioFunctionWithAliases) => void;

export type DefineScenarioFunction = (
    scenarioTitle: string,
    stepsDefinitionCallback: StepsDefinitionCallbackFunction,
    timeout?: number,
) => void;

export type DefineRuleFunction = (ruleTitle: string, provideRuleDefinition: RulesDefinitionCallbackFunction) => void;

export type DefineFeatureFunctions = DefineScenarioFunctionWithAliases & {
    rule: DefineRuleFunction;
    test: DefineFeatureFunctions;
};

export type DefineScenarioFunctionWithAliases = DefineScenarioFunction & {
    skip: DefineScenarioFunction;
    only: DefineScenarioFunction;
    concurrent: DefineScenarioFunction;
};

export type StepsDefinitionCallbackFunction = (options: StepsDefinitionCallbackOptions) => void;
export type DefineStepFunction = (
  stepMatcher: string | RegExp, stepDefinitionCallback: (...args: any[]) => any,
) => any;

type ScenarioTitleFunction = (scenarioTitle: string, scenario: Scenario, options: Options) => string;

const createProcessScenarioTitleTemplate = (feature: Feature) => (
    scenarioTitle: string,
    scenario: Scenario,
    options: Options,
) => {
    if (options && options.scenarioNameTemplate) {
        try {
            return options && options.scenarioNameTemplate({
                featureTitle: feature.title,
                scenarioTitle: scenarioTitle.toString(),
                featureTags: feature.tags,
                scenarioTags: scenario.tags,
            });
        } catch (err) {
            throw new Error(
                // tslint:disable-next-line:max-line-length
                `An error occurred while executing a scenario name template. \nTemplate:\n${options.scenarioNameTemplate}\nError:${err.message}`,
            );
        }
    }

    return scenario.title;
};

const checkForPendingSteps = (scenarioFromStepDefinitions: Scenario) => {
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
    scenario: Scenario,
    only: boolean = false,
    skip: boolean = false,
    concurrent: boolean = false,
    timeout: number | undefined = undefined,
) => {
    const testFunction = getTestFunction(scenario.skippedViaTagFilter, only, skip, concurrent);

    testFunction(scenarioTitle, () => {
        return scenario.steps.reduce((promiseChain, nextStep) => {
            const stepArgument = nextStep.stepArgument;
            const matches = matchSteps(
                nextStep.stepText,
                nextStep.stepMatcher,
            );
            let matchArgs: string[] = [];

            if (matches && (matches as RegExpMatchArray).length) {
                matchArgs = (matches as RegExpMatchArray).slice(1);
            }

            const args = [...matchArgs, stepArgument];

            return promiseChain.then(() => {
              return Promise.resolve()
                .then(() => nextStep.stepFunction(...args))
                .catch((error) => {
                    error.message = `jest-cucumber: ${nextStep.stepText} (line ${nextStep.lineNumber})\n\n${error.message}`;
                    throw error;
                });
            });
        }, Promise.resolve());
    }, timeout);
};

const createDefineRuleFunction = (
    feature: Feature,
) => {
    const defineRuleFunction: DefineRuleFunction = (
      ruleTitle: string,
      provideRuleDefinition: RulesDefinitionCallbackFunction,
    ) => {
        const matchingRules = feature.rules.filter(
            (r) => r.title.toLocaleLowerCase() === ruleTitle.toLocaleLowerCase(),
        );

        if (matchingRules.length === 0) {
            throw new Error(`No rule found in feature that matches "${ruleTitle}"`);
        }

        if (matchingRules.length > 1) {
            throw new Error(`More than one rule found in feature that maches "${ruleTitle}"`);
        }

        const matchingRule = matchingRules[0];
        if (matchingRule.ruleDefinitionAvailable) {
            throw new Error(`Rule "${ruleTitle} defined multiple times`);
        }

        matchingRule.ruleDefinitionAvailable = true;

        describe(ruleTitle, () =>
            provideRuleDefinition(
                createDefineScenarioFunctionWithAliases(
                  matchingRule,
                  createProcessScenarioTitleTemplate(feature),
                  feature.options,
                ),
            ),
        );

        const errors = [
            ...matchingRule.scenarios
                .filter((s) => !s.stepDefinitionsAvailable && !s.skippedViaTagFilter)
                .map(
                    (s) =>
                        `Scenario "${s.title}" defined in feature file but no step definitions provided. Try adding the following code:\n\n${generateScenarioCode(
                            s,
                        )}"`,
                ),
            ...matchingRule.scenarioOutlines
                .filter((s) => !s.stepDefinitionsAvailable && !s.skippedViaTagFilter)
                .map(
                    (s) =>
                        `Scenario outline "${s.title}" defined in feature file but no step definitions provided. Try adding the following code:\n\n${generateScenarioCode(
                            s,
                        )}"`,
                ),
        ];

        if (errors.length > 0) {
            throw new Error(errors.join('\n\n'));
        }
    };
    return defineRuleFunction;
};

const createDefineScenarioFunction = (
    scenarioGroup: Feature | Rule,
    processScenarioTitleTemplate: ScenarioTitleFunction,
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
        const matchingScenarios = scenarioGroup.scenarios.filter(
            (s) => s.title.toLocaleLowerCase() === scenarioTitle.toLocaleLowerCase(),
        );
        const matchingScenarioOutlines = scenarioGroup.scenarioOutlines.filter(
            (s) => s.title.toLocaleLowerCase() === scenarioTitle.toLocaleLowerCase(),
        );

        let scenarios: Scenario[] = [];
        if (matchingScenarios.length === 0 && matchingScenarioOutlines.length === 0) {
            throw new Error(
                `No scenarios found in feature/rule that match scenario title "${scenarioTitle}."`,
            );
        }
        if (matchingScenarios.length + matchingScenarioOutlines.length > 1) {
            throw new Error(
                `More than one scenario found in feature/rule that match scenario title "${scenarioTitle}"`,
            );
        }

        if (matchingScenarios.length === 1) {
            scenarios = [ matchingScenarios[0] ];
        } else {
            matchingScenarioOutlines[0].stepDefinitionsAvailable = true;
            scenarios = matchingScenarioOutlines[0].scenarios;
        }

        scenarios.forEach((s) => (s.stepDefinitionsAvailable = true));

        stepsDefinitionFunctionCallback({
            defineStep: createDefineStepFunction(scenarios),
            given: createDefineStepFunction(scenarios),
            when: createDefineStepFunction(scenarios),
            then: createDefineStepFunction(scenarios),
            and: createDefineStepFunction(scenarios),
            but: createDefineStepFunction(scenarios),
            pending: () => {
                // Nothing to do
            },
        });

        scenarios.forEach((scenario) => {
            const processedScenarioTitle = processScenarioTitleTemplate(
                scenarioTitle,
                scenario,
                options);

            ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps(options, scenario);

            if (checkForPendingSteps(scenario)) {
                xtest(
                    processedScenarioTitle,
                    () => {
                        // Nothing to do
                    },
                    undefined,
                );
            } else {
                defineScenario(
                    processedScenarioTitle,
                    scenario,
                    only,
                    skip,
                    concurrent,
                    timeout,
                );
            }
        });
    };

    return defineScenarioFunction;
};

const createDefineFeatureFunctions = (feature: Feature, options: Options): DefineFeatureFunctions => {
    const featureDefinitionFunctions = createDefineScenarioFunctionWithAliases(
        feature,
        createProcessScenarioTitleTemplate(feature),
        options,
    ) as DefineFeatureFunctions;

    featureDefinitionFunctions.rule = createDefineRuleFunction(feature);
    featureDefinitionFunctions.test = featureDefinitionFunctions;

    return featureDefinitionFunctions;
};

const createDefineScenarioFunctionWithAliases = (
    scenarioGroup: Feature | Rule,
    processScenarioTitleTemplate: ScenarioTitleFunction,
    options: Options,
): DefineScenarioFunctionWithAliases => {

    const defineScenarioFunctionWithAliases = createDefineScenarioFunction(
      scenarioGroup,
      processScenarioTitleTemplate,
      options,
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).only = createDefineScenarioFunction(
        scenarioGroup,
        processScenarioTitleTemplate,
        options,
        true,
        false,
        false,
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).skip = createDefineScenarioFunction(
        scenarioGroup,
        processScenarioTitleTemplate,
        options,
        false,
        true,
        false,
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).concurrent = createDefineScenarioFunction(
        scenarioGroup,
        processScenarioTitleTemplate,
        options,
        false,
        false,
        true,
    );

    return defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases;
};

const createDefineStepFunction = (scenarios: Scenario[]) => {
    return (stepMatcher: string | RegExp, stepFunction: () => any) => {
        scenarios.forEach((scenario) => {
            const unmatchedSteps = scenario.steps.filter((s) => s.stepMatcher === undefined);
            if (unmatchedSteps.length === 0) {
                throw new Error(
                    `Step definition "${stepMatcher}" found for scenario "${scenario.title}" but all steps already defined.`,
                );
            }

            const matchingSteps = scenario.steps.filter((s) => matchSteps(s.stepText, stepMatcher));

            if (matchingSteps.length === 0) {
                throw new Error(`Scenario "${scenario.title}" in feature file has no step matching "${stepMatcher}"`);
            } else if (matchingSteps.length > 1) {
                throw new Error(`More than one step in scenario "${scenario.title}" matches "${stepMatcher}"`);
            }

            const matchingStep = matchingSteps[0];

            if (matchingStep !== unmatchedSteps[0]) {
                const nextStepIndex = scenario.steps.length - unmatchedSteps.length;
                throw new Error(
                    `Expected step #${nextStepIndex + 1} to match "${scenario.steps[
                        nextStepIndex
                    ]}". Try adding the following code:\n\n${generateStepCode(scenario.steps[nextStepIndex])}`,
                );
            }

            if (matchingSteps[0].stepMatcher) {
                throw new Error(
                    `Step ${matchingSteps[0]
                        .stepText} in scenario "${scenario.title}" matches "${stepMatcher} but also matches "${matchingSteps[0]
                        .stepMatcher}"`,
                );
            }

            matchingSteps[0].stepMatcher = stepMatcher;
            matchingSteps[0].stepFunction = stepFunction;
        });
    };
};

export function defineFeature(
    featureFromFile: Feature,
    featureDefinitionCallback: FeatureDefinitionCallbackFunction,
) {
    const parsedFeatureWithTagFiltersApplied = applyTagFilters(featureFromFile);

    const totalNumberOfFilteredScenarios =
      parsedFeatureWithTagFiltersApplied.scenarios.length
      + parsedFeatureWithTagFiltersApplied.scenarioOutlines.length
      + parsedFeatureWithTagFiltersApplied.rules
          .map((r) => r.scenarios.length + r.scenarioOutlines.length)
          .reduce((previousCount, currentCount) => previousCount + currentCount, 0);
    if (
      totalNumberOfFilteredScenarios === 0
    ) {
        return;
    }

    describe(featureFromFile.title, () => {
        featureDefinitionCallback(
            createDefineFeatureFunctions(parsedFeatureWithTagFiltersApplied, featureFromFile.options),
        );

        checkThatFeatureFileAndStepDefinitionsHaveSameScenarios(
            parsedFeatureWithTagFiltersApplied,
            featureFromFile.options,
        );
    });
}
