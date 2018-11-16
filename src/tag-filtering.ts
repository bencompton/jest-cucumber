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

    newTagFilterExpression = newTagFilterExpression.replace(/not/g, '!');
    newTagFilterExpression = newTagFilterExpression.replace(/or/g, '|');
    newTagFilterExpression = newTagFilterExpression.replace(/and/g, '&&');
    newTagFilterExpression = newTagFilterExpression.replace(/[ \t\n\r]+/g, '');

    // tslint:disable-next-line:no-console
    console.log(newTagFilterExpression);

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

    // tslint:disable-next-line:no-console
    console.log(featureAndScenarioTags);
    // tslint:disable-next-line:no-console
    console.log(tagFilterFunction(featureAndScenarioTags));
    // tslint:disable-next-line:no-console
    console.log(tagFilterFunction.toString());

    return tagFilterFunction(featureAndScenarioTags);
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
                parsedFeature.options.tagFilter as string,
                parsedFeature,
                scenario,
            ),
        );

    const scenarioOutlines = parsedFeature.scenarioOutlines
        .filter((scenarioOutline) =>
            checkIfScenarioMatchesTagFilter(
                parsedFeature.options.tagFilter as string,
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
