import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

// StrictMode is turned off for now: in development it mounts every page twice,
// which cancels the first API request and makes Visual Studio break on TaskCanceledException.
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
