export const COIN_TYPES = {
  USQuarter: { value: 0.25, issuingNation: 'USA' },
  CanadianQuarter: { value: 0.25, issuingNation: 'Canada' },
  Unknown: { value: 0, issuingNation: 'Unknown' },
};

export class ArcadeMachine {
  constructor() {
    this.acceptedCoinType = null;
    this.balance = 0;
    this.requireCoins = true;
  }

  insertCoin(coinType) {
    if (!this.requireCoins) {
      return 'CoinReturned';
    }

    if (coinType === this.acceptedCoinType) {
      this.balance += coinType.value;

      return 'CoinAccepted';
    }
    return 'CoinReturned';
  }
}
