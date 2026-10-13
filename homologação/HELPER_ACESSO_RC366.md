# Helper RC366 — candidata de acesso por celular

Base: RC365 publicada, merge 08a4acceebe1268e4257a8ad5a5f75256312187a.

Implementado na candidata:
- sessão persistente isolada do Helper/Owner, migração da sessão da aba atual, fallback de armazenamento, renovação, saída e sincronização de alterações entre abas;
- telefone brasileiro normalizado com +55 ou formato internacional explícito;
- código SMS e verificação via Supabase Auth, sem senha no fluxo por celular;
- conta existente pode confirmar celular mantendo seu user_id e vínculos;
- convites individuais por número confirmado, sete dias, sem envio automático de mensagem;
- compatibilidade com contas/convites anteriores por e-mail;
- checks de número confirmado e comparação sem bypass por e-mail nulo;
- acesso por celular só aparece se Phone Auth e backend específico estiverem habilitados. Nenhuma UI simula entrega de SMS.

Validação:
- 33 verificações do cliente anterior passadas;
- novos testes de formatação, OTP com respostas de teste, persistência, migração de sessão, armazenamento bloqueado, logout e bloqueio de pedido de SMS sem serviço habilitado, passados;
- SQL candidato executado em transação e desfeito: convite celular confirmado, número incorreto/não confirmado, proteção de e-mail nulo, IDs estáveis, convite anterior por e-mail, tarefas e vínculo revogado, passados;
- sintaxe JavaScript e diff verificados.

Não publicado/aplicado:
- migração helper-phone-backend-rc366.sql ainda não aplicada;
- Phone Auth segue desativado. Não configurado/contratado provedor SMS;
- não enviado SMS real nem provada entrega do OTP;
- Safari/iPhone, código expirado real, limitação de reenvios real e dois aparelhos ainda pendentes;
- sessão persistente em Safari/PWA depende de o navegador conservar o armazenamento. Sair da conta, limpar dados, modo privado ou expiração/revogação podem exigir código novamente;
- recuperação/troca de número precisa validar as regras de confirmação do provedor antes de liberar a candidata;
- a versão pública permanece RC365 e ainda usa o login anterior.

Próximo passo bloqueante: configurar Phone Auth no Supabase com uma conta de provedor SMS aprovada pela usuária. A integração pode cobrar por mensagem. Não compartilhar credenciais em mensagens; usar o painel do serviço.

Rollback: restaurar os quatro arquivos publicados de frontend (helper-client-rc363.js, helper-rc363.js, helper.html, helper-owner.html) da RC365. A migração é aditiva e ainda está apenas na candidata; não apagar dados/vínculos para desfazer a autenticação.
