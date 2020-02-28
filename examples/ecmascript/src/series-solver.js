export class SeriesSolver {
  constructor() {
    this.solutions = {
      '1+2+3+...': '-1/12',
      '1/0!+1/1!+1/2!+...': 'e',
      '1+1/2+1/4+...': '2',
    };
  }

  solve(terms, operator) {
    const series = terms.join(operator);
    return this.solutions[series];
  }

  add(terms, operator, solution) {
    const series = terms.join(operator);
    this.solutions[series] = solution;
  }
}
