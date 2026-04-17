# Printing Layer

Camada responsável pelos documentos operacionais impressos do PDV.

## Escopo atual

- cupom de venda
- comprovante de abertura de caixa
- comprovante de fechamento de caixa
- histórico local de impressão e reimpressão

## Fonte de verdade

- `printed_documents`: documento renderizado e snapshot do payload impresso
- `print_jobs`: histórico de tentativas, sucesso, falha e reimpressão

## Integração futura com fiscal

- o cupom já aceita snapshot fiscal no payload
- a renderização pode incorporar NFC-e autorizada sem trocar o fluxo de impressão
- a impressão operacional continua funcionando mesmo sem emissão fiscal
