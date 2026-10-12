# BERTH.A — matriz da revisão RC357–RC362

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
| 2. Meu Dia Ideal — referência/preferência | Sem mudança de lógica | Obrigatórios; preferência Tarde/15; salvar/reabrir/recarregar; referência Autocuidado 80 e Financeiro 100. Passou | Edição implementada/testada na RC360; exclusão de registros reais não testada |
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
| 18. Owner | Artes e critérios preservados | 12 cores carregadas; Sálvia persistida; critério semanal personalizado; sala6 troféus/12 paletas/preview. Passou | RC360: coleção fixa occurrence=0/medal=1; progressão automática não comprovada nem implementada no renderizador inspecionado. Depende de definição das fontes dos critérios, além do teste temporal. |
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

**Publicação funcional concluída:** RC359, PR **35**, commit **c42d837ba6f908830b49dfc23743d7f3cb268f9d**. Deploy **1334 / 38294421196**, **Success**, duração **1m48s**. Link aberto e verificado: https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/?v=359#satelites

### Verificação pós-publicação RC359

- Index, título, badge HML e marcador INDEX confirmados como RC359. Arquivos carregados: core v359-improvements, time v359-checklists, satélites v359-queue e marcador de avatares RC359. Marcadores novamente conferidos após navegar entre Satélites, Casa, Rituais, Convites e Meu Dia.
- Fila vazia real exibida corretamente. Novo satélite aberto sem salvar: inputs nativos das permissões ocultos; checked/aria sincronizados por teclado; Adulto→Kids; gamificação e exigência de validação; marcação única; campos de 16 px; seis imagens RC353 carregadas.
- Casa: Editar Aspirador abre o editor correto, valores e fontes conferidos, cancelado sem gravação. Rituais: Capilar abre checklist 0/6 com controles de 20 px na HML real, sem marcações gravadas. Convites: estado vazio, novo convite sem destinatários e cancelamento, sem criar convites reais.
- Auditoria externa publicada carregando os mesmos módulos: checklist de retomada mantém 1/2; respostas Owner mantêm Não vai/Vai nos destinatários corretos.
- Backups comparados após os testes publicados: **HML 5/5 conjuntos exatamente iguais ao backup anterior**; **QA 65/65 conjuntos exatamente iguais ao fim dos testes isolados**. Nenhum erro do aplicativo nos registros de console capturados (mensagens da extensão do navegador foram separadas).
- Persistem os limites de dispositivo real e integrações externas já registrados. A revisão e os testes não garantem ausência absoluta de falhas.

Esta atualização documental altera somente a matriz; seu deploy também deve ser confirmado antes da entrega final.


## RC360 — preparação do Owner antes dos apps satélites

Base confirmada: RC359, **a5e44087c250672a9129dee974afe32e07511ebd**. Rollback criado no GitHub: **backup/bertha-pre-owner-rc360-a5e4408**, mesmo hash. Branch de correções: **work/bertha-owner-ready-rc360**. Branch QA de ciclos: **qa/bertha-owner-cycles-rc360**. Os PRs 37/38/39 publicam apenas candidatas QA; o index real continuou RC359 durante esses testes.

| Fluxo Owner | Problema e causa | Correção | Testes e resultado | Pendência / limite |
|---|---|---|---|---|
| Meu Dia Ideal — editar preferência | Mapa só oferecia remover; diálogo só inseria novo registro | Editar com mesmo ID, campos existentes e metadados preservados; validação de título, duração, data final e lembrete | QA: preencheu Tarde/15min; cancelar descartou alterações; título em branco, duração0, data final vazia e aviso0 bloquearam salvar; salvar Noite/2h/31-01-2027/aviso2dias; reabrir/recarregar; título longo em 320px sem overflow; campos16px; Escape, X e Enter; criação/edição em janela livre | Aviso é preferência armazenada, não teste de entrega externa. Safari/iPhone real não disponível |
| Compromissos — recorrência semanal | Math.floor da diferença em milissegundos falha na mudança de horário de verão (7dias tornam-se6) | Diferença de datas de calendário com Date.UTC, sem alterar critérios diário/semanal/dias úteis/mensal ou repeatUntil | 9 casos simulados em São Paulo e Nova York: virada de ano, término da recorrência, dias úteis, mensal31 preservado e semanas de8/15março2026; todos passaram após correção | Não é simulação de Push nem confirmação de mudança real de semana no aparelho |
| Rituais — repetir/revisar ciclo | Contador avançava sem mudar datas do cronograma | Novo cronograma inicia após a última ocorrência do ciclo, ou hoje quando o fim já passou; conserva intervalos, templates e overrides; revisão guarda snapshot anterior | 22 assertivas em cada fuso; navegador QA: Autocuidado repetir gerou24out–6nov,14dias; Capilar movido pela UI para terminar12out, revisar/repetir gerou13out–14nov,33dias e cuidados editados preservados | Relógio simulado apenas nos testes de fonte; sem alteração da data real. Ciclos completos em dispositivo físico continuam pendentes |
| Rituais — encerrar e estado vazio | Estado ended não filtrava futuras sugestões; selfcareProcedure(null) produzia objeto vazio/undefined | Bloqueio a partir da data de encerramento; consultas históricas anteriores preservadas; null permanece null; nota legível quando não há cuidado hoje | 2 verificações adicionais de evento ausente; regressão com ciclo QA encerrado e reiniciado; estado vazio final revalidado antes da publicação funcional | Não remove cuidados extras independentes, produtos, cronogramas ou históricos |
| Versão / carregamento | Correções precisam carregar sem divergência entre badge e index | Marcadores RC360, query própria no timer/avatar; artes dos seis avatares intactas | QA compilada comparada integralmente com fonte gravado; index/auditoria preservam CSS RC359 e namespaces separados | Pós-publicação registrado adiante após deploy |

Teste reproduzível: **tests/owner-tempo-rc360.cjs** lê as funções do timer ativo (não uma cópia de implementação). São33 verificações por execução:22ciclos +9recorrências +2eventos ausentes, executadas com TZ=America/Sao_Paulo e TZ=America/New_York. Testa invariantes com memória e relógio isolados, sem acesso a armazenamento/browser/notificações reais. Node --check do timer passou.

### Bloqueios reais para considerar o Owner fechado

| Dependência | Evidência verificada | Estado | Necessário para encerrar |
|---|---|---|---|
| Premiações automáticas Owner / histórico / seis cores | loadOwnerRewards grava configuração dos4critérios; roomItems do script ativo rc196-sat-owner-helper.js fixa occurrence0,toneFor(0),medal1; rc344/rc351 tratam artes/estilos, sem registrar ocorrências. Coleção é catálogo visual | **Lacuna funcional identificada**, não apenas aguardar7/30dias. Artes, IDs, configuração e paletas preservados | Definir fontes e condição de sucesso por critério já aprovado: quais metas, quais ciclos e qual medida diária conta como constância/100%; ligar registro idempotente ao histórico, testar6repetições e períodos sem retroconquistas fictícias |
| Satélites em aparelhos distintos | Satélites/Convites usam berthaHmlStorage; não há fluxo remoto de identidade, vínculo e sincronização nesses scripts ativos | **Não implementado**. A prévia local não constitui app satélite independente | Definir serviço e fluxo de identidade/vínculo; autorização específica para autenticação/permissões externas, congeladas pelo pedido; isolamento HML/produção; testes Owner/satélite com contas e dados de teste |
| Notificações externas | Preferências e eventos locais funcionais; entrega real remota não exercitada | **Não validado** | Ambiente/contas/dispositivos isolados e serviço aprovado; confirmar entrega e evitar duplicação |
| Safari/iPhone, teclado virtual, safe areas e Watch | Somente Chrome remoto disponível | **Sem acesso real para validar** | Teste físico; não declarar teste Safari a partir de viewport Chrome |
| Kids30dias e progressões futuras, hábitos/Estudos/Exercícios em semanas reais | Histórico de testes locais da matriz mantido; fontes congeladas não reescritas | **Validação temporal/dispositivo incompleta** | Testes longos/relógio isolado e regressão em ambiente adequado; não criar conquistas na rede real |

**O Owner ainda não está declarado pronto para os apps satélites.** RC360 fecha as correções locais verificáveis desta rodada; as dependências acima não foram substituídas por telas fictícias ou declarações de sucesso. Sem mudança de autenticação, credenciais, notificações externas, permissões ou arquitetura de integração. Sem artes regeneradas, exclusões em massa ou limpeza de dados.

### RC360 — resultados finais da candidata isolada

- Candidata final aberta com query **v=360-final**, fonte DOM confirmado contendo o guard de evento ausente. O iframe anterior v=360 ainda carregava a versão anterior em cache; nenhuma limpeza de caches/dados foi feita. Wrapper atualizado para a query final.
- Autocuidado: após mover o último dia pela UI em QA, Encerrar foi confirmado; mensagem correta persistiu após recarga, zero sugestões futuras, sem undefined. Meu Dia deixou de sugerir esse cuidado nativo encerrado e manteve o resumo da rede.
- Backups QA:65→67 conjuntos; nenhuma chave removida. Alterados apenas preferência/ciclos e cadastro explícito de templates/produtos durante o teste de mover datas. Entradas de templates/produtos anteriores integralmente preservadas; ID da preferência antiga preservado; janela livre manteve sourceZone=free após editar. Motor/histórico de execuções e permissões/redes satélites exatamente iguais ao backup RC359 anterior.
-33 assertivas do fonte final passaram em cada fuso (São Paulo/Nova York); Node --check passou. Deslocamento/reinício/encerramento de ciclos testados em QA, sem esperar33dias físicos.
- Backup real desta rodada exportado antes de publicação:5conjuntos. Comparação posterior à RC funcional ainda será registrada após deploy.

### RC360 — publicação e verificação externa

- PR40 integrado: **231447be3390a90c1ba808291354703b3b3617e7**. Deploy Pages1339, run38302079622: **Success**,1m49s.
- Homologação aberta em **https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/?v=360#dia-ideal**. HML/INDEX/title RC360; timer?v=360-owner e avatar?v=360-version carregados. Marcadores mantidos ao navegar Meu Dia Ideal/Satélites/Rituais.
- Real: Novo Meu Dia Ideal abrir/cancelar, foco no X e campos16px; Novo satélite abrir/cancelar, clique/Espaço/Enter sincronizam checked/aria-checked/is-checked; input nativo continua display:none e disponível no formulário. Adulto→Kids mantém as regras existentes; teste de Medalhas por teclado; seis avatares carregados (quatro adultos e dois Kids). Nenhum cadastro ou convite salvo.
- Auditoria externa com arquivos publicados: edição reabriu Noite/2h/data31-01-2027/aviso2dias; cancelamento; ciclo encerrado sem undefined/sugestões; backups67/67 conjuntos **exatamente iguais** ao término da candidata isolada.
- Responsivo final: wrapper queryv=360-final; viewport útil373px em largura390 e303px em largura320, modais sem overflow horizontal e campos16px. Tab alcança Salvar, Cancelar acessível; Escape fecha. Evidência visual: bertha-owner-rc360-edicao-validada-390.jpg (QA isolado, Chrome).
- Backup real antes/depois: **5/5 conjuntos exatamente iguais**, nenhum campo/chave alterado. Console: nenhum erro do aplicativo observado; mensagens da extensão de automação desconsideradas como externas ao app.
- Diff pré-publicação: os7arquivos,131acréscimos/36remoções de linhas, comparados integralmente ao fonte preparado; arquivos antigos preservados. Core, Satélites, Helper, Kids e artes não alterados (arquivo de avatar só teve2linhas de marcador de versão).
- Dependências de premiação automática, sincronização/autenticação remota, notificações e dispositivos físicos continuam **abertas**. Não declarar fechamento completo do Owner nem criação de apps satélites independentes a partir desta RC.


## RC361 — evidências de Boa Vida e conquistas do Owner

Base: RC360, `38c565a1e0d682cde493f6cfe6209f04588a4a15`. Rollback: `backup/bertha-pre-owner-progress-rc361-38c565a`, mesmo hash. Branch: `work/bertha-owner-progress-rc361`. A definição mais recente da usuária é: conquistas resultam das ações realizadas pelos módulos no Meu Dia, comparadas ao Meu Dia Ideal. Sono deve vir do Saúde/Watch quando houver integração real.

A matriz de 20 módulos acima continua válida como registro dos fluxos efetivamente exercitados; as limitações anteriores não são consideradas encerradas por esta RC.

| Módulo / fluxo | Problema e causa | Correção | Testes e resultado antes da publicação principal | Pendência |
|---|---|---|---|---|
| Meu Progresso / referências pessoais | Campos targetPercent/onTimePercent já salvos não eram usados pela lógica legada | Referência de consistência: dias distintos com ações concluídas na dimensão, divididos pelos dias de calendário decorridos e pelo percentual pessoal; teto100. Financeiro compara pontualidade à referência, mantendo agregados existentes. Deduplica somente a leitura; não reescreve histórico | Chrome QA: semana100%, mês10% com referência80%; nova conclusão no mesmo dia aumenta histórico23→24, mês permanece10%; metas financeiras25/0→100/100 refletidas na evidência de metas100% | É medida de continuidade, não volume/duração de todas as sugestões. Referências antigas mantêm fallback legado. Sono sem conexão permanece fora do cálculo. Resultado informa cobertura de referências mensuráveis |
| Premiações Owner / histórico | Sala mostrava catálogo com medalha inicial fixa e não registrava conquistas | Ledger separado bertha.owner.achievements.v1 com regra, evidências, ocorrência e cor; baseline inicial preserva ações anteriores sem retroconquistas. Mudar configuração não concede recompensa por si | QA:12 modelos inicialmente não conquistados; concluir primeira meta financeira gera uma medalha; reabrir/recarregar mantém uma; segunda meta gera segunda medalha e cor sálvia; arte RC351 loaded384px | Critérios existentes mantidos: dimensão100%, meta, sequência, ciclo. Sete/trinta dias e seis cores completos exercitados com relógio/dados isolados, sem esperar período real |
| Rituais / evidências de ciclo Owner | Repetir ou encerrar um cronograma não comprova execução | API de leitura dos IDs exatos e datas dos cuidados; somente ciclo com todas as ocorrências exigidas concluídas vira candidato | Testes: ciclo parcial, ID de prefixo parecido e ciclo vazio não premiam; todas as ocorrências exatas premiam. Templates/agendamento não alterados por essa API | Nesta RC o reconhecimento de ciclo automático cobre Capilar e Autocuidado nativos; marcos de ciclos de treino/projeto ainda precisam de mapeamento específico. Projeto concluído com prova no motor entra como meta |
| Exercícios → Meu Progresso | Integração congelada precisa sobreviver à nova leitura Owner | Gravador original preservado | QA: “Já fiz” registra Esteira20min; registro visível, progresso24 conclusões;23 anteriores preservadas integralmente em backup | Nenhum treino inserido na homologação real; temporalidade longa e aparelho físico pendentes |
| Financeiro → conquista Owner | Nova leitura não pode acionar migração financeira legada ou premiar aporte futuro | Snapshot evita loadFin quando existe somente financeiro.v1; candidatos financeiros leem metas nomeadas sem normalizar/salvar; data sem hora interpretada localmente; aportes com data futura ficam fora da nova conquista | Campo obrigatório vazio inválido; campos16px; cancelar75 não salva; registrar75 e100 em duas metas QA gera duas evidências independentes | Não é transação financeira externa. Métricas financeiras históricas gerais permanecem com semântica aprovada |
| Owner / modal longo | X desaparece ao rolar sala | Cabeçalho sticky com classe exclusiva da sala Owner e mesma base creme existente | Candidata390/320 sem overflow; Escape fecha,12 imagens carregadas. Falha do X identificada; correção preparada na branch | Revalidação do cabeçalho após publicação ainda necessária; Safari/iPhone físico indisponível |
| Dados / integrações congeladas | Revisão não pode alterar registros existentes | Nova chave isolada; nenhuma limpeza, migração para raiz ou mudança de permissão | Backup QA inicial67→68:67 originais exatamente iguais e ledger vazio. Final68→68: só metas nomeadas, exercícios, motor e novo ledger mudaram conforme testes;23 eventos anteriores íntegros. Nenhuma pessoa/convite/reconhecimento fictício criado na rede real | Comparação da homologação real pós-publicação será registrada após deploy |

Validação reproduzível: `owner-progress-rc361.test.cjs`,42 assertivas em TZ=America/Sao_Paulo e America/New_York, com armazenamento em memória. Inclui retorno original de setItem, debounce sem loop, idempotência, configuração/baseline, formato desconhecido preservado, recorrência, ciclos exatos e sequência das6cores. Node --check nos arquivos modificados e nos scripts inline da candidata passou.

Auditoria isolada: PR42, merge `3d3dce67e96146e743187a6b9810e8710c44f1d7`, deploy1341 Success; PR43 preservou critério de dimensão100%, merge `8ff9a9973d7ce03b2fa2f357e9eee06822f99dba`, deploy1342/run38308736500 Success2m16s. Esses PRs não ativaram a RC361 na homologação principal. Backups e registros de teste não foram publicados no repositório.

### Raiz, apps satélites, mensagens e localização

- Auditoria somente do fonte: o index da raiz ainda referencia versão antiga e contém namespace `bertha-hml::` e neutralização HML de Push. Não é seguro copiar o index da homologação para a raiz. Nenhum arquivo ou isolamento da raiz foi alterado nesta revisão.
- Ordem recomendada: fechar correções locais do Owner e validações necessárias; preparar ambiente de produção com isolamento explícito; promover código validado para a raiz sem transportar dados HML; construir/testar apps satélites na homologação; depois promover a integração validada entre aparelhos. Serviços compartilhados e contratos de dados devem ser preparados antes dos satélites, independentemente da promoção do frontend.
- Mensagens Owner→satélite são requisito novo, não implementação validada. O sistema ativo usa armazenamento local; é necessário serviço autenticado de sincronização e vínculo entre aparelhos. Mensagens não foram enviadas a pessoas reais.
- Localização escolhida pela usuária: **tempo real**. Requisito: início voluntário no app satélite, indicador de compartilhamento ativo, parada imediata, Owner destinatário autorizado individualmente, horário/precisão da última atualização e indicação de informação desatualizada. Nenhuma localização foi coletada, transmitida ou solicitada nesta RC.
- GPS contínuo com iPhone bloqueado/segundo plano e leitura Saúde/Watch dependem de integração nativa e testes em dispositivo físico; a presença de uma tela web não comprova esses comportamentos. Não há acesso Safari/iPhone/Watch/Xcode neste ambiente de revisão.
- Não declarar Owner integralmente encerrado: mapeamento dos demais ciclos automáticos, integração nativa Saúde/sono, sincronização remota, notificações externas e validação em dispositivos continuam abertos. Todos os testes persistentes desta rodada ocorreram no namespace QA isolado.


### RC361 — publicação e revalidação concluídas

- PR44 integrado em `145d13761d95b729309b06b0cdd3263169561e44`. Pages1343/run38310404597: **Success**. Diff integral:9arquivos de homologação, sem arquivos da raiz/artes; adições comparadas ao preparado, novo módulo e teste integrais. Não houve exclusão de arquivos.
- PR45 adicionou somente visor dos scripts publicados, mantendo candidata antiga. Merge `5daac9fd5f8349ed53374301c292cf29507003a5`. Pages1344/run38310632799: **Success**.
- Homologação real RC361 aberta, com title/HML/INDEX/build RC361 e core/timer/helper?v=361-owner, avatar?v=361-version, owner-progress-rc361.js?v=361-owner. Marcadores mantidos ao navegar Progresso/Satélites/Convites. Estado sem referências mostra “Construindo sua referência”,0conclusões e nenhuma porcentagem inventada.
- Backup real:5→6 conjuntos. Os5originais **exatamente iguais**; única chave nova bertha.owner.achievements.v1, awards vazio. Depois de abrir/cancelar Novo satélite e Novo convite:6/6 **exatamente iguais**. Nenhuma pessoa, convite, reconhecimento, refeição, exercício ou meta persistida na rede real durante esta rodada.
- QA externa:68/68 conjuntos **exatamente iguais** ao término da candidata; duas medalhas e cores0/1 persistidas. Semana23 e mês24 conclusões (um evento histórico anterior à semana); mês10% de Boa Vida e metas financeiras100%. Cobertura explicitada:1de2referências mensuráveis, financeiro sem pagamentos permanece indisponível.
- Permissões reais sem salvar: clique/Espaço/Enter alternam checked/aria-checked/is-checked em sincronia; input nativo display:none, única marca visual. Adulto→Kids conserva validação Owner obrigatória existente; Medalhas alterna pelo teclado; cancelar descarta. Convites reais sem rede mostram ausência de destinatários e Salvar desabilitado. QA: card de convite alterna por Espaço com estado/input/ARIA iguais; cancelar sem enviar.
- Sala Owner publicada: desktop720px de conteúdo; largura390→366px e320→296px, scrollWidth=clientWidth,12imagens carregadas. Ao rolar até o histórico em320, X continuou visível(top88px); click fecha, reabrir e Escape fecham. Evidência: bertha-owner-rc361-historico-320-publicado.jpg, **QA isolado/Chrome**, não Safari/iPhone.
- Console: nenhum erro do aplicativo observado nos logs consultados; mensagens da extensão do navegador excluídas. Não houve limpeza de cache/localStorage/bancos; cache-bust por query nas referências dos scripts.
- A correção de cabeçalho Owner e comparação de dados reais anteriormente pendentes nesta seção estão **revalidadas**. As dependências nativas, remotas e mapeamentos adicionais listados acima continuam abertas; não representam falhas visuais resolvidas nem funcionalidades GPS/mensagens implementadas.


## RC362 — ciclos de treino e projetos do Owner

Base confirmada: `805a7d3a2c69820545648a476b144148cc9bc544`, RC361. Rollback criado: `backup/bertha-pre-owner-cycles-rc362-805a7d3`, mesmo hash. Branch: `work/bertha-owner-cycles-rc362`. PR47 publica somente o módulo inicialmente inativo, testes, auditoria e visor QA; merge `1a1eb84f3448724305f12b3fa086bb8ff28e166e`. Pages1346/run38312880925 Success. Arquivos RC361 preservados.

| Módulo / fluxo | Causa / lacuna | Correção | Testes e resultado | Pendência |
|---|---|---|---|---|
| Exercícios / conquista de ciclo Owner | Fonte de ciclo só cobria rituais | Usa frequência semanal já configurada, cycleId, sessões e eventos concluídos exatos do Meu Dia. Cada sessão exige prova distinta; período semanal separado. Não altera gravador, programação ou integração aprovada | QA: ciclo existente1/2; iniciar/concluir pela UI registra1min e2/2; uma conquista de ciclo; reabrir/recarregar conserva somente uma. Testes rejeitam ausência de prova, IDs parecidos, duplicações, ciclo inativo, alvo ausente/zero/fracionário e provas futuras | É a frequência existente do app; não exige completar duração planejada nem impõe punição. Semana real longa ainda não foi aguardada |
| Criação & Ideias / conquista de ciclo e meta | Projeto comprovado já entrava como meta; faltava fonte para critério de ciclo | Projeto concluído com evento de execução pode atender aos dois critérios configurados, cada qual com ocorrência própria | QA: projeto1min criado/planejado0%; cadastrado sem conquista. Execução começou pelo card do Meu Dia; conclusão confirmou1min e chegou100%; ciclo2ªcor e meta3ªcor. Reabrir/recarregar mantém cinco conquistas no total | Uma execução é um único evento de progresso; receber dois tipos de conquista configurados não duplica o evento |
| Atualização / histórico cumulativo | Acrescentar fonte poderia premiar retrospectivamente projetos antigos | sourcesVersion2 no ledger, com baseline das novas fontes. Guarda todas as conquistas/evidências anteriores. Mudança da frequência/ativação dos ciclos gera baseline; normalização de campos neutros não muda a regra | Upgrade QA68/68: única chave alterada é ledger; duas medalhas antigas exatamente iguais, nenhuma nova no upgrade.65 assertivas em São Paulo/Nova York, incluindo fonte desconhecida preservada e idempotência | Não reescreve configurações, cadastros, históricos, permissões ou pontuações antigas |
| Dados / regressão | Novos reconhecimentos não podem alterar rede/integrações | Leitura de provas e uma chave de histórico; módulos de execução congelados | QA final68/68: alterados somente aprendizagem de duração, exercícios, motor, ideias e ledger conforme sessões/projeto testados.24eventos anteriores integralmente preservados;24→26 eventos; duas medalhas anteriores intactas; novas três têm provas rastreáveis | Testes persistentes somente namespace QA isolado; comparação real pós-deploy ainda será registrada |
| Sala Owner / responsivo | Histórico maior precisa continuar legível | Layout/arte/cabeçalho da RC361 mantidos | Desktop720px,390→366px,320→296px, scrollWidth=clientWidth;12 imagens carregadas, X visível ao rolar e Escape fecha. Evidência bertha-owner-rc362-ciclos-390.jpg, QA/Chrome | Safari/iPhone físico não disponível |

Verificações: `owner-progress-rc362.test.cjs`,65 assertivas por execução em dois fusos; sintaxe válida do módulo e todos os scripts inline da auditoria.4arquivos novos do PR47 comparados integralmente com fontes preparados; nenhuma remoção. Index principal durante a candidata permaneceu RC361.

### Backend existente — inspeção e retomada, sem modificação de regras

O conector Supabase identificou projeto **BERTH.A**, ref `ouxellokvigbdeeyvvfv`, região sa-east-1, criado16/09/2026. Inicialmente INACTIVE; consulta de estrutura falhou com timeout. Organização existente no plano free. A retomada foi executada pela operação restore_project; status passou COMING_UP e depois **ACTIVE_HEALTHY**, confirmado por get_project. Nenhum projeto/branch/plano novo criado.

Inspeção em leitura após retomada:8tabelas public.bertha_* com RLS ativo, todas com0registros;0contas auth.users; nenhuma tabela em supabase_realtime. Há estruturas de households, members, invitations, shared_tasks, task_events, kids_wallets, kids_awards e task_targets. Não há tabela de mensagens/localização nessa estrutura inspecionada. As políticas e funções foram lidas, sem alteração, sem cadastro de pessoas, convites, contas ou envio de mensagens/localização.

RLS ativo não equivale a validação de permissões individuais: tasks_read atualmente exige apenas private.bertha_is_household_member, sem recorte por destinatário/permissão naquela expressão. Isso deve ser revisado/testado antes de integrar apps satélites. Não foi alterada arquitetura ou política aprovada por iniciativa desta revisão local.

Dependências ainda abertas para mensagens/GPS: vincular identidades reais Owner/satélite em ambiente isolado, escolher/configurar fluxo de entrada, garantir recortes individuais e isolamento de ambiente no backend, implementar transporte protegido e testar entre aparelhos. O pedido de tempo real continua registrado; nenhuma posição foi coletada/transmitida e nenhuma notificação externa enviada. GPS contínuo em segundo plano e Saúde/Watch exigem ambiente nativo e teste físico; estes acessos não estão disponíveis no ambiente atual.

A raiz não foi promovida nesta RC. Seu index auditado usa namespace HML e versão antiga. Não copiar index/dados HML para produção; preparar isolamento explícito e revisar recursos/cache antes da promoção. A retomada do backend não prova que o frontend já está conectado a ele.

Checagem automática Supabase get_advisors(type=security): lints=[] após retomada. Isso não avalia a semântica dos recortes individuais citada acima. Não houve alteração de Auth/RLS, nem inserção/remoção de linhas no backend.


### Comunicação/GPS — bloqueios confirmados por leitura, sem acionamento

- Edge Functions existentes: apenas bertha-push, ACTIVE, versão9, verify_jwt=false. Fonte examinado: POST recebe subscriptionId/message/title; verifica origem quando presente, mas não verifica token de usuário, vínculo familiar ou propriedade da inscrição antes de chamar OneSignal. CORS/origem não autentica o remetente. Nenhuma chamada de envio foi feita, nenhum segredo foi impresso ou alterado. Não reaproveitar esta integração congelada para mensagens/GPS como se estivesse autorizada por pessoa.
- A função privada bertha_is_household_member(hid) retorna Owner ou membro ativo com user_id igual a auth.uid(). A política tasks_read usa apenas essa condição: não há filtro por assignee/targets ou pelas permissões individuais. A função privada confirma o alcance do problema, além da inspeção da expressão da política. Não foi modificada.
- Existem zero contas Auth e zero registros nas oito tabelas consultadas; não existem destinos reais vinculados para um teste entre Owner e satélite. Não foram inventadas contas/pessoas/convites. Realtime ainda não tem tabelas publicadas; backend ativo sozinho não é comunicação funcionando.
- Para uma implementação verificável: canal de mensagem deve resolver destinatário por membership autenticado, guardar remetente pelo servidor, limitar leitura a remetente/destinatário e separar ambiente. Localização deve ser opt-in do próprio satélite, com Owner autorizado individualmente, início/parada visíveis, posição/acurácia/horário e expiração; revogação precisa interromper novos dados e a leitura. Não publicar coordenadas em canal aberto ou reaproveitar acesso por família como autorização individual. Testar isolamento e revogação antes de integrar push.
- GPS contínuo em segundo plano no iPhone e Health/Watch exigem implementação nativa e testes físicos. Só há Chrome remoto disponível; nenhuma posição real foi coletada/transmitida. Não há identidades inventadas ou teste real entre aparelhos.


### RC362 — publicação e revalidação concluídas

- PR48 integrado em ec9e26270bebacf921f66e67794897d5a3522ca2. Pages1347/run38315211427: **Success**, build e deploy concluídos. Diff integral dos seis arquivos revisado: index, auditoria externa, dois guardas do módulo, quatro assertivas adicionais, marcadores de versão e matriz; sem alteração do motor/helper/artes/raiz e sem exclusão de arquivo.
- URL real aberta e verificada: https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/?v=362#progresso. Title/index/build RC362; core/timer/helper continuam361-owner; avatar362-version e owner-progress-rc362.js362-cycles realmente carregados.
- Backups HML real pré6→pós6: cinco conjuntos anteriores exatamente iguais. Somente ledger ganhou sourcesVersion2; nenhuma conquista nova ou antiga alterada. Após abrir sala/fechar por Escape, navegar Satélites, alternar checkbox por clique/Space, Adulto→Kids, Space em medalhas, Cancelar, abrir/cancelar Convites e recarregar: seis conjuntos exatamente iguais ao pós-deploy.
- Cards nativos display:none nos nove componentes; marca selecionada content vazio (uma única marca por bordas), desmarcada content none; grade28px e coluna de texto ampla, checked/aria sincronizados. Kids manteve validação Owner obrigatória; seis opções de representação preservadas. Nenhuma pessoa/convite foi salva.
- Auditoria externa dos scripts publicados:68→68, todas as chaves/valores exatamente iguais ao final da candidata. Cinco conquistas permanecem únicas: duas de ciclos, três de metas. Reabrir/recarregar não premia de novo; todos os26eventos, incluindo24anteriores, mantidos.
- Sala após publicação: desktop720px;390→366px;320→296px; scrollWidth=clientWidth,12imagens carregadas. Rolagem até histórico em390: X top88px, cabeçalho sticky. Screenshot bertha-owner-rc362-publicado-390.jpg é QA isolado em Chrome; não é Safari/iPhone.
- Console nos trechos recentes inspecionados: nenhum erro atribuível ao app; mensagens de erro da extensão de metadados do navegador foram separadas. Isto não é garantia de ausência absoluta de erros em qualquer fluxo.
- Testes finais65/65 em São Paulo e Nova York e sintaxe passaram. Preservados arquivos RC361 e artes já aprovadas; sem exclusões em massa, limpeza de storage/bancos, migração de dados para raiz, alteração Auth/RLS, notificações enviadas ou coleta de localização.
- Comunicação entre aparelhos, GPS, Saúde/Watch, isolamento de produção e promoção da raiz permanecem **pendentes**, pelos limites e achados de acesso documentados acima. Esta RC conclui a correção local de ciclos de treino/projeto; não declara a BERTH.A inteira ou os apps satélites concluídos.
