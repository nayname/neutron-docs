export const NLQueryPlugin = () => {
  // Use React.useState since React is globally available in this environment
  const [query, setQuery] = React.useState("Query transaction history for my address")//"Send 10 NTRN from my default wallet to Bob's address ntrn1bobaddressxx");
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isMarkedLoaded, setIsMarkedLoaded] = React.useState(false);
  const [expandedSteps, setExpandedSteps] = React.useState(new Set());

    // --- NEW: Structured data for workflows ---
    const WORKFLOWS = {
        "Withdraw 50 NTRN from the smart contract": [
            {
                tool: 'ensureWalletConnected',
                type: 'Frontend',
                description: 'Verify the wallet connection is active.',
                code: `const signer = await ensureWalletConnected()\nconst signer = await ensureWalletConnected()`
            },
            {
                tool: 'getWalletAddress',
                type: 'Frontend',
                description: 'Retrieve the wallet address from the signer.',
                code: `const address = await getWalletAddress(signer)`
            },
            {
                tool: 'queryBankBalance',
                type: 'Backend',
                description: 'Fetch the raw untrn balance from the API.',
                code: `const balance = await fetch('https://.../queryBankBalance?address='+address);`
            },
            {
                tool: 'formatAmount',
                type: 'Backend',
                description: 'Convert the raw untrn amount to a readable NTRN format.',
                code: `const result = await fetch('https://.../formatAmount?address=...');`
            }
        ],
        "Increment my personal counter": [
            {
                tool: 'ensureWalletConnected',
                type: 'Frontend',
                description: 'Verify the wallet connection is active.',
                code: `const signer = await ensureWalletConnected();`
            },
            {
                tool: 'get_sender_address',
                type: 'Frontend',
                description: 'Identify the caller’s wallet address.',
                code: `const myAddress = await getWalletAddress(signer);`
            },
            {
                tool: 'load_contract_address',
                type: 'Frontend',
                description: 'Retrieve the deployed contract address.',
                code: `const contractAddress = loadContractAddress();`
            },
            {
                tool: 'construct_wasm_execute_msg',
                type: 'Frontend',
                description: 'Build the execute message: {"increment_personal":{}}.',
                code: `const execMsg = constructTxWasmExecute(myAddress, contractAddress, { increment_personal: {} });`
            }
        ]
    };

    // A list of example intents with their implementation status
    const intents = [
        { text: "Query the connected wallet’s NTRN balance", implemented: true },
        { text: "Query transaction history for my address", implemented: true },
        { text: "Connect Keplr wallet", implemented: true },
        { text: "Increment my personal counter", implemented: true },
        { text: "Withdraw 50 NTRN from the smart contract", implemented: true },
        { text: "Send 10 NTRN to a specified recipient address", implemented: false },
        { text: "Remove the cron schedule named \"daily_rewards\"", implemented: false },
        { text: "Enable mobile wallet support", implemented: false },
    ];

  // This effect runs once when the component mounts to load the marked.js script
  React.useEffect(() => {
    // Check if the script is already loaded to avoid duplicates
    if (window.marked) {
      setIsMarkedLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    script.async = true;

    // When the script finishes loading, update the state
    script.onload = () => {
      setIsMarkedLoaded(true);
    };

    // Add the script to the document's body
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component is unmounted
    return () => {
      document.body.removeChild(script);
    };
  }, []); // The empty array ensures this effect runs only once

  // Function to safely parse and render Markdown
  const renderMarkdown = (markdownText) => {
    // Check if the 'marked' library is available on the window, like in the original script
    if (window.marked) {
      return { __html: window.marked.parse(markdownText) };
    }
    return { __html: markdownText }; // Fallback to plain text if marked.js is not found
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);
    setError('');
    setExpandedSteps(new Set());

    try {
           const result = await fetch('https://api.thousandmonkeystypewriter.org/generate_reponse', {
             method: 'POST',
             body: JSON.stringify({ text: query }),
             headers: { 'Content-Type': 'application/json' }
           });

           const data = await result.json();

        if (query === "Withdraw 50 NTRN from the smart contract") {
            const executedSteps = [];
            const baseWorkflow = WORKFLOWS[query];

            const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
            executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

            const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
            executedSteps.push({ ...baseWorkflow[1], output: senderAddress });

            await validateAddressFormat(loadContractAddress());//step: 3 Tool: validate_contract_address Desciption: Ensure the provided contract address is a valid Neutron CosmWasm address.",
            const funds = convertToBaseUnits(100);  // \u2192 \"100000000\"//step: 4 Tool: convert_to_base_units Desciption: Convert 100 NTRN to 100 000 000 untrn.",
            const execMsg = constructTxWasmExecute(senderAddress, loadContractAddress(), { deposit: {} }, [{ amount: funds, denom: 'untrn' }]);//step: 5 Tool: construct_tx_wasm_execute Desciption: Create a `MsgExecuteContract` with `{ \"deposit\": {} }` as the message payload and attach 100 000 000 untrn as funds.",
            const txHash = await signAndBroadcast(signer, senderAddress, [execMsg], 'auto');//step: 6 Tool: sign_and_broadcast_tx Desciption: Prompt the wallet to sign and broadcast the execution transaction."

            // alert(`${formattedData.balance}, ${formattedData.address}`);
            setResponse({ label: data.label, params: data.params, workflow: executedSteps, ui_mesages: `Balance: 0` });

        } else if (query === "Query transaction history for my address"){
            const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
            const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",

            const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
              method: 'POST',
              body: JSON.stringify({ text: query, address: senderAddress }),
              headers: { 'Content-Type': 'application/json' }
            });

            setResponse({"label": "Others", "params": "UNDEF", "ui_mesages": "execMsg:"+JSON.stringify(execMsg)+"\n txHash"+txHash});
        } else if (query === "Connect a user’s wallet to the dApp") {
            const signer = await connectWallet('keplr');
		    await ensureNeutronNetwork();
		    const account = await storeSessionAccount(signer);
            alert('Connected Neutron address:'+ account.address);
        } else if (query === "Query the connected wallet’s NTRN balance") {
            const signer = await ensureWalletConnected()
            const address = await getWalletAddress(signer)

            const balance = await fetch('https://api.thousandmonkeystypewriter.org/queryBankBalance?address='+address, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!balance.ok) {
              const errorData = await result.json();
              throw new Error(errorData.error || `HTTP error! Status: ${result.status}`);
            }
            const blnc = await balance.json();

            const result = await fetch('https://api.thousandmonkeystypewriter.org/formatAmount?address='
                +address+'&untrn_balance='+blnc.raw_balance, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!result.ok) {
              const errorData = await result.json();
              throw new Error(errorData.error || `HTTP error! Status: ${result.status}`);
            }

            const data = await result.json();
            alert(data.balance+", "+data.address);
        } else if (query === "Connect Keplr wallet") {
            await ensureWalletConnected();//step: 1 Tool: install_keplr_extension Desciption: Ensure the Keplr browser extension is installed and unlocked.",
		    await suggestNeutronChain(window.keplr);//step: 2 Tool: suggest_chain_to_keplr Desciption: From the dApp (NeutronTemplate) call window.keplr.experimentalSuggestChain with Neutron chain parameters (chainId, rpc/rest endpoints, stake currency).",
		    const accessGranted = await ensureNeutronNetwork();//step: 3 Tool: keplr_enable_chain Desciption: Invoke window.keplr.enable('neutron-1') (or 'pion-1') to trigger the approval popup and grant site access.",
		    const { signer, address } = await getOfflineSignerAndAddress('neutron-1');//step: 4 Tool: get_keplr_offline_signer Desciption: Fetch the OfflineSigner via window.getOfflineSigner('neutron-1') and store the user’s first address in app state."
        } else if (query === "Connect Leap wallet") {
            await connectWallet('leap');//step: 1 Tool: detect_leap_provider Desciption: Check for window.leap or use @cosmos-kit/leap adapter to detect the Leap extension.",
		    await suggestNeutronChain(window.leap);//step: 2 Tool: leap_suggest_chain Desciption: Send the chain configuration object to window.leap.experimentalSuggestChain so Leap knows about Neutron.",
		    await ensureNeutronNetwork();//step: 3 Tool: leap_enable_chain Desciption: Call window.leap.enable('neutron-1') to request user approval.",
		    const { address, signer } = await getOfflineSignerAndAddress('neutron-1');//step: 4 Tool: retrieve_leap_accounts Desciption: Use window.leap.getOfflineSigner('neutron-1') and store the primary address for subsequent tx signing."
		} else if (query === "Enable mobile wallet support") {
//             UNDEF
        } else if (query === "Increment my personal counter") {
            const signer = await ensureWalletConnected();
            const myAddress = await getWalletAddress(signer);//step: 1 Tool: get_sender_address Desciption: Identify the caller\u2019s wallet address (this will also become the key for their personal counter).",
            const contractAddress = loadContractAddress();//step: 2 Tool: load_contract_address Desciption: Retrieve or confirm the deployed NeutronTemplate contract address that exposes the counter API.",
            const execMsg = constructTxWasmExecute(myAddress, contractAddress, { increment_personal: {} });//step: 3 Tool: construct_wasm_execute_msg Desciption: Build the execute message: {\"increment_personal\":{}} targeted at the contract address."
        } else if (query === "Increment the global counter") {
            await ensureWalletConnected();
            const { address, signer } = await getOfflineSignerAndAddress('neutron-1');//step: 1 Tool: get_sender_address Desciption: Identify the caller’s wallet (needed for fee payment and signing).",
		    const contractAddress = loadContractAddress();//step: 2 Tool: load_contract_address Desciption: Retrieve or confirm the deployed NeutronTemplate contract address.",
		    const execMsg = constructTxWasmExecute(address, contractAddress, { increment_global: {} });//step: 3 Tool: construct_wasm_execute_msg Desciption: Build the execute message: {\"increment_global\":{}}."
		} else if (query === "Query contract metadata on Celatone"){
           const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
              method: 'POST',
              body: JSON.stringify({ text: query, address: loadContractAddress() }),
              headers: { 'Content-Type': 'application/json' }
           });

           setResponse({"label": "Others", "params": "UNDEF", "ui_mesages": "execMsg:"+JSON.stringify(execMsg)+"\n txHash"+txHash});
        } else if (query === "Query the code hash of a specific smart contract") {
            const { address, signer } = await getOfflineSignerAndAddress();//step: 1 Tool: get_sender_address Desciption: Determine the caller\u2019s address which will be supplied in the query.",
            const contract = loadContractAddress();//step: 2 Tool: load_contract_address Desciption: Fetch the deployed NeutronTemplate contract address.",
            const queryMsg = constructWasmQueryMsg(address);//step: 3 Tool: construct_wasm_query_msg Desciption: Create the smart-query payload: {\"get_personal_counter\":{\"address\":\"<sender>\"}}.",
            const counter = await queryContractSmart(contract, queryMsg);//step: 4 Tool: query_contract_smart Desciption: Execute the query against the contract and return the counter value."
        } else if (query === "Withdraw 50 NTRN from the smart contract") {
            const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Verify the wallet connection is active.",
            await validateAddressFormat(contractAddress);//step: 2 Tool: validate_contract_address Desciption: Check that the contract address is valid.",
            const microAmount = convertToBaseUnits('50'); // \u279c \"50000000\"//step: 3 Tool: convert_to_base_units Desciption: Convert 50 NTRN to 50 000 000 untrn.",
            const execMsg = constructTxWasmExecute(sender, contractAddr, { withdraw: { amount: microAmount } }, []);//step: 4 Tool: construct_tx_wasm_execute Desciption: Build a `MsgExecuteContract` with `{ \"withdraw\": { \"amount\": \"50000000\" } }` and no attached funds.",
            const txHash = await signAndBroadcast(signer, sender, [execMsg], 'auto');//step: 5 Tool: sign_and_broadcast_tx Desciption: Prompt the wallet to sign and broadcast the withdrawal transaction."

            const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
              method: 'POST',
              body: JSON.stringify({ text: query, address: sender }),
              headers: { 'Content-Type': 'application/json' }
           });
        } else if (query === "Query my deposited NTRN amount") {
            const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Verify the wallet connection is active.",
            const sender = await getWalletAddress(signer);//step: 1 Tool: get_sender_address Desciption: Identify the wallet address whose deposit balance is being requested.",
            const contractAddr = loadContractAddress();//step: 2 Tool: load_contract_address Desciption: Retrieve the NeutronTemplate contract address.",
            const queryMsg = constructWasmQueryMsg(sender);//step: 3 Tool: construct_wasm_query_msg Desciption: Build the query payload: {\"get_deposit\":{\"address\":\"<sender>\"}}.",
            const depositInfo = await queryContractSmart(contractAddr, queryMsg);//step: 4 Tool: query_contract_smart Desciption: Execute the smart query to obtain the deposited NTRN amount."
        } else if (query === "Show the current block height of the Neutron chain") {
            const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
              method: 'POST',
              body: JSON.stringify({ text: query }),
              headers: { 'Content-Type': 'application/json' }
           });
       } else if (query === "Query the global counter value") {
            const contractAddr = loadContractAddress();//step: 1 Tool: load_contract_address Desciption: Fetch the deployed NeutronTemplate contract address.",
            const queryMsg = constructWasmQueryMsg();//step: 2 Tool: construct_wasm_query_msg Desciption: Create the query payload: {\"get_global_counter\":{}}.",
            const counter = await queryContractSmart(contractAddr, queryMsg);//step: 3 Tool: query_contract_smart Desciption: Perform the smart-query and retrieve the global counter value."
       } else if (query === "Query my personal counter value") {
            const { address, signer } = await getOfflineSignerAndAddress();//step: 1 Tool: get_sender_address Desciption: Determine the caller\u2019s address which will be supplied in the query.",
            const contract = loadContractAddress();//step: 2 Tool: load_contract_address Desciption: Fetch the deployed NeutronTemplate contract address.",
            const queryMsg = constructWasmQueryMsg(address);//step: 3 Tool: construct_wasm_query_msg Desciption: Create the smart-query payload: {\"get_personal_counter\":{\"address\":\"<sender>\"}}.",
            const counter = await queryContractSmart(contract, queryMsg);//step: 4 Tool: query_contract_smart Desciption: Execute the query against the contract and return the counter value."
       }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const handleIntentClick = async (intentText) => {
        // Set the text in the textarea
        setQuery(intentText);
        // Immediately execute the query
        await handleSubmit(intentText);
    };


    const toggleStep = (index) => {
        setExpandedSteps(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

  const handleQuery = async () => {
    setLoading(true);
    setResponse(null);
    setError('');

    try {

        // const signer = await ensureWalletConnected()
      // const address = await getWalletAddress(signer)
      //
      // const balance = await fetch('https://api.thousandmonkeystypewriter.org/queryBankBalance?address='+address, {
      //   method: 'GET',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      //
      // if (!balance.ok) {
      //   const errorData = await result.json();
      //   throw new Error(errorData.error || `HTTP error! Status: ${result.status}`);
      // }
      // const blnc = await balance.json();
      //
      // const result = await fetch('https://api.thousandmonkeystypewriter.org/formatAmount?address='
      //     +address+'&untrn_balance='+blnc.raw_balance, {
      //   method: 'GET',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      //
      // if (!result.ok) {
      //   const errorData = await result.json();
      //   throw new Error(errorData.error || `HTTP error! Status: ${result.status}`);
      // }
      //
      // const data = await result.json();
      // alert(data.balance+", "+data.address);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="p-4 border rounded-lg bg-white font-sans text-gray-800">

      <h4 className="text-lg font-semibold mb-2">NL Execution Module</h4>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your natural language query"
        rows={3}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
      >
          {loading ? (
            <>
              {/* Simple spinner for loading state */}
              <div style={{
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                animation: 'spin 1s linear infinite'
              }} className="mr-2"></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <span>Processing...</span>
            </>
          ) : 'Execute'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-6 border-t pt-6 space-y-4">
            <div className="flex items-center gap-x-4">
                <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Intent / Label</h5>
                <p className="text-lg font-semibold text-blue-700 bg-blue-50 py-2 px-3 rounded-md">{response.label}</p>
            </div>
          <div>
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Extracted Parameters</h5>
            <pre className="mt-1 text-sm bg-gray-100 p-4 rounded-md overflow-x-auto">
              <code>{JSON.stringify(response.params, null, 2)}</code>
            </pre>
          </div>
            {/* --- NEW: Workflow Steps Section --- */}

            {response.workflow && response.workflow.length > 0 && (
                <div>
                    <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Execution Workflow</h5>
                    <div className="mt-1 border rounded-md">
                        {response.workflow.map((step, index) => (
                            <div key={index} className={`p-3 ${index < response.workflow.length - 1 ? 'border-b' : ''}`}>
                                <div className="flex items-center gap-x-3">
                                    <span className="font-semibold text-gray-800">{step.tool}</span>
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${step.type === 'Frontend' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                                        {step.type}
                                    </span>
                                    <button onClick={() => toggleStep(index)} className="text-sm text-blue-600 hover:underline">
                                        {expandedSteps.has(index) ? 'Hide Code' : 'Show Code'}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{step.description}</p>

                                {step.output && (
                                    <div className="mt-3">
                                        <h6 className="text-xs font-semibold text-gray-500 uppercase">Output</h6>
                                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
                          <code>{step.output}</code>
                        </pre>
                                    </div>
                                )}

                                {expandedSteps.has(index) && (
                                    <div className="mt-3">
                                        <h6 className="text-xs font-semibold text-gray-500 uppercase">Code</h6>
                                        <pre className="mt-1 text-xs bg-gray-900 text-white p-3 rounded-md overflow-x-auto">
                           <code>{step.code}</code>
                         </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
          <div>
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">What the User Sees</h5>
            {/* FIX: Use a <pre> tag to respect newlines and formatting without needing a Markdown parser */}
            <div
              className="mt-1 text-sm bg-gray-100 p-4 rounded-md overflow-x-auto prose"
              dangerouslySetInnerHTML={{ __html: (isMarkedLoaded && window.marked) ? window.marked.parse(response.ui_mesages) : response.ui_mesages }}
            />
          </div>
        </div>
      )}

        {/* List of clickable intents */}
        <div className="mt-4">
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Or try one of these:</h5>
            <div className="flex flex-wrap gap-2">
                {intents.map((intent, index) => (
                    <button
                        key={index}
                        onClick={() => handleIntentClick(intent.text)}
                        disabled={!intent.implemented || loading}
                        title={intent.implemented ? 'Click to run' : 'This feature is not yet implemented'}
                        className="flex items-center gap-2 text-sm px-3 py-1 border rounded-full transition-colors hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        <span>{intent.implemented ? '✅' : '❌'}</span>
                        <span>{intent.text}</span>
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};