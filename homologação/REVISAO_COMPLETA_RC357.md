# BERTH.A — matriz da revisão RC357–RC359

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
| 1. Meu Dia — execução | Preservado motor de tempo e histórico | Adiar 30; começar; recarregar sessão ativa; concluir/continuar; editar 12 minutos; retomar +3. Um único evento de 15 minutos. Passou | Compromisso QA13:41–14:11 conflita com Trabalho oficial: modal de conflito e escolha Priorizar o compromisso confirmados; atividade longa iniciada manualmente sobrepõe compromisso, no horário previsto o compromisso apareceu em Agora; sessões paralelas mantidas, concluir cada uma preservou a outra; recarga final sem sessões ativas |
| Meu Dia — projeto | Integração preservada | Começar bloco de 10; recarregar; concluir; projeto com 17%, 50 minutos restantes e um evento. Passou | Projeto curto isolado10/10 concluído100%, faltam0, persistido após recarga; card recebeu estado Concluído |
| 2. Meu Dia Ideal — referência/preferência | Sem mudança de lógica | Obrigatórios; preferência Tarde/15; salvar/reabrir/recarregar; referência Autocuidado 80 e Financeiro 100. Passou | Preferências não expõem edição; exclusão não testada |
| Horários-base | Preservados dias e janelas | Criar/cancelar; selecionar Seg–Sex; renomear; salvar/recarregar; backup contém dias 1–5. Passou | Calendário após passagem real da semana não testado |
| 3. Planos — tarefas | Hidden e busca corrigidos | Obrigatório; texto longo; criar 30; editar/cancelar; salvar; concluir/reabrir; busca sem resultado oculta cards; modal estreito; notificação oculta/visível/oculta. Passou | Entrega externa da notificação não testada |
| Planos — compromissos | Lógica aprovada preservada | Criar 13/10 15:30/30 min; editar/cancelar; salvar recorrência semanal; recarregar e conferir próxima data. Passou | Execução da recorrência com passagem real da semana pendente |
| 4. Rituais — personalizados | Título principal e acessibilidade corrigidos | Criar 20 min, intervalo 2 dias, etapas/produtos; editar/cancelar/salvar/recarregar; evento extra 7 min; renomear pai mantém extra e atualiza principal; ícone Lua aria-pressed. Passou | Checkboxes das instruções são temporários e resetam ao reabrir; persistência desse checklist não validada |
| Rituais — produtos | Deduplicação existente preservada | Duas linhas repetidas enviadas a Compras produzem um item. Passou | Não foi ampliado parser de quantidade |
| Ritual Capilar | Cabeçalho/cronograma real | 33 dias efetivos, configuração Tarde cancelar/salvar/recarregar; cronograma-base e duração preservados. Passou | Ciclo completo com passagem dos dias não testado |
| Autocuidado | Cabeçalho sem descrição duplicada | 14 dias; editar/cancelar/salvar/recarregar; Revisar e repetir cria ciclo 2; Repetir igual cria ciclo 3. Passou | Encerrar confirmado e backup/recarrega preserva ciclo3/status ended/endedAt; efeito de passagem futura dos dias não testado |
| 5. Trabalho — frente/tarefa/nota | Sem troca de arquitetura | Criar frente/áreas; editar/cancelar/salvar; nota longa; tarefa 20; começar/concluir 1; repetir preserva histórico; transformar nota em tarefa preserva nota; recarregar. Passou | Sem busca disponível na interface dessa frente; exclusões não testadas |
| 6. Estudos — conteúdo/sessão/mapa | Sem mudança de lógica | Criar/editar/cancelar/recarregar; sessão ativa recarregada e concluída 1; registro passado 15; mapa 261; busca vazia/positiva; filtros/revisão/domínio. Passou | Progressão por passagem real de dias pendente |
| 7. Casa — rotina/jardim | Min/step e delegação | Criar duração válida 6; cancelar edição; salvar 10; dois destinatários/“todos”; aceitar/concluir; histórico 10; recarregar. Passou | Exclusão de registros reais não exercitada |
| Casa — manutenção | Funções RC141 restauradas | Obrigatório; criar/editar/cancelar/salvar; delegar Kids; aceitar/começar/recarregar/concluir; validação Owner; recorrência mensal duas execuções. Próximas datas 12/11 e 12/12; +5 por rodada, sem duplicação. Passou | Passagem real do mês não aguardada |
| Casa — procedimentos/equipamentos/receitas | Dados preservados | Procedimento editar/cancelar/salvar/recarregar; detalhes/produtos; criar utensílio/equipamento; receita doméstica com materiais e etapas. Passou | Utensílios não expõem edição; Receita doméstica→Compras: somente material QA selecionado, categoriaCasa; nova dica cancelar não cria, salvar título/ícone/link e recarregar preserva. Passou |
| 8. Exercícios — ciclo/treino/registro | Integração Progresso preservada | Ciclo 10+5=15; obrigatório; editar/cancelar/salvar; planejamento semanal; começar/recarregar/concluir; editar registro 12; “Fiz outro” 10; dois registros distintos, substituição preserva planejado. Passou | Ciclo semanal completo em tempo real pendente |
| 9. Alimentação — próprio/outro | Guarda existente preservada | Cardápio próprio com receita; Não comi/Comi; evento único 100 kcal/10g; cardápio de outra pessoa com trackProgress:false; editar/cancelar/próxima cozinha/recarregar. Passou | Lancheira real do Henrique não alterada; testado cenário isolado equivalente, não dados reais |
| 10. Receitas — cadastro/consulta | Fluxos preservados | Busca sem resultado; filtro; criar porções/ingredientes/etapas/nutrição; obrigatório; editar/cancelar/salvar/recarregar/favorito; consulta. Passou | Campos nutricionais não receberam nova regra de cálculo |
| Receitas — compras | Seleção individual preservada | Modal filho cancelar/reabrir; desmarcar arroz; adicionar só banana. Passou | Quantidade textual ficou no nome do ingrediente, comportamento existente; não reivindicada como quantidade estruturada |
| 11. Compras — item/compra | Integração estoque preservada | Obrigatório; criar 2kg; filtrar; editar 3/cancelar preserva 2; salvar 3; marcar comprado/cancelar; confirmar 3kg/12,50; encerrar compra. Passou | Novo item em320px: modal320/scroll320; seis campos16px; cancelar sem gravar, passou |
| Estoque — ajuste/base | Sem nova arquitetura | Estoque 3kg; ajuste cancelar mantém 3/salvar 2; base gera pendência 1kg; repetir não duplica; recarregar. Passou | Exclusão não testada |
| 12. Financeiro — renda/fontes | Editor e privacidade negativa corrigidos | Fonte 1000→1100 com cancelamento; renda 500 independente das fontes; recarregar; mascarar negativos/mostrar; restaurar backup retorna renda 600→500. Passou | Transações bancárias externas não existem nesse teste |
| Financeiro — contas | Estatísticas existentes mantidas | Conta 65; lembrete desligado por clique/Space; pagamento com desconto 2 =63/Pix/fonte; desfazer restaura pendente, saldo1100 e remove despesa/pontualidade. Passou | Entrega externa de lembrete pendente |
| Financeiro — orçamento/desejo/meta/coberto | Leitura Progresso corrigida | Orçamento 50→55; desejo100/Alta; meta100/aporte25; coberto30/benefício; editar/cancelar/salvar/recarregar; fluxo Pix expande. Passou | Desejo→Criar meta: cancelar, criar meta100 e vínculo persistido; duas metas25%/0% agregadas13% no Progresso; Leitura confirmada na candidata: aporte25/meta100 → alcance25% e dimensão Financeiro25%; pontualidade permanece sem dado após desfazer pagamento |
| 13. Criação & Ideias | Busca min-width corrigida | Ideia/texto longo/obrigatório; busca vazia; filtro; editar/cancelar; converter projeto60/blocos10/20; materiais→Compras; prioridade/prazo; recarregar; progresso17%. 320px sem rolagem horizontal, campo16px. Passou | Tipo Plano: criarEstaSemana, editar/cancelar preserva, salvarEsteMês/recarregar; projeto curto10/10=100%, persistido; estado textual corrigido |
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
- Histórico QA: **18 eventos, 18 pares únicos**, dois registros de exercício e dois de projeto; pontos individuais menino11/menina13.
- Assets grandes comparados ao original: alteração de contador é apenas código/texto (573 caracteres); conteúdo de imagens preservado. Avatares recebem apenas marcador de versão.
- Chrome real em desktop e viewport320/390. Não foi testado Safari/iPhone físico. Não se declara funcionamento de teclado virtual, Watch/push, passagem real de dias/meses ou fluxos não exercitados.
- Incompletude inicial de imagens lazy não foi tratada como recurso quebrado; após carga os conjuntos inspecionados não tinham imagens com falha.
- Checklist de instruções de ritual não persiste ao reabrir; confirmar expectativa do produto antes de alterar sua semântica. Não é apresentado como persistência validada.
- Limitações e pendências da tabela são reais. Não se declara validação integral de todas as combinações de fluxo.

## Publicação e regressão posterior

- PR24 publicado: merge3f1c853f446784928d8defa9c1b42e1fb562991d. GitHub Pages run1323/38275869056, **Success**, build/deploy concluídos.
- URL aberta: https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/?v=357#satelites. Título, INDEX e HML RC357 confirmados, inclusive após navegação.
- Repetidos no index ativo: Novo satélite sem salvar; clique/Space sincronizam checked/aria; input nativo display:none; Adulto/Kids; controle Medalhas; quatro avatares adultos carregados; cancelar; tarefa nova, aviso oculto; ícones16 nomeados/seleção Lua; cancelar.
- Auditoria externa após publicação (arquivos reais do index, prefixo QA): Financeiro25%, alcance25%, projeto1/histórico14 semanal; satélites Kids em320px sem overflow, nome/tipo16px, nove inputs nativos ocultos.
- Três exportações HML (inicial, pré-publicação, pós-testes): **cinco conjuntos exatamente iguais**, nenhuma chave nova ou alterada. Nova leitura Progresso: quatro chaves financeiras QA exatamente iguais ao backup anterior.
- A recarga direta de Rituais revelou cabeçalho antigo “Meu Dia”. Correção restrita adicionada ao renderizador da lista, com query357-title para esse único script. PR25/facc314458a10cba6fe9bcfa839466a90fc5a32e publicado; run1324/38277374133 Success. Duas recargas de #rituais confirmaram Rituais, script357-title e os três marcadores RC357. Passou.

## Cenários finais complementares

- Casa receita doméstica enviou apenas o material selecionado à categoriaCasa de Compras. Nova dica: cancelamento não cria; salvamento de título, íconeOrganização e link preservado após recarga.
- Plano: criarEstaSemana; edição cancelada preserva título; salvarEsteMês e recarregar confirmou.
- Desejo: cancelar conversão; nova meta100 com vínculo preservado após recarga; meta anterior25/100 intacta. Meu Progresso agrega25% e0% em13%, conforme arredondamento existente.
- Projeto curto: criar10min; Meu Dia oferece bloco; começar/recarregar mantém sessão; concluir10; encerrar; recarregar projeto100%, faltam0min. Card ainda mostrava próximo passo/sugestão apesar do estado concluído: corrigido apenas texto do card, sem alterar motor, dados ou arquitetura. PR26/a3e9dec1af08a59a834e170d5a2224d2fddca04e, run1325/38279250378 Success. Auditoria externa após deploy: projeto100% exibe Concluído sem sugestão/próximo; projeto ativo17% mantém sugestão/próximo. Desktop e320px sem overflow, busca16px. Passou.
- Compromisso hoje13:41/30min: conflito com Trabalho oficial exibido; priorização confirmou faixa13:41–14:11 e sugestões deslocadas após14:11. Início manual de ritual45min permanece possível; não se reivindica bloqueio de execução manual.
- Nenhuma operação desses cenários finais foi feita no prefixo HML.

- Backup final QA:18 eventos/18 pares únicos, exercícios2, projetos2; cicloAutocuidado número3/status ended/endedAt confirma persistência de Encerrar. Ritual Capilar e compromisso foram iniciados separadamente (actives é a lógica existente), concluídos8min/1min, produzindo eventos distintos. Backup final: active:null, actives:[],18 eventos/18 pares únicos. Passou.

## Encerramento da revisão executada

RC357 publicada e verificada após PR24, PR25 e PR26. Último deploy funcional: **run1325/38279250378 Success**, commit **a3e9dec1af08a59a834e170d5a2224d2fddca04e**. Os testes dos20 módulos e fluxos estão na matriz; as pendências de acesso/dispositivo/tempo e semântica do checklist permanecem explicitamente abertas, não são apresentadas como concluídas.

Última exportação HML depois dos três deploys funcionais: **cinco conjuntos exatamente iguais ao backup inicial**, nenhuma chave nova, alterada ou removida. Nenhum cadastro fictício criado na HML, nenhum arquivo removido ou arte regenerada, nenhuma integração externa alterada.

O PR documental que inclui este encerramento altera somente esta matriz; seu deploy também deve ser conferido.

## Correção complementar RC358 — check único

A usuária identificou a marca sobreposta nos prints de iPhone após a revisão RC357. Essa falha visual passou pela inspeção anterior; não se confunde com os testes funcionais que haviam passado.

- Causa confirmada no CSSOM publicado: regra rc125 mantém content:"✓" com !important; regra rc192 cria o check por bordas e tenta content vazio sem !important. O mesmo pseudoelemento renderizava glifo e bordas.
- Correção: uma propriedade da regra existente rc192 em rc196-sat-owner-helper.js, content vazio com prioridade adequada. Nenhum handler, input, checked/aria, salvamento, permissão, integração ou imagem alterado.
- Publicação RC358: PR28, merge **72c7a070bcc0f1035063502f70cfc2a266859244**; GitHub Pages **run1327/38281673563 Success**, build e deploy confirmados.
- URL aberta e verificada: https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/?v=358#satelites.
- Pós-deploy: content do check selecionado é vazio, ::before:none, apenas as duas bordas2px desenham a marca; desmarcado content:none. Input nativo continua display:none. Screenshot da versão publicada confirma marca única.
- Cinco cards Adulto: clique alterna; Space restaura; checked, aria-checked e classe visual sincronizados em cada card. Quatro cards gamificação Kids repetiram o teste; troca Adulto→Kids manteve validação Owner. Cancelado sem salvar.
- Desktop,320px e390px: modal sem overflow, nome/tipo16px, nove inputs nativos ocultos.
- Convites isolados: seleção de destinatário por clique/Space, estado nativo/aria e marca única; cancelar, nenhum convite enviado.
- Backups antes/depois: **HML5/5 conjuntos exatamente iguais**, **QA62/62 conjuntos exatamente iguais**, nenhuma chave criada, removida ou alterada.
- Integrações preservadas: diff não contém lógica funcional; reabertos registros de exercícios10/12min, Progresso com projetos2, metas13% e17 conclusões semanais (18 totais; uma fora da semana), e painel Owner com conclusões compartilhadas existentes. Os testes persistentes de integração da matriz RC357 continuam sendo a evidência dos fluxos de Exercícios→Progresso, Receitas→Compras→estoque, delegação/validação/pontos Kids e metas financeiras. Não se afirma teste integral dessas integrações em iPhone físico.
- Rollback desta correção: **backup/bertha-pre-checkbox-rc358-380117f**, hash **380117ff8418d112cfa1ffb93e56b6e7fb057f55**. Branch **work/bertha-checkbox-rc358**.
- Mantidas as limitações de Safari/iPhone, teclado virtual, Push/Watch e passagem real de ciclos. Sem exclusões em massa, alterações indevidas de dados, credenciais, integrações externas ou artes.

O PR documental desta seção altera apenas a matriz; a conclusão exige verificar seu deploy também.


## RC359 — melhorias autorizadas e testes antes da publicação

Base confirmada: RC358, main **805b17df7d6be33db8d440026804dc11b9a180e7**. Rollback criado antes das alterações: **backup/bertha-pre-improvements-rc359-805b17d**, no mesmo hash. Branch funcional: **work/bertha-improvements-rc359**. Ambiente ativo permanece a pasta **homologação**, com acentos; produção e a pasta histórica sem acentos não foram alteradas.

As linhas abaixo complementam a matriz dos 20 módulos e prevalecem sobre as pendências anteriores relativas a checklists, edição de utensílios e respostas locais aos convites. Os demais limites registrados na revisão RC357/RC358 continuam válidos.

| Módulo / fluxo | Problema e causa | Correção aplicada | Testes efetivos | Resultado e pendências |
|---|---|---|---|---|
| Satélites / Owner / Meu Dia | Conclusões compartilhadas dispersas, sem fila central de ações | Fila lê os estados já existentes em Casa; validação tem prioridade; resumo no Meu Dia; Ver atividade abre o editor existente | Aceitar, começar, concluir missão Kids; pendência em rede e Meu Dia; validar pela fila; permanecer em Satélites; botão validar desaparece; manutenção avança para próxima ocorrência | Passou em QA. Nesta execução pontuada, 18→23 pontos, uma concessão de 5 pontos. Não substitui arquitetura nem handler aprovado |
| Casa / Satélites / estados compartilhados | Rótulos diferentes, duplicidade e ações esticadas pela grade | Apresentação comum: disponível para ajuda, delegada, assumida, em andamento, aguardando validação e concluída; inicialização do estilo aprovado; ações empilhadas em tela estreita | Estados delegada→assumida→em andamento→aguardando validação; concluída já existente; retorno recorrente a delegada; inspeção de texto e controles | Passou. Grade de uma coluna em quadros estreitos; botões de 40 px; sem overflow horizontal |
| Rituais / checklist por execução | Marcação efêmera ao reabrir e sem identidade de execução | Armazenamento separado por ritual, ocorrência/dia e execução; repetir cria sessão nova; retomar reutiliza a sessão; catálogo não recebe as marcações | Personalizado 2/3 após recarga; início conserva marcas; checklist completo não conclui atividade; repetir inicia 0/3; novo ritual 1/2 retoma 1/2; Capilar 1/6, Autocuidado 1/4 e extra 1/2 conservados após recarga | Passou. Etapas principal/extra independentes. Execuções antigas sem metadados não são migradas |
| Casa / utensílios e equipamentos | Cadastros personalizados e itens do catálogo sem edição completa | Editor único; personalizados conservam ID/createdAt e campos adicionais; catálogo recebe ajustes em mapa separado por nome original | Editar nome, quantidade 2→3, localização, observação longa; cancelar não grava; salvar/reabrir; item do catálogo renomeado e reaberto; nome vazio e quantidade 0 bloqueados; criação cancelada | Passou. Catálogo original e associações antigas preservados; nenhuma exclusão testada |
| Convites / Owner e destinatários | Sem editar evento, responder e consultar retorno | Edição conserva ID/createdAt/respostas; Vai/Talvez/Não vai por destinatário; resumo de respostas; checagem de destino e permissão antes de salvar | Editar/cancelar; múltiplos destinatários via teclado; cancelar resposta mantém Sem resposta; três opções salvas; segundo destinatário independente; reabrir/recarga; Owner mostra Não vai/Vai; obrigatório e zero destinatários bloqueados | Passou. Registro local no ambiente existente; não cria envio externo, autenticação nova ou sincronização entre aparelhos |
| Meu Dia / retomar | Última conclusão ficava oculta quando havia nova sugestão | Retomar aparece também junto à próxima sugestão, sem alterar planejamento | Concluir, encerrar, retomar, conferir checklist da mesma sessão e concluir retomada | Passou. Retomada soma tempo ao mesmo registro; não duplica o histórico |
| Modais / componentes compartilhados | X do utensílio excedia borda estreita; checkbox/grade exigiam regressão | X dentro do cabeçalho; ajustes restritos aos componentes novos | Quadros Chrome desktop 1100, 390 e 320 px (áreas úteis 1083/373/303 por bordas e scrollbar); campos 16 px; X dentro de 320; permissões Adulto/Kids e Convites por clique/Espaço; checked/aria sincronizados; input nativo oculto e marcação única | Passou no Chrome. Safari/iPhone físico, teclado virtual, safe areas reais e Watch não disponíveis |
| Dados / integrações congeladas | Risco de regressão ao acrescentar fluxos | Sem alterações em delegação, validação, pontuação, progresso ou notificações existentes | Seis funções comparadas exatamente; node --check dos três módulos; diff integral dos seis arquivos comparado às alterações preparadas; backups antes/depois | Passou: QA 62→65 conjuntos, nenhuma chave removida, 18/18 eventos antigos preservados, 23 eventos únicos, nenhum ativo. Exercícios, financeiro, compras e rede/permissões existentes permaneceram iguais |

### Evidências e limites desta etapa

- Os testes persistentes ocorreram somente em **bertha-qa-rc357::**. A homologação real usa **bertha-hml::**; nenhuma migração entre ambientes.
- Os três conjuntos novos em QA foram fila de repetição já prevista pelo motor, checklists e ajustes do catálogo. As alterações nos demais conjuntos correspondem aos testes descritos; IDs anteriores de rituais, eventos, utensílios e convite foram preservados.
- A primeira candidata revelou estado duplicado, retorno incorreto à Casa após validar pela fila e layout comprimido. Foram corrigidos e retestados. Uma divergência da compilação isolada com os módulos finais foi identificada por comparação do conteúdo e resolvida antes da validação final; não houve limpeza de cache ou dados.
- Candidata final conferida integralmente: **1.810.154 caracteres**, igualdade exata com o conteúdo preparado. Deploy isolado **1333 / 38292613639** confirmado **Success**, commit **3e6e736ac17fdf1a0fcb2e2b139b5b7fd6be87c0**. O HTML carregado foi conferido como contendo o CSS e a inicialização finais.
- Artes RC349, RC351, RC352 e seis avatares RC353 preservados. No arquivo de avatares, somente os marcadores RC359 mudaram. Nenhuma geração de imagens, exclusão em massa, mudança de credenciais, autenticação, permissões reais ou integração externa.
- Integrações existentes têm a evidência persistente da revisão RC357 e a regressão pontual acima. Não se afirma validação absoluta, teste em Safari/iPhone/Watch nem envio real de notificações na homologação, que permanece neutralizado pelo isolamento já existente.

**Publicação funcional e testes essenciais na versão publicada: pendentes nesta entrada; serão registrados após o deploy.**
