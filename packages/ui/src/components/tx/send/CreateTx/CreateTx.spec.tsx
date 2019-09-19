import { Units, Wei } from '@emeraldplatform/eth';
import { CreateEthereumTx } from '@emeraldwallet/workflow';
import BigNumber from 'bignumber.js';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import CreateTx from './CreateTx';

describe('CreateTx', () => {
  it('it renders without crash', () => {
    const tx = new CreateEthereumTx();
    tx.amount = new Wei(1, Units.ETHER);
    tx.totalBalance = new Wei(5, Units.ETHER);
    tx.gas = new BigNumber(100000);
    tx.gasPrice = new Wei(0.0001, Units.ETHER);

    const wrapper = shallow(
      <CreateTx
        token='ETH'
        tx={tx}
        txFeeToken='ETH'
      />);
    expect(wrapper).toBeDefined();

    const mounted = mount(<CreateTx
      token='ETH'
      tx={tx}
      txFeeToken='ETH'
    />);
    expect(mounted).toBeDefined();
  });
});
