import { ParsedFeature, ParsedScenario, ParsedScenarioOutline, ScenarioGroup } from './models';

type TagFilterFunction = (tags: string[]) => boolean;

const cachedTagFilterFunctions: { [tag: string]: TagFilterFunction } = {};

const convertTagFilterExpressionToFunction = (tagFilterExpression: string) => {
    const tagRegex = /(\@[A-Za-z-_0-9]+)/g;
    const tags: string[] = [];
    let match: RegExpMatchArray | null = null;
    let newTagFilterExpression = tagFilterExpression + '';

    do {
        match = tagRegex.exec(tagFilterExpression);

        if (match) {
            // tslint:disable-next-line:max-line-length
            newTagFilterExpression = newTagFilterExpression.replace(match[1], `(tags.indexOf("${match[1].toLowerCase()}")!==-1)`);

            if (tags.indexOf(match[1]) !== -1) {
                tags.push(match[1]);
            }
        }
    } while (match);

    newTagFilterExpression = newTagFilterExpression.replace(/(\s+not|not\s+|\s+not\s+)/g, ' ! ');
    newTagFilterExpression = newTagFilterExpression.replace(/(\s+or|or\s+|\s+or\s+)/g, ' || ');
    newTagFilterExpression = newTagFilterExpression.replace(/(\s+and|and\s+|\s+and\s+)/g, ' && ');
    newTagFilterExpression = newTagFilterExpression.replace(/[ \t\n\r]+/g, '');

    let tagFilterFunction: TagFilterFunction;

    try {
        tagFilterFunction = new Function('tags', `return ${newTagFilterExpression};`) as TagFilterFunction;
        tagFilterFunction([]);
    } catch (error) {
        throw new Error(`Could not parse tag filter "${tagFilterExpression}"`);
    }

    return tagFilterFunction;
};

const checkIfScenarioMatchesTagFilter = (
    tagFilterExpression: string,
    feature: ScenarioGroup,
    scenario: ParsedScenario | ParsedScenarioOutline,
) => {
    const featureAndScenarioTags = [
        ...scenario.tags.map((tag) => tag.toLowerCase()),
        ...feature.tags.map((tag) => tag.toLowerCase()),
    ];

    let tagFilterFunction = cachedTagFilterFunctions[tagFilterExpression];

    if (!tagFilterFunction) {
        tagFilterFunction = convertTagFilterExpressionToFunction(tagFilterExpression);
        cachedTagFilterFunctions[tagFilterExpression] = tagFilterFunction;
    }

    return tagFilterFunction(featureAndScenarioTags);
};

const setScenarioSkipped = (parsedFeature: ScenarioGroup, scenario: ParsedScenario, tagFilter: string) => {
    const skippedViaTagFilter = !checkIfScenarioMatchesTagFilter(
        tagFilter,
        parsedFeature,
        scenario,
    );

    return {
        ...scenario,
        skippedViaTagFilter,
    };
};

export const applyTagFilters = (
    group: ScenarioGroup,
    tagFilter: string | undefined
) => {
    if (tagFilter === undefined) {
        return group;
    }

    const scenarios = group.scenarios.map((scenario) => setScenarioSkipped(group, scenario, tagFilter));
    const scenarioOutlines = group.scenarioOutlines
        .map((scenarioOutline) => {
            return {
                ...setScenarioSkipped(group, scenarioOutline, tagFilter),
                scenarios: scenarioOutline.scenarios.map((scenario) => setScenarioSkipped(group, scenario, tagFilter)),
            };
        });

    return {
        ...group,
        scenarios,
        scenarioOutlines,
    } as ParsedFeature;
};
