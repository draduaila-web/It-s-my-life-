# BERTH.A Helper RC371 — mensagens e convites

Pronto:
- Helper: Mensagens e Convites integrados ao acesso próprio validado por código.
- Owner: acesso às Mensagens e à autorização de duplas pelo módulo Satélites.
- Owner ↔ Helper, texto, remetente e horário; pendente/enviado/falha e retentativa com UUID idempotente.
- Satélite adulto ↔ adulto somente por dupla autorizada. Novas duplas bloqueadas; bloqueio individual e revogação no servidor.
- Histórico de conversa revogada disponível apenas aos participantes ativos; Owner não consulta conversas privadas entre adultos.
- Convite do módulo existente enviado ao servidor após salvar quando conta/rede Owner estiverem conectadas. Botão de compartilhamento para os já existentes. Cadastros e identificadores originais preservados.
- Respostas Vou/Talvez/Não vou retornam ao módulo de Convites do Owner; convidado só consulta a própria resposta.
- Permissão de convites e destinatários verificados por RLS/RPC no servidor. Edição do mesmo identificador não duplica convite; resposta repetida não duplica registro.
- Notificações de mensagens, convites e respostas pelo OneSignal existente, com opt-in por aparelho, inscrição verificada no servidor, fila de entrega independente do app aberto e chave idempotente por evento/aparelho. Texto da mensagem não aparece na notificação. Serviço antigo bertha-push e neutralização dos avisos antigos da HML preservados.
- Conversas atualizam a cada cinco segundos em primeiro plano; convites/respostas a cada dez segundos. Sem envio automático a contatos reais pelo agente.

Pendente:
- Mensagens/convites Kids, canal de ajuda Kids e integração com a experiência Kids completa.
- Recebimento físico dos novos avisos no iPhone/PWA com app fechado: integração implementada; precisa de ativação e teste manual em aparelhos autorizados. Nenhum push foi enviado a pessoa real pelo agente.
- Anexos, áudio, grupos e GPS no frontend publicado.
- Teste manual ponta a ponta com dois aparelhos físicos/Safari/PWA. APIs reais e contas QA isoladas foram usadas para verificação; não equivalem a testes físicos.

Validação: testes transacionais SQL com rollback; geração e entrada Auth reais com contas QA; convites, respostas, isolamento, mensagens Owner/Helper, idempotência, autorização/bloqueio/revogação, privacidade entre adultos; regressões do acesso, código, armazenamento, progresso Owner e syntax/diff checks. Nenhuma mensagem de teste a pessoa real, nenhum GPS ou e-mail real acionado. Auditoria sem novas ocorrências; aviso pré-existente de proteção contra senhas vazadas não alterado.

Rollback frontend: `backup/bertha-pre-social-rc371-48294cb`. Migrations aditivas: `bertha_hml_helper_invitations_rc371` e `bertha_hml_social_push_rc371`. Preservar tabelas, conversas, respostas, identidades e históricos ao retornar o frontend anterior.
