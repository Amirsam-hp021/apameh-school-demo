import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../hooks/useAsync';

/** Loads the student linked to the signed-in parent. */
export function useChild() {
  const { user } = useAuth();
  return useAsync(() => api.auth.getChild(user.id), [user.id]);
}
