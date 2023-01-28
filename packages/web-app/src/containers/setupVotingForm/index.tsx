import {VotingSettings} from '@aragon/sdk-client';
import {
  AlertCard,
  AlertInline,
  CheckboxListItem,
  DateInput,
  DropdownInput,
  Label,
  NumberInput,
} from '@aragon/ui-components';
import {toDate} from 'date-fns-tz';
import React, {useCallback, useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {SimplifiedTimeInput} from 'components/inputTime/inputTime';
import UtcMenu from 'containers/utcMenu';
import {timezones} from 'containers/utcMenu/utcData';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {
  daysToMills,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getDaysHoursMins,
  getDHMFromSeconds,
  getFormattedUtcOffset,
  hoursToMills,
  minutesToMills,
} from 'utils/date';
import {StringIndexed} from 'utils/types';
import {DateModeSwitch} from './dateModeSwitch';
import {DateTimeErrors} from './dateTimeErrors';
import {
  HOURS_IN_DAY,
  MAX_DURATION_DAYS,
  MINS_IN_DAY,
  MINS_IN_HOUR,
  MIN_DURATION_HOURS,
} from 'utils/constants';

type UtcInstance = 'first' | 'second';

const SetupVotingForm: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {
    control,
    setValue,
    getValues,
    setError,
    formState,
    clearErrors,
    resetField,
  } = useFormContext();
  const endDateType = useWatch({
    name: 'durationSwitch',
  });

  /*************************************************
   *                    STATE & EFFECT             *
   *************************************************/
  const [utcInstance, setUtcInstance] = useState<UtcInstance>('first');
  const [utcStart, setUtcStart] = useState('');
  const [utcEnd, setUtcEnd] = useState('');

  const {data: daoId} = useDaoParam();
  const {data: daoDetails} = useDaoDetails(daoId!);
  const {data} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  // TODO: fix when implementing multisig
  const daoSettings = data as VotingSettings;
  const {days, hours, minutes} = getDHMFromSeconds(daoSettings.minDuration);

  // Initializes values for the form
  // This is done here rather than in the defaulValues object as time can
  // ellapse between the creation of the form context and this stage of the form.
  useEffect(() => {
    const currTimezone = timezones.find(tz => tz === getFormattedUtcOffset());
    if (!currTimezone) {
      setUtcStart(timezones[13]);
      setUtcEnd(timezones[13]);
      setValue('startUtc', timezones[13]);
      setValue('endUtc', timezones[13]);
    } else {
      setUtcStart(currTimezone);
      setUtcEnd(currTimezone);
      setValue('startUtc', currTimezone);
      setValue('endUtc', currTimezone);
    }
  }, []); //eslint-disable-line

  // Validates all fields (date, time and UTC) for both start and end
  // simultaneously. This is necessary, as all the fields are related to one
  // another. The validation gathers information from all start and end fields
  // and constructs two date (start and end). The validation leads to an error
  // if the dates violate any of the following constraints:
  //   - The start date is in the past
  //   - The end date is before the start date
  // If the form is invalid, errors are set for the repsective group of fields.
  const dateTimeValidator = useCallback(() => {
    //build start date/time in utc mills
    const sDate = getValues('startDate');
    const sTime = getValues('startTime');
    const sUtc = getValues('startUtc');

    const canonicalSUtc = getCanonicalUtcOffset(sUtc);
    const startDateTime = toDate(sDate + 'T' + sTime + canonicalSUtc);
    const startMills = startDateTime.valueOf();

    const currDateTime = new Date();
    const currMills = currDateTime.getTime();

    //build end date/time in utc mills
    const eDate = getValues('endDate');
    const eTime = getValues('endTime');
    const eUtc = getValues('endUtc');

    const canonicalEUtc = getCanonicalUtcOffset(eUtc);
    const endDateTime = toDate(eDate + 'T' + eTime + canonicalEUtc);
    const endMills = endDateTime.valueOf();

    const minEndDateTimeMills =
      startMills +
      daysToMills(days || 0) +
      hoursToMills(hours || 0) +
      minutesToMills(minutes || 0);

    let returnValue = '';

    // check start constraints
    if (startMills < currMills) {
      setError('startTime', {
        type: 'validate',
        message: t('errors.startPast'),
      });
      setError('startDate', {
        type: 'validate',
        message: t('errors.startPast'),
      });
      returnValue = t('errors.endPast');
    }
    if (startMills >= currMills) {
      clearErrors('startDate');
      clearErrors('startTime');
    }

    //check end constraints
    if (endMills < minEndDateTimeMills) {
      setError('endTime', {
        type: 'validate',
        message: t('errors.endPast'),
      });
      setError('endDate', {
        type: 'validate',
        message: t('errors.endPast'),
      });
      returnValue = t('errors.endPast');
    }

    if (endMills >= minEndDateTimeMills) {
      clearErrors('endDate');
      clearErrors('endTime');
    }

    return !returnValue ? true : returnValue;
  }, [clearErrors, days, getValues, hours, minutes, setError, t]);

  // These effects trigger validation when UTC fields are changed.

  useEffect(() => {
    dateTimeValidator();
  }, [utcStart, dateTimeValidator]);

  useEffect(() => {
    dateTimeValidator();
  }, [utcEnd, dateTimeValidator]); //eslint-disable-line

  useEffect(() => {
    if (!daoSettings.minDuration) {
      setError('areSettingsLoading', {});
    } else {
      clearErrors('areSettingsLoading');
    }
  }, [clearErrors, daoSettings.minDuration, setError]);

  // sets the UTC values for the start and end date/time
  const tzSelector = (tz: string) => {
    if (utcInstance === 'first') {
      setUtcStart(tz);
      setValue('startUtc', tz);
    } else {
      setUtcEnd(tz);
      setValue('endUtc', tz);
    }
  };

  const clearInputs = () => {
    resetField('duration');
    resetField('endDate');
    resetField('endTime');
  };

  /*************************************************
   *                    Render                     *
   *************************************************/

  return <SetupVotingFormMultisig />;
};

export default SetupVotingForm;

/**
 * Check if the screen is valid
 * @param errors List of fields that have errors
 * @param durationSwitch Duration switch value
 * @returns Whether the screen is valid
 */
export function isValid(errors: StringIndexed) {
  return !(
    errors.startDate ||
    errors.startTime ||
    errors.endDate ||
    errors.ednTime ||
    errors.areSettingsLoading
  );
}

const FormSection = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const HStack = styled.div.attrs({
  className: 'inline-flex space-x-1',
})``;

const SetupVotingFormMultisig = () => {
  const {t} = useTranslation();
  const {control, setValue, getValues, trigger} = useFormContext();

  function handleCheckBoxToggled(
    changeValue: string,
    onChange: (value: string) => void
  ) {
    onChange(changeValue);
  }

  const startItems = [
    {label: t('Now'), selectValue: 'now'},
    {label: t('Specific Date + Time'), selectValue: 'dateTime'},
  ];

  const expirationItems = [
    {label: t('Duration'), selectValue: 'duration'},
    {label: t('Specific Date + Time'), selectValue: 'dateTime'},
  ];

  const handleDaysChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      const durationHours = getValues('durationHours');
      if (value >= MAX_DURATION_DAYS) {
        e.target.value = MAX_DURATION_DAYS.toString();

        setValue('durationDays', MAX_DURATION_DAYS.toString());
        setValue('durationHours', '0');
        setValue('durationMinutes', '0');
      } else if (value === 0 && durationHours === '0') {
        setValue('durationHours', MIN_DURATION_HOURS.toString());
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [getValues, setValue, trigger]
  );

  const handleHoursChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);
      const durationDays = getValues('durationDays');

      if (value >= HOURS_IN_DAY) {
        const {days, hours} = getDaysHoursMins(value, 'hours');
        e.target.value = hours.toString();

        if (days > 0) {
          setValue('durationDays', (Number(durationDays) + days).toString());
        }
      } else if (value === 0 && durationDays === '0') {
        setValue('durationHours', MIN_DURATION_HOURS.toString());
        setValue('durationMinutes', '0');
        e.target.value = MIN_DURATION_HOURS.toString();
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [getValues, setValue, trigger]
  );

  const handleMinutesChanged = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: React.ChangeEventHandler
    ) => {
      const value = Number(e.target.value);

      if (value >= MINS_IN_HOUR) {
        const [oldDays, oldHours] = getValues([
          'durationDays',
          'durationHours',
        ]);

        const totalMins =
          oldDays * MINS_IN_DAY + oldHours * MINS_IN_HOUR + value;

        const {days, hours, mins} = getDaysHoursMins(totalMins);
        setValue('durationDays', days.toString());
        setValue('durationHours', hours.toString());
        e.target.value = mins.toString();
      }
      trigger(['durationMinutes', 'durationHours', 'durationDays']);
      onChange(e);
    },
    [getValues, setValue, trigger]
  );

  return (
    <>
      {/* Voting Type Selection  */}
      <FormSection>
        <Label
          label={t('newWithdraw.setupVoting.optionLabel.title')}
          helpText="These are the following options for voting on this proposition."
        />
        <CheckboxListItem
          label={t('Approve')}
          type="active"
          helptext={t(
            'Each Multisig member has the ability to approve the proposal and any associated optional actions. The proposal will be executed if three out of four members approve it.'
          )}
          multiSelect={false}
        />
        <AlertInline
          mode="neutral"
          label={t('Approval is the only option for Multisig DAOs.')}
        />
      </FormSection>

      {/* Start time */}
      <FormSection>
        <Label
          label={t('Start Time')}
          helpText={t(
            'Define when a proposal should be active to receive approvals. If now is selected, the proposal is immediately active after publishing.'
          )}
        />
        <Controller
          name="startNow"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="now"
          render={({field: {onChange, value}}) => (
            <ToggleCheckList
              items={startItems}
              value={value}
              onChange={changeValue =>
                handleCheckBoxToggled(changeValue, onChange)
              }
            />
          )}
        />
      </FormSection>

      {/* Expiration time */}
      <FormSection>
        <Label
          label={t('Expiration Time')}
          helpText={t(
            'Define when a proposal should get expired, if the minimum approval threshold is never reached until then. After the expiration time, there is no way to approve or execute the proposal.'
          )}
        />
        <Controller
          name="expirationDuration"
          rules={{required: 'Validate'}}
          control={control}
          defaultValue="duration"
          render={({field: {onChange, value}}) => (
            <ToggleCheckList
              value={value}
              items={expirationItems}
              onChange={changeValue =>
                handleCheckBoxToggled(changeValue, onChange)
              }
            />
          )}
        />

        <DurationContainer>
          <Controller
            name="durationMinutes"
            control={control}
            defaultValue="0"
            rules={{
              required: t('errors.emptyDistributionMinutes'),
              validate: value =>
                value <= 59 && value >= 0
                  ? true
                  : t('errors.distributionMinutes'),
            }}
            render={({
              field: {onBlur, onChange, value, name},
              fieldState: {error},
            }) => (
              <TimeLabelWrapper>
                <TimeLabel>{t('createDAO.step4.minutes')}</TimeLabel>
                <NumberInput
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleMinutesChanged(e, onChange)
                  }
                  placeholder={'0'}
                  min="0"
                  // disabled={durationDays === MAX_DURATION_DAYS.toString()}
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </TimeLabelWrapper>
            )}
          />

          <Controller
            name="durationHours"
            control={control}
            defaultValue="0"
            rules={{required: t('errors.emptyDistributionHours')}}
            render={({
              field: {onBlur, onChange, value, name},
              fieldState: {error},
            }) => (
              <TimeLabelWrapper>
                <TimeLabel>{t('createDAO.step4.hours')}</TimeLabel>
                <NumberInput
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleHoursChanged(e, onChange)
                  }
                  placeholder={'0'}
                  min="0"
                  // disabled={durationDays === MAX_DURATION_DAYS.toString()}
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </TimeLabelWrapper>
            )}
          />

          <Controller
            name="durationDays"
            control={control}
            defaultValue="1"
            rules={{
              required: t('errors.emptyDistributionDays'),
              validate: value =>
                value >= 0 ? true : t('errors.distributionDays'),
            }}
            render={({
              field: {onBlur, onChange, value, name},
              fieldState: {error},
            }) => (
              <TimeLabelWrapper>
                <TimeLabel>{t('createDAO.step4.days')}</TimeLabel>
                <NumberInput
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDaysChanged(e, onChange)
                  }
                  placeholder={'0'}
                  min="0"
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </TimeLabelWrapper>
            )}
          />
        </DurationContainer>
      </FormSection>
    </>
  );
};

type Props = {
  items: Array<{
    label: string;
    selectValue: string;
  }>;

  value: string;
  onChange: (value: string) => void;
};

const ToggleCheckList: React.FC<Props> = ({onChange, items, value}) => {
  return (
    <ToggleCheckListContainer>
      {items.map(item => (
        <ToggleCheckListItemWrapper key={item.label}>
          <CheckboxListItem
            label={item.label}
            multiSelect={false}
            onClick={() => onChange(item.selectValue)}
            type={value === item.selectValue ? 'active' : 'default'}
          />
        </ToggleCheckListItemWrapper>
      ))}
    </ToggleCheckListContainer>
  );
};

const ToggleCheckListContainer = styled.div.attrs({
  className: 'flex gap-x-3',
})``;

const ToggleCheckListItemWrapper = styled.div.attrs({className: 'flex-1'})``;

const DurationContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row space-y-1.5 tablet:space-y-0 tablet:space-x-1.5 p-3 bg-ui-0 rounded-xl',
})``;

const TimeLabelWrapper = styled.div.attrs({
  className: 'w-1/2 tablet:w-full space-y-0.5',
})``;

const TimeLabel = styled.span.attrs({
  className: 'text-sm font-bold text-ui-800',
})``;

// const SetupVotingFormTokenVoting () => {
//   return (<>
//     {/* Voting Type Selection */}
//     <FormSection>
//       <Label label={t('newWithdraw.setupVoting.optionLabel.title')} />
//       <CheckboxListItem
//         label={t('newWithdraw.setupVoting.yesNoLabel.title')}
//         type="active"
//         helptext={t('newWithdraw.setupVoting.yesNoLabel.helpText')}
//         multiSelect={false}
//       />
//       <AlertCard
//         mode="info"
//         title={t('infos.newVotingTypes')}
//         helpText={t('infos.newTypesHelpText')}
//       />
//     </FormSection>

//     {/* Start Date */}
//     <FormSection>
//       <Label label={t('labels.startDate')} />
//       <HStack>
//         <Controller
//           name="startDate"
//           control={control}
//           defaultValue={getCanonicalDate({ minutes: 10 })}
//           rules={{
//             required: t('errors.required.date'),
//             validate: dateTimeValidator,
//           }}
//           render={({ field: { name, value, onChange, onBlur } }) => (
//             <div>
//               <DateInput
//                 name={name}
//                 value={value}
//                 onChange={onChange}
//                 onBlur={onBlur}
//               />
//             </div>
//           )}
//         />
//         <Controller
//           name="startTime"
//           control={control}
//           defaultValue={getCanonicalTime({ minutes: 10 })}
//           rules={{
//             required: t('errors.required.time'),
//             validate: dateTimeValidator,
//           }}
//           render={({ field: { name, value, onChange, onBlur } }) => (
//             <div>
//               <SimplifiedTimeInput
//                 name={name}
//                 value={value}
//                 onChange={onChange}
//                 onBlur={onBlur}
//               />
//             </div>
//           )}
//         />
//         <div>
//           <DropdownInput
//             value={utcStart}
//             onClick={() => {
//               setUtcInstance('first');
//               open('utc');
//             }}
//           />
//         </div>
//       </HStack>
//       <DateTimeErrors mode={'start'} />
//     </FormSection>

//     {/* End date */}
//     {daoSettings.minDuration && (
//       <FormSection>
//         <Label label={t('labels.endDate')} />
//         {endDateType === 'duration' && days && days >= 1 ? (
//           <>
//             <HStack>
//               <Controller
//                 name="durationSwitch"
//                 defaultValue="duration"
//                 control={control}
//                 render={({ field: { onChange, value } }) => {
//                   return (
//                     <DateModeSwitch
//                       value={value}
//                       setValue={value => {
//                         clearInputs();
//                         onChange(value);
//                       }}
//                     />
//                   );
//                 }}
//               />
//               <Controller
//                 name="duration"
//                 control={control}
//                 defaultValue={days + 1}
//                 rules={{
//                   min: {
//                     value: days + 1 || 0,
//                     message: t('errors.durationTooShort'),
//                   },
//                   required: t('errors.required.duration'),
//                 }}
//                 render={({ field: { name, onChange, value } }) => {
//                   return (
//                     <NumberInput
//                       name={name}
//                       value={value}
//                       min={days + 1}
//                       onChange={onChange}
//                       width={144}
//                     />
//                   );
//                 }}
//               />
//             </HStack>
//             {formState.errors?.duration?.message && (
//               <AlertInline
//                 label={formState.errors.duration.message}
//                 mode="critical"
//               />
//             )}
//           </>
//         ) : (
//           <>
//             <div className="block space-y-2">
//               {days && days >= 1 ? (
//                 <div>
//                   <Controller
//                     name="durationSwitch"
//                     control={control}
//                     defaultValue="date"
//                     render={({ field: { onChange, value } }) => {
//                       return (
//                         <DateModeSwitch
//                           value={value}
//                           setValue={value => {
//                             clearInputs();
//                             onChange(value);
//                           }}
//                         />
//                       );
//                     }}
//                   />
//                 </div>
//               ) : null}
//               <HStack>
//                 <Controller
//                   name="endDate"
//                   control={control}
//                   rules={{
//                     required: t('errors.required.date'),
//                     validate: dateTimeValidator,
//                   }}
//                   defaultValue={getCanonicalDate({ days, hours, minutes })}
//                   render={({ field: { name, value, onChange, onBlur } }) => (
//                     <div>
//                       <DateInput
//                         name={name}
//                         value={value}
//                         onChange={onChange}
//                         onBlur={onBlur}
//                       />
//                     </div>
//                   )}
//                 />
//                 <Controller
//                   name="endTime"
//                   control={control}
//                   defaultValue={getCanonicalTime({
//                     days,
//                     hours,
//                     minutes: (minutes || 0) + 10,
//                   })}
//                   rules={{
//                     required: t('errors.required.time'),
//                     validate: dateTimeValidator,
//                   }}
//                   render={({ field: { name, value, onChange, onBlur } }) => (
//                     <div>
//                       <SimplifiedTimeInput
//                         name={name}
//                         value={value}
//                         onChange={onChange}
//                         onBlur={onBlur}
//                       />
//                     </div>
//                   )}
//                 />
//                 <div>
//                   <DropdownInput
//                     value={utcEnd}
//                     onClick={() => {
//                       setUtcInstance('second');
//                       open('utc');
//                     }}
//                   />
//                 </div>
//               </HStack>
//             </div>
//             <DateTimeErrors mode={'end'} />
//           </>
//         )}
//         {minutes && minutes > 0 ? (
//           <AlertInline
//             label={t('infos.voteDHMDuration', { days, hours, minutes })}
//             mode="neutral"
//           />
//         ) : hours && hours > 0 ? (
//           <AlertInline
//             label={t('infos.voteDHDuration', { days, hours })}
//             mode="neutral"
//           />
//         ) : (
//           <AlertInline
//             label={t('infos.voteDuration', { days })}
//             mode="neutral"
//           />
//         )}
//       </FormSection>
//     )}
//     <UtcMenu onTimezoneSelect={tzSelector} />
//   </>);
// }
