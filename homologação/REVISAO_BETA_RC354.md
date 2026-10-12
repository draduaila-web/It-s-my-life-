# BERTH.A — matriz de revisão beta RC354

Status: inspeção parcial de todos os 20 módulos; nenhum módulo declarado integralmente homologado. Correções na branch; validação pós-deploy pendente.

Base: 1d7e0d853b4a6d81c89228b19940407c7ef2f533.
Rollback: backup/bertha-pre-review-1d7e0d8, no mesmo hash.
Branch: work/bertha-beta-review-rc354.
Caminho: homologação (com acentos), confirmado no repositório e Pages.
Ambiente efetivo: Chrome desktop, 1363×936. Safari/iPhone, teclado virtual e telas estreitas não testados.

## Correções

1. Satélites: modal recebe casa-dialog; CSS genérico exibe input nativo e não havia regra eficaz para ocultá-lo. Grid de duas colunas recebe três filhos, comprimindo texto em 28px. Corrigido no CSS já injetado por rc196-sat-owner-helper.js, dentro de dialog.sat-modal .sat-permission; mantém IDs, campos e eventos. Controle visual e foco visível restaurados.
2. Planos/Compromissos: data UTC sugeria dia 12 enquanto Meu Dia/Trabalho indicavam dia 11 em Brasília. Corrigidos dia atual, próximo dia e data inicial do formulário usando todayISO local já existente. A função recebe data opcional; todos os usos anteriores eram sem argumentos. Cálculo verificado para UTC−3 antes/depois da meia-noite e UTC+2. Sintaxe será verificada no carregamento publicado; compilação estática no runtime foi bloqueada.
3. Trabalho: faltava a rota no mapa de títulos. Cabeçalho mostra Trabalho também nas subrotas. Emojis legados retirados somente desse mapa de títulos dos módulos.
4. Alimentação: .food-owner-check tinha display:grid!important, anulando o display:none de Outra pessoa. Retirado somente esse !important. O salvamento continua forçando trackProgress:false para outra pessoa; a Lancheira do Henrique já tem owner:other e trackProgress:false. Essa inspeção de código não equivale a teste completo da integração.
5. Index e carimbos RC354; cache-bust restrito a core, estilos Satélites e carimbos. Artes e normalização dos avatares RC353 intactas.

## Matriz de módulos e fluxos

| Módulo/fluxo | Problema, causa e correção | Testes executados | Resultado | Pendências |
|---|---|---|---|---|
| 1. Meu Dia | Nenhuma correção neste módulo | Tela com sugestões; Horários-base aberto/fechado | Parcial; não homologado integralmente | Ainda sem concluir/retomar/adiar |
| 2. Meu Dia Ideal / Horários-base | Nenhuma correção neste módulo | Criar sem salvar, períodos/dias, inclusão de horário, cancelar; campos 16px, sem overflow desktop | Parcial; não homologado integralmente | Persistência e conflitos |
| 3. Planos / Tarefas / Compromissos | Data UTC em Planos/Compromissos: usar todayISO local já existente; recorrência preservada | Planos e Tarefas vazios; Nova tarefa: texto longo, período, recorrência, cancelar; campos 16px; Compromissos vazio e Novo compromisso aberto/cancelado | Parcial; não homologado integralmente | Compromissos e persistência |
| 4. Rituais | Nenhuma correção neste módulo | Novo ritual aberto/cancelado; campos 16px, sem autofocus/IDs duplicados/overflow desktop | Parcial; não homologado integralmente | Todos os fluxos |
| 5. Trabalho | Título Minha Vida em Trabalho: rota incluída no mapa de títulos | Frente CREFITO aberta; Nova frente e Nova demanda abertos/cancelados; campos 16px | Parcial; não homologado integralmente | Todos os fluxos |
| 6. Estudos | Nenhuma correção neste módulo | 260 mapas presentes; Adicionar conteúdo aberto/cancelado; campos 16px | Parcial; não homologado integralmente | Todos os fluxos |
| 7. Casa / manutenção / jardim / utensílios / equipamentos | Nenhuma correção neste módulo | 26 rotinas; manutenção com Delegar/Todos sem destinatários; Nova rotina Jardim e Novo equipamento abertos/cancelados; inventário e equipamentos existentes inspecionados | Parcial; não homologado integralmente | Todos os fluxos |
| 8. Exercícios / ciclos | Nenhuma correção neste módulo | Novo ciclo; adicionar bloco: total 30 → 40 min; cancelamento; campos 16px | Parcial; não homologado integralmente | Conclusão → Progresso e demais fluxos |
| 9. Alimentação | display:grid!important anulava display:none do campo Progresso para Outra pessoa: removido somente o !important de display em .food-owner-check | Estado vazio; Programar próxima e Novo cardápio; seleção Outra pessoa; cancelar; conflito de CSS no campo de Progresso confirmado | Parcial; não homologado integralmente | Lista de Compras; lancheira fora do Progresso |
| 10. Receitas | Nenhuma correção neste módulo | Pesquisar strogonoff; abrir receita; ingredientes à lista; desmarcar cebola; cancelar modal empilhado; Nova receita abrir/cancelar | Parcial; não homologado integralmente | Ingredientes → Compras e demais fluxos |
| 11. Lista de Compras / estoque | Nenhuma correção neste módulo | Lista/estoque vazios; Encerrar compra desabilitado; Adicionar item e Ajustar estoque abrir/cancelar | Parcial; não homologado integralmente | Compra → estoque e demais fluxos |
| 12. Financeiro | Nenhuma correção neste módulo | Estado vazio; Nova conta prevista abrir/cancelar; campos/vencimento/lembretes inspecionados | Parcial; não homologado integralmente | Todos os fluxos |
| 13. Criação & Ideias | Nenhuma correção neste módulo | Nova entrada; troca Ideia → Projeto; campos 16px, cancelar | Parcial; não homologado integralmente | Todos os fluxos |
| 14. Meu Progresso | Nenhuma correção neste módulo | Visão sem referências, financeiro e compras vazios | Parcial; não homologado integralmente | Integrações e demais fluxos |
| 15. Satélites / Adulto / Helper / Kids | Input nativo como 3º item de grid; ocultação restrita, controle visual e foco no botão | RC353: abrir Novo, checkbox por clique e Space, input/aria/classe sincronizados; Adulto → Kids, cancelar; zero pessoas salvas; salvar sem Nome bloqueado; quatro avatares Adulto carregados | Parcial; não homologado integralmente | Repetir em RC354; persistência e edição em ambiente isolado |
| 16. Delegação / conclusões compartilhadas | Nenhuma correção neste módulo | Casa manutenção: Delegar oferece Todos e informa ausência de destinatários; nenhum destinatário criado | Parcial; não homologado integralmente | Bloqueado: sessão sem satélites; conclusão compartilhada, Owner e notificações não testados |
| 17. Convites | Nenhuma correção neste módulo | Novo convite abrir/cancelar; Enviar desabilitado sem destinatários; campos 16px | Parcial; não homologado integralmente | Bloqueado: nenhuma pessoa habilitada; cards de seleção, envio e respostas não testados |
| 18. Premiações / Owner / Kids / Helper | Nenhuma correção neste módulo | Owner: Sala de Troféus abre; 12 imagens RC351 carregadas. Helper: personalização abre, 9 imagens RC352 carregadas, 18 botões Rosé/Brisa, campos 16px. Kids mostra ausência de cadastro | Parcial; não homologado integralmente | Bloqueado: sem Kids/Helper cadastrados; progressão, envio, critérios, ciclos/histórico não validados. Erro R147_RECOG_TARGET em navegação inicial não repetiu após reload: investigar inicialização |
| 19. Mais / ferramentas HML | Nenhuma correção neste módulo | Menu aberto/fechado; botões de backup/restauração/limpeza presentes, não acionados | Parcial; não homologado integralmente | Exportação e restauração isolada |
| 20. Navegação / modais / versão / cache | Carimbos RC354 e cache-bust somente dos arquivos modificados; emojis legados removidos só dos títulos do mapa | Main e Pages em RC353; index e scripts inspecionados; navegação entre telas acima; navegados todos os módulos acima; um erro do app em Premiações registrado, separado de erros da extensão Chrome | Parcial; não homologado integralmente | Pós-deploy RC354; narrow/Safari/iPhone/teclado virtual indisponíveis. Ctrl+plus não alterou viewport; nenhum teste estreito declarado |

## Medições dos formulários

- Novo ritual: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Nova frente Trabalho: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Nova demanda Trabalho: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Conteúdo Estudos: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Manutenção Casa / delegar: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Utensílios Casa: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Rotina Jardim Casa: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Novo ciclo Exercícios: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Próxima cozinha Alimentação: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Novo cardápio Alimentação: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Ingredientes Receitas → Compras: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Nova receita: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Adicionar compra: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Ajustar estoque: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Conta prevista Financeiro: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Nova ideia: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Projeto Ideias: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.
- Novo convite: campos visíveis inspecionados sem fonte abaixo de 16px; overflow horizontal não observado; autofocus 0; IDs duplicados 0.

O teste de ingredientes usou o modal empilhado: seleção e cancelamento verificados, mas a medição automática de layout alcançou a receita subjacente; não atribuir essa medição ao modal de ingredientes.

## Impedimentos e registro técnico

- Não há satélites no navegador desta sessão. Não foram criados cadastros, convites ou reconhecimentos fictícios. Impede validar destinatários múltiplos, cards de Convites, conclusões/validação Owner e progressão Kids.
- Safari/iPhone real e controle de viewport estreito não disponíveis. Zoom tentado não alterou a largura. Safe areas, teclado virtual, autozoom e responsivo estreito ficam pendentes.
- ReferenceError R147_RECOG_TARGET antes da inicialização foi capturado na primeira navegação para Premiações (core v331, linha 6927). Ao recarregar e repetir Satélites → Premiações, o módulo abriu; causa não confirmada, não foi aplicado remendo especulativo.
- Nenhum salvamento de conteúdo/registro, edição persistida, exclusão de registro, timer/conclusão ou integração externa foi testado até esta etapa. Cancelamento e obrigatoriedade sem Nome em Novo satélite foram testados. Não concluir persistência por inspeção de fonte.
- Conferência de imagens carregadas não equivale a homologação de enquadramento/transparência em todos os tamanhos.

## Proteção

Nenhuma exclusão de arquivo ou limpeza de histórico, localStorage, bancos ou cadastros. Sem migração HML → produção. Sem alterações de permissões, autenticação, credenciais, integrações externas ou notificações. Assets Kids/Owner/Helper/avatares preservados. Ferramentas de backup/restauração presentes e preservadas, sem reset ou importação nesta etapa.
