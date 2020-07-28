import { defineFeature, loadFeature, DefineStepFunction } from '../../../../src';
import { SeriesSolver } from '../../src/series-solver';

const feature = loadFeature('./examples/typescript/specs/features/more-scenario-outlines.feature');

defineFeature(feature, (test) => {
  let solver: SeriesSolver;
  let solution: string;
  let terms: string[];
  let operator: string;

  beforeEach(() => {
    solver = new SeriesSolver();
  });

  const whenISolveTheSeries = (when: DefineStepFunction) => {
    when(/^I solve the series$/, () => {
      solution = solver.solve(terms, operator);
    });
  };

  const thenIShouldGetXAsTheAnswer = (then: DefineStepFunction) => {
    then(/^I should get (.*) as the answer$/, (expectedSolution) => {
      expect(solution).toBe(expectedSolution);
    });
  };

  test('Solving series', ({ given, when, then }) => {
    given(
      /^I have a series (.*) (.*) (.*) (.*) (.*) (.*) (.*)$/,
      (firstTerm, firstOperator, secondTerm, secondOperator, thirdTerm, thirdOperator, forthTerm) => {
        expect(firstOperator).toEqual(secondOperator);
        expect(firstOperator).toEqual(thirdOperator);

        operator = firstOperator;
        terms = [firstTerm, secondTerm, thirdTerm, forthTerm];
      });

    whenISolveTheSeries(when);

    thenIShouldGetXAsTheAnswer(then);
  });

  test('Adding series', ({ given, when, then }) => {
    given(
      /^I add the following series:$/,
      (table: [{ Series: string, Operator: string, Solution: string }]) => {
        const row = table[0];
        terms = row.Series.split(` ${row.Operator} `);
        operator = row.Operator;
        solver.add(terms, operator, row.Solution);
      });

    whenISolveTheSeries(when);

    thenIShouldGetXAsTheAnswer(then);
  });
});
