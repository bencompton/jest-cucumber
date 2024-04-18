Feature: Using latest Gherkin keywords

    Rule: When a number, a minus sign, a number, and equals is entered into the calculator, 
          the sum should be calculated and displayed

        Example: Subtracting two numbers
            Given I have entered "4" as the first operand
            And I have entered "-" as the operator
            And I have entered "2" as the second operand
            When I press the equals key
            Then the output of "2" should be displayed

        Example: Attempting to subtract without entering a second number
            Given I have entered "2" as the first operand
            And I have entered "-" as the operator
            And I have not entered a second operand
            When I press the equals key
            Then no output should be displayed

    Rule: When a number, a division sign, a number, and equals is entered into the calculator,
          the quotient should be calculated and displayed

        Scenario Template: Division operations
            Given I have entered "<firstOperand>" as the first operand
            And I have entered "/" as the operator
            And I have entered "<secondOperand>" as the second operand
            When I press the equals key
            Then the output of "<output>" should be displayed

            Examples: Successful division

            | firstOperand | secondOperand | output |
            | 4            | 2             | 2      |

            Examples: Unsuccessful division

            | firstOperand | secondOperand | output    |
            | 4            | 0             | undefined |