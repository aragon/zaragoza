import React from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {
  AvatarDao,
  Badge,
  ButtonText,
  IconGovernance,
  Link,
  ListItemLink,
} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';

import {PageWrapper} from 'components/wrappers';
import {DescriptionListContainer, Dl, Dt, Dd} from 'components/descriptionList';
import {useGlobalModalContext} from 'context/globalModals';

const Settings: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();

  return (
    <PageWrapper title={'DAO Settings'}>
      <div className="mt-3 desktop:mt-8 space-y-5">
        <DescriptionListContainer title={t('labels.review.blockchain')}>
          <Dl>
            <Dt>{t('labels.review.network')}</Dt>
            <Dd>{t('createDAO.review.network', {network: 'Main'})}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.blockchain')}</Dt>
            <Dd>Arbitrum</Dd>
          </Dl>
        </DescriptionListContainer>

        <DescriptionListContainer title={t('labels.review.daoMetadata')}>
          <Dl>
            <Dt>{t('labels.logo')}</Dt>
            <Dd>
              <AvatarDao daoName="Aragon" />
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.daoName')}</Dt>
            <Dd>Aragon DAO</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.description')}</Dt>
            <Dd>
              This is a short description of your DAO, so please look that
              it&apos;s not that long as wished. 👀
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.links')}</Dt>
            <Dd>
              <div className="space-y-1.5">
                <ListItemLink label="Forum" href="https://forum.aragon.org" />
                <ListItemLink label="Discord" href="https://discord.com" />
              </div>
            </Dd>
          </Dl>
        </DescriptionListContainer>

        <DescriptionListContainer title={t('labels.review.community')}>
          <Dl>
            <Dt>{t('labels.review.eligibleMembers')}</Dt>
            <Dd>Token Holders</Dd>
          </Dl>
          <Dl>
            <Dt>{t('votingTerminal.token')}</Dt>
            <Dd>
              <div className="flex items-center space-x-1.5">
                <p>Token Name</p>
                <p>TKN</p>
                <Badge label="New" colorScheme="info" />
              </div>
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.supply')}</Dt>
            <Dd>
              <div className="flex items-center space-x-1.5">
                <p>1,000 TKN</p>
                <Badge label="Mintable" />
              </div>
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.distribution')}</Dt>
            <Dd>
              <Link
                label={t('createDAO.review.distributionLink', {
                  count: 10,
                })}
                onClick={() => open('addresses')}
              />
            </Dd>
          </Dl>
        </DescriptionListContainer>

        <DescriptionListContainer title={t('labels.review.governance')}>
          <Dl>
            <Dt>{t('labels.minimumApproval')}</Dt>
            <Dd>15% (150 TKN)</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumSupport')}</Dt>
            <Dd>50%</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumDuration')}</Dt>
            <Dd>5 Days 12 Hours 30 Minutes</Dd>
          </Dl>
        </DescriptionListContainer>

        <ButtonText
          label={t('labels.newSettings')}
          className="mx-auto"
          size="large"
          iconLeft={<IconGovernance />}
          // onClick={() => navigate(CreateDAO)}
        />
      </div>
    </PageWrapper>
  );
};

export default withTransaction('Settings', 'component')(Settings);
