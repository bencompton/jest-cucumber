import { readFileSync } from 'fs';
import { sync as globSync } from 'glob';
import { dirname, resolve } from 'path';
import callsites from 'callsites';
import Parser from 'gherkin/dist/src/Parser';
import { default as Gherkins } from 'gherkin';
import AstBuilder from 'gherkin/dist/src/AstBuilder';
import { v4 as uuidv4 } from 'uuid';

import { getJestCucumberConfiguration } from './configuration';
import { ParsedFeature, ParsedScenario, ParsedStep, ParsedScenarioOutline, Options } from './models';
import Dialect from 'gherkin/dist/src/Dialect';

const parseDataTableRow = (astDataTableRow: any) => {
    return astDataTableRow.cells.map((col: any) => col.value) as string[];
};

const parseDataTable = (astDataTable: any, astDataTableHeader?: any) => {
    let headerRow: string[];
    let bodyRows: string[];

    if (astDataTableHeader) {
        headerRow = parseDataTableRow(astDataTableHeader);
        bodyRows = astDataTable;
    } else {
        headerRow = parseDataTableRow(astDataTable.rows[0]);
        bodyRows = astDataTable && astDataTable.rows && astDataTable.rows.length && astDataTable.rows.slice(1);
    }

    if (bodyRows && bodyRows.length > 0) {
        return bodyRows.map((nextRow) => {
            const parsedRow = parseDataTableRow(nextRow);

            return parsedRow.reduce((rowObj, nextCol, index) => {
                return {
                    ...rowObj,
                    [headerRow[index]]: nextCol,
                };
            }, {});
        });
    } else {
        return [];
    }
};

const parseStepArgument = (astStep: any) => {
    if (astStep) {
        switch (astStep.argument) {
            case 'dataTable':
                return parseDataTable(astStep.dataTable);
            case 'docString':
                return astStep.docString.content;
            default:
                return null;
        }
    } else {
        return null;
    }
};

const parseStep = (astStep: any) => {
    return {
        stepText: astStep.text,
        keyword: (astStep.keyword).trim().toLowerCase() as string,
        stepArgument: parseStepArgument(astStep),
        lineNumber: astStep.location.line,
    } as ParsedStep;
};

const parseSteps = (astScenario: any) => {
    return astScenario.steps.map((astStep: any) => parseStep(astStep));
};

const parseTags = (ast: any) => {
    if (!ast.tags) {
        return [] as string[];
    } else {
        return ast.tags.map((tag: any) => tag.name.toLowerCase());
    }
};

const parseScenario = (astScenario: any) => {
    return {
        title: astScenario.name,
        steps: parseSteps(astScenario),
        tags: parseTags(astScenario),
        lineNumber: astScenario.location.line,
    } as ParsedScenario;
};

const parseScenarioOutlineExampleSteps = (exampleTableRow: any, scenarioSteps: ParsedStep[]) => {
    return scenarioSteps.map((scenarioStep) => {
        const stepText = Object.keys(exampleTableRow).reduce((processedStepText, nextTableColumn) => {
            return processedStepText.replace(new RegExp(`<${nextTableColumn}>`, 'g'), exampleTableRow[nextTableColumn]);
        }, scenarioStep.stepText);

        let stepArgument: string | {} = '';

        if (scenarioStep.stepArgument) {
            if (Array.isArray(scenarioStep.stepArgument)) {
                stepArgument = (scenarioStep.stepArgument as any).map((stepArgumentRow: any) => {
                    const modifiedStepArgumentRow = { ...stepArgumentRow };

                    Object.keys(exampleTableRow).forEach((nextTableColumn) => {
                        Object.keys(modifiedStepArgumentRow).forEach((prop) => {
                            modifiedStepArgumentRow[prop] =
                                modifiedStepArgumentRow[prop].replace(
                                    new RegExp(`<${nextTableColumn}>`, 'g'),
                                    exampleTableRow[nextTableColumn],
                                );
                        });
                    });

                    return modifiedStepArgumentRow;
                });
            } else {
                stepArgument = scenarioStep.stepArgument;

                if (
                    typeof scenarioStep.stepArgument === 'string' ||
                    scenarioStep.stepArgument instanceof String
                ) {
                    Object.keys(exampleTableRow).forEach((nextTableColumn) => {
                        stepArgument = (stepArgument as string).replace(
                            new RegExp(`<${nextTableColumn}>`, 'g'),
                            exampleTableRow[nextTableColumn],
                        );
                    });
                }
            }
        }

        return {
            ...scenarioStep,
            stepText,
            stepArgument,
        } as ParsedStep;
    });
};

const getOutlineDynamicTitle = (exampleTableRow: any, title: string) => {
    return title.replace(/<(\S*)>/g, (_, firstMatch) => {
        return exampleTableRow[firstMatch || ''];
    });
};

const parseScenarioOutlineExample = (
    exampleTableRow: any,
    outlineScenario: ParsedScenario,
    exampleSetTags: string[],
) => {
    return {
        title: getOutlineDynamicTitle(exampleTableRow, outlineScenario.title),
        steps: parseScenarioOutlineExampleSteps(exampleTableRow, outlineScenario.steps),
        tags: Array.from(new Set<string>([...outlineScenario.tags, ...exampleSetTags])),
    } as ParsedScenario;
};

const parseScenarioOutlineExampleSet = (astExampleSet: any, outlineScenario: ParsedScenario) => {
    const exampleTable = parseDataTable(astExampleSet.tableBody, astExampleSet.tableHeader);

    return exampleTable.map(
        (tableRow) => parseScenarioOutlineExample(tableRow, outlineScenario, parseTags(astExampleSet)),
    );
};

const parseScenarioOutlineExampleSets = (astExampleSets: any, outlineScenario: ParsedScenario) => {
    const exampleSets = astExampleSets.map((astExampleSet: any) => {
        return parseScenarioOutlineExampleSet(astExampleSet, outlineScenario);
    });

    return exampleSets.reduce((scenarios: ParsedScenario[], nextExampleSet: ParsedScenario[][]) => {
        return [
            ...scenarios,
            ...nextExampleSet,
        ];
    }, [] as ParsedScenario[]);
};

const parseScenarioOutline = (astScenarioOutline: any) => {
    const outlineScenario = parseScenario(astScenarioOutline.scenario);

    return {
        title: outlineScenario.title,
        scenarios: parseScenarioOutlineExampleSets(astScenarioOutline.scenario.examples, outlineScenario),
        tags: outlineScenario.tags,
        steps: outlineScenario.steps,
        lineNumber: astScenarioOutline.scenario.location.line,
    } as ParsedScenarioOutline;
};

const parseScenarios = (astFeature: any) => {
    return astFeature.children
        .filter((child: any) => {
            const keywords = ['Scenario Outline', 'Scenario Template'];

            return child.scenario && keywords.indexOf(child.scenario.keyword) === -1;
        })
        .map((astScenario: any) => parseScenario(astScenario.scenario));
};

const parseScenarioOutlines = (astFeature: any) => {
    return astFeature.children
        .filter((child: any) => {
            const keywords = ['Scenario Outline', 'Scenario Template'];

            return child.scenario && keywords.indexOf(child.scenario.keyword) !== -1;
        })
        .map((astScenarioOutline: any) => parseScenarioOutline(astScenarioOutline));
};

const collapseBackgrounds = (astChildren: any[], backgrounds: any[]) => {
    const backgroundSteps = backgrounds
        .reduce((allBackgroundSteps, nextBackground) => {
            return [
                ...allBackgroundSteps,
                ...nextBackground.steps,
            ];
        }, []);

    astChildren.forEach((child) => {
        if (child.scenario) {
            child.scenario.steps = [...backgroundSteps, ...child.scenario.steps];
        }
    });

    return astChildren;
};

const parseBackgrounds = (ast: any) => {
    return ast.children
        .filter((child: any) => child.background)
        .map((child: any) => child.background);
};

const collapseRulesAndBackgrounds = (astFeature: any) => {
    const featureBackgrounds = parseBackgrounds(astFeature);

    const children = collapseBackgrounds(astFeature.children, featureBackgrounds)
        .reduce((newChildren: [], nextChild: any) => {
            if (nextChild.rule) {
                const rule = nextChild.rule;
                const ruleBackgrounds = parseBackgrounds(rule);

                return [
                    ...newChildren,
                    ...collapseBackgrounds(rule.children, [...featureBackgrounds, ...ruleBackgrounds]),
                ];
            } else {
                return [...newChildren, nextChild];
            }
        }, []);

    return {
        ...astFeature,
        children,
    };
};

const translateKeywords = (astFeature: any) => {
    const languageDialect = Gherkins.dialects()[astFeature.language];
    const translationMap = createTranslationMap(languageDialect);

    astFeature.language = 'en';
    astFeature.keyword = translationMap[astFeature.keyword] || astFeature.keyword;
    for(const child of astFeature.children){
        if(child.background) {
            child.background.keyword = translationMap[child.background.keyword] || child.background.keyword;
        }

        if(child.scenario) {
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

const createTranslationMap = (translateDialect: Dialect) => {
    const englishDialect = Gherkins.dialects()['en'];
    const translationMap: {[word: string]: string} = {};

    const props: (keyof Dialect)[] = ['and', 'background', 'but', 'examples', 'feature', 'given', 'scenario', 'scenarioOutline', 'then', 'when', 'rule'];
    for(const prop of props) {
        const dialectWords = translateDialect[prop];
        const translationWords = englishDialect[prop];
        let index = 0;
        for(const dialectWord of dialectWords){
            if(dialectWord.indexOf('*') !== 0) {
                translationMap[dialectWord] = translationWords[index];
            }
            index++;
        }
    }

    return translationMap;
}


export const parseFeature = (featureText: string, options?: Options): ParsedFeature => {
    let ast: any;

    try {
        const builder = new AstBuilder(uuidv4 as any);
        ast = new Parser(builder).parse(featureText);
    } catch (err) {
        throw new Error(`Error parsing feature Gherkin: ${err.message}`);
    }

    let astFeature = collapseRulesAndBackgrounds(ast.feature);
    if(astFeature.language !== 'en') {
        astFeature = translateKeywords(astFeature);
    }

    return {
        title: astFeature.name,
        scenarios: parseScenarios(astFeature),
        scenarioOutlines: parseScenarioOutlines(astFeature),
        tags: parseTags(astFeature),
        options,
    } as ParsedFeature;
};

export const loadFeature = (featureFilePath: string, options?: Options) => {
    options = getJestCucumberConfiguration(options);

    const callSite = callsites()[1];
    const fileOfCaller = callSite && callSite.getFileName() || '';
    const dirOfCaller = dirname(fileOfCaller);
    const absoluteFeatureFilePath = resolve(options.loadRelativePath ? dirOfCaller : '', featureFilePath);

    try {
        const featureText: string = readFileSync(absoluteFeatureFilePath, 'utf8');
        return parseFeature(featureText, options);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`Feature file not found (${absoluteFeatureFilePath})`);
        }

        throw err;
    }
};

export const loadFeatures = (globPattern: string, options?: Options) => {
    const featureFiles = globSync(globPattern);

    return featureFiles.map((featureFilePath) => loadFeature(featureFilePath, options));
};
