export const ensureWalletConnected = async () => {
  try {
    const chainId = 'neutron-1';
    const keplr = window.keplr;

    // Execute the full workflow
    if (!keplr) {
      throw new Error('Keplr wallet is not installed.');
    }

    await keplr.enable(chainId);
    const signer = window.getOfflineSigner(chainId);

    return signer;

  } catch (err) {
    alert(err.message);
//     setError(err.message); // Update the error state
  }
};

export const getWalletAddress = async (signer) => {
  try {
      const accounts = await signer.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('No account found in the signer.');
      }

      const address = accounts[0].address;
      return address;
  } catch (err) {
    alert(err.message);
//     setError(err.message); // Update the error state
  }
};


export const connectWallet = async (preferredWallet = 'keplr') => {
  /*
   * Attempt to detect and connect to the requested wallet extension.
   * Currently supports Keplr and Leap; extend this switch-case to add more wallets.
   */
  let wallet;
  switch (preferredWallet.toLowerCase()) {
    case 'keplr':
      wallet = window.keplr;
      break;
    case 'leap':
      wallet = window.leap;
      break;
    default:
      throw new Error(`${preferredWallet} wallet is not supported by this dApp.`);
  }

  if (!wallet) {
    throw new Error(`${preferredWallet} extension not found. Please install it and refresh the page.`);
  }

  try {
    // Ask the user to approve connection permissions (UI popup in the wallet).
    await wallet.enable('neutron-1');
    // Return an OfflineSigner required by CosmJS.
    return wallet.getOfflineSigner('neutron-1');
  } catch (err) {
    console.error('Wallet connection failed:', err);
    throw new Error('User rejected the wallet connection request or another error occurred.');
  }
};

export const ensureNeutronNetwork = async () => {
  const chainId = 'neutron-1';
  const keplr = window.keplr || window.leap;
  if (!keplr) throw new Error('No compatible wallet detected.');

  try {
    // First try to enable Neutron if it already exists in the wallet.
    await keplr.enable(chainId);
    return true;
  } catch (enableErr) {
    console.warn('Neutron chain not yet added in the wallet, attempting experimentalSuggestChain');

    // Fallback: suggest chain (only works if wallet supports the experimental API).
    if (!keplr.experimentalSuggestChain) {
      throw new Error('Wallet does not support chain suggestions. Please add Neutron manually.');
    }

    // Minimal and up-to-date Neutron chain configuration.
    const neutronChainInfo = {
      chainId,
      chainName: 'Neutron',
      rpc: 'https://rpc-kralum.neutron.org',
      rest: 'https://api-kralum.neutron.org',
      bip44: { coinType: 118 },
      bech32Config: {
        bech32PrefixAccAddr: 'neutron',
        bech32PrefixAccPub: 'neutronpub',
        bech32PrefixValAddr: 'neutronvaloper',
        bech32PrefixValPub: 'neutronvaloperpub',
        bech32PrefixConsAddr: 'neutronvalcons',
        bech32PrefixConsPub: 'neutronvalconspub'
      },
      currencies: [{ coinDenom: 'NTRN', coinMinimalDenom: 'untrn', coinDecimals: 6 }],
      feeCurrencies: [{ coinDenom: 'NTRN', coinMinimalDenom: 'untrn', coinDecimals: 6 }],
      stakeCurrency: { coinDenom: 'NTRN', coinMinimalDenom: 'untrn', coinDecimals: 6 },
      gasPriceStep: { low: 0.01, average: 0.025, high: 0.04 }
    };

    try {
      await keplr.experimentalSuggestChain(neutronChainInfo);
      // Chain suggested successfully; enable it now.
      await keplr.enable(chainId);
      return true;
    } catch (suggestErr) {
      console.error('Failed to suggest Neutron chain:', suggestErr);
      throw new Error('Unable to add Neutron network automatically. Please add it to your wallet manually.');
    }
  }
};

export const storeSessionAccount = async (signer) => {
  if (!signer) throw new Error('Signer instance is required.');

  // CosmJS signers expose getAccounts() which returns an array of accounts.
  const accounts = await signer.getAccounts();
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found in the signer.');
  }

  const { address, pubkey } = accounts[0];

  const pubkeyBase64 = btoa(String.fromCharCode.apply(null, pubkey));

  const accountInfo = {
    address,
    pubkey: pubkeyBase64 // Use the browser-safe Base64 string
  };

  try {
    // Persist to the browser session (cleared on tab close).
    sessionStorage.setItem('neutron_account', JSON.stringify(accountInfo));
    return accountInfo;
  } catch (err) {
    console.error('Failed to write account info to sessionStorage:', err);
    throw new Error('Unable to store account data locally.');
  }
};
