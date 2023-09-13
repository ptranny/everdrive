import { useEffect, useState } from 'react'

function App() {
  let [message, setMessage] = useState('loading...')

  useEffect(() => {
    fetch(import.meta.env.VITE_APP_API_URL)
      .then((response) => response.text())
      .then((data) => setMessage(data))
  }, [])

  return <>{message}</>
}

export default App
