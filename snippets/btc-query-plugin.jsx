import {loadContractAddress, signAndBroadcast} from "./walletUtils.jsx";

export const NLQueryPlugin = () => {
    // Use React.useState since React is globally available in this environment
    // const [query, setQuery] = React.useState("Query transaction history for my address")//"Send 10 NTRN from my default wallet to Bob's address ntrn1bobaddressxx");
    const [query, setQuery] = React.useState(null)//"Send 10 NTRN from my default wallet to Bob's address ntrn1bobaddressxx");
    const [response, setResponse] = React.useState(null);
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [isMarkedLoaded, setIsMarkedLoaded] = React.useState(false);
    const [expandedSteps, setExpandedSteps] = React.useState(new Set());
    const [loadingDots, setLoadingDots] = React.useState(1);
    const [executionLevel, setExecutionLevel] = React.useState('Mock');
    const [showTrustBanner, setShowTrustBanner] = React.useState(true);

    const levels = [
        { label: 'Mock', color: 'bg-gray-200 text-gray-800', description: 'Local simulation, no chain writes.' },
        { label: 'Read-only', color: 'bg-blue-100 text-blue-800', description: 'Safe blockchain queries only.' },
        { label: 'Testnet', color: 'bg-yellow-100 text-yellow-800', description: 'Write ops in test environment.' },
        { label: 'Mainnet', color: 'bg-green-100 text-green-800', description: 'Production execution with wallet approval.' },
    ];

    // A list of example intents with their implementation status
    const intents = [
        {text: "Check my health factor on Amber Finance", implemented: true},
        {text: "Deposit 3 eBTC into the maxBTC/eBTC Supervault", implemented: true},
        {text: "Execute an emergency withdrawal for the user's Amber trading position", implemented: true},
        {
            text: "Increase the user's deposit in the WBTC/USDC Supervault by 0.2 WBTC and 12 000 USDC",
            implemented: true
        },
        {text: "Enable USDC gas payments for my next transaction", implemented: true},
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

    // ----- ADDED EFFECT FOR ANIMATING LOADING DOTS -----
    React.useEffect(() => {
        let intervalId;
        if (loading) {
            // Reset dots to 1 immediately when loading starts
            setLoadingDots(1);
            intervalId = setInterval(() => {
                // Cycle dots from 1 -> 2 -> 3 -> 1
                setLoadingDots(dots => (dots % 3) + 1);
            }, 500); // Change dots every 500ms
        }

        // Cleanup function to clear the interval
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [loading]); // This effect depends only on the 'loading' state

    // Function to safely parse and render Markdown
    const renderMarkdown = (markdownText) => {
        // Check if the 'marked' library is available on the window, like in the original script
        if (window.marked) {
            return {__html: window.marked.parse(markdownText)};
        }
        return {__html: markdownText}; // Fallback to plain text if marked.js is not found
    };

    const handleSubmit = async (queryToExecute = query) => {
        setLoading(true);
        setResponse(null);
        setError('');
        setExpandedSteps(new Set());

        try {
            const result = await fetch('https://api.thousandmonkeystypewriter.org/generate_reponse', {
                method: 'POST',
                body: JSON.stringify({text: queryToExecute}),
                headers: {'Content-Type': 'application/json'}
            });

            const data = await result.json();

            if (queryToExecute === "Check my health factor on Amber Finance") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
                var date = new Date();
                executedSteps.push({
                    ...baseWorkflow[0],
                    output: signer ? '['+date.toISOString()+'] '+'✅ Signer object received' : '['+date.toISOString()+'] '+'❌ Failed to get signer'
                });

                const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
                executedSteps.push({...baseWorkflow[1], output: senderAddress});

                const positions = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({text: queryToExecute, address: senderAddress}),
                    headers: {'Content-Type': 'application/json'}
                });

                let res = await positions.json();
                var date = new Date();
                executedSteps.push({...baseWorkflow[2], output: '['+date.toISOString()+'] '+"positions: " + JSON.stringify(res)});

                const computed = calculateHealthFactor(res.positions);//step: 3 Tool: calculate_health_factor Desciption: Compute or read the health factor metric returned by Amber for each position.",
                var date = new Date();
                executedSteps.push({...baseWorkflow[3], output: '['+date.toISOString()+'] '+"Data normalized"});

                const summary = presentResults(computed);//step: 4 Tool: present_results Desciption: Return a formatted summary: position ID → health factor, collateral, debt."
                var date = new Date();
                executedSteps.push({...baseWorkflow[4], output: '['+date.toISOString()+'] '+"Final result:" + summary});

                setResponse({label: data.label, params: {}, workflow: executedSteps});
            } else if (queryToExecute === "Deposit 3 eBTC into the maxBTC/eBTC Supervault") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
                executedSteps.push({
                    ...baseWorkflow[0],
                    output: signer ? '✅ Signer object received' : '❌ Failed to get signer'
                });

                const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
                executedSteps.push({...baseWorkflow[1], output: "User address:" + senderAddress});

                const amount = await checkEbtcBalance(senderAddress, '3000000')//step: 2 Tool: check_token_balance Desciption: Ensure the wallet has at least 3 eBTC available on Neutron."
                executedSteps.push({...baseWorkflow[2], output: "User has " + amount.amountMicro + " eBTC"});

                const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({text: queryToExecute, address: senderAddress}),
                    headers: {'Content-Type': 'application/json'}
                });

                const res = await result.json();

                let i = 3
                for (const item of res) {
                    executedSteps.push({...baseWorkflow[i], output: item});
                    i += 1
                }

                setResponse({label: data.label, params: {}, workflow: executedSteps});
            } else if (queryToExecute === "Execute an emergency withdrawal for the user's Amber trading position") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
                executedSteps.push({
                    ...baseWorkflow[0],
                    output: signer ? '✅ Signer object received' : '❌ Failed to get signer'
                });

                const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
                executedSteps.push({...baseWorkflow[1], output: senderAddress});

                const positions = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({text: queryToExecute, address: senderAddress}),
                    headers: {'Content-Type': 'application/json'}
                });

                let res = await positions.json();
                executedSteps.push({...baseWorkflow[2], output: "positions: " + JSON.stringify(res)});

                let position_id = 1
                const txMsg = constructTxWasmExecute(senderAddress, loadContractAddress(), {emergency_withdraw: {position_id}}, []);//step: 3 Tool: construct_tx_amber_emergency_withdraw Desciption: Build the emergency_withdraw transaction message with the selected position_id.",
                executedSteps.push({...baseWorkflow[3], output: "Transaction message:" + JSON.stringify(txMsg)});

                const txHash = await signAndBroadcast(signer, senderAddress, [txMsg], 'auto');//step: 6 Tool: sign_and_broadcast_tx Desciption: Prompt the wallet to sign and broadcast the execution transaction."
                executedSteps.push({...baseWorkflow[4], output: 'Transaction hash: ' + txHash});

                setResponse({label: data.label, params: {}, workflow: executedSteps});
            } else if (queryToExecute === "Increase the user's deposit in the WBTC/USDC Supervault by 0.2 WBTC and 12 000 USDC") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
                executedSteps.push({
                    ...baseWorkflow[0],
                    output: signer ? '✅ Signer object received' : '❌ Failed to get signer'
                });

                const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
                executedSteps.push({...baseWorkflow[1], output: "User address:" + senderAddress});

                const amount = await checkEbtcBalance(senderAddress, '3000000')//step: 2 Tool: check_token_balance Desciption: Ensure the wallet has at least 3 eBTC available on Neutron."
                executedSteps.push({...baseWorkflow[2], output: "User has " + amount.amountMicro + " eBTC"});

                const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({text: queryToExecute, address: senderAddress}),
                    headers: {'Content-Type': 'application/json'}
                });

                const res = await result.json();

                let i = 3
                for (const item of res) {
                    executedSteps.push({...baseWorkflow[i], output: item});
                    i += 1
                }

                setResponse({label: data.label, params: {}, workflow: executedSteps});
            } else if (queryToExecute === "Enable USDC gas payments for my next transaction") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const {eligible} = await isFeeDenomEligible('uusdc');//step: 1 Tool: query_dynamic_fees_supported_assets Desciption: Call `/neutron/dynamicfees/params` to confirm that \"uusdc\" (USDC-denom) is in `ntrn_prices` and thus fee-eligible.",
                executedSteps.push({...baseWorkflow[0], output: "Confirm that denom in `ntrn_prices` is " + eligible});

                const minGasPrice = await getMinGasPrice('uusdc');//step: 2 Tool: query_global_fee_minimum Desciption: Query `/neutron/globalfee/min_gas_prices` to fetch the minimum gas price required for the \"uusdc\" denom.",
                // setDefaultFeeDenom('uusdc');//step: 3 Tool: set_wallet_default_fee_denom Desciption: Configure the local wallet/CLI to default to \"uusdc\" fees (e.g., `export NEUTRON_FEE_DENOM=uusdc`)."
                executedSteps.push({...baseWorkflow[1], output: " Minimum gas price " + minGasPrice});

                const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({text: queryToExecute}),
                    headers: {'Content-Type': 'application/json'}
                });

                const res = await result.json();

                let i = 2
                for (const item of res) {
                    executedSteps.push({...baseWorkflow[i], output: item});
                    i += 1
                }
                setResponse({label: data.label, params: {}, workflow: executedSteps});
            } else {
                const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({text: queryToExecute}),
                    headers: {'Content-Type': 'application/json'}
                });

                const res = await result.json();
            }
        } catch (err) {
            alert(err.message)
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


    const handleKeyDown = async (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent new line on Enter
            await handleSubmit(query);
        }
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

    const handleInput = (event) => {
        // Reset height to 'auto' to allow shrinking
        event.target.style.height = 'auto';
        // Set height to match the content's full height
        event.target.style.height = `${event.target.scrollHeight}px`;
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
        <div id="panel"
             className="z-20 fixed right-0 w-[23rem] border-l border-gray-500/5 dark:border-gray-300/[0.06] bg-background-light dark:bg-background-dark h-[calc(100vh-9.5rem)] top-[9.5rem] lg:h-[calc(100vh-6.5rem)] lg:top-[6.5rem] transition-[width] duration-300 ease-in-out"
             style={{width: '469px', minWidth: '441px', maxWidth: '691px'}}> {/* <-- MODIFIED */}
            <div
                className="absolute -left-1 top-0 bottom-0 w-1 cursor-col-resize hover:bg-gray-200/70 dark:hover:bg-white/[0.07] z-10"
                style={{cursor: 'col-resize'}}></div>
            {/* <-- CHANGED */}
            <div id="chat-assistant-sheet"
                 className="absolute inset-0 -top-px min-h-full flex flex-col overflow-hidden shrink-0 chat-assistant-sheet"
                 aria-hidden="false">
                <div className="w-full flex flex-col pb-4 h-full lg:pt-3">
                    <div className="chat-assistant-sheet-header flex items-center justify-between pb-3 px-4">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"
                                 className="size-5 text-primary dark:text-primary-light"
                                 style={{color: 'rgb(22, 110, 63)'}}>
                                <g fill="currentColor">
                                    <path
                                        d="M5.658,2.99l-1.263-.421-.421-1.263c-.137-.408-.812-.408-.949,0l-.421,1.263-1.263,.421c-.204,.068-.342,.259-.342,.474s.138,.406,.342,.474l1.263,.421,.421,1.263c.068,.204,.26,.342,.475,.342s.406-.138,.475-.342l.421-1.263,1.263-.421c.204-.068,.342-.259,.342-.474s-.138-.406-.342-.474Z"
                                        fill="currentColor" data-stroke="none" stroke="none"></path>
                                    <polygon
                                        points="9.5 2.75 11.412 7.587 16.25 9.5 11.412 11.413 9.5 16.25 7.587 11.413 2.75 9.5 7.587 7.587 9.5 2.75"
                                        fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5"></polygon>
                                </g>
                            </svg>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Natural Language Execution Module</span>
                        </div>
                        {/*<div className="flex items-center gap-1">*/}
                        {/*<button className="group hover:bg-gray-100 dark:hover:bg-white/10 p-1.5 rounded-lg">*/}
                        {/*    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"*/}
                        {/*         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"*/}
                        {/*         stroke-linejoin="round"*/}
                        {/*         className="lucide lucide-maximize2 size-[13px] text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">*/}
                        {/*        <polyline points="15 3 21 3 21 9"></polyline>*/}
                        {/*        <polyline points="9 21 3 21 3 15"></polyline>*/}
                        {/*        <line x1="21" x2="14" y1="3" y2="10"></line>*/}
                        {/*        <line x1="3" x2="10" y1="21" y2="14"></line>*/}
                        {/*    </svg>*/}
                        {/*</button>*/}
                        {/*<button className="group hover:bg-gray-100 dark:hover:bg-white/10 p-1.5 rounded-lg">*/}
                        {/*    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"*/}
                        {/*         xmlns="http://www.w3.org/2000/svg"*/}
                        {/*         className="size-3.5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">*/}
                        {/*        <path d="M12.4444 3.55566L3.55554 12.4446" stroke="currentColor" stroke-width="1.5"*/}
                        {/*              stroke-linecap="round" stroke-linejoin="round"></path>*/}
                        {/*        <path d="M3.55554 3.55566L12.4444 12.4446" stroke="currentColor" stroke-width="1.5"*/}
                        {/*              stroke-linecap="round" stroke-linejoin="round"></path>*/}
                        {/*    </svg>*/}
                        {/*</button>*/}
                        {/*</div>*/}
                    </div>
                    <div id="chat-content"
                         className="chat-assistant-sheet-content flex-1 overflow-y-auto relative px-4">
                         {showTrustBanner && (
                              <div className="mx-4 mb-3 p-3 rounded-md border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-800">
                                <p className="text-xs text-gray-800 dark:text-gray-100 leading-snug">
                                  ⚠️ This page can execute <strong>read-only queries</strong>.
                                  Write operations require explicit <strong>wallet approval</strong> and default to <strong>Testnet</strong> mode.
                                </p>
                                <div className="flex justify-end mt-2">
                                  <button
                                    onClick={() => setShowTrustBanner(false)}
                                    className="text-xs font-medium text-blue-600 hover:underline"
                                  >
                                    Got it
                                  </button>
                                </div>
                              </div>
                            )}
                        {/* ----- MOVED TEXTAREA HERE ----- */}
                        <textarea id="chat-assistant-textarea"
                                  aria-label="To enrich screen reader interactions, please activate Accessibility in Grammarly extension settings"
                                  autoComplete="off" placeholder="Enter an action (e.g. deposit 3 eBTC)"
                                  value={query}
                                  onKeyDown={handleKeyDown}
                                  onChange={(e) => setQuery(e.target.value)}
                                  className="w-full px-3.5 pr-10 outline-none py-2.5 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-600/30 rounded-2xl focus:outline-0 focus:border-primary dark:focus:border-primary-light text-gray-900 dark:text-gray-100 text-sm chat-assistant-input"
                                  spellCheck="false"
                                  rows="1"
                                  onInput={handleInput} /* <-- ADDED THIS */
                                  style={{
                                      resize: 'none',
                                      maxHeight: '200px' /* <-- ADDED THIS (adjust value as needed) */
                                  }}>
                        </textarea>
                        {/* ----- MOVED BUTTON HERE & MODIFIED ----- */}
                        {/*<button*/}
                        {/*    onClick={handleExecuteClick}*/}
                        {/*    disabled={loading}*/}
                        {/*    className="w-full mt-2 bg-primary dark:bg-primary-light text-white dark:text-gray-950 font-semibold py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"*/}
                        {/*>*/}
                        {/*    Execute*/}
                        {/*</button>*/}
                        {loading && (
                            <div className="mt-6"> {/* Removed the surrounding bordered div */}
                                <span
                                    className="text-sm text-gray-700 dark:text-gray-300 starter-question-text" // Applied classes from "Suggestions" title
                                    style={{minWidth: '80px'}} // Kept to prevent layout shift
                                >
                                    {`Generating${".".repeat(loadingDots)}`}
                                </span>
                            </div>
                        )}

                        {/* ----- MODIFIED SUGGESTIONS BLOCK (HIDDEN WHEN LOADING) ----- */}
                        {!loading && !response && (
                            <div className="mt-6">
                                <div className="pb-6">
                                    <div className="flex flex-col gap-4">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 starter-question-text">Suggestions</p>
                                        {intents.map((intent, index) => (
                                            <button
                                                key={index} // Added key for React list
                                                style={{color: 'rgb(22, 110, 63)'}}
                                                className="font-medium text-left text-sm text-primary hover:brightness-[0.75] dark:hover:brightness-[1.35] dark:text-primary-light dark:hover:text-primary transition-colors"
                                                onClick={() => handleIntentClick(intent.text)}
                                            >
                                                {intent.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {response && (
                            <div id="workflow" className="mt-6 pt-6 space-y-4">
                                {response.workflow && response.workflow.length > 0 && (
                                    <div
                                        className="border rounded-md bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/10">
                                        <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider p-3 border-b border-gray-200 dark:border-white/10">
                                            Trust-aware execution steps&nbsp;
                                            <span className="text-gray-400 dark:text-gray-500 normal-case font-normal">
                                                — here are the proposed steps to execute a task. Initially, all steps run in
                                                <strong className="text-green-700 dark:text-green-400"> Mock </strong>
                                                mode only to demonstrate the execution flow; write actions require explicit
                                                wallet approval and default to
                                                <strong className="text-blue-700 dark:text-blue-400"> Testnet</strong>.
                                            </span>
                                            <a
                                                href="https://your-security-page-url"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-2 text-xs text-blue-600 hover:underline"
                                            >
                                                Security & Data Handling →
                                            </a>
                                        </h5>
                                        <div>
                                            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Execution Level:
                                                    </h5>
                                                    <span
                                                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                            levels.find(l => l.label === executionLevel)?.color
                                                        }`}
                                                    >
      {executionLevel}
    </span>
                                                </div>

                                                <select
                                                    value={executionLevel}
                                                    onChange={(e) => setExecutionLevel(e.target.value)}
                                                    className="text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 focus:outline-none"
                                                >
                                                    {levels.map((level) => (
                                                        <option key={level.label} value={level.label}>
                                                            {level.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {response.workflow.map((step, index) => (
                                                <div key={index}
                                                     className={`p-3 ${index < response.workflow.length - 1 ? 'border-b border-gray-200 dark:border-white/10' : ''}`}>
                                                    <div className="flex items-center gap-x-3">
                                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{step.tool}</span>
                                                        <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${step.type === 'Frontend' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
        {step.type}
      </span>
                                                        <button onClick={() => toggleStep(index)}
                                                                className="text-sm text-blue-600 hover:underline">
                                                            {expandedSteps.has(index) ? 'Hide Details' : 'Show Details'}
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>

                                                    {expandedSteps.has(index) && (
                                                        <div className="mt-3 space-y-3">
                                                            {/* Console */}
                                                            <div>
                                                                <h6 className="text-xs font-semibold text-gray-500 uppercase">Console (Mock)</h6>
                                                                <pre className="mt-1 text-xs bg-gray-900 dark:bg-black/50 text-white p-3 rounded-md overflow-x-auto">
            <code>{step.output || 'Preview will appear here after execution.'}</code>
          </pre>
                                                            </div>

                                                            {/* Code */}
                                                            <div>
                                                                <h6 className="text-xs font-semibold text-gray-500 uppercase">Code</h6>
                                                                <pre className="mt-1 text-xs bg-gray-100 dark:bg-white/5 dark:text-gray-200 p-2 rounded-md overflow-x-auto">
            <code>{step.code || 'Code snippet unavailable.'}</code>
          </pre>
                                                            </div>

                                                            {/* Execute Button */}
                                                            <div className="flex justify-end">
                                                                <button
                                                                    disabled={executionLevel === 'Mock'}
                                                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                                                                        executionLevel === 'Mainnet'
                                                                            ? 'bg-green-600 text-white'
                                                                            : executionLevel === 'Testnet'
                                                                                ? 'bg-yellow-500 text-black'
                                                                                : executionLevel === 'Read-only'
                                                                                    ? 'bg-blue-500 text-white'
                                                                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                                                                    }`}
                                                                >
                                                                    Execute ({executionLevel})
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};