import {gql} from 'graphql-request';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from '../query-keys';
import type {IFetchCreatorProposalsParams} from '../aragon-sdk-service.api';
import {MultisigProposal, TokenVotingProposal} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';
import {useNetwork} from 'context/network';
import {ProposalBase} from '@aragon/sdk-client-common';
import {PluginClient, usePluginClient} from 'hooks/usePluginClient';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';

type Proposal = MultisigProposal | TokenVotingProposal | GaslessVotingProposal;

export const tokenVotingProposalsQuery = gql`
  query TokenVotingProposals(
    $where: TokenVotingProposal_filter!
    $block: Block_height
  ) {
    tokenVotingProposals(where: $where, block: $block) {
      id
    }
  }
`;

export const multisigProposalsQuery = gql`
  query MultisigProposals(
    $where: MultisigProposal_filter!
    $block: Block_height
  ) {
    multisigProposals(where: $where, block: $block) {
      id
    }
  }
`;

const fetchCreatorProposals = async (
  {
    pluginAddress,
    address,
    pluginType,
    blockNumber,
  }: IFetchCreatorProposalsParams,
  client?: PluginClient
): Promise<Proposal[]> => {
  invariant(client != null, 'fetchCreatorProposals: client is not defined');

  const params = {
    where: {
      plugin: pluginAddress.toLowerCase(),
      creator: address.toLowerCase(),
    },
    block: blockNumber ? {number: blockNumber} : null,
  };

  type TResult = {
    tokenVotingProposals?: Array<{id: string}>;
    multisigProposals?: Array<{id: string}>;
  };

  const executedQuery =
    pluginType === 'multisig.plugin.dao.eth'
      ? multisigProposalsQuery
      : tokenVotingProposalsQuery;

  const response = await client.graphql.request<TResult>({
    query: executedQuery,
    params,
  });

  const resultProposalsIds =
    (pluginType === 'multisig.plugin.dao.eth'
      ? response.multisigProposals
      : response.tokenVotingProposals) || [];

  const proposalQueriesPromises = resultProposalsIds.map(
    item => client?.methods.getProposal(item.id)
  );

  const resultsProposals = await Promise.all(proposalQueriesPromises);

  return resultsProposals.filter(item => !!item) as Proposal[];
};

export const useCreatorProposals = (
  params: IFetchCreatorProposalsParams,
  options: UseQueryOptions<ProposalBase[]> = {}
) => {
  const client = usePluginClient(params.pluginType);
  const {network} = useNetwork();

  const baseParams = {
    network: network,
  };

  if (!client || !params.pluginType) {
    options.enabled = false;
  }

  return useQuery(
    aragonSdkQueryKeys.getCreatorProposals(baseParams, params),
    () => fetchCreatorProposals(params, client),
    options
  );
};
