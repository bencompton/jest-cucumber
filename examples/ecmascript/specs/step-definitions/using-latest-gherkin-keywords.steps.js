// eslint-disable-next-line import/no-unresolved
import { defineFeature, loadFeature } from 'jest-cucumber';

import { Calculator } from '../../src/calculator';

const feature = loadFeature('./specs/features/using-latest-gherkin-keywords.feature');

defineFeature(feature, test => {
  let calculator;
  let output;

  beforeEach(() => {
    calculator = new Calculator();
  });

  const givenIHaveEnteredXAsTheFirstOperand = given => {
    given(/^I have entered "(\d+)" as the first operand$/, firstOperand => {
      calculator.setFirstOperand(parseFloat(firstOperand));
    });
  };

  const andIHaveEnteredXAsTheOperator = and => {
    and(/^I have entered "([+-/*])" as the operator$/, operator => {
      calculator.setCalculatorOperator(operator);
    });
  };

  const andIHaveEnteredXAsTheSecondOperand = and => {
    and(/^I have entered "(\d+)" as the second operand$/, secondOperand => {
      calculator.setSecondOperand(parseFloat(secondOperand));
    });
  };

  const whenIPressTheEnterKey = when => {
    when('I press the equals key', () => {
      output = calculator.computeOutput();
    });
  };

  const thenTheOutputOfXShouldBeDisplayed = then => {
    then(/^the output of "(\d+)" should be displayed$/, expectedOutput => {
      if (!expectedOutput) {
        expect(output).toBeFalsy();
      } else {
        expect(output).toBe(parseFloat(expectedOutput));
      }
    });
  };

  test('Subtracting two numbers', ({ given, and, when, then }) => {
    givenIHaveEnteredXAsTheFirstOperand(given);
    andIHaveEnteredXAsTheOperator(and);
    andIHaveEnteredXAsTheSecondOperand(and);
    whenIPressTheEnterKey(when);
    thenTheOutputOfXShouldBeDisplayed(then);
  });

  test('Attempting to subtract without entering a second number', ({ given, and, when, then }) => {
    givenIHaveEnteredXAsTheFirstOperand(given);
    andIHaveEnteredXAsTheOperator(and);

    and('I have not entered a second operand', () => {
      // Nothing to do here
    });

    whenIPressTheEnterKey(when);

    then('no output should be displayed', () => {
      expect(output).toBeFalsy();
    });
  });

  test('Division operations', ({ given, and, when, then }) => {
    givenIHaveEnteredXAsTheFirstOperand(given);
    andIHaveEnteredXAsTheOperator(and);
    andIHaveEnteredXAsTheSecondOperand(and);
    whenIPressTheEnterKey(when);
    thenTheOutputOfXShouldBeDisplayed(then);
  });
});
