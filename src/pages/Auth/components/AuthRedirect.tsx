import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { useSubStore } from '../../../store/useSubStore';

const AuthRedirect = () => {
  const { user } = useAuthStore();
  const { membership, fetchMembership } = useSubStore();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      await fetchMembership(user.uid);

      if (!membership) {
        navigate('/subscription', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    };

    run();
  }, []);

  return null;
};

export default AuthRedirect;
