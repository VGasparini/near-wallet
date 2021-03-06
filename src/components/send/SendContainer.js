import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import Container from '../common/styled/Container.css'
import { Translate } from 'react-localize-redux'
import FormButton from '../common/FormButton'
import ArrowCircleIcon from '../svg/ArrowCircleIcon'
import AccountFormAccountId from '../accounts/AccountFormAccountId'
import { checkAccountAvailable, sendMoney, getBalance } from '../../actions/account'
import { clearLocalAlert } from '../../actions/status'
import BalanceBreakdown from '../staking/components/BalanceBreakdown'
import BN from 'bn.js'
import { utils } from 'near-api-js'
import { WALLET_APP_MIN_AMOUNT } from '../../utils/wallet'
import isDecimalString from '../../utils/isDecimalString'
import SendConfirmModal from './SendConfirmModal'
import Balance from '../common/Balance'
import TransferMoneyIcon from '../svg/TransferMoneyIcon'
import { onKeyDown } from '../../hooks/eventListeners'
import classNames from '../../utils/classNames'

const {
    parseNearAmount, formatNearAmount
} = utils.format

const StyledContainer = styled(Container)`
    &.success {
        svg {
            display: block;
            margin: 50px auto;
        }
        .sub-title {
            span {
                color: #292526;

                &.receiver {
                    line-break: anywhere;
                }
            }
        }
    }
`

export function SendContainer({ match, location }) {
    const dispatch = useDispatch()
    const { accountId, balance } = useSelector(({ account }) => account);
    const { localAlert, mainLoader } = useSelector(({ status }) => status);
    const [useMax, setUseMax] = useState(null)
    const [amount, setAmount] = useState('')
    const [confirm, setConfirm] = useState(null)
    const [id, setId] = useState(match.params.id || '')
    const [success, setSuccess] = useState(null)
    const amountAvailableToSend = balance.available
        ? new BN(balance.available).sub(new BN(parseNearAmount(WALLET_APP_MIN_AMOUNT)))
        : undefined
    const sufficientBalance = balance.available
        ? !new BN(parseNearAmount(amount)).isZero() && (new BN(parseNearAmount(amount)).lte(amountAvailableToSend) || useMax) && isDecimalString(amount)
        : undefined
    const sendAllowed = ((localAlert && localAlert.success !== false) || id.length === 64) && sufficientBalance && amount && !mainLoader && !success

    useEffect(() => {
        if (success) {
            setUseMax(null)
            setAmount('')
            setConfirm(null)
            setId('')
            setSuccess(null)
        }
    }, [location.key])

    useEffect(() => {
        dispatch(getBalance())
    }, [])

    onKeyDown(e => {
        if (e.keyCode === 13 && sendAllowed) {
            if (!confirm) {
                setConfirm(true)
            } else {
                handleSend()
            }
        }
    })

    const handleSetUseMax = () => {
        if (amountAvailableToSend.gt(new BN('0'))) {
            setUseMax(true)
            setAmount(formatNearAmount(amountAvailableToSend, 5).replace(/,/g, ''))
        }
    }

    const handleChangeAmount = (e) => {
        if (!/^\d*[.]?\d*$/.test(e.target.value)) {
            return
        }
        setUseMax(false)
        setAmount(e.target.value)
    }

    const handleConfirm = () => {
        setConfirm(true)
    }

    const handleSend = async () => {
        await dispatch(sendMoney(id, parseNearAmount(amount)))
        await dispatch(getBalance())
        setConfirm(false)
        setSuccess(true)
        window.scrollTo(0, 0)
    }

    if (!success) {
        return (
            <StyledContainer className='small-centered send-theme'>
                <h1><Translate id='sendMoney.title.default' /></h1>
                <div className='sub-title'><Translate id='sendMoney.subtitle.default' /></div>
                <div className='header-button'>
                    <h4><Translate id='staking.stake.amount' /></h4>
                    <FormButton className='light-blue small' onClick={handleSetUseMax}><Translate id='staking.stake.useMax' /></FormButton>
                </div>
                <input
                    disabled={false}
                    type='number'
                    autoFocus
                    placeholder='0'
                    value={amount}
                    onChange={handleChangeAmount}
                    className={classNames(['amount-input', !sufficientBalance ? 'error' : ''])}
                    tabIndex='1'
                />
                <BalanceBreakdown
                    total={balance.available}
                    onClickAvailable={handleSetUseMax}
                    availableType='sendMoney.amount.available'
                    error={!sufficientBalance}
                />
                <ArrowCircleIcon color={sendAllowed ? '#6AD1E3' : ''}/>
                <h4><Translate id='sendMoney.account.title' /></h4>
                <AccountFormAccountId
                    mainLoader={mainLoader || false}
                    handleChange={(e, { value }) => setId(value)}
                    defaultAccountId={id}
                    checkAvailability={() => dispatch(checkAccountAvailable(id))}
                    localAlert={localAlert}
                    autoFocus={false}
                    clearLocalAlert={() => dispatch(clearLocalAlert())}
                    stateAccountId={accountId}
                />
                <FormButton onClick={handleConfirm} disabled={!sendAllowed}>
                    <Translate id='sendMoney.button.send' />
                </FormButton>
                {confirm &&
                    <SendConfirmModal
                        onClose={() => setConfirm(false)}
                        onConfirm={handleSend}
                        loading={mainLoader}
                        receiver={id}
                        amount={amount}
                    />
                }
            </StyledContainer>
        )
    } else {
        return (
            <StyledContainer className='small-centered send-theme success'>
                <TransferMoneyIcon/>
                <h1>Success!</h1>
                <div className='sub-title success'>You have successfully sent <span><Balance amount={utils.format.parseNearAmount(amount) || '0'} symbol='near'/></span> to <span className='receiver'>{id}</span></div>
                <FormButton linkTo='/'>
                    <Translate id='button.goToDashboard' />
                </FormButton>
            </StyledContainer>
        )
    }
}