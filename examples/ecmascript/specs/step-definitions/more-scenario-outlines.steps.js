import { defineFeature, loadFeature } from 'jest-cucumber';
import { SeriesSolver } from '../../src/series-solver';

const feature = loadFeature('./specs/features/more-scenario-outlines.feature');

defineFeature(feature, (test) => {
  let solver;
  let solution;
  let terms;
  let operator;

  beforeEach(() => {
    solver = new SeriesSolver();
  });

  const whenISolveTheSeries = (when) => {
    when(/^I solve the series$/, () => {
      solution = solver.solve(terms, operator);
    });
  };

  const thenIShouldGetXAsTheAnswer = (then) => {
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
      (table) => {
        const row = table[0];
        terms = row.Series.split(` ${row.Operator} `);
        operator = row.Operator;
        solver.add(terms, operator, row.Solution);
      });

    whenISolveTheSeries(when);

    thenIShouldGetXAsTheAnswer(then);
  });
});
