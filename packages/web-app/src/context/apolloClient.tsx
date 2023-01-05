import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  makeVar,
  NormalizedCacheObject,
} from '@apollo/client';
import {
  AddressListProposal,
  DaoListItem,
  Deposit,
  Erc20Proposal,
  ICreateParams,
  IMetadata,
} from '@aragon/sdk-client';
import {RestLink} from 'apollo-link-rest';
import {CachePersistor, LocalStorageWrapper} from 'apollo3-cache-persist';

import {
  BASE_URL,
  FAVORITE_DAOS_KEY,
  PENDING_DAOS_KEY,
  PENDING_DEPOSITS_KEY,
  PENDING_PROPOSALS_KEY,
  PENDING_VOTES_KEY,
  SUBGRAPH_API_URL,
  SupportedNetworks,
} from 'utils/constants';
import {customJSONReviver} from 'utils/library';
import {AddressListVote, Erc20ProposalVote} from 'utils/types';
import {PRIVACY_KEY} from './privacyContext';

const restLink = new RestLink({
  uri: BASE_URL,
});

const cache = new InMemoryCache();

// add the REST API's typename you want to persist here
const entitiesToPersist = ['tokenData'];

// check if cache should be persisted or restored based on user preferences
const value = localStorage.getItem(PRIVACY_KEY);
if (value && JSON.parse(value).functional) {
  const persistor = new CachePersistor({
    cache,
    // TODO: Check and update the size needed for the cache
    maxSize: 5242880, // 5 MiB
    storage: new LocalStorageWrapper(window.localStorage),
    debug: process.env.NODE_ENV === 'development',
    persistenceMapper: async (data: string) => {
      const parsed = JSON.parse(data);

      const mapped: Record<string, unknown> = {};
      const persistEntities: string[] = [];
      const rootQuery = parsed['ROOT_QUERY'];

      mapped['ROOT_QUERY'] = Object.keys(rootQuery).reduce(
        (obj: Record<string, unknown>, key: string) => {
          if (key === '__typename') return obj;

          const keyWithoutArgs = key.substring(0, key.indexOf('('));
          if (entitiesToPersist.includes(keyWithoutArgs)) {
            obj[key] = rootQuery[key];

            if (Array.isArray(rootQuery[key])) {
              const entities = rootQuery[key].map(
                (item: Record<string, unknown>) => item.__ref
              );
              persistEntities.push(...entities);
            } else {
              const entity = rootQuery[key].__ref;
              persistEntities.push(entity);
            }
          }

          return obj;
        },
        {__typename: 'Query'}
      );

      persistEntities.reduce((obj, key) => {
        obj[key] = parsed[key];
        return obj;
      }, mapped);

      return JSON.stringify(mapped);
    },
  });

  const restoreApolloCache = async () => {
    await persistor.restore();
  };

  restoreApolloCache();
}

export const goerliClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['goerli']})),
});

const mumbaiClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['mumbai']})),
});

const arbitrumTestClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['arbitrum-test']})),
});

// TODO: remove undefined when all clients are defined
const client: Record<
  SupportedNetworks,
  ApolloClient<NormalizedCacheObject> | undefined
> = {
  ethereum: undefined,
  goerli: goerliClient,
  polygon: undefined,
  mumbai: mumbaiClient,
  arbitrum: undefined,
  'arbitrum-test': arbitrumTestClient,
};

// SELECTED DAO
export type SelectedDao = {
  address: string;
  ensDomain: string;
  avatar?: string;
  name: string;
};

const selectedDaoVar = makeVar<SelectedDao>({
  address: '',
  ensDomain: '',
  avatar: '',
  name: '',
});

// FAVORITE DAOS
// including description and plugin in anticipation for
// showing these daos on explorer page
type FavoriteDao = Omit<DaoListItem, 'metadata'> & {
  metadata: {
    name: string;
    avatar?: string;
    description: string;
  };
};
const favoriteDaos = JSON.parse(
  localStorage.getItem(FAVORITE_DAOS_KEY) || '[]'
);
const favoriteDaosVar = makeVar<Array<FavoriteDao>>(favoriteDaos);

// PENDING DEPOSITS
const depositTxs = JSON.parse(
  localStorage.getItem(PENDING_DEPOSITS_KEY) || '[]',
  customJSONReviver
);
const pendingDeposits = makeVar<Deposit[]>(depositTxs);

// PENDING VOTES
type PendingVotes = {
  /** key is: daoAddress_proposalId */
  [key: string]: AddressListVote | Erc20ProposalVote;
};
const pendingVotes = JSON.parse(
  localStorage.getItem(PENDING_VOTES_KEY) || '{}',
  customJSONReviver
);
const pendingVotesVar = makeVar<PendingVotes>(pendingVotes);

// PENDING PROPOSAL
// iffy about this structure
type PendingProposals = {
  // key is dao address
  [key: string]: {
    // key is proposal id
    [key: string]: Erc20Proposal | AddressListProposal;
  };
};

const pendingProposals = JSON.parse(
  localStorage.getItem(PENDING_PROPOSALS_KEY) || '{}',
  customJSONReviver
);
const pendingProposalsVar = makeVar<PendingProposals>(pendingProposals);

type PendingDaoCreation = {
  [key in SupportedNetworks]?: {
    // This key is the id of the newly created DAO
    [key: string]: {
      daoCreationParams: ICreateParams;
      daoMetadata: IMetadata;
    };
  };
};
const pendingDaoCreation = JSON.parse(
  localStorage.getItem(PENDING_DAOS_KEY) || '{}'
);
const pendingDaoCreationVar = makeVar<PendingDaoCreation>(pendingDaoCreation);

export {
  client,
  favoriteDaosVar,
  selectedDaoVar,
  pendingDeposits,
  pendingProposalsVar,
  pendingVotesVar,
  pendingDaoCreationVar,
};
