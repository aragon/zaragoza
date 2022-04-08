import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';

import App from './app';
import {WalletProvider} from 'context/augmentedWallet';
import {APMProvider} from 'context/elasticAPM';
import {WalletMenuProvider} from 'context/walletMenu';
import {GlobalModalsProvider} from 'context/globalModals';
import {ApolloClientProvider} from 'context/apolloClient';
import 'tailwindcss/tailwind.css';
import {ProvidersProvider} from 'context/providers';
import {UseSignerProvider} from 'use-signer';
import {IProviderOptions} from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: 'mainnet.eth.aragon.network',
    },
  },
};

ReactDOM.render(
  <React.StrictMode>
    <APMProvider>
      <WalletProvider>
        <UseSignerProvider providerOptions={providerOptions}>
          <ProvidersProvider>
            <WalletMenuProvider>
              <GlobalModalsProvider>
                <Router>
                  <ApolloClientProvider>
                    <App />
                  </ApolloClientProvider>
                </Router>
              </GlobalModalsProvider>
            </WalletMenuProvider>
          </ProvidersProvider>
        </UseSignerProvider>
      </WalletProvider>
    </APMProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
