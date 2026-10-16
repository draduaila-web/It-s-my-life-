# Auditoria funcional — RC395 — somente homologação

## Versão de partida e preservação

Conferência em 16/10/2026: `main` em `f312d87cb10cc70e5c2052faaa6ed93839667881`, a mesma referência da avaliação. A implantação anterior terminou com sucesso. Backup de código: branch `backup/hml-before-functional-audit-2026-10-16`. Este backup não é uma cópia dos dados do iPhone.

Mudanças desta rodada restritas a `homologação/` e à função/tabela **bertha_hml** de notificações. Nenhum arquivo da raiz de produção, arte, CSS, critério de premiação ou identidade visual foi alterado. O modal de missões aprovado na versão de partida foi preservado.

Antes de carregar o Owner RC395, `hml-backup-rc395.js` tenta guardar uma cópia única dos dados funcionais HML existentes no próprio navegador (`bertha-hml-backup::before-audit395`), fora do namespace apagado pelo clear da HML. Não inclui autenticação, tokens ou credenciais de push; não lê dados da produção. Se faltar espaço, registra falha e mantém os dados originais. A criação no aparelho ainda deve ser confirmada; não é backup remoto nem substitui a exportação pessoal. Não há restauração automática ou limpeza.

O SQL anterior de push e a reversão estão em `audit-rc395/`. A migração foi aplicada após confirmar zero inscrições duplicadas ativas. Não houve exclusão de vínculos. Os testes SQL usaram transações revertidas; a contagem posterior de usuários fictícios foi zero.

## Correções e limites

| Avaliação | Resultado nesta rodada |
|---|---|
| FIN01 — renda | Retirada a inferência automática que trocava renda pela base legada. Valores já alterados por versões anteriores não são adivinhados nem restaurados. |
| O2/O3 — treino | Evidência por execução; editar/excluir atua na sessão selecionada. Legados são associados por atividade/data/instante somente quando inequívocos. Caso ambíguo é bloqueado sem alterar registros. |
| O6 — Casa | Tentar reabrir Casa não apaga mais a coleção de receitas. A causa específica de um eventual dado incompatível ainda exige reprodução com cópia autorizada desse dado. |
| SHOP01 — estoque | kg/g e L/ml são convertidos e somados; unidades incompatíveis mantêm saldos separados. Não é feita conversão de pacote/caixa para peso por suposição. |
| FOOD01 — vazio | Lista explicitamente vazia permanece vazia após releitura. Campo ausente continua permitindo migração legada. |
| I01 — validação | A ação leva ao servidor o ID exato da ocorrência clicada; reconciliação e pontos continuam por ocorrência, sem repetir crédito. |
| I02 — remarcar | Missão única ainda disponível/atribuída, sem participante que a assumiu, usa a nova data e referência. Ocorrências assumidas/iniciadas mantêm o histórico; regra de remarcação depois de assumir depende de decisão. |
| I03 — chat longo | Kids busca as últimas 100 mensagens com desempate por ID e as exibe em ordem cronológica. Interface para carregar mensagens anteriores depende de aprovação. |
| I04 — destinatário | Resposta de abertura antiga não substitui a seleção mais recente; envio usa o ID da conversa capturado no toque de enviar. |
| I05 — antecipação | Botão respeita a janela de um dia e o fuso America/Sao_Paulo usado pelo servidor existente. Não foi ampliada a regra. |
| Push — conta/aparelho | Vínculo exclusivo ativo por inscrição, atualização serializada no servidor e índice único. Cliente refaz vínculo ao mudar de conta e serializa operações pendentes. Falha ao desativar preserva a escolha local e informa pendência da rede; sem conexão não se promete revogação remota. |
| O1 — duração | Retomar/editar atualiza minutos na sessão de Exercícios/Estudos, no registro de tarefa/Trabalho correspondente e no total do projeto por diferença, sem concluir novamente nem adicionar outra amostra de aprendizado. Histórico antigo ambíguo não é associado por aproximação. |
| O4 — datas | Exercícios e início da semana usam data civil local. |
| O5 — horários | Sugestão flexível considera blocos ocupados e limite da próxima janela, como a linha do tempo. Compromisso já devido mantém prioridade. |
| HEALTH02 | Hoje/ontem calculados por dias civis. |
| SHOP02 | Encerrar reposição preserva quantidade/unidade-alvo da Lista base existente. |
| FIN02 — fontes | Novos lançamentos inequívocos guardam ID da fonte; renomear preserva vínculos e pagamentos. Legados de nome repetido não são atribuídos por palpite nem somados em duplicidade; ficam sem atribuição até revisão. |
| IDEA01 — materiais | Projeto novo recebe ID antes de enviar materiais; renomear atualiza origem de material pendente vinculado, sem duplicá-lo. Compras concluídas são preservadas. Legados com títulos duplicados não são conciliados por suposição. |
| FIN03 — valores | Mascaramento reaplicado aos desejos inseridos depois do conteúdo financeiro. |
| FOOD03 — nutrição | Vazio/nulo continua desconhecido; zero explícito continua válido. Resumos não contam desconhecido como zero conhecido. |
| FOOD02 — alternativa legada | Refeição alternativa sem receita cadastrada não herda a nutrição da receita prevista. |
| Saúde vazia | Preservado o painel existente com seu botão Adicionar. |
| Trabalho | Removido corte silencioso de 30 tarefas abertas; registros permanecem acessíveis na lista existente. |
| Comunicação | Texto desatualizado sobre Kids em implementação substituído pela condição de conexão à rede. |

## Testes executados

As suítes operam funções reais extraídas do fonte atual, DOM simulado e dados fictícios. Não são aprovação visual ou teste completo em Safari/iPhone.

- **7 falhas da versão de partida reproduzidas**, separadas dos testes de aprovação: renda, edição de treino, estoque, cardápio vazio, nutrição ausente, data Saúde e duplicação por nome da fonte.
- **29 cenários novos de regressão passaram**, incluindo criação/renomeação de projeto via handler real, reposição via formulário, corrida de abertura de chat, histórico de 105 mensagens, backup e conclusão/retomada 10 + 5 = 15 com uma única sessão/amostra.
- **3 cenários adicionais de troca de conta/push passaram**: segunda conta com estado anterior ativo; bind antigo atrasado; desativação offline seguida de nova conta.
- **65 verificações de Progresso/Premiações passaram**: métricas, deduplicação, ciclos, recorrência, baseline, seis cores e armazenamento isolado.
- **33 verificações temporais em três fusos = 99 execuções passaram**: São Paulo, Nova York e UTC, usando o fonte temporal ativo.
- **3 suítes anteriores passaram**: formulário de missão/recorrência/lembrete e preservação da área Casa; grupos de missões e isolamento local por criança; restauração de push autorizado e desativação explícita.
- JavaScript incluído no pacote passou em parse Acorn; os arquivos editados também passaram em `node --check`.
- **Servidor HML, transações revertidas:** geração diária/amanhã, bloqueio futuro, lembrete com fuso, idempotência, validação Owner sem consumir outra data, dias da semana, acesso de conta externa negado, rota de aviso Kids. Rebind exclusivo, autorização de serviço, vínculo anterior preservado desativado, logout atrasado sem desativar a conta nova e unbind passaram.
- Conferido push Edge implantado: `bertha-social-push`, versão 4, já contém os textos de mensagem, reconhecimento, colaboração, tarefa, validação, atividade e lembrete; não foi reimplantado. A fonte convencional antiga na raiz permanece divergente e não foi alterada nesta rodada.
- Advisor de segurança: sem novos avisos de RLS; aviso existente sobre proteção de senhas vazadas desativada permanece sem alteração de configuração de Auth. Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.

Reprodução local após checkout: `cd homologação/audit-rc395 && npm ci && npm test`. Os testes de reprodução da versão defeituosa devem receber o diretório da baseline como argumento e não integram a aprovação atual. As suítes SQL não devem ser usadas com dados reais: criam apenas fixtures e encerram em ROLLBACK.

## Pendências de decisão — não implementadas

1. Exclusão em Estudos deve remover também a evidência no Progresso ou apenas ocultar a sessão? Mantida a regra atual enquanto não definida.
2. Missão já assumida/iniciada: permitir remarcação da mesma ocorrência ou cancelar e criar outra? Histórico preservado, sem regra nova nesta rodada.
3. Atalho “Receitas do dia”: abrir Alimentação no dia ou manter biblioteca com uma seção diária? Destino não alterado sem aprovação.
4. Carregar mensagens anteriores, busca/paginação, novos rótulos, confirmação/desfazer uniforme, onboarding e indicador de foco: propostas de experiência separadas dos bugs. Nenhum redesenho foi aplicado.
5. Fonte canônica de implantação de push e caminhos de ícone na raiz precisam de uma mudança separada, por afetarem manutenção/produção. Sem promoção autorizada.

## O que ainda depende do aparelho

Usar conta/base de teste em homologação. Não limpar dados nem reinstalar o Owner como primeira medida.

1. Conferir que o app carregou RC395. No Owner, registrar o mesmo treino em duas datas; editar/excluir o antigo; comparar Exercícios, Progresso e conquistas. Retomar 10 + 5 e ajustar tempo em Estudo, projeto, tarefa e Trabalho. Confirmar persistência ao fechar e reabrir.
2. Validar a mais recente entre duas missões concluídas, conferir data e pontos apenas dela, depois validar a antiga. Reabrir ambos os apps e verificar ausência de crédito repetido.
3. Remarcar missão única não assumida; conferir a nova data no Kids. Testar amanhã com antecipação e três dias sem botão antecipado.
4. Testar mensagem, reconhecimento Helper, nova tarefa, colaboração concluída, validação Kids e lembrete com app em segundo plano. Conferir banner, som, texto e destino. Desativar/reativar, reabrir e trocar conta com conexão interrompida. Os testes de servidor/mocks não comprovam entrega OneSignal/iOS.
5. Conferir duas famílias de teste separadas, revogação de permissões e leitura real de guias, missões, conversas e progresso individual. A simulação não aprova isolamento ponta a ponta.
6. Conferir ícone instalado, endereço que abre, modal X/data, 320/390 px, texto ampliado, teclado, botões finais, Voltar e VoiceOver. Artes, CSS e modal aprovado foram mantidos, sem QA visual atual no dispositivo.
7. Conferir sucesso do snapshot local antes de experimentar restauração, sempre em base isolada. Restauração completa e importação sob falha não foram aprovadas nesta rodada.

## Produção

**Não promovida.** A liberação depende de aprovação explícita e do fechamento das validações essenciais. A rodada corrige código; não afirma que registros pessoais anteriores foram afetados ou recuperados.
