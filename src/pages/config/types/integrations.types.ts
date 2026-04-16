export interface ERPIntegration {
  id: string;
  name: string;
  logo: string;
}

export type IntegrationStatus = {
  connected: boolean;
  loading: boolean;
  expiresAt?: string | null;
};