# Helper RC367 — entrada por link pessoal no e-mail

Substitui o fluxo candidato de SMS RC366, conforme escolha da usuária. Base publicada: RC365 / 08a4acceebe1268e4257a8ad5a5f75256312187a.

Implementado:
- entrada e criação de conta por magic link do Supabase Auth, sem campo de senha;
- convite Owner por e-mail, copiável para envio pessoal no WhatsApp; convite e link de autenticação são distintos;
- convite preservado ao retornar do e-mail, e vínculo continua exigindo o e-mail confirmado correspondente;
- sessão persistente por aparelho, com migração da sessão anterior e fallback para aba quando armazenamento não disponível;
- validação do usuário no servidor e correspondência access/refresh tokens antes de aceitar a sessão;
- confirmação explícita do e-mail ao abrir o link em navegador diferente do que solicitou;
- remoção de tokens do fragmento da URL antes da confirmação, nenhum log de tokens;
- convite, IDs e registros anteriores por e-mail preservados; nenhuma migração de banco necessária;
- nova solicitação de link pelo formulário em caso de expiração/uso anterior. Limites reais de envio continuam controlados pelo servidor.

Testes:
- 33 verificações existentes passadas;
- teste novo com Auth mock: e-mail/destino, conta confirmada, tokens pareados, ID preservado, sessão após reabrir, link expirado/incompatível, logout e migração de sessão, passado;
- sintaxe JavaScript e diff conferidos;
- GET de verificação com token inválido e sem conta real confirmou retorno atual para http://localhost:3000. Nenhum e-mail real enviado.

Bloqueante real:
Auth está com e-mail habilitado, mas a URL de homologação não está permitida como retorno. O endpoint descartou redirect_to e devolveu localhost:3000. Não mesclar/publicar o novo login antes de cadastrar no Supabase Authentication > URL Configuration > Redirect URLs:

https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/helper.html**
https://draduaila-web.github.io/It-s-my-life-/homologa%C3%A7%C3%A3o/helper-owner.html**

Adicionar apenas estes destinos, preservando os destinos de produção existentes. Os dois asteriscos aceitam os parâmetros de versão e do convite nessa página específica. A confirmação de entrada ainda depende de o serviço de e-mail entregar o magic link.

Não validado: entrega real de e-mail, eventual exigência de SMTP personalizado, retorno em iPhone/Safari/PWA, fluxo completo entre contas e dispositivos reais, esgotamento de limites. A candidata ainda não é prova de login funcional entre aparelhos.

Rollback: restaurar helper-client-rc363.js, helper-rc363.js, helper.html, helper-owner.html e helper-manifest.webmanifest do commit base. Nenhum cadastro/dado deve ser apagado.

Versão pública permanece RC365 até configuração e publicação verificadas.
