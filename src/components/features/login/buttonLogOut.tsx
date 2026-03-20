import '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth';
import { navigate } from 'astro/virtual-modules/transitions-router.js';

export const ButtonLogOut = () => {
  const { t } = useTranslation();

  const handleLogout = async () => {
    await authClient.signOut();
    navigate('/login');
  };

  return (
    <Button className="w-full rounded-none" onClick={handleLogout}>
      {t('nav.logout')}
    </Button>
  );
};
