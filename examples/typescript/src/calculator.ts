export type CalculatorOperator =
    '+' |
    '-' |
    '*' |
    '/';

export class Calculator {
    private firstOperand: number | null = null;
    private secondOperand: number | null = null;
    private operator: CalculatorOperator | null = null;

    public setFirstOperand(operand: number) {
        this.firstOperand = operand;
    }

    public setSecondOperand(operand: number) {
        this.secondOperand = operand;
    }

    public setCalculatorOperator(operator: CalculatorOperator) {
        this.operator = operator;
    }

    public computeOutput() {
        if (!this.firstOperand || !this.secondOperand || !this.operator) {
            return;
        }

        switch (this.operator) {
            case '+':
                return this.firstOperand + this.secondOperand;
            case '-':
                return this.firstOperand - this.secondOperand;
            case '*':
                return this.firstOperand * this.secondOperand;
            case '/':
                return this.firstOperand / this.secondOperand;
        }
    }
}
