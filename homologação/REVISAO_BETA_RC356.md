# BERTH.A — revisão beta RC356

**Estado: revisão parcial. Os 20 módulos foram inspecionados, mas nenhum foi declarado integralmente homologado.**

As correções dirigidas foram publicadas nas RC354/RC355; a RC356 corrige inicialização e a sugestão local da cozinha quinzenal. Validação pós-deploy RC356 pendente nesta edição.

## Base, caminho e rollback

- Caminho ativo confirmado: homologação, com acentos. Não foi tratado como homologacao.
- Base anterior à revisão: 1d7e0d853b4a6d81c89228b19940407c7ef2f533. Rollback: backup/bertha-pre-review-1d7e0d8.
- RC354: PR #10, c030e712ee22ce41fe62ee5870e216eeb0638400, deploy 38191058472 Success.
- RC355: PR #11, 66f997d4db9db89702f0158150cdb5bf0758af5b, deploy 38191764986 Success.
- Branch RC356: work/bertha-beta-review-rc356, baseada em 66f997d4db9db89702f0158150cdb5bf0758af5b. Rollback adicional: backup/bertha-pre-rc356-66f997d.
- Backup intermediário também preservado: backup/bertha-pre-rc355-c030e71.
- Browser efetivo: Chrome desktop 1363×936. Safari/iPhone/teclado virtual/viewport estreito não testados.

## Problemas, causas e correções

1. Permissões de Satélites tinham três filhos no grid de duas colunas. O checkbox nativo era exibido por CSS de casa-dialog. RC354 não venceu a prioridade porque a regra global usa :is(...,#ideaDialog,...), conferindo especificidade de ID. RC355 restringe a ocultação a dialog.sat-modal :is(#satForm,#inviteForm) .sat-permission > input[type=checkbox]. Campos, IDs e eventos mantidos. Controle visual e foco restaurados. Pós-deploy: input none, controle 24px, texto 539px; nove opções passaram clique e Space com checked/aria/classe sincronizados.
2. Alimentação: display:grid!important em .food-owner-check anulava display:none. Retirado apenas esse !important. Outra pessoa ↔ Meu cardápio testado na RC354, com campo Progresso oculto/reapresentado. O salvamento continua forçando trackProgress false para other.
3. Planos/Compromissos: data UTC mudava o dia após 21h em Brasília. Reutiliza todayISO local; nenhum registro ou regra de recorrência foi migrado. Novo compromisso publicou 2026-10-11, em vez do 2026-10-12 anterior.
4. Próxima cozinha: em 11/10 a sugestão quinzenal aparecia como 26/10, por conversão UTC da data local +14 dias. RC356 usa todayISO(base); d.nextCookingDate já cadastrado continua prioritário.
5. Trabalho: rota faltava no mapa de títulos, resultando em Minha Vida. Título Trabalho confirmado no módulo e em CREFITO. Emojis legados removidos somente do mapa de títulos.
6. Inicialização: render() era executado no meio do core, antes do runtime final. Ao abrir por Satélites, loadSatelliteOwnerEvents não existia, causando exceção e interrompendo o restante do arquivo. Depois Premiações falhava em R147_RECOG_TARGET antes da inicialização. RC356 adia a mesma primeira chamada para DOMContentLoaded, uma vez, ou requestAnimationFrame se o documento já estiver pronto. Não acrescenta observer nem substitui renderizadores.
7. Marcadores e cache-bust restritos aos arquivos alterados; artes RC349/RC351/RC352/RC353 intactas.

## Matriz dos 20 módulos

| Módulo | Problema/causa/correção | Testes executados | Resultado | Pendências |
|---|---|---|---|---|
| 1. Meu Dia | Nenhuma correção neste módulo | Tela com sugestões; Horários-base aberto/fechado | Parcial; não homologado integralmente | Ainda sem concluir/retomar/adiar |
| 2. Meu Dia Ideal / Horários-base | Nenhuma correção neste módulo | Criar sem salvar, períodos/dias, inclusão de horário, cancelar; campos 16px, sem overflow desktop | Parcial; não homologado integralmente | Persistência e conflitos |
| 3. Planos / Tarefas / Compromissos | Data UTC em Planos/Compromissos: usar todayISO local já existente; recorrência preservada | Planos e Tarefas vazios; Nova tarefa: texto longo, período, recorrência, cancelar; campos 16px; Compromissos vazio e Novo compromisso aberto/cancelado | Parcial; não homologado integralmente | Compromissos e persistência |
| 4. Rituais | Nenhuma correção neste módulo | Novo ritual aberto/cancelado; campos 16px, sem autofocus/IDs duplicados/overflow desktop | Parcial; não homologado integralmente | Todos os fluxos |
| 5. Trabalho | Título Minha Vida em Trabalho: rota incluída no mapa de títulos | Frente CREFITO aberta; Nova frente e Nova demanda abertos/cancelados; campos 16px | Parcial; não homologado integralmente | Todos os fluxos |
| 6. Estudos | Nenhuma correção neste módulo | 260 mapas presentes; Adicionar conteúdo aberto/cancelado; campos 16px | Parcial; não homologado integralmente | Todos os fluxos |
| 7. Casa / manutenção / jardim / utensílios / equipamentos | Nenhuma correção neste módulo | 26 rotinas; manutenção com Delegar/Todos sem destinatários; Nova rotina Jardim e Novo equipamento abertos/cancelados; inventário e equipamentos existentes inspecionados | Parcial; não homologado integralmente | Todos os fluxos |
| 8. Exercícios / ciclos | Nenhuma correção neste módulo | Novo ciclo; adicionar bloco: total 30 → 40 min; cancelamento; campos 16px | Parcial; não homologado integralmente | Conclusão → Progresso e demais fluxos |
| 9. Alimentação | display:grid!important anulava display:none do campo Progresso para Outra pessoa: removido somente o !important de display em .food-owner-check; sugestão da próxima cozinha convertida para data local, preservando d.nextCookingDate já salvo | Estado vazio; Programar próxima e Novo cardápio; seleção Outra pessoa; cancelar; conflito de CSS no campo de Progresso confirmado | Parcial; não homologado integralmente | Lista de Compras; lancheira fora do Progresso |
| 10. Receitas | Nenhuma correção neste módulo | Pesquisar strogonoff; abrir receita; ingredientes à lista; desmarcar cebola; cancelar modal empilhado; Nova receita abrir/cancelar | Parcial; não homologado integralmente | Ingredientes → Compras e demais fluxos |
| 11. Lista de Compras / estoque | Nenhuma correção neste módulo | Lista/estoque vazios; Encerrar compra desabilitado; Adicionar item e Ajustar estoque abrir/cancelar | Parcial; não homologado integralmente | Compra → estoque e demais fluxos |
| 12. Financeiro | Nenhuma correção neste módulo | Estado vazio; Nova conta prevista abrir/cancelar; campos/vencimento/lembretes inspecionados | Parcial; não homologado integralmente | Todos os fluxos |
| 13. Criação & Ideias | Nenhuma correção neste módulo | Nova entrada; troca Ideia → Projeto; campos 16px, cancelar | Parcial; não homologado integralmente | Todos os fluxos |
| 14. Meu Progresso | Nenhuma correção neste módulo | Visão sem referências, financeiro e compras vazios | Parcial; não homologado integralmente | Integrações e demais fluxos |
| 15. Satélites / Adulto / Helper / Kids | Input nativo como 3º item de grid; ocultação restrita, controle visual e foco no botão | RC355: input computado none; controle 24px; texto 539px. Nove opções: clique e Space com checked/aria/classe sincronizados. Enter, Tab e foco 2px; Adulto → Kids preserva Casa e ativa validação; salvar sem Nome bloqueado; cancelar/reabrir restaura defaults; avatares Kids carregados e Adulto renderizados na captura real | Componente passou testes dirigidos RC355; módulo parcial | Persistência/edição de cadastro e testes Safari/tela estreita não executados |
| 16. Delegação / conclusões compartilhadas | Nenhuma correção neste módulo | Casa manutenção: Delegar oferece Todos e informa ausência de destinatários; nenhum destinatário criado | Parcial; não homologado integralmente | Bloqueado: sem destinatários; core referencia loadSatelliteOwnerEvents e SAT_OWNER_EVENTS_KEY sem definição identificada; chave original não recuperada nas fontes consultadas |
| 17. Convites | Nenhuma correção neste módulo | Novo convite abrir/cancelar; Enviar desabilitado sem destinatários; campos 16px | Parcial; não homologado integralmente | Bloqueado: nenhuma pessoa habilitada; cards de seleção, envio e respostas não testados |
| 18. Premiações / Owner / Kids / Helper | Nenhuma correção neste módulo | Owner: Sala de Troféus abre; 12 imagens RC351 carregadas. Helper: personalização abre, 9 imagens RC352 carregadas, 18 botões Rosé/Brisa, campos 16px. Kids mostra ausência de cadastro | Parcial; não homologado integralmente | Sem Kids/Helper cadastrados; progressão, envio, histórico e ciclos não validados. RC355 reproduziu erro após abrir por Satélites; inicialização corrigida na branch RC356, teste pós-deploy pendente |
| 19. Mais / ferramentas HML | Nenhuma correção neste módulo | Menu abre/fecha; exportação real de backup JSON válido HML, cinco conjuntos, 3497 bytes; restauração e limpeza não acionadas | Parcial; não homologado integralmente | Restauração em ambiente comprovadamente isolado |
| 20. Navegação / modais / versão / cache | Inicial render() interrompia core antes do runtime final; chamada movida para DOMContentLoaded (uma vez). Marcadores/cache-bust RC356; sem novo observer | Main e Pages em RC353; index e scripts inspecionados; navegação entre telas acima; navegados todos os módulos acima; um erro do app em Premiações registrado, separado de erros da extensão Chrome | Parcial; não homologado integralmente | Pós-deploy RC356; Safari/iPhone/teclado virtual/tela estreita indisponíveis; namespace da raiz também é bertha-hml::, isolamento persistente não homologado |

## Matriz de fluxos importantes

| Módulo | Fluxo | Teste/evidência | Resultado e pendência |
|---|---|---|---|
| Meu Dia | Começar / concluir / continuar / retomar / adiar | Não acionados | Pendente: timer, persistência e regressão |
| Meu Dia Ideal | Adicionar preferência, períodos e cancelar | Formulário aberto/cancelado; campos 16px | Parcial; salvar/editar/persistir pendentes |
| Horários-base | Dias específicos, adicionar horário, fechar X | UI testada sem salvar | Parcial; conflito e persistência pendentes |
| Tarefas | Novo, texto longo, período e recorrência, cancelar | UI testada | Parcial; criar salvo/editar/concluir/reabrir/reload pendentes |
| Compromissos | Novo e data local | RC354: 2026-10-11; cancelado | Direcionado passou; salvar/editar/recorrência pendentes |
| Rituais | Novo ritual e cancelar | Campos 16px; sem autofocus/IDs duplicados/overflow desktop | Parcial; capilar/autocuidado e ciclo não concluídos |
| Trabalho | Nova frente / demanda, cancelar; abrir CREFITO | UI e título Trabalho na subrota testados | Parcial; notas/projetos/reuniões/salvamento pendentes |
| Estudos | Biblioteca / Novo conteúdo | 260 mapas; formulário cancelar | Parcial; mapa/questões/histórico/timer/salvar pendentes |
| Casa | Manutenção / Delegar / Todos | Formulário abre; nenhum destinatário disponível | Parcial; pontuação e compartilhamento com pessoas pendentes |
| Casa / Jardim | Nova rotina, cancelar | UI testada | Parcial; salvar/editar/delegar/concluir pendentes |
| Casa / equipamentos | Inventário / Novo equipamento, cancelar | 35 produtos, 19 equipamentos; campos 16px | Parcial; saldo/edição/compra pendentes |
| Exercícios | Novo ciclo, adicionar bloco e cancelar | Total 30 → 40 min; campos 16px | Direcionado passou; persistência e composição variável pendentes |
| Exercícios → Progresso | Iniciar / concluir treino e refletir progresso | Não acionados | Pendente; integração preservada no código, não revalidada |
| Alimentação | Próxima cozinha | RC353 sugeria 26/10 em 11/10; padrão de 14 dias convertido para data local na RC356 | Teste publicado pendente; datas cadastradas preservadas |
| Alimentação | Outra pessoa ↔ Meu cardápio | RC354: Progresso none/grid; campo pessoa grid/none | Direcionado passou; sem salvar cardápio |
| Lancheira → Progresso | Consumir e verificar exclusão | Fonte: owner other e trackProgress false; salvamento força false para other | Inspeção de fonte; integração não testada |
| Receitas | Pesquisar / ver / editar novo formulário | Busca strogonoff, abrir receita, Nova receita e cancelar | Parcial; editar registro/salvar não testados |
| Receitas → Compras | Ingredientes, desmarcar e cancelar | Modal empilhado testado sem adicionar | Parcial; gravar selecionados/deduplicação pendentes |
| Compras | Adicionar item / cancelar / filtros estado vazio | Formulário testado; encerrar desabilitado sem itens | Parcial; salvar/comprar/persistência pendentes |
| Compras → estoque | Finalizar compra e refletir saldo | Ajustar estoque vazio abre/cancela | Pendente: compra real isolada, saldos e reabertura |
| Financeiro | Nova conta prevista / cancelar | Vencimento, lembretes e campos 16px inspecionados | Parcial; salvar/pagar/repetir/privacidade/metas pendentes |
| Criação & Ideias | Nova entrada / trocar Projeto / cancelar | Campos 16px; sem autofocus/IDs duplicados/overflow | Parcial; salvar/editar/material para compras pendentes |
| Meu Progresso | Referências e resumos de finanças/compras | Visão sem referências e resumos vazios | Parcial; agregações e integrações pendentes |
| Satélites / permissões | Cards Adulto e Kids, teclado e sincronização | RC355: nove opções passaram por clique/Space; Enter/Tab/foco e input oculto confirmados | Passou nos testes direcionados desktop; cadastrar/editar não testados |
| Satélites / cadastro | Obrigatório Nome / cancelar / reabrir | Salvar vazio bloqueado; rede continua zero; defaults retornam ao reabrir | Direcionado passou; nenhum cadastro salvo |
| Delegação | Múltiplos / todos / conclusão / validação Owner | Sem destinatários; APIs de eventos do Owner precisam de origem verificada | Bloqueado, sem pessoas fictícias |
| Convites | Novo / obrigatório / cancelar | Enviar desabilitado sem pessoas; campos 16px | Parcial; cards dos destinatários apenas cobertos por seletor #inviteForm na fonte |
| Owner | Sala de Troféus / coleção | RC353 após reload: sala abre, 12 imagens RC351 carregadas | Parcial; critérios, histórico, repetição e cores não testados |
| Helper | Personalizar reconhecimentos | RC353 após reload: 9 imagens, 18 opções Rosé/Brisa, campos 16px | Parcial; alteração de cor pode salvar automaticamente e não foi acionada; envio pendente |
| Kids | Ciclo / progressão / cápsulas / acessórios | UI sem Kids cadastrados | Bloqueado; nenhuma espécie/asset/identificador alterado |
| Mais | Abrir / fechar / exportar backup | JSON baixado e validado | Exportação passou; restauração/limpeza não testadas |
| Bootstrap | Abrir por Satélites → Premiações | RC355: loadSatelliteOwnerEvents ausente aborta render() no meio do core; R147_RECOG_TARGET fica não inicializado | RC356 adia render inicial; regressão publicada pendente |
| Versão / navegação | Title / HML / INDEX / arquivos carregados | RC354 e RC355 conferidos; RC356 na branch | Pós-deploy e navegação RC356 pendentes |

## Impedimentos reais e achados que não foram escondidos

- Sem cadastros de Satélites nesta sessão. Nenhuma pessoa, convite ou reconhecimento fictício criado. Destinatários múltiplos, cards de Convites com pessoas, conclusões compartilhadas, envio de reconhecimento e progressão Kids não foram validados.
- O index da raiz também declara bertha-hml::. Não foi homologado isolamento para testes persistentes. A configuração não foi alterada e não foram criados registros de teste. A raiz tem título Homologação RC239 e referencia app-v2.8.221-rc196.js na raiz; a consulta desse caminho no repositório retornou 404. Isso é um achado estático, não um teste do ambiente pessoal de produção.
- O core consultado referencia loadSatelliteOwnerEvents e SAT_OWNER_EVENTS_KEY sem definir leitor/chave. satellites-v161 apenas usa o leitor se disponível. Versões do mesmo core em 07/10 (d0cb935) e primeiro upload 03/10 (7d1d815) também não forneceram essa definição. GitHub Code Search informou que o repositório estava sendo indexado e não trouxe resultados. Não foi inventada chave nem aplicado retorno vazio para fingir que o histórico funciona. Recuperação da origem e teste dos eventos Owner permanecem pendentes. A correção RC356 de inicialização não certifica esse fluxo de dados.
- Novo ritual mostrou botões de ícones sem nome no DOM acessível; investigar rótulos. Cards de avatar computaram radius 0px; não foram redesenhados por iniciativa própria.
- Há outros usos de conversão UTC no core (Exercícios e históricos, por exemplo); ficaram como candidatos de auditoria para teste em ambiente isolado, sem modificar a integração congelada de Exercícios com Progresso.
- Safari/iPhone, safe areas, teclado virtual, autozoom, viewport estreito, estados longos em todas as telas e cache no aparelho não testados. Ctrl+plus não alterou o viewport; nenhum teste móvel declarado.
- Formulários auditados: sem campos visíveis abaixo de 16px, sem autofocus, sem IDs duplicados e sem overflow horizontal no desktop observado. Isso não certifica todas as variações de conteúdo. A medição automática do modal empilhado de ingredientes alcançou a receita subjacente; seleção/cancelamento foram testados, layout daquele modal não foi certificado.
- Recursos: 12 imagens Owner, 9 Helper e avatares observados carregaram nos testes registrados. Isso não certifica todas as artes/universos/enquadramentos/transparências nem URLs que dependem de Kids cadastrado.

## Dados e escopo preservados

Nenhuma exclusão de arquivo ou de histórico Git; matrizes anteriores mantidas. Sem limpeza de localStorage, caches de dados, bancos ou cadastros; sem importação de backup ou migração HML → produção. Sem alterações de credenciais, autenticação, permissões de pessoas, notificações ou integrações externas. Nenhuma arte regenerada. Identificadores, normalização e arquivos Kids/Owner/Helper/avatares mantidos. Não foram salvos cadastros ou conteúdos de teste. Exportação de backup foi testada; restauração e limpeza não foram acionadas. Preservação dos dados pessoais no iPhone não foi verificada por acesso ao aparelho.
