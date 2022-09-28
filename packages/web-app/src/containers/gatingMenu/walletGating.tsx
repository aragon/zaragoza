import React from 'react';
import {ButtonText} from '@aragon/ui-components';
import {useGlobalModalContext} from 'context/globalModals';
import styled from 'styled-components';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useTranslation} from 'react-i18next';
import WalletIcon from 'public/wallet.svg';
import {
  ModalBody,
  StyledImage,
  WarningContainer,
  WarningTitle,
} from 'containers/networkErrorMenu';

export const WalletGating = () => {
  const {close, isRequiredWalletOpen} = useGlobalModalContext();
  const {t} = useTranslation();

  return (
    <ModalBottomSheetSwitcher
      isOpen={isRequiredWalletOpen}
      onClose={() => close('requiredWallet')}
    >
      <ModalBody>
        <StyledImage src={WalletIcon} />
        <WarningContainer>
          <WarningTitle>{t('alert.gatingUsers.walletTitle')}</WarningTitle>
          <WarningDescription>
            {t('alert.gatingUsers.walletDescription')}
          </WarningDescription>
        </WarningContainer>
        <ButtonText
          label={t('alert.gatingUsers.buttonLabel')}
          onClick={() => close('requiredWallet')}
          size="large"
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const WarningDescription = styled.p.attrs({
  className: 'text-base text-ui-500 text-center',
})``;
