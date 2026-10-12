# BERTH.A — revisão completa RC357

**Estado: EM ANDAMENTO. A beta não está declarada integralmente homologada.**

Data: 12/10/2026, America/Sao_Paulo. Navegador real: Chrome. Safari/iPhone e teclado virtual não disponíveis.

## Base e segurança

- Base confirmada: 13b9262cb4af5747b7df1169b8d0deb4f8926562 (RC356), sem alterações posteriores na abertura.
- Rollback: backup/bertha-pre-full-review-13b9262, no mesmo hash. Branch: work/bertha-full-review-rc357.
- Caminho ativo: homologação, com acentos. Somente arquivos desta pasta foram alterados.
- auditoria-rc357.html usa namespace bertha-qa-rc357:: e os mesmos scripts e assets. Namespace bertha-hml:: do index ativo permanece intacto.
- auditoria-viewport-rc357.html permite desktop, 390 px e 320 px no Chrome; não equivale a Safari/iPhone.
- Preparação QA: PR #14, merge 7dd80bae0c43875a2a573db30e66c1203b521e7b, deploy 38250427950 Success.
- Isolamento comprovado: tarefa somente no backup QA; ausente no backup HML. Dados HML idênticos antes/depois, com cinco conjuntos.
- Nenhuma pessoa, convite ou reconhecimento fictício na rede real. Registros QA357 exclusivamente no namespace isolado. Sem limpeza, restauração ou exclusão.
- Origem do leitor Owner: BERTHA_HOMOLOGACAO_v2_8_221_RC141_CASA_MANUTENCAO_PONTOS_SATELITES.zip, arquivo homologacao/app-v2.8.221-exercicios-modal-ancorado.js. Caminho histórico sem acentos usado somente como referência.
- Sintaxe dos candidatos core/runtime: node --check passou sem executar o aplicativo. Edições feitas no GitHub pelo navegador. Regressão pós-deploy pendente nesta edição.

## Matriz dos 20 módulos

| Módulo | Problema e causa | Correção | Testes executados nesta rodada | Resultado | Pendências |
|---|---|---|---|---|---|
| 1. Meu Dia | Nenhuma correção definida nesta edição | Nenhuma | Adiar 30 min; começar tarefa; sessão após recarga; continuar; concluir; ajustar tempo; retomar. Histórico único de 15 min. | Parcial; resultados dirigidos abaixo | Completar fluxos disponíveis, regressão e 390/320 px. |
| 2. Meu Dia Ideal e Horários-base | Nenhuma correção definida nesta edição | Nenhuma | Preferência de Tarde, 15 min, salva e recarregada; obrigatório vazio bloqueado. Horários: cancelar por X, salvar nome e dias, recarregar. | Parcial; resultados dirigidos abaixo | Completar fluxos disponíveis, regressão e 390/320 px. |
| 3. Planos — Tarefas e Compromissos | Busca: card.hidden correto, mas display:grid anulava ocultação. Fonte de busca com 15 px. | Regra restrita .bertha-task-card[hidden]; busca com fonte de 16 px. | Tarefa: criar, editar, cancelar, concluir, reabrir e recarregar. Busca falhou por CSS. Compromisso: amanhã, 15:30, 30 min; edição semanal persistida. | Parcial; resultados dirigidos abaixo | Completar fluxos disponíveis, regressão e 390/320 px. |
| 4. Rituais | Campo de intervalo hidden aparecia; 16 ícones sem nome acessível; header inconsistente e descrição duplicada. | Campos hidden ocultados no componente; aria-label e aria-pressed; título e header dos Rituais personalizados. | Ritual: criar, editar, cancelar, recarregar; produtos deduplicados enviados à lista; cuidado extra editado e presente no Meu Dia. Falhas de hidden, ícones e títulos. | Parcial; resultados dirigidos abaixo | Completar fluxos disponíveis, regressão e 390/320 px. |
| 5. Trabalho | Nenhuma correção definida nesta edição | Nenhuma | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 6. Estudos | Nenhuma correção definida nesta edição | Nenhuma | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 7. Casa — manutenção, jardim, utensílios e equipamentos | Nenhuma correção definida nesta edição | Nenhuma | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 8. Exercícios e ciclos de treino | Nenhuma correção definida nesta edição | Nenhuma | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 9. Alimentação | Nenhuma correção definida nesta edição | Nenhuma | Cardápio próprio com receita associada: 100 kcal e 10 g. Comi/Não comi; Outra pessoa sem progresso; cancelamento; próxima cozinha persistida. | Parcial; resultados dirigidos abaixo | Completar fluxos disponíveis, regressão e 390/320 px. |
| 10. Receitas | Nenhuma correção definida nesta edição | Nenhuma | Busca vazia e por ingrediente; categorias; criar, editar, cancelar, favorito e recarga. Modal empilhado de ingredientes: cancelar, reabrir, selecionar e adicionar. | Parcial; resultados dirigidos abaixo | Completar fluxos disponíveis, regressão e 390/320 px. |
| 11. Lista de Compras e estoque doméstico | Nenhuma correção definida nesta edição | Nenhuma | Item: criar, editar, cancelar, filtrar; compra cancelada e confirmada; estoque, encerramento, histórico e Lista base. Saldo 2 kg gerou falta de 1 kg sem duplicar. | Parcial; resultados dirigidos abaixo | Completar fluxos disponíveis, regressão e 390/320 px. |
| 12. Financeiro | Nenhuma correção definida nesta edição | Nenhuma | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 13. Criação & Ideias | Nenhuma correção definida nesta edição | Nenhuma | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 14. Meu Progresso | Nenhuma correção definida nesta edição | Nenhuma | Semanal, Mensal e Anual. Dois eventos: uma tarefa e uma alimentação. Tarefa retomada permaneceu em um histórico de 15 min. | Parcial; resultados dirigidos abaixo | Completar fluxos disponíveis, regressão e 390/320 px. |
| 15. Satélites — Adulto, Helper e Kids | Regra RC176 de 86 px vencia regra RC192 de 118 px, cortando rótulos dos avatares. | Regra antiga de SVG exclui cards com .sat-avatar-art; regra posterior aprovada opera sem alterar imagens. | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 16. Delegação e conclusões compartilhadas | Leitor e chave de eventos Owner ausentes no core atual; originais recuperados da RC141. | Restauração literal do leitor e da chave bertha.satellites.owner-events.v1; nenhuma migração. | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 17. Convites | Nenhuma correção definida nesta edição | Nenhuma | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 18. Premiações — Owner, Kids e Helper | Nenhuma correção definida nesta edição | Nenhuma | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |
| 19. Menu Mais e ferramentas de homologação | Nenhuma correção definida nesta edição | Nenhuma | Menu e exportação real. Backup HML idêntico após tarefa QA; tarefa presente somente no backup QA. Exportação pelo iframe não gerou download; acesso direto funcionou. | Parcial; resultados dirigidos abaixo | Completar fluxos disponíveis, regressão e 390/320 px. |
| 20. Navegação global, modais, versão, cache e carregamento | Duas regras distintas injetavam estilos com o mesmo ID rc188-helper-assets. | Segundo ID renomeado para rc188-recognition-assets; conteúdo CSS preservado. | Inspeção anterior RC356; testes desta rodada ainda não executados | Pendente nesta rodada | Completar fluxos disponíveis, regressão e 390/320 px. |

## Fluxos e evidências

| Módulo | Fluxo | Resultado |
|---|---|---|
| Planos/Tarefas | Obrigatório/criar/salvar/reabrir | Passou: vazio bloqueado, tarefa QA salva e reaberta em nova aba; backup QA contém tarefa; backup HML idêntico antes/depois |
| Navegação/estilos | IDs duplicados | Falha: rc188-helper-assets duplicado |
| Planos/Tarefas | 390px campo busca | Falha: font-size15px; sem overflow horizontal |
| Planos/Tarefas | Editar/cancelar/salvar/concluir/reabrir/recarregar | Passou: cancelamento preservou original, edição persistiu, concluídas1, reabriu abertas1, recarga manteve tarefa editada |
| Planos/Tarefas | Busca sem resultado | Falha reproduzida: searchbox semresultadoQA357 deixa tarefa editada visível |
| Planos/Tarefas | Causa busca | Causa confirmada: o filtro define hidden=true, mas CSS mantém o card em grid. Correção candidata no seletor do componente; busca 15→16 px. |
| Planos/Compromissos | Criar/editar/cancelar/recorrência/recarregar | Amanhã 13/10, 15:30, 30 min, salvo. Cancelamento preservou título. Edição para recorrência semanal persistiu. Notificações não ativadas. |
| Meu Dia Ideal | Obrigatório/criar/período/duração/salvar/recarregar | Vazio bloqueado. Preferência de Tarde com 15 min persistiu. Card não oferece edição, somente remoção; nenhuma exclusão acionada. |
| Meu Dia/Horários-base | Editar/cancelar/dias/salvar/recarregar | Cancelar por X preservou nome. Horário renomeado persistiu. Backup confirmou estrutura nos dias 1–5 após selecionar Seg–Sex; acessibilidade da seleção a conferir. |
| Meu Dia | Adiar/começar/em andamento/recarregar/continuar/concluir | Adiar Ritual por 30 min retirou destaque. Tarefa iniciou e sobreviveu à recarga. Continuar fechou modal; conclusão permitiu informar tempo real. |
| Meu Dia | Editar tempo/retomar/concluir novamente | Ajuste de 10 para 12 min visível; retomar e concluir mais 3 min totalizou 15 min no mesmo histórico, sem duplicação. |
| Rituais | Novo ritual campos condicionais/ícones | Falhas: campo de intervalo hidden visível; 16 botões de ícone sem nome. Ritual salvo com intervalo de 2 dias. |
| Rituais | Criar/editar/cancelar/reabrir/produtos/cuidados/Meu Dia | Ritual editado persistiu; cancelar preservou nome. Produtos deduplicados e enviados à lista. Cuidado extra 5→7 min persistiu e apareceu no Meu Dia. Header e descrição apresentam falhas; nome da atividade inicial permaneceu antigo após renomear ritual, ainda sob investigação. |
| Compras/Estoque | Obrigatório/criar/editar/cancelar/filtrar/marcar/cancelar compra/estoque/encerrar/base/reload | Obrigatório, criar, editar e cancelar passaram. Filtro mostra somente Alimentação. Cancelar compra desmarca. Compra de 3 kg por R$12,50 criou estoque e histórico. Encerrar manteve histórico e Lista base. Cancelar ajuste preservou 3 kg; estoque 2 kg salvo; base calculou falta de 1 kg; nova aplicação não duplicou pendentes. Recarga conferida. |
| Receitas | Busca/ingrediente/categoria/vazio/obrigatório/criar/editar/cancelar/favorito/reload/ingredientes | Busca vazia informa nenhum resultado; cottage encontra receita; filtro Sobremesas mostra quatro. Receita criada e editada, cancelamento preservou nome, favorito persistiu. Seleção de ingredientes cancelada/reaberta; somente banana adicionada, arroz desmarcado. |
| Alimentação | Criar/cardápio/receita/Comi/NãoComi/Outra pessoa/cancelar/cozinha/reload/receita modal | Receita própria associada e consumida. Outra pessoa oculta Progresso e não entra em Hoje. Cancelamento preservou nome; próxima cozinha 27/10 persistiu. Receita abriu/fechou a partir do cardápio. |
| Meu Progresso | Semanal/Mensal/Anual/com registros | Controles Semanal/Mensal/Anual responderam. Semana mostra dois eventos; fontes e agregação confirmadas no backup. Exercícios ainda pendente. |
| Delegação/Owner | Causa recuperada | Definição original recuperada no pacote RC141, arquivo homologacao/app-v2.8.221-exercicios-modal-ancorado.js. Restauração literal candidata, sem nova chave ou migração. |
| Alimentação/Meu Progresso | Evidência de dados QA | Backup QA: um evento Alimentação com 100 kcal e 10 g; cardápio owner=other e trackProgress=false sem evento. Histórico de tarefa único com 15 min. Compras contém apenas ingrediente selecionado da receita. |

## Preservação e próximas etapas

Artes RC349/RC351/RC352/RC353, identificadores e associações preservados. Sem mudanças em credenciais, autenticação, permissões de acesso, push real, integrações externas ou isolamento HML/produção. Sem exclusão de arquivos ou histórico.

Faltam nesta rodada: Trabalho, Estudos, Casa, Exercícios/Progresso, Financeiro, Ideias, Satélites/Convites/Delegação/Premiações e regressão após deploy. Restauração de backup será testada somente na auditoria isolada. Nenhum módulo será marcado concluído apenas porque abriu.
