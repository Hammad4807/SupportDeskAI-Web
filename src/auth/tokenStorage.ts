// Where the JWT is kept in the browser, so the user stays logged in after a page refresh.
// localStorage can throw (private mode, blocked storage), so every access is wrapped:
// without storage the user simply has to log in again.
const TOKEN_KEY = 'supportdesk.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignored: the token still works until the page is reloaded
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignored
  }
}
