import React from 'react';
import {connect} from 'react-redux';
import {AppBar, Toolbar} from '@material-ui/core';
import {withStyles} from '@material-ui/styles';
import {Button, Status} from '@emeraldwallet/ui';
import {Settings as SettingsIcon} from '@emeraldplatform/ui-icons';
import { blockchains } from '@emeraldwallet/store';
import SyncWarning from '../../../containers/SyncWarning';
import Total from './Total';
import EmeraldTitle from './Title';

const styles = (theme) => ({
  appBarRight: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'inherit',
  },
  buttons: {
    label: {
      textTransform: 'none',
      fontWeight: 'normal',
      fontSize: '16px',
    },
  },
  appBarRoot: {
    backgroundColor: theme.palette.primary.contrastText,
  },
});

const Header = (props) => {
  const {
    openSettings, theme, network, showFiat,
  } = props;

  const blockDisplayStyles = {
    text: {
      textTransform: 'none',
      fontWeight: 'normal',
      fontSize: '16px',
    },
  };

  const SettingsButton = ({classes}) => (
    <Button
      variant="text"
      onClick={openSettings}
      label="Settings"
      classes={{
        text: classes.text,
      }}
      icon={<SettingsIcon/>}
    />);

  const StyledSettingsButton = withStyles(blockDisplayStyles)(SettingsButton);

  return (
    <div>
      <div className={props.classes.appBarRoot}>
        <AppBar position="static" color="inherit">
          <Toolbar>
            <EmeraldTitle />
            <div className={props.classes.appBarRight}>
              <Total showFiat={showFiat}/>
              <Status blockchains={props.chains}/>
              <StyledSettingsButton/>
            </div>
          </Toolbar>
        </AppBar>
      </div>
      <SyncWarning/>
    </div>
  );
};

const StyledHeader = withStyles(styles)(Header);

const mapStateToProps = (state, ownProps) => {
  const chains = [];
  const curr = blockchains.selectors.all(state);
  for (const code of curr.keys()) {
    chains.push({
      id: code,
      title: code,
      height: curr.get(code).height,
    });
  }
  return {
    chains,
  };
};

export default connect(mapStateToProps, null)(StyledHeader);
