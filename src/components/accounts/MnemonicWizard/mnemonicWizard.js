import React from 'react';
import { connect } from 'react-redux';
import screen from 'store/wallet/screen';
import accounts from 'store/vault/accounts';

import ImportMnemonic from '../add/ImportMnemonic';

import NewMnemonic from './NewMnemonic';

const PAGES = {
  GENERATE: 1,
  IMPORT: 2,
};

class MnemonicWizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: PAGES.GENERATE,
    };
  }

  generate = () => {
    if (this.props.generateMnemonic) {
      this.props.generateMnemonic().then((mnemonic) => {
        this.setState({
          mnemonic,
        });
      });
    }
  };

  gotoImport = () => {
    this.setState({
      page: PAGES.IMPORT,
    });
  }

  gotoGenerate = () => {
    this.setState({
      page: PAGES.GENERATE,
    });
  }

  render() {
    const { gotoDashboard } = this.props;
    const { page, mnemonic } = this.state;

    switch (page) {
      case PAGES.GENERATE:
        return (
          <NewMnemonic
            mnemonic={ mnemonic }
            onBack={ gotoDashboard }
            onGenerate={ this.generate }
            onContinue={ this.gotoImport }
          />
        );

      case PAGES.IMPORT:
        return (
          <ImportMnemonic
            mnemonic={ mnemonic }
            onBack={ this.gotoGenerate }
            backLabel="Back"
          />
        );

      default: return null;
    }
  }
}


export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({

    generateMnemonic: () => {
      return dispatch(accounts.actions.generateMnemonic());
    },
    gotoDashboard: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },

  })
)(MnemonicWizard);

