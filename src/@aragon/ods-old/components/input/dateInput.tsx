import React from 'react';
import {styled} from 'styled-components';

export type DateInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const DateInput: React.FC<DateInputProps> = ({disabled, ...props}) => {
  return (
    <InputContainer data-testid="date-input" disabled={disabled}>
      <StyledInput
        id="date"
        type="date"
        required
        disabled={disabled}
        {...props}
      />
    </InputContainer>
  );
};

type InputContainerProps = Pick<DateInputProps, 'disabled'>;

const InputContainer = styled.div.attrs<InputContainerProps>(({disabled}) => {
  const baseClasses =
    'flex relative items-center p-1 rounded-xl border-2 font-normal cursor-pointer';
  let className = `${baseClasses}`;

  if (disabled) {
    className += ' bg-neutral-100 text-neutral-300 border-ui-200';
  } else {
    const focusVisibleClasses =
      'focus-within:ring-2 focus-within:ring-primary-500';
    const hoverClasses = 'hover:border-ui-300';
    const activeClasses = 'active:border-primary-500 active:ring-0';
    className += ` bg-neutral-0 text-neutral-600 ${focusVisibleClasses} ${hoverClasses} ${activeClasses}`;
  }
  return {className, disabled};
})<DateInputProps>``;

const StyledInput = styled.input.attrs(() => {
  const baseClasses = 'w-full bg-transparent';
  const className = `${baseClasses}`;

  return {className};
})<DateInputProps>`
  ::-webkit-calendar-picker-indicator {
  }

  outline: 0;
`;
