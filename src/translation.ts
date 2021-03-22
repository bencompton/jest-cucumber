import { default as Gherkins } from 'gherkin';
import Dialect from 'gherkin/dist/src/Dialect';

const createTranslationMap = (translateDialect: Dialect) => {
    const englishDialect = Gherkins.dialects().en;
    const translationMap: { [word: string]: string } = {};

    const props: Array<keyof Dialect> = [
        'and',
        'background',
        'but',
        'examples',
        'feature',
        'given',
        'scenario',
        'scenarioOutline',
        'then',
        'when',
        'rule',
    ];

    for (const prop of props) {
        const dialectWords = translateDialect[prop];
        const translationWords = englishDialect[prop];
        const defaultTranslation = getDefaultTranslation(translationWords as string[]);

        for (const dialectWord of dialectWords) {
            // don't translate *
            if (dialectWord.indexOf('*') !== 0) {
                translationMap[dialectWord] = defaultTranslation;
            }
        }
    }

    return translationMap;
};

const getDefaultTranslation = (translationWords: string[]): string => {
    return translationWords.find(word => !word.includes('*'))!;
};

export const translateKeywords = (astFeature: any) => {
    const languageDialect = Gherkins.dialects()[astFeature.language];
    const translationMap = createTranslationMap(languageDialect);

    // replace language
    astFeature.language = 'en';
    // update top level
    astFeature.keyword = translationMap[astFeature.keyword] || astFeature.keyword;

    for (const child of astFeature.children) {
        if (child.background) {
            child.background.keyword = translationMap[child.background.keyword] || child.background.keyword;
        }

        if (child.scenario) {
            child.scenario.keyword = translationMap[child.scenario.keyword] || child.scenario.keyword;

            for (const step of child.scenario.steps) {
                step.keyword = translationMap[step.keyword] || step.keyword;
            }

            for (const example of child.scenario.examples) {
                example.keyword = translationMap[example.keyword] || example.keyword;
            }
        }
    }

    return astFeature;
};
