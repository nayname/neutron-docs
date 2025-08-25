export default function PluginSidebar() {
  return (
    <div className="space-y-4">
      <h3>Recipes</h3>
      <ul>
        <li>Query contract config</li>
        <li>Simulate tx (read-only)</li>
        <li>Health check</li>
      </ul>

      {/* Example: Wallet connect hook point */}
      {/* <WalletConnect provider="cosmoskit" /> */}

      {/* Pin a sample request */}
      <pre>
{`neutrond query wasm contract-state smart $CONTRACT '{"config":{}}'`}
      </pre>
    </div>
  );
}
