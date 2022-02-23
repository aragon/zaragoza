import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from 'react';

import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {ActionItem} from 'utils/types';

const ActionsContext = createContext<ActionsContextType | null>(null);

type ActionsContextType = {
  daoAddress: Address;
  actions: ActionItem[];
  addAction: (value: ActionItem) => void;
  duplicateAction: (index: number) => void;
  removeAction: (index: number) => void;
  setDaoAddress: (value: string) => void;
};

type Props = Record<'children', ReactNode>;

const ActionsProvider: React.FC<Props> = ({children}) => {
  const [daoAddress, setDaoAddress] =
    useState<ActionsContextType['daoAddress']>('');
  const [actions, setActions] = useState<ActionsContextType['actions']>([]);

  const addAction = useCallback(newAction => {
    setActions((oldActions: ActionsContextType['actions']) => [
      ...oldActions,
      newAction,
    ]);
  }, []);

  const removeAction = useCallback(
    (index: number) => {
      const newActions = actions.filter((_, oldIndex) => oldIndex !== index);
      setActions(newActions);
    },
    [actions]
  );

  const duplicateAction = useCallback((index: number) => {
    setActions((oldActions: ActionsContextType['actions']) => [
      ...oldActions,
      oldActions[index],
    ]);
  }, []);

  const value = useMemo(
    (): ActionsContextType => ({
      daoAddress,
      actions,
      setDaoAddress,
      addAction,
      removeAction,
      duplicateAction,
    }),
    [actions, addAction, daoAddress, duplicateAction, removeAction]
  );

  return (
    <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
  );
};

function useActionsContext(): ActionsContextType {
  return useContext(ActionsContext) as ActionsContextType;
}

export {useActionsContext, ActionsProvider};
