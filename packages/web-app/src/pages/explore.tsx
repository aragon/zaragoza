import React from 'react';
import styled from 'styled-components';
import {generatePath, useNavigate} from 'react-router-dom';
import {ActionListItem, ButtonText, IconExpand} from '@aragon/ui-components';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import Hero from 'containers/hero';
import {Dashboard} from 'utils/paths';
import Carousel from 'containers/carousel';
import {TemporarySection} from 'components/temporary';
import {DaoExplorer} from 'containers/daoExplorer';
import ActiveProposalsExplore from 'containers/activeProposalsExplore';
import {GridLayout} from 'components/layout';
import {useGlobalModalContext} from 'context/globalModals';
import ManageWalletsModal from 'containers/manageWalletsModal';
import {AccordionMethod} from 'components/accordionMethod';

const Explore: React.FC = () => {
  const navigate = useNavigate();

  // Temporary; for QA-purposes
  const {open} = useGlobalModalContext();

  return (
    <>
      <Hero />
      <GridLayout>
        <ContentWrapper>
          <Carousel />
          <DaoExplorer />
          <ActiveProposalsExplore />
          <div className="h-20" />
          <TemporarySection purpose="It allows you to navigate to a mock dao to test daos URLs.">
            <ActionListItem
              title={'ERC20Voting DAO'}
              subtitle={'Rinkeby Testnet'}
              icon={<IconExpand />}
              background={'white'}
              onClick={() => {
                navigate(
                  generatePath(Dashboard, {
                    network: 'rinkeby',
                    dao: '0x663ac3c648548eb8ccd292b41a8ff829631c846d',
                  })
                );
              }}
            />
            <ActionListItem
              title={'WhiteListVoting DAO'}
              subtitle={'Rinkeby Testnet'}
              icon={<IconExpand />}
              background={'white'}
              onClick={() => {
                navigate(
                  generatePath(Dashboard, {
                    network: 'rinkeby',
                    dao: '0xb2af1aab06a01dd3e4c4f420f91bda89efe15531',
                  })
                );
              }}
            />

            <ActionListItem
              title={'Non-existing dao: 0x1234'}
              subtitle={'Rinkeby testnet'}
              icon={<IconExpand />}
              background={'white'}
              onClick={() =>
                navigate(
                  generatePath(Dashboard, {network: 'rinkeby', dao: '0x1234'})
                )
              }
            />
          </TemporarySection>
          {/* Button and ManageWalletsModal are here for demo purposes only. will be removed before merging */}
          <ButtonText
            label="Open Manage Wallet Modal"
            onClick={() => open('manageWallet')}
            className="mx-auto"
          />
          <ManageWalletsModal
            addWalletCallback={wallets => console.log(wallets)}
            resetOnClose
          />
          <div className="mx-auto max-w-3xl">
            <AccordionMethod
              type="action-builder"
              methodName="Method Name"
              smartContractName="Smart Contract Name"
              verified
              methodDescription="This is the description of the method provided by NatSpec Format or if those are our smart contracts, by further implementation"
            />
          </div>
          <div className="p-2 tablet:py-4 tablet:px-8 mx-auto max-w-4xl bg-white">
            <AccordionMethod
              type="execution-widget"
              methodName="Method Name"
              smartContractName="0x23f3....9382"
              methodDescription="This is the description of the method provided by NatSpec Format or if those are our smart contracts, by further implementation"
            />
          </div>
        </ContentWrapper>
      </GridLayout>
    </>
  );
};

const ContentWrapper = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 space-y-5 desktop:space-y-9 mb-5 desktop:mb-10 pb-5',
})``;

export default Explore;
