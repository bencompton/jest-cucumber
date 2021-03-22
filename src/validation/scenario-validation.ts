import {
    Options,
    Feature,
} from '../models';

export const checkThatFeatureFileAndStepDefinitionsHaveSameScenarios = (
    feature: Feature,
    options: Options,
) => {

    if (options && options.errors === false) {
      return;
    }

    const scenariosWithoutDefinition = feature.scenarios.filter((s) => !s.stepDefinitionsAvailable);

    const errors = scenariosWithoutDefinition.map((s) =>
      `Scenario "${s.title}" found been in feature file but no step definitions were provided`,
    );

    if (errors.length) {
        throw new Error(errors.join('\n\n'));
    }
};
