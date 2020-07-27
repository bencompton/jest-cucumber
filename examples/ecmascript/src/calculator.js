export class Calculator {
    setFirstOperand(operand) {
        this.firstOperand = operand;
    }

    setSecondOperand(operand) {
        this.secondOperand = operand;
    }

    setCalculatorOperator(operator) {
        this.operator = operator;
    }

    computeOutput() {
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
