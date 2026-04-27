# Fontes fiscais oficiais

Este modulo nao deve usar `integrations` como fonte primaria de configuracao fiscal.

## Fonte oficial por responsabilidade

- `stores`: estabelecimento emitente, CNPJ, IE, razao social, nome fantasia, endereco fiscal, CRT/regime, ambiente, CSC, serie padrao e proximo numero NFC-e.
- `fiscal_settings`: configuracao operacional da emissao, provider, certificado, URL SEFAZ/gateway, API key, CA/TLS e contingencia.
- `sales`, `sale_items`, `payments` e snapshots tributarios: dados transacionais que alimentarao o XML.
- `fiscal_documents`: documento fiscal gerado, XMLs, chave, protocolo, status, rejeicao, QR Code, serie/numero e datas fiscais.
- `fiscal_events`: auditoria de eventos fiscais.
- `sync_queue`: fila de processamento/retry.

## Legado

`integrations.raw_json` com `integration_id = fiscal:nfce` fica apenas como fallback temporario para instalacoes antigas. Novas leituras fiscais devem passar por `FiscalContextResolver`.
