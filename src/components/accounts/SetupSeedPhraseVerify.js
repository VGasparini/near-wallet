import React from 'react'
import { withRouter } from 'react-router-dom'
import { Responsive, Input } from 'semantic-ui-react'
import { Translate } from 'react-localize-redux'

import LocalAlertBox from '../common/LocalAlertBox'
import FormButton from '../common/FormButton'

import styled from 'styled-components'

const CustomDiv = styled.div`

    input {
        margin-bottom: 30px !important;
    }

    .blue, .input {
        width: 100% !important;
    }

    h4 {
        margin-top: 20px;
    }

    .blue {
        margin-top: 20px !important;
    }

    .start-over {
        padding: 20px 0 0 0;
        color: #24272a;
        border-top: 2px solid #f8f8f8;
        margin-top: 48px;

        button {
            font-size: 16px !important;
            font-weight: 500;
            margin: 0 0 0 6px !important;
        }
    }
`

const SetupSeedPhraseVerify = ({
    enterWord,
    wordId,
    handleChangeWord,
    mainLoader,
    localAlert
}) => (
    <CustomDiv>
        <h4><Translate id='input.enterWord.title' data={{ wordId: wordId + 1 }} /></h4>
        <Translate>
            {({ translate }) => (
                <Input
                    name='enterWord'
                    value={enterWord}
                    onChange={handleChangeWord}
                    placeholder={translate('input.enterWord.placeholder')}
                    required
                    tabIndex='1'
                    pattern='[a-zA-Z ]*'
                    className={localAlert ? (localAlert.success ? 'success' : 'problem') : ''}
                    disabled={mainLoader}
                />
            )}
        </Translate>
        <Responsive as={LocalAlertBox} localAlert={localAlert} />
        <FormButton
            type='submit'
            color='blue'
            disabled={!enterWord || mainLoader}
            sending={mainLoader}
            sendingString='button.verifying'
        >
            <Translate id='button.verify' />
        </FormButton>
    </CustomDiv>
)

export default withRouter(SetupSeedPhraseVerify)
