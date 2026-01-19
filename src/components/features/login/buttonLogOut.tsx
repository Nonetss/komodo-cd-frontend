import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth';
import { navigate } from 'astro/virtual-modules/transitions-router.js';

export const ButtonLogOut = () => {
  const handleLogout = async () => {
    await authClient.signOut();
    navigate('/login');
  };
  return (
    <Button className="w-full rounded-none" onClick={handleLogout}>
      Logout
    </Button>
  );
};
