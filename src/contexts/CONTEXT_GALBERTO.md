    ### 1. CONTEXTO DO SISTEMA

    * **Nome:** Galberto PDV
    * **Tipo:** PDV Desktop (**Electron + React + TypeScript + Vite**) offline-first
    * **Banco de dados:** SQLite (`better-sqlite3`)
    * **Público:** pequenos mercados e comércios locais
    * **Arquitetura atual:** existe uma tabela `integrations` para armazenar tokens, credenciais e configurações de integrações externas
    * O sistema já consome dados do **Bling**, que hoje é o sistema mestre de produtos, clientes e outras entidades de retaguarda
    * No futuro, o Bling será substituído por um ERP próprio

    ---

    ### 2. OBJETIVO DESTA TAREFA

Okay eu validei que ja possuo "ca-certificates-2025.2.80_v9.0.304-1.2.fc43.noarch instalado no meu pc mesmo assim continua?

isaque@fedora:~/Dev/galberto-pdv-local$ sudo dnf install ca-certificates
[sudo] senha para isaque: 
Atualizando e carregando repositórios:
 RPM Fusion for Fedora 43 - Nonfree - Updates                                                                                                                                                       100% |   3.9 KiB/s |  14.6 KiB |  00m04s
 RPM Fusion for Fedora 43 - Free - Updates                                                                                                                                                          100% |   3.9 KiB/s |  11.5 KiB |  00m03s
 Fedora 43 - x86_64 - Updates                                                                                                                                                                       100% |  19.5 KiB/s |  42.6 KiB |  00m02s
 Fedora 43 openh264 (From Cisco) - x86_64                                                                                                                                                           100% | 571.0   B/s | 986.0   B |  00m02s
 Fedora 43 - x86_64                                                                                                                                                                                 100% |  56.8 KiB/s |  75.0 KiB |  00m01s
>>> Curl error (56): Failure when receiving data from the peer for https://mirrors.fedoraproject.org/metalink?repo=fedora-43&arch=x86_64 [Recv failure: Conexão fechada pela outra ponta] - https://mirrors.fedoraproject.org/metalink?repo=
 google-chrome                                                                                                                                                                                      100% |   9.6 KiB/s |   1.3 KiB |  00m00s
 Docker CE Stable - x86_64                                                                                                                                                                          100% |  14.3 KiB/s |   2.0 KiB |  00m00s
Repositórios carregados.
O pacote "ca-certificates-2025.2.80_v9.0.304-1.2.fc43.noarch" já está instalado.

Nada para fazer.
