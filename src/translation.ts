import { Dialect, dialects } from '@cucumber/gherkin';

// only translation props 
type DialectTranslationProps = keyof Pick<Dialect, 'and' | 'background' | 'but' | 'examples' | 'feature' | 'given' | 'scenario' | 'scenarioOutline' | 'then' | 'when' | 'rule'>;
const englishDialect = dialects.en

type TranslationMap = { [word: string]: string };

const createTranslationMap = (translateDialect: Dialect): TranslationMap => {
    const translationMap: TranslationMap = {};

    const props: DialectTranslationProps[] = [
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
        // it does not matter where the word is translated to,
        // just get the first non-'*' word
        const defaultTranslation = getDefaultTranslation(englishDialect[prop]);

        for (const dialectWord of dialectWords) {
            // don't translate *
            if (dialectWord.indexOf('*') === 0) {
                continue;
            }
            translationMap[dialectWord] = defaultTranslation;
        }
    }

    return translationMap;
};

const getDefaultTranslation = (translationWords: readonly string[]): string => {
    return translationWords.find(word => !word.includes('*'))!;
};

export const translateKeywords = (astFeature: any) => {
    const languageDialect = dialects[astFeature.language];
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
