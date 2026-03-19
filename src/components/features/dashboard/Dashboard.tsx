import { useState } from 'react';
import { CredentialsPanel } from './CredentialsPanel';
import { DeployPanel } from './DeployPanel';
import { StacksPanel } from './StacksPanel';
import { ApiKeysPanel } from './ApiKeysPanel';

type Tab = 'deploy' | 'stacks' | 'credentials' | 'apikeys';

const TABS: { id: Tab; label: string }[] = [
  { id: 'deploy', label: 'Deploy' },
  { id: 'stacks', label: 'Stacks' },
  { id: 'credentials', label: 'Credenciales' },
  { id: 'apikeys', label: 'API Keys' },
];

export const Dashboard = () => {
  const [tab, setTab] = useState<Tab>('deploy');

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-b-2 border-black text-black'
                : 'text-slate-500 hover:text-black'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'deploy' && (
        <div className="max-w-md">
          <DeployPanel />
        </div>
      )}
      {tab === 'stacks' && <StacksPanel />}
      {tab === 'credentials' && (
        <div className="max-w-md">
          <CredentialsPanel />
        </div>
      )}
      {tab === 'apikeys' && <ApiKeysPanel />}
    </div>
  );
};
