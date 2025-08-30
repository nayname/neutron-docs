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
