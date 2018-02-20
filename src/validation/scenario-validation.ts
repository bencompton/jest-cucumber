import { FeatureFromStepDefinitions, ScenarioFromStepDefinitions, ParsedFeature, ParsedScenario, ParsedScenarioOutline } from '../models';
import { generateScenarioCode } from '../code-generation';

const findScenarioFromParsedFeature = (
    errors: string[],
    parsedScenarios: (ParsedScenario | ParsedScenarioOutline)[],
    scenarioTitle: string
) => {
    let matchingScenarios: (ParsedScenario | ParsedScenarioOutline)[] = [];

    if (parsedScenarios) {
        matchingScenarios = parsedScenarios
            .filter(parsedScenario => parsedScenario.title.toLowerCase() === scenarioTitle.toLowerCase());
    }

    if (matchingScenarios.length === 0) {
        errors.push(`No scenarios found in feature file that match scenario title "${scenarioTitle}."`);

        return null;
    } else if (matchingScenarios.length > 1) {
        errors.push(`More than one scenario found in feature file that match scenario title "${scenarioTitle}"`);

        return null;
    }

    return matchingScenarios[0];
};

const findScenarioFromStepDefinitions = (
    errors: string[],
    scenariosFromStepDefinitions: ScenarioFromStepDefinitions[],
    scenario: ParsedScenario | ParsedScenarioOutline
) => {
    const scenarioTitle = scenario.title;
    const matchingScenarios = scenariosFromStepDefinitions
        .filter(scenarioFromStepDefinitions => scenarioFromStepDefinitions.title.toLocaleLowerCase() === scenarioTitle.toLocaleLowerCase());

    if (matchingScenarios.length === 0) {
        errors.push(`Feature file has a scenario titled "${scenarioTitle}", but no match found in step definitions. Try adding the following code:\n\n${generateScenarioCode(scenario)}`);

        return null;
    } else if (matchingScenarios.length > 1) {
        errors.push(`More than one scenario found in step definitions matching scenario title "${scenarioTitle}"`);

        return null;
    }

    return matchingScenarios[0];
};

const filterParsedScenariosByTags = (tagNames: string[], parsedScenarios: (ParsedScenario | ParsedScenarioOutline)[]) => {
    return parsedScenarios.filter(parsedScenario => {
        const tagMatches = parsedScenario.tags
            .map(tag => tag.toLowerCase())
            .filter(scenarioTagNames => {
                return tagNames.filter(tagName => scenarioTagNames.indexOf(tagName.toLowerCase()) !== -1).length > 0;
            });

        return tagMatches.length > 0;
    });
};

export const checkThatFeatureFileAndStepDefinitionsHaveSameScenarios = (
    parsedFeature: ParsedFeature,
    featureFromStepDefinitions: FeatureFromStepDefinitions
) => {
    const errors: string[] = [];

    let parsedScenarios: (ParsedScenario | ParsedScenarioOutline)[] = [];

    if (parsedFeature && parsedFeature.scenarios && parsedFeature.scenarios.length) {
        parsedScenarios = parsedScenarios.concat(parsedFeature.scenarios);
    }

    if (parsedFeature && parsedFeature.scenarioOutlines && parsedFeature.scenarioOutlines.length) {
        parsedScenarios = parsedScenarios.concat(parsedFeature.scenarioOutlines);
    }

    if (parsedFeature.options && parsedFeature.options.tagFilter) {
        parsedScenarios = filterParsedScenariosByTags(parsedFeature.options.tagFilter, parsedScenarios);
    }

    if (parsedFeature.options && parsedFeature.options.errorOnMissingScenariosAndSteps === false) {
        return;
    }

    if (featureFromStepDefinitions && featureFromStepDefinitions.scenarios && featureFromStepDefinitions.scenarios.length) {
        featureFromStepDefinitions.scenarios.forEach(scenarioFromStepDefinitions => {
            findScenarioFromParsedFeature(errors, parsedScenarios, scenarioFromStepDefinitions.title);
        });
    }

    if (parsedScenarios && parsedScenarios.length) {
        parsedScenarios.forEach(parsedScenario => {
            findScenarioFromStepDefinitions(errors, featureFromStepDefinitions && featureFromStepDefinitions.scenarios, parsedScenario);
        });
    }

    if (errors.length) {
        throw new Error(errors.join('\n\n'));
    }
};