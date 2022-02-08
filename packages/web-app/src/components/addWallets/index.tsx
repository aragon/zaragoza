import React from 'react';
import styled from 'styled-components';
import {ButtonText} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {useFormContext, useFieldArray} from 'react-hook-form';

import Row from './row';
import Header from './header';
import Footer from './footer';

const TOTAL_SUPPLY = 100;

const AddWallets: React.FC = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const {fields, append, remove} = useFieldArray({name: 'wallets', control});

  if (fields.length === 0) {
    append([
      {address: 'DAO Treasury', amount: '0'},
      {address: 'My Wallet', amount: '0'},
    ]);
  }

  // TODO: research focus after input refactor
  const handleAddLink = () => {
    append({address: '', amount: ''});
  };

  return (
    <Container data-testid="add-links">
      <ListGroup>
        <Header />
        {fields.map((field, index) => {
          return (
            <Row
              key={field.id}
              index={index}
              control={control}
              fieldset={fields}
              {...(index !== 0 ? {onDelete: () => remove(index)} : {})}
            />
          );
        })}
        <Footer totalAddresses={fields.length || 0} />
      </ListGroup>
      <ButtonText
        label={t('labels.addLink')}
        mode="secondary"
        size="large"
        onClick={handleAddLink}
      />
    </Container>
  );
};

export default AddWallets;

const Container = styled.div.attrs({className: 'space-y-1.5'})``;
const ListGroup = styled.div.attrs({
  className: 'flex flex-col overflow-hidden space-y-0.25 rounded-xl',
})``;
