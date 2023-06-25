import {
  ButtonText,
  IconReload,
  IconSpinner,
  Label,
  WalletInputLegacy,
} from '@aragon/ui-components';
import React, {useCallback, useMemo, useState} from 'react';
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import useScreen from 'hooks/useScreen';
import {handleClipboardActions} from 'utils/library';
import {useAlertContext} from 'context/alert';
import {TransactionState as ConnectionState} from 'utils/constants/misc';

type Props = {
  onBackButtonClicked: () => void;
  onClose: () => void;
  isOpen: boolean;
};

// Wallet connect id input name
export const WC_ID_INPUT_NAME = 'wcID';

const WCdAppValidation: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop} = useScreen();

  const [connectionStatus] = useState<ConnectionState>(ConnectionState.WAITING);

  const {control} = useFormContext();
  const {errors} = useFormState({control});
  const [wcId] = useWatch({name: [WC_ID_INPUT_NAME], control});

  const ctaLabel = useMemo(() => {
    switch (connectionStatus) {
      case ConnectionState.LOADING:
        return t('wc.validation.ctaLabel.verifying');
      case ConnectionState.ERROR:
        return t('Retry');
      case ConnectionState.SUCCESS:
        return t('Start adding actions');
      case ConnectionState.WAITING:
      default:
        return t('Connect dApp');
    }
  }, [t, connectionStatus]);

  const adornmentText = useMemo(() => {
    if (
      connectionStatus === ConnectionState.SUCCESS ||
      connectionStatus === ConnectionState.LOADING
    )
      return t('labels.copy');

    if (wcId) return t('labels.clear');

    return t('labels.paste');
  }, [connectionStatus, t, wcId]);

  const disableCta = !wcId || Boolean(errors[WC_ID_INPUT_NAME]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  // clear field when there is a value, else paste
  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // when there is a value clear it save for when attempting
      // to connect and successfully connected
      if (
        value &&
        connectionStatus !== ConnectionState.SUCCESS &&
        connectionStatus !== ConnectionState.LOADING
      ) {
        onChange('');
        alert(t('alert.chip.inputCleared'));
      } else handleClipboardActions(value, onChange, alert);
    },
    [alert, connectionStatus, t]
  );

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader
        title={t('wc.validation.modalTitle')}
        showBackButton
        onBackButtonClicked={props.onBackButtonClicked}
        {...(isDesktop ? {showCloseButton: true, onClose: props.onClose} : {})}
      />
      <Content>
        <FormGroup>
          <Label
            label={t('wc.validation.codeInputLabel')}
            helpText={t('wc.validation.codeInputHelp')}
          />
          <Controller
            name={WC_ID_INPUT_NAME}
            control={control}
            defaultValue=""
            render={({
              field: {name, onBlur, onChange, value},
              fieldState: {error},
            }) => (
              <>
                <WalletInputLegacy
                  mode={error ? 'critical' : 'default'}
                  name={name}
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value}
                  placeholder="wc:…"
                  adornmentText={adornmentText}
                  onAdornmentClick={() => handleAdornmentClick(value, onChange)}
                />
              </>
            )}
          />
        </FormGroup>
        <ButtonText
          size="large"
          label={ctaLabel}
          disabled={disableCta}
          className="w-full"
          {...(connectionStatus === ConnectionState.LOADING && {
            iconLeft: <IconSpinner />,
            isActive: true,
          })}
          {...(connectionStatus === ConnectionState.ERROR && {
            iconLeft: <IconReload />,
          })}
        />
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default WCdAppValidation;

const Content = styled.div.attrs({
  className: 'py-3 px-2 desktop:px-3 space-y-3',
})``;

const FormGroup = styled.div.attrs({className: 'space-y-1.5'})``;
