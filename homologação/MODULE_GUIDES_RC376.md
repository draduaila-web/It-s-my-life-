# RC376

Correção de escopo: Como fazer removido de Satélites; sem escolha/publicação separada de procedimentos pelo Owner. Casa autorizada dá leitura dos procedimentos e manuais aprovados, com personalizações. Instruções anexadas às atividades Helper correspondentes e acessíveis dentro de Casa no Helper/Kids.

Principal conectado sincroniza somente procedimentos alterados, a cada 30 segundos em primeiro plano. Cadastro local, permissão Casa e vínculo remoto ativo definem destinatários; dados editados enquanto principal fechado só atualizam ao reabrir. Backend RLS RC374 preservado, sem ampliar mensagens/tarefas Kids. Demais módulos ainda precisam de seus recortes entre aparelhos para receber a integração correspondente.

Testes: sync mockado verifica destinatário autorizado, personalização, atualização e ausência de republicação sem mudança; regressões código/client/painéis; servidor já validado com Kids/Helper, isolamento e revogação RC374. Sem compartilhamento real para teste. Rollback backup/bertha-pre-module-guides-rc376 (44e8da958cb092f7faf856df0334acdfbad09785). Tabelas/históricos preservados.
