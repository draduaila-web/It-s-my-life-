# BERTH.A Kids — RC393 (homologação)

## Comportamento

- Ícone aprovado sem borda RC391 e controles amarelo/pêssego RC392 preservados.
- Owner: Satélites → Missões Kids → Nova missão. Leitura, estudos e hábitos são independentes da Casa. Editar, pausar e retomar; criança, pontos, data, repetição única/diária/dias da semana, horário, lembrete opcional e antecipação de um dia.
- Casa: editor mantém a área, os detalhes abertos e a rolagem após salvar; ciclo/horário/aviso também podem ser configurados nas rotinas existentes.
- Kids: Hoje, Amanhã, Ficaram para trás, Em acompanhamento, Próximas e Já fiz. Uma ação iniciada continua em acompanhamento. Amanhã fica bloqueado, salvo autorização de antecipação do Owner.
- Rotinas possuem ocorrências separadas por data. O servidor gera hoje e amanhã a cada minuto, mesmo sem o Owner aberto. Pendências anteriores continuam até validação. Concluir um dia não consome o seguinte.
- A confirmação de cada ocorrência Kids passa pelo Owner. Pontos têm registro persistente por ocorrência no mesmo documento local do progresso e não são creditados novamente por atualização ou repetição da confirmação.
- Premiações → Kids → Configuração do Owner: cinco pontuações totais crescentes editáveis. Padrão: 10, 20, 30, 50 e 70. Ritmo dos acessórios editável por pontos/etapa e etapas/acessório. Configuração individual segue para novos ciclos. Conquistas já obtidas são preservadas.
- Avisos: inscrição conferida e recuperada ao abrir/retornar ao app, sem solicitar de novo uma permissão já concedida. Desativação explícita é respeitada. Mudanças na inscrição do aparelho provocam nova vinculação segura. O mesmo aparelho não fica vinculado simultaneamente a contas anteriores.
- Eventos: mensagens, reconhecimento Helper, novas tarefas, colaboração concluída para o Owner, tarefa assumida/iniciada para o Owner, validação para o colaborador e lembrete antes do horário. Conteúdo de mensagem privada não vai no push.
- Lembretes por horário usam o fuso informado pelo dispositivo do Owner; agrupamento diário desta versão permanece na data de São Paulo. A entrega depende de permissão, conexão e serviço push do aparelho. A janela do relógio é de aproximadamente um minuto, não um alarme exato.

## Verificação

- JavaScript: sintaxe de todos os arquivos novos/alterados.
- DOM: criação/edição de missão em dois dias da semana, horário e lembrete; permanência da área da Casa; grupos por data, isolamento de outra criança, bloqueio/antecipação; manutenção da ativação e respeito à desativação.
- Lógica: marcos padrão e personalizados, acessórios configuráveis, preservação de conquistas; rotina concluída permanece como definição recorrente; confirmação serial de duas ocorrências e pontos creditados uma vez em cada uma.
- Banco: transação de teste com rollback confirmou hoje/amanhã, lembrete/fuso, bloqueio futuro, conclusão idempotente aguardando Owner, validação independente do próximo dia, dias da semana, bloqueio de conta sem vínculo e rota Kids no push de validação. Nenhuma conta de teste foi persistida e nenhum push de teste foi enviado a pessoas.
- Segurança: tabela de programação privada, RLS, política explícita de negação ao cliente e funções com autorização por rede. Advisors sem nova vulnerabilidade; aviso de proteção de senha anterior permanece fora desta alteração.

## Teste no iPhone

1. Reabrir Owner, Helper e Kids instalados, com conexão; conferir a versão RC393 no Kids.
2. Criar uma missão em Satélites → Missões Kids, escolher dois dias da semana, pontos e horário. Verificar que editar mantém os campos.
3. No Kids, escolher uma missão de hoje, começar e terminar. Deve ficar em acompanhamento sem liberar pontos. Confirmar no Owner e atualizar o Kids; conferir pontos e Já fiz.
4. Verificar Amanhã; sem antecipação não há ação, com antecipação pode começar no dia anterior. A ocorrência de hoje continua independente.
5. Em Premiações, mudar os cinco marcos e salvar; conferir no Meu mundo do Kids. Conquistas obtidas não são retiradas.
6. Ativar avisos em cada app instalado uma vez e reabri-lo. A ativação deve continuar. Com os apps em segundo plano, testar mensagem nas duas direções, reconhecimento Helper, conclusão e confirmação Kids.
7. Para o lembrete, escolher um horário alguns minutos à frente e antecedência de 5/10 minutos. Manter a missão pendente. Conferir o aviso no aparelho autorizado.

A entrega física no iPhone, apresentação de banners/sons e políticas de Foco do sistema precisam ser homologadas no aparelho; aceitação do envio pelo provedor não comprova exibição.
