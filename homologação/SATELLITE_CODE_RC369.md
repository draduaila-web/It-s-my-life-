# BERTH.A RC369 — Convites por código

Pronto:
- Novo satélite no módulo existente: cadastro local preservado, convite remoto após salvar quando a conta Owner está conectada; confirmação/conexão única do Owner quando necessário.
- Código individual aleatório de 60 bits, mostrado em três blocos de quatro caracteres. Armazenamento somente do hash no servidor, validade de sete dias, uso único e cancelamento pelo Owner.
- Link de app Helper ou Kids sem credenciais na URL. Botões para copiar código, link ou mensagem inteira; nenhum envio automático pelo WhatsApp.
- Entrada do convidado sem e-mail/senha, identidade Auth própria por satélite, sessão persistente e renovação pelo Supabase existente.
- Retentativa com nonce do mesmo navegador por cinco minutos se a resposta da entrada se perder; novo navegador não reaproveita o código.
- RLS, verificação de rede, tipo de app, acesso pausado, código revogado/expirado e restrição de promoção de convidado a Owner.
- Helper mantém colaboração e validação de tarefas; contas antigas por e-mail e identificadores locais permanecem válidos.
- Entrada Kids vinculada ao responsável e consulta apenas do próprio perfil.

Pendente:
- Experiência Kids completa: missões, pontos, medalhas, troféus, cápsulas, pets, acessórios e progressão entre dispositivos. A página de entrada declara essa limitação; não contém dados simulados.
- Mensagens, GPS e demais conteúdos no frontend publicado. Backend RC364 pré-existente não equivale a uma entrega completa desses recursos.
- Teste manual em dois aparelhos físicos e Safari/PWA instalado. Sessão do Safari e sessão de PWA podem usar armazenamentos distintos; outro navegador requer novo código do Owner.

Testes executados:
- Banco em transação com rollback: convites, isolamento entre redes e apps, uso único, retentativa, expirado/revogado/pausado, restrições de Owner e serviço privado.
- APIs reais de homologação com identidades QA isoladas: geração, entrada Auth, renovação, isolamento, Helper sem privilégio Owner, Kids no app correto; compartilhamento, execução e validação de tarefa QA; revogação de conteúdo e cancelamento de código.
- 65 verificações do progresso Owner, 33 do cliente Helper, testes RC367 de acesso legado e novos testes RC369 de código/identidade/sessão, syntax checks e diff check.
- Nenhuma mensagem, e-mail ou localização de pessoas reais usada para teste.
- Auditoria: nenhuma nova ocorrência de segurança nas tabelas/functions. Aviso pré-existente sobre proteção contra senhas vazadas permanece fora desta mudança.

Rollback frontend: `backup/bertha-pre-code-access-rc369-2e4395e`.
Banco: três migrations aditivas `bertha_hml_satellite_code_rc369`, `bertha_hml_code_pause_revoke_rc369`, `bertha_hml_code_explicit_deny_rc369`. Retornar o frontend à branch de backup preserva dados e mantém os acessos e funções antigos. Não apagar tabelas ou identidades de convidados para fazer rollback.

Código pessoal só deve ser enviado ao destinatário (e responsável no Kids). O controle de acesso ocorre no servidor. Cancelar convite impede nova entrada; pausar acesso pelo Owner impede consultas/ações da conta conectada. Gerar novo código não encerra, por si só, sessões já conectadas.
