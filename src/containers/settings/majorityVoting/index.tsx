import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import {
  MajorityVotingSettings as VotingSettings,
  VotingMode,
} from '@aragon/sdk-client';
import {Link, Tag} from '@aragon/ods';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes} from 'hooks/usePluginClient';
import {useVotingSettings} from 'hooks/usePluginSettings';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {getDHMFromSeconds} from 'utils/date';
import {formatUnits} from 'utils/library';
import {Community} from 'utils/paths';
import {IPluginSettings} from 'pages/settings';
import {useExistingToken} from 'hooks/useExistingToken';

const MajorityVotingSettings: React.FC<IPluginSettings> = ({daoDetails}) => {
  const {t} = useTranslation();
  const {network} = useNetwork(); // TODO get the network from daoDetails
  const navigate = useNavigate();

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {data: votingSettings} = useVotingSettings({pluginAddress, pluginType});
  const {data: daoMembers} = useDaoMembers(pluginAddress, pluginType);
  const {data: daoToken} = useDaoToken(pluginAddress);

  const {isTokenMintable} = useExistingToken({daoToken, daoDetails});
  const {data: tokenSupply} = useTokenSupply(daoToken?.address ?? '');

  const daoVotingSettings = votingSettings as VotingSettings;

  const {days, hours, minutes} = getDHMFromSeconds(
    daoVotingSettings.minDuration
  );

  const votingMode = {
    // Note: This implies that earlyExecution and voteReplacement may never be
    // both true at the same time, as they shouldn't.
    earlyExecution:
      daoVotingSettings?.votingMode === VotingMode.EARLY_EXECUTION
        ? t('labels.yes')
        : t('labels.no'),
    voteReplacement:
      daoVotingSettings?.votingMode === VotingMode.VOTE_REPLACEMENT
        ? t('labels.yes')
        : t('labels.no'),
  };

  return (
    <div className="space-y-5">
      {/* COMMUNITY SECTION */}
      <DescriptionListContainer title={t('navLinks.community')}>
        <Dl>
          <Dt>{t('labels.review.eligibleVoters')}</Dt>
          <Dd>{t('createDAO.step3.tokenMembership')}</Dd>
        </Dl>

        <Dl>
          <Dt>{t('votingTerminal.token')}</Dt>
          <Dd>
            <div className="flex items-center space-x-1.5">
              <p>{daoToken?.name}</p>
              <p>{daoToken?.symbol}</p>
            </div>
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.supply')}</Dt>
          <Dd>
            <div className="flex items-center space-x-1.5">
              <p>
                {tokenSupply?.formatted} {daoToken?.symbol}
              </p>
              {isTokenMintable && <Tag label={t('labels.mintable')} />}
            </div>
          </Dd>
        </Dl>

        <Dl>
          <Dt>{t('labels.review.distribution')}</Dt>
          <Dd>
            <Link
              label={t('createDAO.review.distributionLink', {
                count: daoMembers?.members.length,
              })}
              onClick={() =>
                navigate(
                  generatePath(Community, {network, dao: daoDetails?.address})
                )
              }
            />
          </Dd>
        </Dl>
      </DescriptionListContainer>

      {/* GOVERNANCE SECTION */}
      <DescriptionListContainer title={t('labels.review.governance')}>
        <Dl>
          <Dt>{t('labels.minimumApprovalThreshold')}</Dt>
          <Dd>
            {'>'}
            {Math.round(daoVotingSettings?.supportThreshold * 100)}%
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumParticipation')}</Dt>

          <Dd>
            {'≥'}
            {Math.round(daoVotingSettings?.minParticipation * 100)}% ({'≥'}
            {daoVotingSettings?.minParticipation *
              (tokenSupply?.formatted || 0)}{' '}
            {daoToken?.symbol})
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumDuration')}</Dt>
          <Dd>
            {t('governance.settings.preview', {
              days,
              hours,
              minutes,
            })}
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.review.earlyExecution')}</Dt>
          <Dd>{votingMode.earlyExecution}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.review.voteReplacement')}</Dt>
          <Dd>{votingMode.voteReplacement}</Dd>
        </Dl>

        <Dl>
          <Dt>{t('labels.review.proposalThreshold')}</Dt>
          <Dd>
            {t('labels.review.tokenHoldersWithTkns', {
              tokenAmount: formatUnits(
                daoVotingSettings?.minProposerVotingPower || 0,
                daoToken?.decimals || 18
              ),
              tokenSymbol: daoToken?.symbol,
            })}
          </Dd>
        </Dl>
      </DescriptionListContainer>
    </div>
  );
};

export default MajorityVotingSettings;
