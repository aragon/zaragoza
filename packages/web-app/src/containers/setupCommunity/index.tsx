import {CheckboxListItem, Label} from '@aragon/ui-components';
import React, {useEffect} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import CreateNewToken from './createNewToken';
import {MultisigWallets} from 'components/multisigWallets';
import {MultisigEligibility} from 'components/multisigEligibility';
import {FormSection} from 'containers/setupVotingForm';
import {ToggleCheckList} from 'containers/setupVotingForm/multisig';
import AddExistingToken from './addExistingToken';

const SetupCommunityForm: React.FC = () => {
  const {t} = useTranslation();

  const {control, resetField, setValue} = useFormContext();
  const [membership, existingToken] = useWatch({
    name: ['membership', 'existingToken'],
  });

  const existingTokenItems = [
    {label: t('labels.yes'), selectValue: true},
    {
      label: t('labels.no'),
      selectValue: false,
    },
  ];

  useEffect(() => {
    if (membership === 'token') {
      setValue('eligibilityType', 'token');
    } else if (membership === 'multisig') {
      setValue('eligibilityType', 'multisig');
    }
  }, [membership, setValue]);

  const resetTokenFields = () => {
    resetField('tokenName');
    resetField('tokenSymbol');
    resetField('tokenAddress');
    resetField('tokenTotalSupply');
    resetField('multisigWallets');
    resetField('wallets');
  };

  return (
    <>
      {/* Eligibility */}
      <FormItem>
        <Label label={t('createDAO.step3.membership') as string} />
        <Controller
          name="membership"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="token"
          render={({field: {onChange, value}}) => (
            <>
              <CheckboxListItem
                label={t('createDAO.step3.tokenMembership')}
                helptext={t('createDAO.step3.tokenMembershipSubtitle')}
                multiSelect={false}
                onClick={() => {
                  resetTokenFields();
                  onChange('token');
                }}
                {...(value === 'token' ? {type: 'active'} : {})}
              />

              <CheckboxListItem
                label={t('createDAO.step3.multisigMembership')}
                helptext={t('createDAO.step3.multisigMembershipSubtitle')}
                onClick={() => {
                  resetTokenFields();
                  onChange('multisig');
                }}
                multiSelect={false}
                {...(value === 'multisig' ? {type: 'active'} : {})}
              />

              {/* Address List Dao has been disabled */}
              {/* <CheckboxListItem
                  label={t('createDAO.step3.walletMemberShip')}
                  helptext={t('createDAO.step3.walletMemberShipSubtitle')}
                  onClick={() => {
                    resetTokenFields();
                    onChange('wallet');
                  }}
                  multiSelect={false}
                  {...(value === 'wallet' ? {type: 'active'} : {})}
                /> */}
            </>
          )}
        />
      </FormItem>

      {membership === 'multisig' && (
        <>
          <FormItem>
            <MultisigWallets />
          </FormItem>
          <FormItem>
            <MultisigEligibility />
          </FormItem>
        </>
      )}

      {/* Token creation */}
      {/* TODO: when validating, the two list items should be either wrapped in a component that takes care of the state
        or manually call setValue() onChange and get rid of the controller so that required validation can be done
      */}

      {/* Membership type */}
      {/* for some reason the default value of the use form is not setting up correctly
      and is initialized to null or '' so the condition cannot be membership === 'token'  */}
      <FormSection>
        <Label label={t('createDAO.step3.existingToken.questionLabel')} />
        <Controller
          name="existingToken"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue={false}
          render={({field: {value, onChange}}) => (
            <ToggleCheckList
              items={existingTokenItems}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </FormSection>

      {membership === 'token' &&
        (existingToken ? <AddExistingToken /> : <CreateNewToken />)}
    </>
  );
};

export default SetupCommunityForm;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
