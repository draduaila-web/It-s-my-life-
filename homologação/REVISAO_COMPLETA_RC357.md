# BERTH.A — matriz da revisão RC357

Revisão executada em 12/10/2026. Escopo: beta em **homologação**, com acentos. A revisão não garante ausência absoluta de falhas. Resultado por fluxo abaixo; abrir uma tela não equivale a validar o módulo inteiro.

## Ambiente, segurança e rastreabilidade

- Referência informada: RC353, 1d7e0d853b4a6d81c89228b19940407c7ef2f533. Ao retomar, a versão ativa era RC356, merge 1c81df8c4573ef6ce84f21a8ecee287d1afe60e7; histórico mais recente preservado.
- Rollback criado antes da revisão completa: **backup/bertha-pre-full-review-13b9262**, hash **13b9262cb4af5747b7df1169b8d0deb4f8926562**. Rollback anterior: backup/bertha-pre-review-1d7e0d8.
- Correções pequenas na branch **work/bertha-full-review-rc357**. A publicação da RC de revisão e os testes posteriores são registrados no PR dessa branch; os resultados abaixo distinguem testes da candidata e limitações.
- Testes persistentes feitos exclusivamente nas páginas auditoria-rc357.html / auditoria-candidata-rc357.html, prefixo **bertha-qa-rc357::**. O index ativo mantém **bertha-hml::**. Dados fictícios não foram salvos na rede real.
- GitHub Pages main/root confirmado; somente arquivos de homologação e esta matriz alterados. Pasta histórica homologacao usada apenas como referência do código RC141, sem edição.
- Sem exclusões em massa, limpeza de histórico, limpeza de localStorage/bancos, migração entre ambientes, mudanças de autenticação, credenciais ou permissões externas.
- Artes Kids RC349, Owner RC351, Helper RC352 e seis avatares RC353 preservadas; nenhuma imagem gerada. Avatares e identificadores continuam associados aos mesmos cadastros.

## Correções e causas verificadas

1. Permissões: input nativo não deve participar da grade de duas colunas. A correção inicial de permissões das RC354–356 foi revisada contra estilos globais e injetados, cards de Convites e gamificação. Clique/Space, checked, aria-checked e estado visual sincronizados. Nenhum campo de salvamento removido.
2. Campos hidden: CSS de tarefa forçava display:block e cards display:grid mesmo com hidden. Regra responsável passou a excluir [hidden]; componente respeita hidden. Busca e alternância de notificação validadas.
3. Satélites: constante e leitor de eventos Owner ausentes causavam erro; restaurados da implementação aprovada, mesma chave. ID de estilo duplicado corrigido. Regra antiga de 86 px excluída dos novos avatares, preservando escala aprovada de 118 px.
4. Casa: step/min conflitantes bloqueavam durações válidas. Campos aceitam minutos inteiros positivos. Funções de manutenção, delegação e pontuação restauradas literalmente da RC141 aprovada, com proteção contra dupla conclusão/validação e liberação de nova pontuação em cada execução recorrente.
5. Perfil delegado: runtime externo omitia kind de manutenção e responsável compartilhado. Passa a exibir manutenção e identificação de quem assumiu/concluiu, mantendo os handlers existentes.
6. Financeiro: renda mensal voltou a abrir seu editor, sem somar fontes automaticamente; privacidade agora cobre valores negativos. Meu Progresso acessa leitores de metas e estatísticas de pagamentos no escopo correto, preservando cálculos existentes e sem migração ou gravação.
7. Rituais: nomes acessíveis/aria-pressed dos ícones; cabeçalhos corretos; título da tarefa principal acompanha renomeação do ritual quando seguia o título anterior. Cronograma Capilar mostra quantidade real de dias, sem alterar composição/datas.
8. Responsividade: campos de busca de tarefa e seletor Kids com 16 px. Busca de Criação & Ideias tinha min-width automático causando rolagem horizontal; corrigido no próprio componente com min-width:0.
9. Kids: texto do contador de cápsulas usa o mesmo estado da progressão vigente; antes o contador legado divergia. Espécies, acessórios, cores, imagens e regras individuais mantidos.
10. Index e runtime com marcadores RC357 e cache bust somente nos arquivos corrigidos; dados/cache pessoal não foram apagados.

## Matriz por módulo e fluxo

“Passou” significa o cenário descrito na candidata isolada, não todos os casos possíveis. Cancelar incluiu conferir que o valor anterior foi preservado. Recarregar incluiu conferir o registro salvo. Funções sem controle na interface são registradas, não presumidas.

| Módulo / fluxo | Problema e causa / correção | Testes executados e resultado | Pendências e limites |
|---|---|---|---|
| 1. Meu Dia — execução | Preservado motor de tempo e histórico | Adiar 30; começar; recarregar sessão ativa; concluir/continuar; editar 12 minutos; retomar +3. Um único evento de 15 minutos. Passou | Conflito com compromisso protegido durante sessão não exercitado |
| Meu Dia — projeto | Integração preservada | Começar bloco de 10; recarregar; concluir; projeto com 17%, 50 minutos restantes e um evento. Passou | Conclusão integral de projeto não testada |
| 2. Meu Dia Ideal — referência/preferência | Sem mudança de lógica | Obrigatórios; preferência Tarde/15; salvar/reabrir/recarregar; referência Autocuidado 80 e Financeiro 100. Passou | Preferências não expõem edição; exclusão não testada |
| Horários-base | Preservados dias e janelas | Criar/cancelar; selecionar Seg–Sex; renomear; salvar/recarregar; backup contém dias 1–5. Passou | Calendário após passagem real da semana não testado |
| 3. Planos — tarefas | Hidden e busca corrigidos | Obrigatório; texto longo; criar 30; editar/cancelar; salvar; concluir/reabrir; busca sem resultado oculta cards; modal estreito; notificação oculta/visível/oculta. Passou | Entrega externa da notificação não testada |
| Planos — compromissos | Lógica aprovada preservada | Criar 13/10 15:30/30 min; editar/cancelar; salvar recorrência semanal; recarregar e conferir próxima data. Passou | Execução da recorrência com passagem real da semana pendente |
| 4. Rituais — personalizados | Título principal e acessibilidade corrigidos | Criar 20 min, intervalo 2 dias, etapas/produtos; editar/cancelar/salvar/recarregar; evento extra 7 min; renomear pai mantém extra e atualiza principal; ícone Lua aria-pressed. Passou | Checkboxes das instruções são temporários e resetam ao reabrir; persistência desse checklist não validada |
| Rituais — produtos | Deduplicação existente preservada | Duas linhas repetidas enviadas a Compras produzem um item. Passou | Não foi ampliado parser de quantidade |
| Ritual Capilar | Cabeçalho/cronograma real | 33 dias efetivos, configuração Tarde cancelar/salvar/recarregar; cronograma-base e duração preservados. Passou | Ciclo completo com passagem dos dias não testado |
| Autocuidado | Cabeçalho sem descrição duplicada | 14 dias; editar/cancelar/salvar/recarregar; Revisar e repetir cria ciclo 2; Repetir igual cria ciclo 3. Passou | Encerrar foi confirmado, mas efeito temporal futuro não considerado validado |
| 5. Trabalho — frente/tarefa/nota | Sem troca de arquitetura | Criar frente/áreas; editar/cancelar/salvar; nota longa; tarefa 20; começar/concluir 1; repetir preserva histórico; transformar nota em tarefa preserva nota; recarregar. Passou | Sem busca disponível na interface dessa frente; exclusões não testadas |
| 6. Estudos — conteúdo/sessão/mapa | Sem mudança de lógica | Criar/editar/cancelar/recarregar; sessão ativa recarregada e concluída 1; registro passado 15; mapa 261; busca vazia/positiva; filtros/revisão/domínio. Passou | Progressão por passagem real de dias pendente |
| 7. Casa — rotina/jardim | Min/step e delegação | Criar duração válida 6; cancelar edição; salvar 10; dois destinatários/“todos”; aceitar/concluir; histórico 10; recarregar. Passou | Exclusão de registros reais não exercitada |
| Casa — manutenção | Funções RC141 restauradas | Obrigatório; criar/editar/cancelar/salvar; delegar Kids; aceitar/começar/recarregar/concluir; validação Owner; recorrência mensal duas execuções. Próximas datas 12/11 e 12/12; +5 por rodada, sem duplicação. Passou | Passagem real do mês não aguardada |
| Casa — procedimentos/equipamentos/receitas | Dados preservados | Procedimento editar/cancelar/salvar/recarregar; detalhes/produtos; criar utensílio/equipamento; receita doméstica com materiais e etapas. Passou | Utensílios não expõem edição; Casa receita→Compras e criação de dica não exercitadas |
| 8. Exercícios — ciclo/treino/registro | Integração Progresso preservada | Ciclo 10+5=15; obrigatório; editar/cancelar/salvar; planejamento semanal; começar/recarregar/concluir; editar registro 12; “Fiz outro” 10; dois registros distintos, substituição preserva planejado. Passou | Ciclo semanal completo em tempo real pendente |
| 9. Alimentação — próprio/outro | Guarda existente preservada | Cardápio próprio com receita; Não comi/Comi; evento único 100 kcal/10g; cardápio de outra pessoa com trackProgress:false; editar/cancelar/próxima cozinha/recarregar. Passou | Lancheira real do Henrique não alterada; testado cenário isolado equivalente, não dados reais |
| 10. Receitas — cadastro/consulta | Fluxos preservados | Busca sem resultado; filtro; criar porções/ingredientes/etapas/nutrição; obrigatório; editar/cancelar/salvar/recarregar/favorito; consulta. Passou | Campos nutricionais não receberam nova regra de cálculo |
| Receitas — compras | Seleção individual preservada | Modal filho cancelar/reabrir; desmarcar arroz; adicionar só banana. Passou | Quantidade textual ficou no nome do ingrediente, comportamento existente; não reivindicada como quantidade estruturada |
| 11. Compras — item/compra | Integração estoque preservada | Obrigatório; criar 2kg; filtrar; editar 3/cancelar preserva 2; salvar 3; marcar comprado/cancelar; confirmar 3kg/12,50; encerrar compra. Passou | Modal estreito específico de novo item não medido nesta etapa |
| Estoque — ajuste/base | Sem nova arquitetura | Estoque 3kg; ajuste cancelar mantém 3/salvar 2; base gera pendência 1kg; repetir não duplica; recarregar. Passou | Exclusão não testada |
| 12. Financeiro — renda/fontes | Editor e privacidade negativa corrigidos | Fonte 1000→1100 com cancelamento; renda 500 independente das fontes; recarregar; mascarar negativos/mostrar; restaurar backup retorna renda 600→500. Passou | Transações bancárias externas não existem nesse teste |
| Financeiro — contas | Estatísticas existentes mantidas | Conta 65; lembrete desligado por clique/Space; pagamento com desconto 2 =63/Pix/fonte; desfazer restaura pendente, saldo1100 e remove despesa/pontualidade. Passou | Entrega externa de lembrete pendente |
| Financeiro — orçamento/desejo/meta/coberto | Leitura Progresso corrigida | Orçamento 50→55; desejo100/Alta; meta100/aporte25; coberto30/benefício; editar/cancelar/salvar/recarregar; fluxo Pix expande. Passou | Desejo→Criar meta não exercitado; Leitura confirmada na candidata: aporte25/meta100 → alcance25% e dimensão Financeiro25%; pontualidade permanece sem dado após desfazer pagamento |
| 13. Criação & Ideias | Busca min-width corrigida | Ideia/texto longo/obrigatório; busca vazia; filtro; editar/cancelar; converter projeto60/blocos10/20; materiais→Compras; prioridade/prazo; recarregar; progresso17%. 320px sem rolagem horizontal, campo16px. Passou | Tipo Plano e conclusão integral do projeto pendentes |
| 14. Meu Progresso | Funções financeiras em IIFEs inacessíveis corrigidas por leitores | Semanal14 eventos vs15 histórico total (um estudo fora da semana); mensal/anual respondem; projeto1/exercícios2 únicos; dimensões configuradas100%. Passou nos cenários descritos | Meta financeira25% confirmada na candidata; dimensões sem referência permanecem sem dados; não são falhas presumidas |
| 15. Satélites — Adulto/Helper/Kids | Leitor Owner, IDs e escala corrigidos | Quatro registros somente QA; Adulto editar nome/avatar mantém ID; Helper e dois Kids; seis opções/identificadores/imagens; permissões click/Space/checked/aria/visual; papel Adulto→Kids; cancelar; recarregar. Passou | Sem contatos fictícios na rede real |
| 16. Delegação/conclusão compartilhada | Manutenção e responsável no perfil; dupla pontuação protegida | Múltiplos/“todos”; responsável protegido; conclusão aguardando Owner; notificações locais7; validação Kids antes/depois; histórico15 pares únicos(itemId,endedAt); mensal duas rodadas distintas. Passou | Push/Watch e entrega externa não testados |
| 17. Convites | Componente de permissão verificado | Vazio/obrigatório; cards ocultam input nativo; Space sincroniza; cancelar; encontro localQA com um destinatário; recarregar. Passou | Interface não expõe editar/RSVP/resposta; entrega externa não validada |
| 18. Owner | Artes e critérios preservados | 12 cores carregadas; Sálvia persistida; critério semanal personalizado; sala6 troféus/12 paletas/preview. Passou | Premiações automáticas após7/30dias reais pendentes |
| Helper — reconhecimento | Artes RC352 e mensagens mantidas | Mensagem personalizada e Brisa salvas; reconhecimento localQA e variações existentes carregadas; recarregar. Passou | Entrega externa e histórico por destinatário não plenamente exercitados |
| Kids — progressão/pets | Contador cápsula sincronizado | Seis universos e espécies/IDs; biblioteca/imagens carregadas; menino11 pontos conclui Gato e passa Coelho; menina0→3→8→13 independente; aos8 pontos contador2/5 igual resumo; Misto por acessório persistido. Passou | Virada real de30dias e todos os estágios futuros não testados; nenhum ranking/recompensa material introduzido |
| 19. Mais/ferramentas | Isolamento mantido | Links dos módulos; exportar60 conjuntos; alterar rendaQA; restaurar backup; exportar novamente: dados exatamente iguais nos60 conjuntos. Passou | Limpar homologação não acionado; restauração realHML não feita |
| 20. Navegação/modais/versão | Marcadores e cache bust restritos | Todos20 módulos acessados com fluxos acima; voltar/menu/reabrir/recarregar; X/Cancelar; desktop/390/320; IDs duplicados nenhum na candidata; console sem erro de aplicação nos trechos inspecionados. Passou | Safari/iPhone, teclado virtual e áreas seguras físicas não disponíveis; pós-publicação acompanhar PR |

## Evidências de preservação e limites

- Exportações da homologação antes/depois dos testes isolados: **os cinco conjuntos existentes exatamente iguais**, sem registros QA na HML.
- Exportação e restauração isoladas: **60 conjuntos exatamente iguais**, nenhuma chave alterada entre checkpoint e restauração.
- Histórico QA: **15 eventos, 15 pares únicos**, dois registros de exercício e um de projeto; pontos individuais menino11/menina13.
- Assets grandes comparados ao original: alteração de contador é apenas código/texto (573 caracteres); conteúdo de imagens preservado. Avatares recebem apenas marcador de versão.
- Chrome real em desktop e viewport320/390. Não foi testado Safari/iPhone físico. Não se declara funcionamento de teclado virtual, Watch/push, passagem real de dias/meses ou fluxos não exercitados.
- Incompletude inicial de imagens lazy não foi tratada como recurso quebrado; após carga os conjuntos inspecionados não tinham imagens com falha.
- Checklist de instruções de ritual não persiste ao reabrir; confirmar expectativa do produto antes de alterar sua semântica. Não é apresentado como persistência validada.
- Limitações e pendências da tabela são reais. Não se declara validação integral de todas as combinações de fluxo.
