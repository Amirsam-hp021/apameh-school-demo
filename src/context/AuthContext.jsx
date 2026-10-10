import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const ROLES = ['admin', 'teacher', 'student', 'parent'];

/** Landing route for each role after login. */
export const HOME_BY_ROLE = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
};

/**
 * Demo authentication. `login(role)` signs in as that role's demo account.
 * State is kept in memory only, so a page reload signs the user out.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (role) => {
    const { user: signedIn } = await api.auth.loginAs(role);
    setUser(signedIn);
    return signedIn;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout, switchRole: login }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
