import {loadContractAddress, signAndBroadcast} from "./walletUtils.jsx";

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
        { text: "Check my health factor on Amber Finance", implemented: true },
        { text: "Deposit 3 eBTC into the maxBTC/eBTC Supervault", implemented: true },
        { text: "Execute an emergency withdrawal for the user's Amber trading position", implemented: true },
        { text: "Increase the user's deposit in the WBTC/USDC Supervault by 0.2 WBTC and 12 000 USDC", implemented: true },
        { text: "Enable USDC gas payments for my next transaction", implemented: true },
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

            if (queryToExecute === "Check my health factor on Amber Finance") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
                executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

                const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
                executedSteps.push({ ...baseWorkflow[1], output: senderAddress });

                const positions = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({ text: queryToExecute, address: senderAddress }),
                    headers: { 'Content-Type': 'application/json' }
                });

                let res = await positions.json();
                executedSteps.push({ ...baseWorkflow[2], output: "positions: "+JSON.stringify(res) });

                const computed = calculateHealthFactor(res.positions);//step: 3 Tool: calculate_health_factor Desciption: Compute or read the health factor metric returned by Amber for each position.",
                executedSteps.push({ ...baseWorkflow[3], output: "Data normalized" });

                const summary = presentResults(computed);//step: 4 Tool: present_results Desciption: Return a formatted summary: position ID → health factor, collateral, debt."
                executedSteps.push({ ...baseWorkflow[4], output: "Final result:"+ summary });

                setResponse({ label: data.label, params: {}, workflow: executedSteps });
            } else if (queryToExecute === "Deposit 3 eBTC into the maxBTC/eBTC Supervault") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
                executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

                const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
                executedSteps.push({ ...baseWorkflow[1], output: "User address:"+senderAddress });

                const amount = await checkEbtcBalance(senderAddress, '3000000')//step: 2 Tool: check_token_balance Desciption: Ensure the wallet has at least 3 eBTC available on Neutron."
                executedSteps.push({ ...baseWorkflow[2], output: "User has "+amount.amountMicro+" eBTC" });

                const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({ text: queryToExecute, address: senderAddress }),
                    headers: { 'Content-Type': 'application/json' }
                });

                const res = await result.json();

                let i = 3
                for (const item of res) {
                    executedSteps.push({ ...baseWorkflow[i], output: item });
                    i += 1
                }

                setResponse({ label: data.label, params: {}, workflow: executedSteps });
            } else if (queryToExecute === "Execute an emergency withdrawal for the user's Amber trading position") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
                executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

                const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
                executedSteps.push({ ...baseWorkflow[1], output: senderAddress });

                const positions = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({ text: queryToExecute, address: senderAddress }),
                    headers: { 'Content-Type': 'application/json' }
                });

                let res = await positions.json();
                executedSteps.push({ ...baseWorkflow[2], output: "positions: "+JSON.stringify(res) });

                let position_id = 1
                const txMsg = constructTxWasmExecute(senderAddress, loadContractAddress(), { emergency_withdraw: { position_id } }, []);//step: 3 Tool: construct_tx_amber_emergency_withdraw Desciption: Build the emergency_withdraw transaction message with the selected position_id.",
                executedSteps.push({ ...baseWorkflow[3], output: "Transaction message:"+JSON.stringify(txMsg) });

                const txHash = await signAndBroadcast(signer, senderAddress, [txMsg], 'auto');//step: 6 Tool: sign_and_broadcast_tx Desciption: Prompt the wallet to sign and broadcast the execution transaction."
                executedSteps.push({ ...baseWorkflow[4], output: 'Transaction hash: '+txHash });

                setResponse({ label: data.label, params: {}, workflow: executedSteps });
            } else if (queryToExecute === "Increase the user's deposit in the WBTC/USDC Supervault by 0.2 WBTC and 12 000 USDC") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const signer = await ensureWalletConnected();//step: 1 Tool: ensure_wallet_connected Desciption: Confirm the user\u2019s wallet session is active.",
                executedSteps.push({ ...baseWorkflow[0], output: signer ? '✅ Signer object received' : '❌ Failed to get signer' });

                const senderAddress = await getWalletAddress(signer);//step: 2 Tool: get_sender_address Desciption: Retrieve the depositor\u2019s Neutron address.",
                executedSteps.push({ ...baseWorkflow[1], output: "User address:"+senderAddress });

                const amount = await checkEbtcBalance(senderAddress, '3000000')//step: 2 Tool: check_token_balance Desciption: Ensure the wallet has at least 3 eBTC available on Neutron."
                executedSteps.push({ ...baseWorkflow[2], output: "User has "+amount.amountMicro+" eBTC" });

                const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({ text: queryToExecute, address: senderAddress }),
                    headers: { 'Content-Type': 'application/json' }
                });

                const res = await result.json();

                let i = 3
                for (const item of res) {
                    executedSteps.push({ ...baseWorkflow[i], output: item });
                    i += 1
                }

                setResponse({ label: data.label, params: {}, workflow: executedSteps });
            }  else if (queryToExecute === "Enable USDC gas payments for my next transaction") {
                const executedSteps = [];
                const baseWorkflow = data.workflow;

                const { eligible } = await isFeeDenomEligible('uusdc');//step: 1 Tool: query_dynamic_fees_supported_assets Desciption: Call `/neutron/dynamicfees/params` to confirm that \"uusdc\" (USDC-denom) is in `ntrn_prices` and thus fee-eligible.",
                executedSteps.push({ ...baseWorkflow[0], output: "Confirm that denom in `ntrn_prices` is "+eligible });

                const minGasPrice = await getMinGasPrice('uusdc');//step: 2 Tool: query_global_fee_minimum Desciption: Query `/neutron/globalfee/min_gas_prices` to fetch the minimum gas price required for the \"uusdc\" denom.",
                // setDefaultFeeDenom('uusdc');//step: 3 Tool: set_wallet_default_fee_denom Desciption: Configure the local wallet/CLI to default to \"uusdc\" fees (e.g., `export NEUTRON_FEE_DENOM=uusdc`)."
                executedSteps.push({ ...baseWorkflow[1], output: " Minimum gas price "+minGasPrice });

                const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
                    method: 'POST',
                    body: JSON.stringify({ text: queryToExecute }),
                    headers: { 'Content-Type': 'application/json' }
                });

                const res = await result.json();

                let i = 2
                for (const item of res) {
                    executedSteps.push({ ...baseWorkflow[i], output: item });
                    i += 1
                }
                setResponse({ label: data.label, params: {}, workflow: executedSteps });
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
        <div className="z-20 fixed right-0 w-[23rem] border-l border-gray-500/5 dark:border-gray-300/[0.06] bg-background-light dark:bg-background-dark h-[calc(100vh-9.5rem)] top-[9.5rem] lg:h-[calc(100vh-6.5rem)] lg:top-[6.5rem] transition-[width] duration-300 ease-in-out"
             style={{ width: '391px', minWidth: '368px', maxWidth: '576px' }}> {/* <-- MODIFIED */}
            <div className="absolute -left-1 top-0 bottom-0 w-1 cursor-col-resize hover:bg-gray-200/70 dark:hover:bg-white/[0.07] z-10"
                 style={{ cursor: 'col-resize' }}></div> {/* <-- CHANGED */}
            <div id="chat-assistant-sheet" className="absolute inset-0 -top-px min-h-full flex flex-col overflow-hidden shrink-0 chat-assistant-sheet" aria-hidden="false">
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
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Assistant</span></div>
                        <div className="flex items-center gap-1">
                            <button className="group hover:bg-gray-100 dark:hover:bg-white/10 p-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                     stroke-linejoin="round"
                                     className="lucide lucide-maximize2 size-[13px] text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <polyline points="9 21 3 21 3 15"></polyline>
                                    <line x1="21" x2="14" y1="3" y2="10"></line>
                                    <line x1="3" x2="10" y1="21" y2="14"></line>
                                </svg>
                            </button>
                            <button className="group hover:bg-gray-100 dark:hover:bg-white/10 p-1.5 rounded-lg">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                     xmlns="http://www.w3.org/2000/svg"
                                     className="size-3.5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                    <path d="M12.4444 3.55566L3.55554 12.4446" stroke="currentColor" stroke-width="1.5"
                                          stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M3.55554 3.55566L12.4444 12.4446" stroke="currentColor" stroke-width="1.5"
                                          stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div id="chat-content"
                         className="chat-assistant-sheet-content flex-1 overflow-y-auto relative px-4">
                        <div className="h-full flex flex-col justify-between">
                            <div className="mt-4 flex flex-col items-center text-sm">
                                <div
                                    className="mx-8 text-center text-gray-400 dark:text-gray-600 text-xs chat-assistant-disclaimer-text">
                                    Responses are generated using AI and may contain mistakes.
                                </div>
                            </div>
                            <div className="pb-6">
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 starter-question-text">Suggestions</p>
                                    <button
                                        style={{color: 'rgb(22, 110, 63)'}} className="font-medium text-left text-sm text-primary hover:brightness-[0.75] dark:hover:brightness-[1.35] dark:text-primary-light dark:hover:text-primary transition-colors">What
                                        is an OpenAPI spec?
                                    </button>
                                    <button
                                        style={{color: 'rgb(22, 110, 63)'}} className="font-medium text-left text-sm text-primary hover:brightness-[0.75] dark:hover:brightness-[1.35] dark:text-primary-light dark:hover:text-primary transition-colors">How
                                        do I set a custom domain?
                                    </button>
                                    <button
                                        style={{color: 'rgb(22, 110, 63)'}} className="font-medium text-left text-sm text-primary hover:brightness-[0.75] dark:hover:brightness-[1.35] dark:text-primary-light dark:hover:text-primary transition-colors">What
                                        is the contextual menu?
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* ----- MODIFIED TEXTAREA BELOW ----- */}
                    <textarea id="chat-assistant-textarea"
                              aria-label="To enrich screen reader interactions, please activate Accessibility in Grammarly extension settings"
                              autoComplete="off" placeholder="Ask a question..."
                              className="w-full px-3.5 pr-10 outline-none py-2.5 bg-background-light dark:bg-background-dark border border-gray-200 dark:border-gray-600/30 rounded-2xl focus:outline-0 focus:border-primary dark:focus:border-primary-light text-gray-900 dark:text-gray-100 text-sm chat-assistant-input"
                              spellCheck="false"
                              rows="1"
                              onInput={handleInput} /* <-- ADDED THIS */
                              style={{
                                  resize: 'none',
                                  maxHeight: '200px' /* <-- ADDED THIS (adjust value as needed) */
                              }}>
                    </textarea>
                </div>
            </div>
        </div>
    );
};