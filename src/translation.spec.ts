import { Dialect, dialects, Parser } from '@cucumber/gherkin';
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

            for (const feature of language.feature) {
                let astFeature = {
                    language: languageCode,
                    keyword: feature,
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
                                examples: language.examples.map((example) => ({ keyword: example, })),
                            },
                        },
                        ...language.scenarioOutline.map((scenarioOutline) => ({
                            scenario: {
                                keyword: scenarioOutline,
                                steps: [],
                                examples: [],
                            },
                        }))
                    ],
                }

                astFeature = translateKeywords(astFeature);

                expect(astFeature.keyword).toEqual('Feature');

                astFeature.children.filter((child) => 'background' in child)
                    .forEach((child: any) => expect(child.background!.keyword).toEqual('Background'));

                const translatedScenarioKeywords = astFeature.children.map((child) => child.scenario.keyword);
                expect(translatedScenarioKeywords).toContain('Example');
                expect(translatedScenarioKeywords).toContain('Scenario Outline');

                const translatedStepKeywords = Array.from(new Set((astFeature.children[0].scenario.steps as []).map((step: { keyword: string; }) => step.keyword)));
                const expectedStepKeywords = ['* ', 'And ', 'But ', 'Given ', 'Then ', 'When '];
                if (languageCode === 'sl') {
                    // exception for 'sl' language, this don't have '*' set
                    expectedStepKeywords.shift();
                }
                expect(translatedStepKeywords).toEqual(expect.arrayContaining(expectedStepKeywords));

                astFeature.children[0].scenario.examples.forEach((example: { keyword: string }) => {
                    expect(example.keyword).toEqual('Examples');
                });
            }
        });

        skipLanguages.forEach((skipLanguage) => {
            test.skip('when the language is ' + skipLanguages, (languageCode) => { });
        })
    });
});