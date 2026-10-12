# BERTH.A — matriz de revisão beta RC354

Status: revisão em andamento; nenhuma validação completa de módulo declarada.

Base: 1d7e0d853b4a6d81c89228b19940407c7ef2f533 (main confirmada em 11/10/2026).
Rollback: backup/bertha-pre-review-1d7e0d8, no mesmo hash.
Branch: work/bertha-beta-review-rc354.
Caminho confirmado: homologação (com acentos).
Ambiente: Chrome desktop 1363×936. Safari/iPhone, teclado virtual e telas estreitas ainda não testados.

## Problema prioritário e causa

Novo satélite: .sat-permission tem input + controle visual + texto em grid de duas colunas. O modal também tem casa-dialog. As regras globais de checkbox exibem o input como grid; a folha do componente não o oculta. A descrição acaba na coluna de 28px.

Correção em rc196-sat-owner-helper.js: ocultar somente o input direto de .sat-permission dentro de dialog.sat-modal, restaurar borda/check do span visual e foco visível do botão. Nenhuma mudança de eventos, campos, IDs, salvamento ou assets. Index: título/metadados e cache-bust restrito. rc353-satellite-avatars.js: somente carimbos de versão; normalização e artes preservadas. Teste pós-deploy pendente.

## Matriz

| Módulo/fluxo | Problema/causa/correção | Testes executados | Resultado | Pendências |
|---|---|---|---|---|
| 1. Meu Dia | Sem correção aplicada | Tela com sugestões; Horários-base aberto/fechado | Parcial; não homologado | Ainda sem concluir/retomar/adiar |
| 2. Meu Dia Ideal / Horários-base | Sem correção aplicada | Criar sem salvar, períodos/dias, inclusão de horário, cancelar; campos 16px, sem overflow desktop | Parcial; não homologado | Persistência e conflitos |
| 3. Planos / Tarefas / Compromissos | Sem correção aplicada | Planos e Tarefas vazios; Nova tarefa: texto longo, período, recorrência, cancelar; campos 16px | Parcial; não homologado | Compromissos e persistência |
| 4. Rituais | Sem correção aplicada | Não testado | Pendente | Todos os fluxos |
| 5. Trabalho | Sem correção aplicada | Não testado | Pendente | Todos os fluxos |
| 6. Estudos | Sem correção aplicada | Não testado | Pendente | Todos os fluxos |
| 7. Casa / manutenção / jardim / utensílios / equipamentos | Sem correção aplicada | Não testado | Pendente | Todos os fluxos |
| 8. Exercícios / ciclos | Sem correção aplicada | Não testado | Pendente | Conclusão → Progresso e demais fluxos |
| 9. Alimentação | Sem correção aplicada | Não testado | Pendente | Lista de Compras; lancheira fora do Progresso |
| 10. Receitas | Sem correção aplicada | Não testado | Pendente | Ingredientes → Compras e demais fluxos |
| 11. Lista de Compras / estoque | Sem correção aplicada | Não testado | Pendente | Compra → estoque e demais fluxos |
| 12. Financeiro | Sem correção aplicada | Não testado | Pendente | Todos os fluxos |
| 13. Criação & Ideias | Sem correção aplicada | Não testado | Pendente | Todos os fluxos |
| 14. Meu Progresso | Sem correção aplicada | Não testado | Pendente | Integrações e demais fluxos |
| 15. Satélites / Adulto / Helper / Kids | Falha de CSS descrita acima; correção na branch | RC353: abrir Novo, checkbox por clique e Space, input/aria/classe sincronizados; Adulto → Kids, cancelar; zero pessoas salvas | Parcial; não homologado | Repetir em RC354; persistência e edição em ambiente isolado |
| 16. Delegação / conclusões compartilhadas | Sem correção aplicada | Não testado | Pendente | Múltiplos/todos, validação Owner e notificações |
| 17. Convites | Sem correção aplicada | Não testado | Pendente | Formulário e componente compartilhado |
| 18. Premiações / Owner / Kids / Helper | Sem correção aplicada | Não testado | Pendente | Histórico, cores e progressão |
| 19. Mais / ferramentas HML | Sem correção aplicada | Menu aberto/fechado; botões de backup/restauração/limpeza presentes, não acionados | Parcial; não homologado | Exportação e restauração isolada |
| 20. Navegação / modais / versão / cache | Sem correção aplicada | Main e Pages em RC353; index e scripts inspecionados; navegação entre telas acima | Parcial; não homologado | RC354 publicada/deploy, responsivo e cache |

## Proteção e limites

Sem exclusões de arquivos, sem limpeza de localStorage, sem migração de dados ou alteração de permissões/autenticação/notificações. Nenhuma pessoa, convite ou reconhecimento fictício salvo. Salvamento, persistência e exclusões em registros reais não foram testados.
