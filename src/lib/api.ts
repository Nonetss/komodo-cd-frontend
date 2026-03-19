import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v0',
  withCredentials: true,
});

export interface Credential {
  id: number;
  name: string | null;
  url: string | null;
}

export interface SaveCredentialPayload {
  name: string;
  url: string;
  key: string;
  secret: string;
}

export type DeployAction =
  | 'build'
  | 'pull'
  | 'redeploy'
  | 'build-pull-redeploy';

export interface TriggerDeployPayload {
  stack: string;
  action: DeployAction;
}

export const credentialsApi = {
  list: () =>
    api.get<{ success: boolean; credentials: Credential[] }>(
      '/deploy/credentials',
    ),
  save: (data: SaveCredentialPayload) =>
    api.post<{ success: boolean; message: string; name: string }>(
      '/deploy/credentials',
      data,
    ),
  delete: (name: string) =>
    api.delete<{ success: boolean; message: string }>('/deploy/credentials', {
      data: { name },
    }),
};

export const deployApi = {
  trigger: (data: TriggerDeployPayload) =>
    api.post<{
      success: boolean;
      message: string;
      stack: string;
      action: string;
    }>('/deploy', data),
};

export interface Stack {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const stacksApi = {
  list: () => api.get<{ success: boolean; stacks: Stack[] }>('/stacks'),
};

export interface ApiKey {
  id: string;
  name: string | null;
  start: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export const apiKeysApi = {
  list: () => api.get<{ success: boolean; keys: ApiKey[] }>('/apikeys'),
  create: (name: string) =>
    api.post<{
      success: boolean;
      key: string;
      id: string;
      name: string | null;
    }>('/apikeys', { name }),
  delete: (id: string) =>
    api.delete<{ success: boolean }>('/apikeys', { data: { id } }),
};
