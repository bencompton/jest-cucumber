import { checkThatFeatureFileAndStepDefinitionsHaveSameScenarios } from './validation/scenario-validation';
import {
  ScenarioFromStepDefinitions,
  FeatureFromStepDefinitions,
  StepFromStepDefinitions,
  ParsedFeature,
  ParsedScenario,
  ParsedScenarioOutline,
} from './models';
import {
  ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps,
  matchSteps,
} from './validation/step-definition-validation';
import { applyTagFilters } from './tag-filtering';
import { getJestCucumberConfiguration, Options } from './configuration';

export type StepsDefinitionCallbackOptions = {
  defineStep: DefineStepFunction;
  given: DefineStepFunction;
  when: DefineStepFunction;
  then: DefineStepFunction;
  and: DefineStepFunction;
  but: DefineStepFunction;
  pending: () => void;
};

export type StepsDefinitionCallbackOptionsWithContext<C extends NonNullable<unknown> = NonNullable<unknown>> =
  StepsDefinitionCallbackOptions & {
    context: C;
  };

export type TestGroup = ((title: string, action: (...args: unknown[]) => void) => void) & {
  skip: (title: string, action: (...args: unknown[]) => void) => void;
  only: (title: string, action: (...args: unknown[]) => void) => void;
};
export interface FrameworkTestCall {
  (title: string, action: (...args: unknown[]) => void | Promise<void> | undefined): void;
  skip: (title: string, action: (...args: unknown[]) => void | Promise<void> | undefined) => void;
  only: (title: string, action: (...args: unknown[]) => void | Promise<void> | undefined) => void;
  concurrent: (title: string, action: (...args: unknown[]) => void | Promise<void> | undefined) => void;
}

export interface IJestLike {
  describe: TestGroup | jest.Describe;
  test: FrameworkTestCall | jest.It;
}

export type ScenariosDefinitionCallbackFunction = (defineScenario: DefineScenarioFunctionWithAliases) => void;

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
export type StepsDefinitionCallbackFunctionWithContext<C extends NonNullable<unknown> = NonNullable<unknown>> = (
  options: StepsDefinitionCallbackOptionsWithContext<C>,
) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefineStepFunction = (stepMatcher: string | RegExp, stepDefinitionCallback: (...args: any[]) => any) => any;
export type DefineFeatureFunction = (
  featureFromFile: ParsedFeature,
  scenariosDefinitionCallback: ScenariosDefinitionCallbackFunction,
) => void;

const getJestLike = (jestLike?: IJestLike): IJestLike => {
  const jestLikeConfig: Partial<IJestLike> = getJestCucumberConfiguration().runner ?? {};

  if (typeof describe === 'function' && typeof test === 'function') {
    jestLikeConfig.describe = describe;
    jestLikeConfig.test = test;
  }

  jestLikeConfig.describe = jestLike?.describe ?? jestLikeConfig?.describe;
  jestLikeConfig.test = jestLike?.test ?? jestLikeConfig?.test;

  if (!jestLikeConfig?.test || !jestLikeConfig?.describe) {
    throw new Error(
      "The 'describe' and 'test' functions cannot be found. If you are using vitest or equivalent, please use the following function in your setupTest to configure jest-cucumber:\n\nimport { describe, test } from 'vitest';\nimport { setJestCucumberConfiguration } from './src';\n\nsetJestCucumberConfiguration({\n  runner: {\n    describe,\n    test,\n  },\n});\n\nPlease check your configuration.",
    );
  }

  return jestLikeConfig as IJestLike;
};

export const createDefineFeature = (): DefineFeatureFunction => {
  const processScenarioTitleTemplate = (
    scenarioTitle: string,
    parsedFeature: ParsedFeature,
    options: Options,
    parsedScenario: ParsedScenario,
    parsedScenarioOutline: ParsedScenarioOutline,
  ) => {
    if (options && options.scenarioNameTemplate) {
      try {
        return (
          options &&
          options.scenarioNameTemplate({
            featureTitle: parsedFeature.title,
            scenarioTitle: scenarioTitle.toString(),
            featureTags: parsedFeature.tags,
            scenarioTags: (parsedScenario || parsedScenarioOutline).tags,
          })
        );
      } catch (err) {
        throw new Error(
          `An error occurred while executing a scenario name template. \nTemplate:\n${options.scenarioNameTemplate}\nError:${err.message}`,
        );
      }
    }

    return scenarioTitle;
  };

  const checkForPendingSteps = (scenarioFromStepDefinitions: ScenarioFromStepDefinitions) => {
    let scenarioPending = false;

    scenarioFromStepDefinitions.steps.forEach(step => {
      try {
        if (step.stepFunction.toString().indexOf('pending()') !== -1) {
          // eslint-disable-next-line no-new-func
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

  const getTestFunction = (
    skippedViaTagFilter: boolean,
    only: boolean,
    skip: boolean,
    concurrent: boolean,
    jestLike: IJestLike,
  ) => {
    if (skip || skippedViaTagFilter) {
      return jestLike.test.skip;
    }
    if (only) {
      return jestLike.test.only;
    }
    if (concurrent) {
      return jestLike.test.concurrent;
    }
    return jestLike.test;
  };

  const defineScenario = (
    scenarioTitle: string,
    scenarioFromStepDefinitions: ScenarioFromStepDefinitions,
    parsedScenario: ParsedScenario,
    jestLike: IJestLike,
    only: boolean = false,
    skip: boolean = false,

    concurrent: boolean = false,
    timeout: number | undefined = undefined,
  ) => {
    const testFunction = getTestFunction(parsedScenario.skippedViaTagFilter, only, skip, concurrent, jestLike);

    testFunction(
      scenarioTitle,
      () => {
        return scenarioFromStepDefinitions.steps.reduce((promiseChain, nextStep, index) => {
          const parsedStep = parsedScenario.steps[index];
          const { stepArgument } = parsedStep;
          const matches = matchSteps(parsedStep.stepText, scenarioFromStepDefinitions.steps[index].stepMatcher);

          let matchArgs: string[] = [];

          if (matches && (matches as RegExpMatchArray).length) {
            matchArgs = (matches as RegExpMatchArray).slice(1);
          }

          const args = [...matchArgs];

          if (stepArgument !== undefined && stepArgument !== null) {
            args.push(stepArgument as string);
          }

          return promiseChain.then(() => {
            return Promise.resolve()
              .then(() => nextStep.stepFunction(...args))
              .catch(error => {
                const formattedError = error;
                formattedError.message = `Failing step: "${parsedStep.stepText}"\n\nStep arguments: ${JSON.stringify(args)}\n\nError: ${error.message}`;
                throw formattedError;
              });
          });
        }, Promise.resolve());
      },
      timeout,
    );
  };

  const createDefineStepFunction = (scenarioFromStepDefinitions: ScenarioFromStepDefinitions) => {
    return (stepMatcher: string | RegExp, stepFunction: (stepArguments?: unknown) => void | PromiseLike<never>) => {
      const stepDefinition: StepFromStepDefinitions = {
        stepMatcher,
        stepFunction,
      };

      scenarioFromStepDefinitions.steps.push(stepDefinition);
    };
  };

  const createDefineScenarioFunction = (
    featureFromStepDefinitions: FeatureFromStepDefinitions,
    parsedFeature: ParsedFeature,
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
        },
      });

      const parsedScenario = parsedFeature.scenarios.filter(
        s => s.title.toLowerCase() === scenarioTitle.toLowerCase(),
      )[0];

      const parsedScenarioOutline = parsedFeature.scenarioOutlines.filter(
        s => s.title.toLowerCase() === scenarioTitle.toLowerCase(),
      )[0];

      const { options } = parsedFeature;

      // eslint-disable-next-line no-param-reassign
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
        options.runner?.test.skip(
          scenarioTitle,
          () => {
            // Nothing to do
          },
          undefined,
        );
      } else if (parsedScenario) {
        defineScenario(
          scenarioTitle,
          scenarioFromStepDefinitions,
          parsedScenario,
          options.runner as IJestLike,
          only,
          skip,
          concurrent,
          timeout,
        );
      } else if (parsedScenarioOutline) {
        parsedScenarioOutline.scenarios.forEach(scenario => {
          defineScenario(
            scenario.title || scenarioTitle,
            scenarioFromStepDefinitions,
            scenario,
            options.runner as IJestLike,
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
    parsedFeature: ParsedFeature,
  ) => {
    const defineScenarioFunctionWithAliases = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature);

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).only = createDefineScenarioFunction(
      featureFromStepDefinitions,
      parsedFeature,
      true,
      false,
      false,
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).skip = createDefineScenarioFunction(
      featureFromStepDefinitions,
      parsedFeature,
      false,
      true,
      false,
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).concurrent = createDefineScenarioFunction(
      featureFromStepDefinitions,
      parsedFeature,
      false,
      false,
      true,
    );

    return defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases;
  };

  return function defineFeature(
    featureFromFile: ParsedFeature,
    scenariosDefinitionCallback: ScenariosDefinitionCallbackFunction,
  ) {
    const jestLike = getJestLike(featureFromFile.options.runner);

    const featureFromDefinedSteps: FeatureFromStepDefinitions = {
      title: featureFromFile.title,
      scenarios: [],
    };

    const parsedFeatureWithTagFiltersApplied = applyTagFilters(featureFromFile);
    parsedFeatureWithTagFiltersApplied.options.runner = jestLike;

    if (
      parsedFeatureWithTagFiltersApplied.scenarios.length === 0 &&
      parsedFeatureWithTagFiltersApplied.scenarioOutlines.length === 0
    ) {
      return;
    }

    jestLike.describe(featureFromFile.title, () => {
      scenariosDefinitionCallback(
        createDefineScenarioFunctionWithAliases(featureFromDefinedSteps, parsedFeatureWithTagFiltersApplied),
      );

      checkThatFeatureFileAndStepDefinitionsHaveSameScenarios(
        parsedFeatureWithTagFiltersApplied,
        featureFromDefinedSteps,
      );
    });
  };
};
