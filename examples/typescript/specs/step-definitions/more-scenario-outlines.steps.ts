import { defineFeature, loadFeature } from '../../../../src';
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

  test('Solving series', ({ given, when, then }) => {
    given(
      /^I have a series (.*) (.*) (.*) (.*) (.*) (.*) \.\.\.$/,
      (firstTerm, firstOperator, secondTerm, secondOperator, thirdTerm, thirdOperator) => {
        expect(firstOperator).toEqual(secondOperator);
        expect(firstOperator).toEqual(thirdOperator);

        operator = firstOperator;
        terms = [firstTerm, secondTerm, thirdTerm];
      });

    when(/^I solve the series$/, () => {
      solution = solver.solve(terms, operator);
    });

    then(/^I should get (.*) as the answer$/, (expectedSolution) => {
      expect(solution).toBe(expectedSolution);
    });
  });
});
