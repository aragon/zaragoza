import {
  AvatarDao,
  ButtonIcon,
  ButtonText,
  ButtonWallet,
  IconMenu,
  IconMenuVertical,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useMemo, useState} from 'react';

import useScreen from 'hooks/useScreen';
import MobileMenu from './mobileMenu';
import {useWallet} from 'context/augmentedWallet';
import {useWalletProps} from 'containers/walletMenu';
import NetworkIndicator from './networkIndicator';
import {NetworkIndicatorStatus} from 'utils/types';

type MobileNavProps = {
  status?: NetworkIndicatorStatus;
  returnURL?: string;
  processLabel?: string;
  onWalletClick: () => void;
};

const MobileNav: React.FC<MobileNavProps> = props => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {isConnected, account, ensName, ensAvatarUrl}: useWalletProps =
    useWallet();

  const isProcess = useMemo(
    () => props.returnURL && props.processLabel,
    [props.processLabel, props.returnURL]
  );

  if (isProcess) {
    return (
      <ProcessMenuItems>
        <div>Add Process Breadcrumb</div>
        <ButtonIcon mode="secondary" size="large" icon={<IconMenuVertical />} />
      </ProcessMenuItems>
    );
  }
  return (
    <>
      <Container>
        <Menu>
          <FlexOne>
            {isMobile ? (
              <ButtonIcon
                mode="secondary"
                size="large"
                icon={<IconMenu />}
                onClick={() => setIsOpen(true)}
              />
            ) : (
              <ButtonText
                size="large"
                mode="secondary"
                label={t('menu')}
                iconLeft={<IconMenu />}
                onClick={() => setIsOpen(true)}
              />
            )}
          </FlexOne>
          <FlexOne className="justify-center">
            <AvatarDao
              src="https://banner2.cleanpng.com/20180325/sxw/kisspng-computer-icons-avatar-avatar-5ab7529a8e4e14.9936310115219636745829.jpg"
              label="DAO Name"
              contentMode={isMobile ? 'none' : 'below'}
            />
          </FlexOne>
          <FlexOne className="justify-end">
            <ButtonWallet
              src={ensAvatarUrl || account}
              onClick={props.onWalletClick}
              isConnected={isConnected()}
              label={
                isConnected()
                  ? ensName || account
                  : t('navButtons.connectWallet')
              }
            />
          </FlexOne>
        </Menu>
        <NetworkIndicator status={props.status} />
      </Container>
      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default MobileNav;

const FlexOne = styled.div.attrs({
  className: 'flex flex-1' as string | undefined,
})``;

const Container = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-col-reverse fixed tablet:sticky bottom-0 tablet:top-0 w-full',
})``;

const Menu = styled.nav.attrs({
  className: `flex justify-between items-center px-2 tablet:px-3 py-1 
     tablet:py-1.5 bg-gradient-to-t tablet:bg-gradient-to-b from-ui-50 to-transparent backdrop-blur-xl`,
})``;

const ProcessMenuItems = styled.nav.attrs({
  className: 'flex justify-between items-center px-2 pt-2 bg-ui-0',
})``;
