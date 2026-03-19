import { useState } from 'react';
import { CredentialsPanel } from './CredentialsPanel';
import { DeployPanel } from './DeployPanel';
import { StacksPanel } from './StacksPanel';
import { ApiKeysPanel } from './ApiKeysPanel';
import { HistoryPanel } from './HistoryPanel';

type Tab = 'stacks' | 'history' | 'deploy' | 'credentials' | 'apikeys';

const TABS: { id: Tab; label: string }[] = [
  { id: 'stacks', label: 'Stacks' },
  { id: 'history', label: 'Historial' },
  { id: 'deploy', label: 'Deploy' },
  { id: 'credentials', label: 'Credenciales' },
  { id: 'apikeys', label: 'API Keys' },
];

const getTabFromUrl = (): Tab => {
  if (typeof window === 'undefined') return 'stacks';
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab') as Tab;
  return TABS.some((t) => t.id === tab) ? tab : 'stacks';
};

export const Dashboard = () => {
  const [tab, setTab] = useState<Tab>(getTabFromUrl);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    const url = new URL(window.location.href);
    if (newTab === 'stacks') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', newTab);
    }
    window.history.pushState({}, '', url);
  };

  return (
    <div className="space-y-6">
      <div className="border-border flex overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`px-4 py-2.5 text-xs tracking-widest whitespace-nowrap uppercase transition-colors ${
              tab === t.id
                ? 'border-primary text-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stacks' && <StacksPanel />}
      {tab === 'history' && <HistoryPanel />}
      {tab === 'deploy' && (
        <div className="w-full max-w-md">
          <DeployPanel />
        </div>
      )}
      {tab === 'credentials' && <CredentialsPanel />}
      {tab === 'apikeys' && <ApiKeysPanel />}
    </div>
  );
};
