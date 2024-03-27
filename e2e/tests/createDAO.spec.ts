import {testWithMetaMask as test} from '../testWithMetaMask';

const {expect} = test;

// The `MetaMask` instance is now available in the test context.
test('Create Multisig DAO', async ({context, page, extensionId, metamask}) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', {name: 'Accept all'}).click();
  await page.getByRole('button', {name: 'Connect wallet'}).click();
  await page.getByRole('button', {name: 'Metamask'}).click();
  await metamask.connectToDapp();
  await page.getByRole('button', {name: 'Create a DAO'}).click();
  await page.getByRole('button', {name: 'Build your DAO'}).click();
  await page.getByRole('radio', {name: 'Testnet'}).click();
  await page.getByText('Ethereum Sepolia').click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByPlaceholder("Type your DAO's name …").click();
  await page.getByPlaceholder("Type your DAO's name …").fill('Multisig DAO');
  await page.getByPlaceholder('Type your summary …').click();
  await page
    .getByPlaceholder('Type your summary …')
    .fill('DAO generated by automated E2E tests');
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByText('Multisig membersOnly multisig').click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.getByRole('button', {name: 'Next'}).click();
  await page.locator('.sc-FjLsS > .w-4').first().click();
  await page
    .locator(
      'div:nth-child(2) > .ml-auto > .md\\:flex > .sc-fbbsWf > .sc-FjLsS > .w-4'
    )
    .click();
  await page
    .locator(
      'div:nth-child(3) > .ml-auto > .md\\:flex > .sc-fbbsWf > .sc-FjLsS > .w-4'
    )
    .click();
  await page
    .locator(
      'div:nth-child(4) > .ml-auto > .md\\:flex > .sc-fbbsWf > .sc-FjLsS > .w-4'
    )
    .click();
  await page.getByRole('button', {name: 'Deploy your DAO'}).click();
  await page.getByRole('button', {name: 'Switch to Ethereum Sepolia'}).click();
  await metamask.approveSwitchNetwork();
  await page.waitForTimeout(1000);
  await page.getByRole('button', {name: 'Deploy your DAO'}).click();
  await page.getByRole('button', {name: 'Approve transaction'}).click();
  await metamask.confirmTransaction();
  await page.getByRole('button', {name: 'Launch DAO Dashboard'}).click();
  await page.getByRole('button', {name: 'Open your DAO'}).click();
});
