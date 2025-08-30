export const NLQueryPlugin = () => {
  // Use React.useState since React is globally available in this environment
  const [query, setQuery] = React.useState("Send 10 NTRN from my default wallet to Bob's address ntrn1bobaddressxx");
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [isMarkedLoaded, setIsMarkedLoaded] = React.useState(false);

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

    try {
      const result = await fetch('https://api.thousandmonkeystypewriter.org/generate', {
        method: 'POST',
        body: JSON.stringify({ text: query }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.error || `HTTP error! Status: ${result.status}`);
      }

      const data = await result.json();
      setResponse(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    setLoading(true);
    setResponse(null);
    setError('');

    try {
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
	  
	  	const signer = await connectWallet('keplr');
		await ensureNeutronNetwork();
		const account = await storeSessionAccount(signer);
        alert('Connected Neutron address:'+ account.address);
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
          <div>
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Intent / Label</h5>
            <p className="mt-1 text-lg font-semibold text-blue-700 bg-blue-50 p-3 rounded-md">{response.label}</p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Extracted Parameters</h5>
            <pre className="mt-1 text-sm bg-gray-100 p-4 rounded-md overflow-x-auto">
              <code>{JSON.stringify(response.params, null, 2)}</code>
            </pre>
          </div>

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

  <a
        href="#"
        onClick={handleQuery}
        className="text-blue-600 hover:underline font-semibold"
      >
        Execute: Query My Balance
      </a>
    </div>
  );
};