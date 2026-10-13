# RC374

Pronto: card Convites com texto acima e botões abaixo; controles novos usando paleta principal, sem menta Helper; Comunicação explica necessidade de dois Helpers vinculados e estado Kids pendente.

Como fazer: Owner abre Satélites → Como fazer, escolhe procedimento das atividades da Casa disponíveis/delegadas e marca os destinatários. Salvar substitui a lista; desmarcar todos encerra acesso. Produtos, materiais, passos e dica personalizados copiados do cadastro aprovado, sem alterar Casa. Helper abre aba Como fazer; Kids conectado tem botão Como fazer. Sem publicação automática de manuais.

Servidor: tabela aditiva bertha_hml_guides, RLS por rede, destinatário ativo e permissão Casa/tasks atual. Escrita somente Owner. Kids e Helper leem somente procedimentos enviados; nenhuma permissão de tarefas/mensagens Kids ampliada.

Testes: SQL com roles authenticated, Owner publica; Kids/Helper leem; Kids não publica; outra rede e revogação bloqueadas. Transação revertida. Regressões client, código, mensagens offline e painéis passaram. Nenhuma mensagem, GPS, push ou compartilhamento para pessoas reais.

Pendente: comunicação Kids, experiência Kids completa, GPS e teste físico dos avisos. Rollback frontend backup/bertha-pre-guides-rc374 (8dfbb23df2b7f78ebcdc1a2615be11bc5e6cedab); preservar tabela de procedimentos ao retornar frontend.
