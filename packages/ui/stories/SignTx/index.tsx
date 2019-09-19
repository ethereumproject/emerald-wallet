import { Wei } from '@emeraldplatform/eth';
import { CreateEthereumTx, TxTarget } from '@emeraldwallet/workflow';
import { storiesOf } from '@storybook/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import SignTx from '../../src/components/tx/send/SignTx';

const tx = {
  from: '0x123',
  to: '0x456,',
  token: 'ETH',
  amount: new Wei('10000'),
  gasLimit: '2100',
  gasPrice: new Wei('100'),
  target: TxTarget.MANUAL,
  gas: new BigNumber(100)
};

storiesOf('SignTx', module)
  .add('default', () => (
    <SignTx
      tx={new CreateEthereumTx(tx)}
    />));
