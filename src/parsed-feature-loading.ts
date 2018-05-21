import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const Gherkin = require('gherkin');

import { ParsedFeature, ParsedScenario, ParsedStep, ParsedScenarioOutline, Options } from './models';

const parseDataTableRow = (astDataTableRow: any) => {
    return <string[]>astDataTableRow.cells.map((col: any) => col.value);
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
        return bodyRows.map(nextRow => {
            const parsedRow = parseDataTableRow(nextRow);

            return parsedRow.reduce((rowObj, nextCol, index) => {
                return {
                    ...rowObj,
                    [headerRow[index]]: nextCol
                };
            }, {});
        });
    } else {
        return [];
    }
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
    return <ParsedStep>{
        stepText: astStep.text,
        keyword: <string>(astStep.keyword).trim().toLowerCase(),
        stepArgument: parseStepArgument(astStep.argument)
    };
};

const parseSteps = (astScenario: any) => {
    return astScenario.steps.map((astStep: any) => parseStep(astStep));
};

const parseScenarioTags = (astScenario: any) => {
    if (!astScenario.tags) {
        return <string[]>[];
    } else {
        return astScenario.tags.map((tag: any) => tag.name.toLowerCase());
    }
};

const parseScenario = (astScenario: any) => {
    return <ParsedScenario>{
        title: astScenario.name,
        steps: parseSteps(astScenario),
        tags: parseScenarioTags(astScenario)
    };
};

const parseScenarioOutlineExampleSteps = (exampleTableRow: any, scenarioSteps: ParsedStep[]) => {
    return scenarioSteps.map(scenarioStep => {
        const stepText = Object.keys(exampleTableRow).reduce((processedStepText, nextTableColumn) => {
            return processedStepText.replace(`<${nextTableColumn}>`, exampleTableRow[nextTableColumn]);
        }, scenarioStep.stepText);

        var stepArgument;
        if(scenarioStep.stepArgument) {
            stepArgument = (<any>scenarioStep.stepArgument).map((stepArgumentRow: any) => {
                var modifiedStepAgrumentRow = {...stepArgumentRow};
                Object.keys(exampleTableRow).forEach(function (nextTableColumn) {
                    for(var prop in modifiedStepAgrumentRow)
                    {
                        modifiedStepAgrumentRow[prop] = modifiedStepAgrumentRow[prop].replace(`<${nextTableColumn}>`, exampleTableRow[nextTableColumn]);
                    }
                });

                return modifiedStepAgrumentRow;
            });
        }

        return <ParsedStep>{
            ...scenarioStep,
            stepText,
            stepArgument
        };
    });
};

const parseScenarioOutlineExample = (exampleTableRow: any, outlineScenario: ParsedScenario) => {
    return <ParsedScenario>{
        title: outlineScenario.title,
        steps: parseScenarioOutlineExampleSteps(exampleTableRow, outlineScenario.steps),
        tags: outlineScenario.tags
    };
};

const parseScenarioOutlineExampleSet = (astExampleSet: any, outlineScenario: ParsedScenario) => {
    const exampleTable = parseDataTable(astExampleSet.tableBody, astExampleSet.tableHeader);

    return exampleTable.map(tableRow => parseScenarioOutlineExample(tableRow, outlineScenario));
};

const parseScenarioOutlineExampleSets = (astExampleSets: any, outlineScenario: ParsedScenario) => {
    const exampleSets = astExampleSets.map((astExampleSet: any) => parseScenarioOutlineExampleSet(astExampleSet, outlineScenario));

    return exampleSets.reduce((scenarios: ParsedScenario[], nextExampleSet: ParsedScenario[][]) => {
        return [
            ...scenarios,
            ...nextExampleSet
        ];
    }, <ParsedScenario[]>[]);
};

const parseScenarioOutline = (astScenarioOutline: any) => {
    const outlineScenario = parseScenario(astScenarioOutline);

    return <ParsedScenarioOutline>{
        title: outlineScenario.title,
        scenarios: parseScenarioOutlineExampleSets(astScenarioOutline.examples, outlineScenario),
        tags: outlineScenario.tags,
        steps: outlineScenario.steps
    };
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

const parseFeature = (ast: any, options?: Options): ParsedFeature => {
    const astFeature = ast.feature;

    return <ParsedFeature>{
        title: astFeature.name,
        scenarios: parseScenarios(astFeature),
        scenarioOutlines: parseScenarioOutlines(astFeature),
        options
    };
};

export const loadFeature = (featureFilePath: string, options?: Options) => {
    if (!existsSync(featureFilePath)) {
        throw new Error(`Feature file not found (${resolve(featureFilePath)})`);
    }

    const featureText: string = readFileSync(featureFilePath, 'utf8');
    const ast = new Gherkin.Parser().parse(featureText);

    return parseFeature(ast, options);
};