import { ParsedFeature, ParsedScenario, ParsedScenarioOutline } from './models';

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
    feature: ParsedFeature,
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

const setScenarioSkipped = (parsedFeature: ParsedFeature, scenario: ParsedScenario) => {
    const skippedViaTagFilter = !checkIfScenarioMatchesTagFilter(
        parsedFeature.options.tagFilter as string,
        parsedFeature,
        scenario,
    );

    return {
        ...scenario,
        skippedViaTagFilter,
    };
};

export const applyTagFilters = (
    parsedFeature: ParsedFeature,
) => {
    if (parsedFeature.options.tagFilter === undefined) {
        return parsedFeature;
    }

    const scenarios = parsedFeature.scenarios.map((scenario) => setScenarioSkipped(parsedFeature, scenario));
    const scenarioOutlines = parsedFeature.scenarioOutlines
        .map((scenarioOutline) => {
            return {
                ...setScenarioSkipped(parsedFeature, scenarioOutline),
                scenarios: scenarioOutline.scenarios.map((scenario) => setScenarioSkipped(parsedFeature, scenario)),
            };
        });

    return {
        ...parsedFeature,
        scenarios,
        scenarioOutlines,
    } as ParsedFeature;
};
