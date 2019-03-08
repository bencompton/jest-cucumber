import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import callsites from 'callsites';
// tslint:disable-next-line:no-var-requires
const Gherkin = require('gherkin');

import {getJestCucumberConfiguration} from './configuration';
import {ParsedFeature, ParsedScenario, ParsedStep, ParsedScenarioOutline, Options} from './models';

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

const parseTableRowLineNumbers = (astDataTable: any) => {
    return astDataTable && astDataTable.rows
        .map((row: any) => row.location.line);
};

const parseStepArgument = (astStepArgument: any) => {
    if (astStepArgument) {
        switch (astStepArgument.type) {
            case 'DataTable':
                return parseDataTable(astStepArgument);
            case 'DocString':
                return astStepArgument.content;
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
        stepArgument: parseStepArgument(astStep.argument),
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
            return processedStepText.replace(`<${nextTableColumn}>`, exampleTableRow[nextTableColumn]);
        }, scenarioStep.stepText);

        let stepArgument;

        if (scenarioStep.stepArgument) {
            stepArgument = (scenarioStep.stepArgument as any).map((stepArgumentRow: any) => {
                const modifiedStepAgrumentRow = {...stepArgumentRow};

                Object.keys(exampleTableRow).forEach((nextTableColumn) => {
                    Object.keys(modifiedStepAgrumentRow).forEach((prop) => {
                        modifiedStepAgrumentRow[prop] =
                            modifiedStepAgrumentRow[prop].replace(
                                `<${nextTableColumn}>`,
                                exampleTableRow[nextTableColumn],
                            );
                    });
                });

                return modifiedStepAgrumentRow;
            });
        }

        return {
            ...scenarioStep,
            stepText,
            stepArgument,
        } as ParsedStep;
    });
};

const getOutlineDynamicTitle = (exampleTableRow: any, title: string) => {
    const findTitleKey = title.match(/<(.*)>/);
    return findTitleKey && findTitleKey.length >= 1 ? findTitleKey[1] : '';
};

const parseScenarioOutlineExample = (exampleTableRow: any, outlineScenario: ParsedScenario, lineNumber: number) => {
    const outlineScenarioTitle = outlineScenario.title;
    const exampleKeyTitle = getOutlineDynamicTitle(exampleTableRow, outlineScenarioTitle);
    const exampleTitle = exampleTableRow[exampleKeyTitle] ? exampleTableRow[exampleKeyTitle] : '';
    let title = outlineScenarioTitle;

    if (exampleKeyTitle) {
        title = outlineScenarioTitle.replace(`<${exampleKeyTitle}>`, exampleTitle);
    }

    return {
        title,
        steps: parseScenarioOutlineExampleSteps(exampleTableRow, outlineScenario.steps),
        tags: outlineScenario.tags,
        lineNumber,
    } as ParsedScenario;
};

const parseScenarioOutlineExampleSet = (astExampleSet: any, outlineScenario: ParsedScenario) => {
    const exampleTable = parseDataTable(astExampleSet.tableBody, astExampleSet.tableHeader);
    const rowLineNumbers = parseTableRowLineNumbers(astExampleSet.tableBody);

    return exampleTable.map((tableRow, index) => parseScenarioOutlineExample(
        tableRow,
        outlineScenario,
        rowLineNumbers[index],
    ));
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
    const outlineScenario = parseScenario(astScenarioOutline);

    return {
        title: outlineScenario.title,
        scenarios: parseScenarioOutlineExampleSets(astScenarioOutline.examples, outlineScenario),
        tags: outlineScenario.tags,
        steps: outlineScenario.steps,
        lineNumber: astScenarioOutline.location.line,
    } as ParsedScenarioOutline;
};

const parseScenarios = (astFeature: any) => {
    return astFeature.children
        .filter((child: any) => child.type === 'Scenario')
        .map((astScenario: any) => parseScenario(astScenario));
};

const parseScenarioOutlines = (astFeature: any) => {
    return astFeature.children
        .filter((child: any) => child.type === 'ScenarioOutline')
        .map((astScenarioOutline: any) => parseScenarioOutline(astScenarioOutline));
};

export const parseFeature = (featurePath: string, featureText: string, options?: Options): ParsedFeature => {
    let ast: any;

    try {
        ast = new Gherkin.Parser().parse(featureText);
    } catch (err) {
        throw new Error(`Error parsing feature Gherkin: ${err.message}`);
    }

    const astFeature = ast.feature;

    return {
        title: astFeature.name,
        scenarios: parseScenarios(astFeature),
        scenarioOutlines: parseScenarioOutlines(astFeature),
        tags: parseTags(astFeature),
        options,
        path: featurePath,
    } as ParsedFeature;
};

export const loadFeature = (featureFilePath: string, options?: Options) => {
    options = getJestCucumberConfiguration(options);

    const dirOfCaller = dirname(callsites()[1].getFileName() || '');
    const absoluteFeatureFilePath = resolve(options.loadRelativePath ? dirOfCaller : '', featureFilePath);

    try {
        const featureText: string = readFileSync(absoluteFeatureFilePath, 'utf8');

        return parseFeature(absoluteFeatureFilePath, featureText, options);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`Feature file not found (${absoluteFeatureFilePath})`);
        }
        throw err;
    }
};
