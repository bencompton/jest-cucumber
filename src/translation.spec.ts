import { Dialect, dialects } from '@cucumber/gherkin';
import { translateKeywords } from './translation';

const StepKeywords: (keyof Dialect)[] = ['and', 'but', 'given', 'then', 'when'];

describe('translations', () => {
    describe('translateKeywords', () => {

        const languages = Object.keys(dialects)
            .filter(language => language !== 'en')
            .map(language => [language]);

        test.each(languages)('when the language is %s', (languageCode) => {
            const language = dialects[languageCode];

            const languageStepKeywords = Array.from(new Set(StepKeywords.map((keyword) => (language[keyword])).flat()));
            let astFeature = {
                language: languageCode,
                // top level
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
            if (!['uz', 'sl'].includes(languageCode)) {// TODO: not exclude uz en sl keyword checks
                const translatedStepKeywords = Array.from(new Set((astFeature.children[0].scenario.steps as []).map((step: { keyword: string; }) => step.keyword)));
                expect(translatedStepKeywords).toEqual(expect.arrayContaining(['* ', 'And ', 'But ', 'Given ', 'Then ', 'When ']));
                // FIXME: Агар in 'uz' is 'given' and 'when'
                // FIXME: there is no '* ' in 'sl'
            }
            expect(astFeature.children[0].scenario.examples[0].keyword).toEqual('Examples');//TODO: all examples keywords
        });
    });
});