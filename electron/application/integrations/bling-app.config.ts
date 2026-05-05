type BlingAppConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

const blingAppConfig: BlingAppConfig = {
  clientId: '544f921fc8bd37fa2a319af77786addf385afffd',
  clientSecret: 'ee219a1ca80750c753d0629753ff51992354d4c7a4dcf1d877ca55a4b7db',
  redirectUri: 'http://127.0.0.1:47831/callback/bling',
};

function requireConfigValue(
  value: string,
  fieldName: keyof BlingAppConfig
): string {
  if (!value.trim()) {
    throw new Error(`Configuração OAuth do Bling ausente: ${fieldName}`);
  }

  return value;
}

export function getBlingAppConfig(): BlingAppConfig {
  return {
    clientId: requireConfigValue(blingAppConfig.clientId, 'clientId'),
    clientSecret: requireConfigValue(blingAppConfig.clientSecret, 'clientSecret'),
    redirectUri: requireConfigValue(blingAppConfig.redirectUri, 'redirectUri'),
  };
}
