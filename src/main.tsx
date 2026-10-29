import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import AuthProvider from './auth/AuthProvider.tsx'

// StrictMode is turned off for now: in development it mounts every page twice,
// which cancels the first API request and makes Visual Studio break on TaskCanceledException.
// AuthProvider wraps the app so every page can ask "who is logged in?" with useAuth().
createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
)
