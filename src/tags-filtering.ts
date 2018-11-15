import { ParsedFeature, ParsedScenario, ParsedScenarioOutline } from './models';

const checkIfScenarioMatchesTagFilter = (
    filterTags: string[],
    feature: ParsedFeature,
    scenario: ParsedScenario | ParsedScenarioOutline,
) => {
    const featureAndScenarioTags = [
        ...scenario.tags.map((tag) => tag.toLowerCase()),
        ...feature.tags.map((tag) => tag.toLowerCase()),
    ];

    return filterTags
        .filter((filterTag) => featureAndScenarioTags.indexOf(filterTag.toLowerCase()) !== -1).length > 0;
};

export const applyTagFilters = (
    parsedFeature: ParsedFeature,
) => {
    if (parsedFeature.options.tagFilter === undefined) {
        return parsedFeature;
    }

    const scenarios = parsedFeature.scenarios
        .filter((scenario) =>
            checkIfScenarioMatchesTagFilter(
                parsedFeature.options.tagFilter as string[],
                parsedFeature,
                scenario,
            ),
        );

    const scenarioOutlines = parsedFeature.scenarioOutlines
        .filter((scenarioOutline) =>
            checkIfScenarioMatchesTagFilter(
                parsedFeature.options.tagFilter as string[],
                parsedFeature,
                scenarioOutline,
            ),
        );

    return {
        ...parsedFeature,
        scenarios,
        scenarioOutlines,
    } as ParsedFeature;
};
