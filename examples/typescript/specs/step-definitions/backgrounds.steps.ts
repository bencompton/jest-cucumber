import { loadFeature, defineFeature, DefineStepFunction } from '../../../../src';
import { ArcadeMachine, COIN_TYPES, CoinStatus } from '../../src/arcade-machine';

const feature = loadFeature('./examples/typescript/specs/features/backgrounds.feature');

defineFeature(feature, test => {
  let arcadeMachine: ArcadeMachine;

  beforeEach(() => {
    arcadeMachine = new ArcadeMachine();
  });

  const givenMyMachineIsConfiguredToRequireCoins = (given: DefineStepFunction) => {
    given('my machine is configured to require coins', () => {
      arcadeMachine.requireCoins = true;
    });
  };

  const givenMyMachineIsConfiguredToAcceptUsQuarters = (given: DefineStepFunction) => {
    given('my machine is configured to accept US Quarters', () => {
      arcadeMachine.acceptedCoinType = COIN_TYPES.USQuarter;
    });
  };

  test('Successfully inserting coins', ({ given, when, then }) => {
    givenMyMachineIsConfiguredToRequireCoins(given);

    given('I have not inserted any coins', () => {
      arcadeMachine.balance = 0;
    });

    when('I insert one US quarter', () => {
      arcadeMachine.insertCoin(COIN_TYPES.USQuarter);
    });

    then(/^I should have a balance of (\d+) cents$/, balance => {
      arcadeMachine.balance = balance / 100;
    });
  });

  test('Inserting a Canadian coin', ({ given, when, then }) => {
    let coinStatus: CoinStatus;

    givenMyMachineIsConfiguredToRequireCoins(given);

    givenMyMachineIsConfiguredToAcceptUsQuarters(given);

    when('I insert a Canadian Quarter', () => {
      coinStatus = arcadeMachine.insertCoin(COIN_TYPES.CanadianQuarter);
    });

    then('my coin should be returned', () => {
      expect(coinStatus).toBe<CoinStatus>('CoinReturned');
    });
  });

  test('Inserting a badly damaged coin', ({ given, when, then }) => {
    let coinStatus: CoinStatus;

    givenMyMachineIsConfiguredToRequireCoins(given);

    givenMyMachineIsConfiguredToAcceptUsQuarters(given);

    when('I insert a US Quarter that is badly damaged', () => {
      coinStatus = arcadeMachine.insertCoin(COIN_TYPES.Unknown);
    });

    then('my coin should be returned', () => {
      expect(coinStatus).toBe<CoinStatus>('CoinReturned');
    });
  });
});
