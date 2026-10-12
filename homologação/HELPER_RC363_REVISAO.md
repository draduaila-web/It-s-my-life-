# BERTH.A Helper RC363 — implementação e matriz de validação

Base GitHub: f724750a0d7d3facbf8ba6ae3dc6a2de0834c017, Owner RC362.
Rollback: backup/bertha-pre-helper-rc363-f724750, mesmo hash.
Branch: work/bertha-helper-rc363. Matriz histórica dos20 módulos preservada em REVISAO_COMPLETA_RC357.md.

## Definição aprovada

Helper é o adulto colaborador, não uma categoria separada de Adulto. Família e coletivos podem cooperar segundo permissões individuais. Kids terá experiência própria, incluindo adolescentes, trilha individual e comunicação com Owner; Kids↔adultos depende da autorização individual do Owner. Sem ranking competitivo, punição por perda de pontos ou recompensas materiais definidas pelo app.

Ícone Helper específico: menta/creme, B•A com h pequeno. Ícone Owner e artes aprovadas intactos.

## Implementação desta etapa

- helper.html: app Adulto/Helper independente, conta, vínculo, busca, Hoje/Ontem/Anteriores/Próximas/Todas, minhas tarefas, assumir/iniciar/concluir.
- helper-owner.html: Owner conecta conta, lê adultos já cadastrados neste navegador HML, atualiza permissão Casa→tarefas e exigência de validação, gera vínculo por email, seleciona atividades e data combinada, acompanha/valida e pausa acesso.
- Owner principal permanece RC362. Nenhuma gravação em seu storage/timers/pontuação ou notificações. **Conclusões remotas desta etapa ainda não alimentam automaticamente Meu Dia/Meu Progresso, recorrências ou reconhecimentos Helper. O retorno ao motor aprovado é etapa pendente, não validada por estes testes.**
- Cinco tabelas novas bertha_hml_*, separadas das tabelas antigas e de produção. Nenhuma política antiga, Auth setting ou push OneSignal alterado.
- SELECT autenticado com RLS; escrita exclusivamente por RPC guardada. Wrapper público SECURITY INVOKER; operação privada verifica auth.uid, email confirmado, Owner/membro/destinatários. Cliente contém somente publishable key.
- local_id e avatar_key preservam associação ao cadastro original. Vínculos com UUID aleatório, email exato, expiração7dias, aceite pela mesma conta e revogação.
- Lock de tarefa e transições controladas: não assumir tarefa de outra pessoa, não concluir antes de iniciar, retries sem eventos duplicados. Compartilhar a mesma ocorrência com outro adulto acrescenta alvo sem reiniciar estado.
- Sem gravação offline. Consulta a cada20s em primeiro plano e Atualizar; **não equivale a Realtime/GPS**.
- Senha não persistida. Sessões temporárias por aba/papel em sessionStorage; renovação deduplicada; logout impede renovação/login pendente de reativar sessão.
- Transmissão de cadastros/tarefas somente após seleção e ação explícita do Owner. Nenhum email de convite, mensagem ou localização enviado pelo agente.

## Matriz antes da publicação

| Fluxo | Teste efetivo | Resultado/pendência |
|---|---|---|
| Calendário/filtros | Datas inválidas, bissexto, hoje/ontem/anteriores/próximas, virada de ano |33 verificações de cliente passaram em São Paulo/Nova York; UI pendente |
| Leitura Owner | Adulto/Kids/pausado, privado/concluído/compartilhado, destinatário e pessoa já responsável | Passou; storage em memória exatamente preservado |
| Transporte/conta | Headers, bloqueio de tabelas legadas, refresh concorrente, logout durante login, erro de credencial simulado | Passou em memória; login/email real não exercitado |
| Vínculo/RLS | Owner, Adultos A/B mesma rede, conta externa, email errado, destino correto, escrita direta negada, vínculo idempotente | Passou no banco real em subtransação revertida |
| Colaboração | Assumir/iniciar/concluir; validação obrigatória; retries; novo alvo sem reset; segundo adulto não assume tarefa ocupada | Passou no banco; simultaneidade de duas conexões ainda não exercitada |
| Revogação | Owner pausa; Helper perde SELECT e escrita | Passou no banco; atualização entre aparelhos reais pendente |
| Preservação | Pós-teste:0Auth users,0redes/membros/tarefas/eventos HML;0households/members antigos | Consulta independente confirmou; nenhum fixture persistente na rede real |
| Visual/modais | Menta, campos16px, creme/X neutro, busca/ações/rolagem | A verificar publicado; Safari/iPhone não testado |

Duas tentativas multicomando interrompidas pelo MCP com Invalid or expired requestState; contagens0 confirmadas. Teste final reproduzível helper-rls-rc363.test.sql usa um único DO com subtransação e rollback deliberado apenas após todos os assertions. Executado sem erro após correção de alvos múltiplos; contagens0 confirmadas separadamente. Fixtures Auth temporários apenas dentro da transação, sem Auth API/email enviados.

Migrations aplicadas: bertha_hml_helper_rc363 e bertha_hml_helper_targets_rc363 e bertha_hml_helper_resume_rc363. Security advisors inicial: lints=[]; repetir ao concluir. Changelog HTML corrente consultado (índice.md indisponível); RLS/Password-based Auth via search_docs; endpoints Auth em documentação/OpenAPI oficial. Teste de banco não valida SMTP ou login real.

## Limites e próxima etapa

- Login/vínculo de duas contas reais e entrega de confirmação de email ainda precisam de validação. Nenhuma credencial inventada. SMTP/redirect atual ainda não verificados; não presumir entrega.
- Alterações posteriores de permissão no Owner são sincronizadas explicitamente por “Ler cadastros e atualizar permissões”. Pausa remota já revoga acesso. Retorno automático ao motor Owner pendente.
- Compras, convites bidirecionais, reconhecimentos/gamificação adulto, conversas, Kids↔adultos, Realtime/GPS não implementados.
- Safari/iPhone físico, teclado virtual, safe areas reais, instalação PWA/ícone iOS, background/Watch não testados. Manifest sem service worker/offline; ícones SVG e PNG192/512, sem garantia de instalação iOS.
- Raiz não promovida; nenhum dado HML migrado. Problema de prefixo da raiz segue na matriz anterior.

Rollback de código: branch acima. Backend aditivo; desativação preservando dados pode revogar EXECUTE da RPC public.bertha_hml_action e retirar o acesso às páginas novas. Não executar DROP/limpeza como rollback automático.

Páginas QA separadas usam exclusivamente bertha.helper.qa.rc363 e transport simulado, sem criar pessoas no backend. Seus testes validam UI, não transporte entre aparelhos reais. Não são carregadas por helper.html/helper-owner.html.


## Publicação inicial e testes de UI

PR50: merge338cb4a66e6837a8e8dc524183d56e40042ed21d. Pages1349/run38323513155 Success.
Diff integral:15arquivos novos;14textos integralmente iguais ao preparado, SVG em diff visual. Nenhum arquivo anterior modificado/excluído.
App real helper.html?v=363 aberto: titleRC363, íconeSVG carregado, campos16px, sem autofocus/overflow; apenas cliente/app363 carregados, nenhum módulo QA.
QA publicado: recortes Hoje/Ontem/anteriores/próximas/Todas, busca positiva/vazia; assumir, recarregar e manter responsável; Minhas tarefas; começar; concluir/cancelar preservou Em andamento; Escape fecha; confirmar exibiu Aguardando validação; Owner QA validou e exibiu Concluída. Leitura explícita, seleção zero bloqueada, selecionar por Space e compartilhar; repetir manteve duas atividades visíveis do dia, sem duplicar.
Owner e Helper em390/320: áreas úteis375/305px, scrollWidth=clientWidth; imagens carregadas, barra inferior77px e padding100px. Não equivale a Safari/teclado virtual.
Ajustes finais preparados após esse teste: label Colaboração no modal, cancelar seleção, data obrigatória só para itens selecionados, login não impõe tamanho mínimo de criação de senha, “Todos os adultos autorizados” com elegibilidade por tarefa; regra de validação permanece por pessoa (não copiada globalmente para os demais alvos). PNG192/512 exportados do SVG novo e apple-touch-icon configurado. Teste SQL ampliado confirmou conclusão sem validação para o adulto com essa permissão individual; fixtures revertidos.
Revalidação desta etapa final registrada após seu deploy.

Ajuste adicional: Pausar agora tem Retomar acesso, pelo Owner, para a mesma conta e com nova conferência da permissão do cadastro local. Links revogados não são reativados. Retomada testada na mesma subtransação após revogação;0fixtures persistidos.
