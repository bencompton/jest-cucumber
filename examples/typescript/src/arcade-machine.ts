export type IssuingNation = 'USA' | 'Canada' | 'Unknown';

export type CoinStatus = 'CoinAccepted' | 'CoinReturned';

export type CoinType = {
  value: number;
  issuingNation: IssuingNation;
};

export const COIN_TYPES: { [coinName: string]: CoinType } = {
  USQuarter: { value: 0.25, issuingNation: 'USA' },
  CanadianQuarter: { value: 0.25, issuingNation: 'Canada' },
  Unknown: { value: 0, issuingNation: 'Unknown' },
};

export class ArcadeMachine {
  public acceptedCoinType: CoinType | null = null;

  public balance: number = 0;

  public requireCoins = true;

  public insertCoin(coinType: CoinType): CoinStatus {
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
