/* eslint-disable import/no-extraneous-dependencies */
import { blockchains, screen } from '@emeraldwallet/store';
import { ipcRenderer } from 'electron';
import { startProtocolListener } from './protocol';

import { Api, getConnector } from '../lib/rpc/api';
import { intervalRates } from './config';
import history from './wallet/history';
import accounts from './vault/accounts';
import network from './network';
import settings from './wallet/settings';
import tokens from './vault/tokens';
import ledger from './ledger';
import Addressbook from './vault/addressbook';
import { addresses } from '.';

import {
  readConfig,
  listenElectron,
  connecting
} from './launcher/launcherActions';
// import { showError } from './wallet/screen/screenActions';

import getWalletVersion from '../utils/get-wallet-version';
import createLogger from '../utils/logger';
import { createStore } from './createStore';

import {
  onceServicesStart,
  onceAccountsLoaded,
  onceHasAccountsWithBalances,
  onceChainSet
} from './triggers';

import {blockchains as supported} from '../config';

const log = createLogger('store');

const api = new Api(getConnector(), supported);

export const store = createStore(api);

function refreshAll() {
  const promises = [
    // store.dispatch(accounts.actions.loadPendingTransactions()), // TODO: Fix it
    store.dispatch(accounts.actions.loadAccountsList()),
  ];

  // Main loop that will refresh UI as needed
  setTimeout(refreshAll, intervalRates.continueRefreshAllTxRate);

  return Promise.all(promises);
}

export function startSync() {
  const state = store.getState();

  const chain = state.launcher.getIn(['chain', 'name']);
  const chainId = state.launcher.getIn(['chain', 'id']);

  store.dispatch(settings.actions.listenPrices());

  const promises = [
    store.dispatch(Addressbook.actions.loadAddressBook()),
    store.dispatch(history.actions.init(chainId)),
    store.dispatch(tokens.actions.loadTokenList()),
    store.dispatch(tokens.actions.addDefault(chainId)),
    store.dispatch(history.actions.refreshTrackedTransactions()),
  ];

  // request gas price for each chain
  supported.forEach((code) => promises.push(store.dispatch(blockchains.actions.fetchGasPriceAction(code))));

  if (chain === 'mainnet') {
    promises.push(
      store.dispatch(ledger.actions.setBaseHD("m/44'/60'/160720'/0'"))
    );
  } else if (chain === 'morden') {
    // FIXME ledger throws "Invalid status 6804" for 44'/62'/0'/0
    promises.push(store.dispatch(ledger.actions.setBaseHD("m/44'/61'/1'/0")));
  }

  promises.push(
    refreshAll()
      .then(() => store.dispatch(connecting(false)))
      .catch((err) => {
        log.error('Failed to do initial sync', err);
        store.dispatch(screen.actions.showError(err));
      })
  );

  return Promise.all(promises);
}

export function stopSync() {
  // TODO
}

function newWalletVersionCheck() {
  getWalletVersion().then((versionDetails) => {
    if (!versionDetails.isLatest) {
      const params = [
        `A new version of Emerald Wallet is available (${versionDetails.tag}).`,
        'info',
        20 * 1000,
        'Update',
        screen.actions.openLink(versionDetails.downloadLink),
      ];

      store.dispatch(screen.actions.showNotification(...params));
    }
  });
}

export function electronToStore() {
  return (dispatch) => {
    log.debug('Running launcher listener for Redux');
    ipcRenderer.on('store', (event, action) => {
      log.debug(`Got from IPC event: ${event} action: ${JSON.stringify(action)}`);
      dispatch(action);
    });
  };
}

export const start = () => {
  try {
    store.dispatch(readConfig());
    store.dispatch(settings.actions.loadSettings());
  } catch (e) {
    log.error(e);
  }
  store.dispatch(listenElectron());
  store.dispatch(electronToStore());
  getInitialScreen();
  newWalletVersionCheck();
};

function checkStatus() {
  function checkServiceStatus() {
    // hack to make some stuff work in storybook: @shanejonas
    if (!ipcRenderer) {
      return;
    }
    ipcRenderer.send('get-status');
  }

  setTimeout(checkServiceStatus, 2000);
}

export function screenHandlers() {
  let prevScreen = null;
  store.subscribe(() => {
    const state = store.getState();
    const curScreen = screen.selectors.getCurrentScreen(state);
    const justOpened = prevScreen !== curScreen;
    prevScreen = curScreen;
    if (justOpened) {
      // TODO: Fix it
      // if (
      //   curScreen === 'create-tx'
      //   || curScreen === 'add-from-ledger'
      //   || curScreen === 'landing-add-from-ledger'
      // ) {
      //   store.dispatch(ledger.actions.setWatch(true));
      //   store.dispatch(ledger.actions.watchConnection());
      // } else {
      //   store.dispatch(ledger.actions.setWatch(false));
      // }
    }
  });
}

startProtocolListener(store);

function getInitialScreen() {
  // First things first, always go to welcome screen. This shows a nice spinner
  store.dispatch(screen.actions.gotoScreen('welcome'));

  if (store.getState().launcher.get('firstRun') === true) {
    return; // stay on the welcome screen.
  }

  return onceAccountsLoaded(store).then(() => {
    const accountSize = addresses.selectors.all(store.getState()).size;

    if (accountSize === 0) {
      return store.dispatch(screen.actions.gotoScreen('landing'));
    }

    return onceHasAccountsWithBalances(store).then(() => {
      return store.dispatch(screen.actions.gotoScreen('home'));
    });
  });
}

Promise
  .all([onceServicesStart(store)])
  .then(startSync);
checkStatus();
screenHandlers();
