export const NLQueryPlugin = () => {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Your API call logic here
      const result = await fetch('/your-api-endpoint', {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await result.json()
      setResponse(data.response)
    } catch (error) {
      setResponse('Error osadfsadfccurred')
    }
    setLoading(false)
  }

  return (
    <div className="p-4 border rounded-lg">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter asdfsdfasdfyour natural language query"
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Processing...' : 'Send Query'}
      </button>
      {response && <div className="mt-2 p-2 bg-gray-100 rounded">{response}</div>}
    </div>
  )
}