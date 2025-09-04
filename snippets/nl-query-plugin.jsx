import {loadContractAddress} from "./walletUtils.jsx";

export const NLQueryPlugin = () => {
  // Use React.useState since React is globally available in this environment
  const [query, setQuery] = React.useState("Query transaction history for my address")//"Send 10 NTRN from my default wallet to Bob's address ntrn1bobaddressxx");
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isMarkedLoaded, setIsMarkedLoaded] = React.useState(false);
  const [expandedSteps, setExpandedSteps] = React.useState(new Set());

    // A list of example intents with their implementation status
    const intents = [
        { text: "Connect a user’s wallet to the dApp", implemented: true },
        { text: "Show the current block height of the Neutron chain", implemented: true },
        { text: "Query the connected wallet’s NTRN balance", implemented: true },
        { text: "Query transaction history for my address", implemented: true },
        { text: "Withdraw 50 NTRN from the smart contract", implemented: true },
        { text: "Query the global counter value", implemented: true },
        { text: "Query my personal counter value", implemented: true },
        { text: "Connect Keplr wallet", implemented: true },
        { text: "List all smart contracts deployed by my account", implemented: true },
        { text: "Query my deposited NTRN amount", implemented: true },
        { text: "Increment my personal counter", implemented: true },
        { text: "Increment the global counter", implemented: true },
        { text: "Connect Leap wallet", implemented: true },
        { text: "Query contract metadata on Celatone", implemented: false },
        { text: "Query the code hash of a specific smart contract", implemented: false },
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

 const handleSubmit = async (queryToExecute = query) => {
    setLoading(true);
    setResponse(null);
    setError('');
    setExpandedSteps(new Set());

    try {
           const result = await fetch('https://api.thousandmonkeystypewriter.org/generate_reponse', {
             method: 'POST',
             body: JSON.stringify({ text: queryToExecute }),
             headers: { 'Content-Type': 'application/json' }
           });

           const data = await result.json();

        if (queryToExecute === "Withdraw 50 NTRN from the smart contract") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
            executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

            const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
            executedSteps.push({ ...baseWorkflow[1], output: senderAddress });

            const valid = await validateAddressFormat(loadContractAddress());//step: 3 Tool: validate_contract_address Desciption: Ensure the provided contract address is a valid Neutron CosmWasm address.",
            executedSteps.push({ ...baseWorkflow[2], output: valid ? '✅ Address valid' : '❌ Address invalid' });

            const funds = convertToBaseUnits(50);  // \u2192 \"100000000\"//step: 4 Tool: convert_to_base_units Desciption: Convert 100 NTRN to 100 000 000 untrn.",
            executedSteps.push({ ...baseWorkflow[3], output: 'You want to withdraw'+funds });

            const execMsg = constructTxWasmExecute(senderAddress, loadContractAddress(), { deposit: {} }, [{ amount: funds, denom: 'untrn' }]);//step: 5 Tool: construct_tx_wasm_execute Desciption: Create a `MsgExecuteContract` with `{ \"deposit\": {} }` as the message payload and attach 100 000 000 untrn as funds.",
            executedSteps.push({ ...baseWorkflow[4], output: 'execMsg: '+JSON.stringify(execMsg) });

            const txHash = await signAndBroadcast(signer, senderAddress, [execMsg], 'auto');//step: 6 Tool: sign_and_broadcast_tx Desciption: Prompt the wallet to sign and broadcast the execution transaction."
            executedSteps.push({ ...baseWorkflow[5], output: 'Transaction hash: '+txHash });

            // alert(`${formattedData.balance}, ${formattedData.address}`);
            setResponse({ label: data.label, params: data.params, workflow: executedSteps });

        } else if (queryToExecute === "Query transaction history for my address"){
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
            executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

            const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
            executedSteps.push({ ...baseWorkflow[1], output: senderAddress });

            const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
              method: 'POST',
              body: JSON.stringify({ text: queryToExecute, address: senderAddress }),
              headers: { 'Content-Type': 'application/json' }
            });

            const res = await result.text();
            if (res.includes("No data provider is reachable at the moment.")) {
                executedSteps.push({ ...baseWorkflow[2], output: "Error: No data provider is reachable at the moment." });
            }
            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Connect a user’s wallet to the dApp") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const signer = await connectWallet('keplr');
            executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

            const accessGranted = await ensureNeutronNetwork();
            executedSteps.push({ ...baseWorkflow[1], output: accessGranted ? '✅ Access to Neutron network granted.' : '❌ Access denied.' });

		    const account = await storeSessionAccount(signer);
            executedSteps.push({ ...baseWorkflow[2], output: 'Connected Neutron address:'+ account.address });

            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Query the connected wallet’s NTRN balance") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const signer = await ensureWalletConnected()
            executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

            const address = await getWalletAddress(signer)
            executedSteps.push({ ...baseWorkflow[1], output: address });

            const balance = await fetch('https://api.thousandmonkeystypewriter.org/queryBankBalance?address='+address, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!balance.ok) {
              const errorData = await result.json();
              throw new Error(errorData.error || `HTTP error! Status: ${result.status}`);
            }
            const blnc = await balance.json();
            executedSteps.push({ ...baseWorkflow[2], output: "Raw balance: "+JSON.stringify(blnc) });

            const result = await fetch('https://api.thousandmonkeystypewriter.org/formatAmount?address='
                +address+'&untrn_balance='+blnc.raw_balance, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });

            if (!result.ok) {
              const errorData = await result.json();
              throw new Error(errorData.error || `HTTP error! Status: ${result.status}`);
            }

            const formatted_blnc = await result.json();
            executedSteps.push({ ...baseWorkflow[3], output: "Formatted blnc: "+JSON.stringify(formatted_blnc) });
            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Connect Keplr wallet") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            await ensureWalletConnected();
            executedSteps.push({ ...baseWorkflow[0], output: '✅ Keplr extension found and unlocked.' });

            await suggestNeutronChain(window.keplr);
            executedSteps.push({ ...baseWorkflow[1], output: '✅ Neutron chain suggested to Keplr.' });

            const accessGranted = await ensureNeutronNetwork();
            executedSteps.push({ ...baseWorkflow[2], output: accessGranted ? '✅ Access to Neutron network granted.' : '❌ Access denied.' });

            const { signer, address } = await getOfflineSignerAndAddress('neutron-1');
            executedSteps.push({ ...baseWorkflow[3], output: `✅ Signer ready for address: ${address}` });

            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Connect Leap wallet") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            await connectWallet('leap');
            executedSteps.push({ ...baseWorkflow[0], output: '✅ Leap wallet provider detected.' });

            await suggestNeutronChain(window.leap);
            executedSteps.push({ ...baseWorkflow[1], output: '✅ Neutron chain suggested to Leap.' });

            await ensureNeutronNetwork();
            executedSteps.push({ ...baseWorkflow[2], output: '✅ Access to Neutron network granted.' });

            const { address, signer } = await getOfflineSignerAndAddress('neutron-1');
            executedSteps.push({ ...baseWorkflow[3], output: `✅ Signer ready for address: ${address}` });

            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "List all smart contracts deployed by my account") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
            const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
            const valid = await validateAddressFormat(senderAddress);//step: 2 Tool: validate_new_admin_address Desciption: Ensure the provided new admin address is a valid Bech32 address.",
            executedSteps.push({ ...baseWorkflow[0], output: valid ? '✅ Address valid' : '❌ Address invalid' });

            const contractAddress = loadContractAddress();//step: 3 Tool: get_contract_address Desciption: Ask for the contract address whose admin will be changed."
            executedSteps.push({ ...baseWorkflow[1], output: 'Address: ' + contractAddress });

            const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                method: 'POST',
                body: JSON.stringify({ text: queryToExecute, address: senderAddress }),
                headers: { 'Content-Type': 'application/json' }
            });

            const res = await result.json();
            executedSteps.push({ ...baseWorkflow[2], output: JSON.stringify(res) });

            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Increment my personal counter") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const signer = await ensureWalletConnected();
            executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

            const myAddress = await getWalletAddress(signer);
            executedSteps.push({ ...baseWorkflow[1], output: `Address identified: ${myAddress}` });

            const contractAddress = loadContractAddress();
            executedSteps.push({ ...baseWorkflow[2], output: `Contract address loaded: ${contractAddress}` });

            const execMsg = constructTxWasmExecute(myAddress, contractAddress, { increment_personal: {} });
            executedSteps.push({ ...baseWorkflow[3], output: `Execute message built: ${JSON.stringify(execMsg.value.msg)}` });

            // In a real scenario, you would then call signAndBroadcast
            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Increment the global counter") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const { address, signer } = await getOfflineSignerAndAddress('neutron-1');
            executedSteps.push({ ...baseWorkflow[0], output: `✅ Wallet connected for address: ${address}` });

            const contractAddress = loadContractAddress();
            executedSteps.push({ ...baseWorkflow[1], output: `Contract address loaded: ${contractAddress}` });

            const execMsg = constructTxWasmExecute(address, contractAddress, { increment_global: {} });
            executedSteps.push({ ...baseWorkflow[2], output: `Execute message built: ${JSON.stringify(execMsg.value.msg)}` });

            // In a real scenario, you would then call signAndBroadcast
            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Query contract metadata on Celatone"){
           const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
              method: 'POST',
              body: JSON.stringify({ text: queryToExecute, address: loadContractAddress() }),
              headers: { 'Content-Type': 'application/json' }
           });

           setResponse({"label": "Others", "params": "UNDEF", "ui_mesages": "execMsg:"+JSON.stringify(execMsg)+"\n txHash"+txHash});
        } else if (queryToExecute === "Query the code hash of a specific smart contract") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const { address, signer } = await getOfflineSignerAndAddress();
            executedSteps.push({ ...baseWorkflow[0], output: `✅ Wallet connected for address: ${address}` });

            const contract = loadContractAddress();
            executedSteps.push({ ...baseWorkflow[1], output: `Contract address loaded: ${contract}` });

            const queryMsg = constructWasmQueryMsg(address);
            executedSteps.push({ ...baseWorkflow[2], output: `Query message constructed: ${JSON.stringify(queryMsg)}` });

            const counter = await queryContractSmart(contract, queryMsg);
            executedSteps.push({ ...baseWorkflow[3], output: `Response from contract: ${JSON.stringify(counter)}` });

            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Query my deposited NTRN amount") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const signer = await ensureWalletConnected();
            const sender = await getWalletAddress(signer);
            executedSteps.push({ ...baseWorkflow[0], output: `Address identified: ${sender}` });

            const contractAddr = loadContractAddress();
            executedSteps.push({ ...baseWorkflow[1], output: `Contract address loaded: ${contractAddr}` });

            const queryMsg = constructWasmQueryMsg(sender); // Assuming this needs to be adapted for get_deposit
            executedSteps.push({ ...baseWorkflow[2], output: `Query message built: ${JSON.stringify(queryMsg)}` });

            const depositInfo = await queryContractSmart(contractAddr, { all_users: { address: sender } });
            executedSteps.push({ ...baseWorkflow[3], output: `Response from contract: ${JSON.stringify(depositInfo)}` });

            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Show the current block height of the Neutron chain") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
              method: 'POST',
              body: JSON.stringify({ text: queryToExecute }),
              headers: { 'Content-Type': 'application/json' }
            });

            const res = await result.json();

            let i = 0
            for (const item of res) {
                executedSteps.push({ ...baseWorkflow[i], output: item });
                i += 1
            }

            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
       } else if (queryToExecute === "Query the global counter value") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const contractAddr = loadContractAddress();
            executedSteps.push({ ...baseWorkflow[0], output: `Contract address loaded: ${contractAddr}` });

            const queryMsg = constructWasmQueryMsg();
            executedSteps.push({ ...baseWorkflow[1], output: `Query message built: ${JSON.stringify(queryMsg)}` });

            const counter = await queryContractSmart(contractAddr, queryMsg);
            executedSteps.push({ ...baseWorkflow[2], output: `Response from contract: ${JSON.stringify(counter)}` });

            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        } else if (queryToExecute === "Query my personal counter value") {
            const executedSteps = [];
            const baseWorkflow = data.workflow;

            const { address, signer } = await getOfflineSignerAndAddress();
            executedSteps.push({ ...baseWorkflow[0], output: `✅ Wallet connected for address: ${address}` });

            const contract = loadContractAddress();
            executedSteps.push({ ...baseWorkflow[1], output: `Contract address loaded: ${contract}` });

            const queryMsg = constructWasmQueryMsg(address);
            executedSteps.push({ ...baseWorkflow[2], output: `Query message built: ${JSON.stringify(queryMsg)}` });

            const counter = await queryContractSmart(contract, queryMsg);
            executedSteps.push({ ...baseWorkflow[3], output: `Response from contract: ${JSON.stringify(counter)}` });

            setResponse({ label: data.label, params: data.params, workflow: executedSteps });
        }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const handleIntentClick = async (intentText) => {
        // Set the text in the textarea
        await setQuery(intentText);
        // Immediately execute the query
        await handleSubmit(intentText);
    };

    const handleExecuteClick = () => {
        // This function is intentionally left empty.
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

      <h4 className="text-lg font-semibold mb-2">Natural Language Execution Module</h4>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your natural language query"
        rows={3}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleExecuteClick}
        disabled={loading}
        className="w-full mt-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg cursor-not-allowed disabled:bg-blue-300 flex items-center justify-center"
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

        <p className="text-xs text-center text-gray-500 mt-2">
            Manual queries are currently disabled. Please select an intent from the list below to execute a workflow.
        </p>

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
          {/*<div>*/}
          {/*  <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Extracted Parameters</h5>*/}
          {/*  <pre className="mt-1 text-sm bg-gray-100 p-4 rounded-md overflow-x-auto">*/}
          {/*    <code>{JSON.stringify(response.params, null, 2)}</code>*/}
          {/*  </pre>*/}
          {/*</div>*/}
            {/* --- NEW: Workflow Steps Section --- */}

            {response.workflow && response.workflow.length > 0 && (
                <div>
                    <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Execution Workflow (Code Examples)</h5>
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
                                        <h6 className="text-xs font-semibold text-green-600 uppercase">Output (terminal)</h6>
                                        <pre className="mt-1 text-xs bg-gray-900 text-white p-3 rounded-md overflow-x-auto">
                                          <code>{step.output}</code>
                                        </pre>
                                    </div>
                                )}

                                {expandedSteps.has(index) && (
                                    <div className="mt-3">
                                        <h6 className="text-xs font-semibold text-gray-500 uppercase">Code</h6>
                                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded-md overflow-x-auto">
                           <code>{step.code}</code>
                         </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
{/*           <div> */}
{/*             <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">What the User Sees</h5> */}
{/*              */}{/* FIX: Use a <pre> tag to respect newlines and formatting without needing a Markdown parser */}
{/*             <div */}
{/*               className="mt-1 text-sm bg-gray-100 p-4 rounded-md overflow-x-auto prose" */}
{/*               dangerouslySetInnerHTML={{ __html: (isMarkedLoaded && window.marked) ? window.marked.parse(response.ui_mesages) : response.ui_mesages }} */}
{/*             /> */}
{/*           </div> */}
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