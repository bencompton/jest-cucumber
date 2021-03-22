import { Dialect, dialects } from '@cucumber/gherkin';
import { translateKeywords } from './translation';

const StepKeywords: (keyof Dialect)[] = ['and', 'but', 'given', 'then', 'when'];

describe('translation', () => {
    // don't test languages that have duplicate keywords
    // See also: https://github.com/cucumber/cucumber/issues/1325
    const skipLanguages = ['uz'];

    describe('translateKeywords', () => {

        const languages = Object.keys(dialects)
            // remove language where it is translated to
            .filter(language => language !== 'en')

            .filter(language => !skipLanguages.includes(language))
            .map(language => [language]);

        test.each(languages)('when the language is %s', (languageCode) => {
            const language = dialects[languageCode];

            const languageStepKeywords = Array.from(new Set(StepKeywords.map((keyword) => (language[keyword])).flat()));
            let astFeature = {
                language: languageCode,
                keyword: language.feature[0],// TODO: all feature keywords
                children: [
                    {
                        background: {
                            keyword: language.background[0],// TODO: all background keywords
                        },
                        scenario: {
                            // TODO: add rule
                            keyword: language.scenario[0],// TODO: all scenario keywords
                            steps: languageStepKeywords.map((stepKeyword) => ({
                                keyword: stepKeyword
                            })),
                            examples: [{
                                keyword: language.examples[0],
                            }],
                        },
                    },
                    {
                        scenario: {
                            keyword: language.scenarioOutline[0],// TODO: all scenarioOutline keywords
                            steps: [],
                            examples: [],
                        },
                    },
                ],
            }

            astFeature = translateKeywords(astFeature);

            expect(astFeature.keyword).toEqual('Feature');
            expect(astFeature.children[0].background?.keyword).toEqual('Background');
            const translatedStepKeywords = Array.from(new Set((astFeature.children[0].scenario.steps as []).map((step: { keyword: string; }) => step.keyword)));
            const expectedStepKeywords = ['* ', 'And ', 'But ', 'Given ', 'Then ', 'When '];
            if (languageCode === 'sl') {
                // exception for 'sl' language, this don't have '*' set
                // See also https://github.com/cucumber/cucumber/issues/1325
                expectedStepKeywords.shift();
            }
            expect(translatedStepKeywords).toEqual(expect.arrayContaining(expectedStepKeywords));
            expect(astFeature.children[0].scenario.examples[0].keyword).toEqual('Examples');//TODO: all examples keywords
        });

        skipLanguages.forEach((skipLanguage) => {
            test.skip('when the language is ' + skipLanguages, (languageCode) => { });
        })
    });
});