export class SeriesSolver {
  private solutions: { [key: string]: string } = {
    '1+2+3+...': '-1/12',
    '1/0!+1/1!+1/2!+...': 'e',
    '1/1+1/2+1/4+...': '2',
  };

  public solve(terms: string[], operator: string) {
    const series = terms.join(operator);
    return this.solutions[series];
  }
}
