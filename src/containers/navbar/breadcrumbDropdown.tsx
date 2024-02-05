import React, {useState} from 'react';
import styled from 'styled-components';
import {ButtonIcon, Dropdown} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';

import NavLink from 'components/navLink';
import {NAV_LINKS_DATA} from 'utils/constants';

export const NavlinksDropdown: React.FC = () => {
  const [showCrumbMenu, setShowCrumbMenu] = useState(false);

  return (
    <StyledDropdown
      open={showCrumbMenu}
      onOpenChange={setShowCrumbMenu}
      align="start"
      trigger={
        <ButtonIcon
          mode="secondary"
          size="large"
          icon={
            showCrumbMenu ? (
              <Icon icon={IconType.CLOSE} />
            ) : (
              <Icon icon={IconType.MENU_DEFAULT} />
            )
          }
          isActive={showCrumbMenu}
        />
      }
      sideOffset={8}
      listItems={NAV_LINKS_DATA.map(d => ({
        component: <NavLink caller="dropdown" data={d} />,
        // Navlink component already takes care of callback. Eventually we
        // should probably make this optional on the dropdown component.
        callback: () => {},
      }))}
    />
  );
};

const StyledDropdown = styled(Dropdown).attrs({
  className: 'p-3 w-60 rounded-xl',
})``;
