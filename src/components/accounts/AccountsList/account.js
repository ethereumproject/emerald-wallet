import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CardText } from 'material-ui/Card';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import log from 'electron-log';

import AddressAvatar from '../../../elements/addressAvatar';
import { gotoScreen } from 'store/screenActions';

import { Wei } from 'lib/types';
import IdentityIcon from 'elements/IdentityIcon';
import Card from 'elements/Card';
import Button from 'elements/Button';
import SecondaryMenu from '../SecondaryMenu';
import AccountPopup from '../popup';
import AccountBalance from '../AccountBalance';

const Render = ({ account, openAccount, createTx }) => {
    const balance = account.get('balance');
    const isHardware = (acc) => acc.get('hardware', false);

    return (
    <Card>
        <CardText>
            <Row>
                <Col xs={3}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <IdentityIcon id={account.get('id')}/>
                        <div style={{marginLeft: '10px'}}>
                            {balance && <AccountBalance balance={account.get('balance')} /> }
                            {!balance && 'loading...'}
                        </div>
                    </div>
                </Col>
                <Col xs={6}>
                    <AddressAvatar
                        addr={account.get('id')}
                        tertiary={account.get('description')}
                        primary={account.get('name')}
                        onAddressClick={openAccount}
                    />
                </Col>
                <Col xs={3}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        { !isHardware(account) && <SecondaryMenu account={account} /> }

                        <AccountPopup account={account}/>
                        <Button
                            style={ {marginLeft: '10px'} }
                            label="Send"
                            onClick={ createTx }
                        />
                    </div>
                </Col>
            </Row>
        </CardText>
    </Card>);
};

Render.propTypes = {
    account: PropTypes.object.isRequired,
    openAccount: PropTypes.func.isRequired,
    createTx: PropTypes.func,
};

const Account = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        createTx: () => {
            const account = ownProps.account;
            dispatch(gotoScreen('create-tx', account));
        },
        openAccount: () => {
            const account = ownProps.account;
            log.debug('open', account.get('id'));
            dispatch(gotoScreen('account', account));
        },
    })
)(Render);


export default Account;
