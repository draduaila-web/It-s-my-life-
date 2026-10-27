/* BERTH.A Owner: ajuda de leitura; exemplos fictícios, sem ações de cadastro. */
(function () {
  "use strict";
  window.BerthaOwnerGuideContent = {
  "version": "398-owner-local",
  "guides": [
    {
      "id": "meu-dia",
      "title": "Meu Dia",
      "steps": [
        "Na barra inferior, toque em B•A. Quando houver uma sugestão em Agora, use Começar ao iniciar ou Adiar se não for o momento.",
        "Com uma atividade em andamento, toque em Concluir, confira Tempo real (min) e confirme. Se ainda não acabou, escolha Continuar atividade.",
        "Use Editar horários para ajustar os horários-base. Escolha os dias, revise Início e Fim e toque em Salvar horários.",
        "Abra Lista de Compras, Meu Progresso ou Minha rede para consultar os detalhes de cada área."
      ],
      "example": "Uma leitura prevista para 20 minutos levou 25. Confira 25 em Tempo real antes de concluir.",
      "note": "",
      "placements": [
        {
          "route": "#meu-dia",
          "anchor": "#app .day-hero"
        }
      ]
    },
    {
      "id": "planos",
      "title": "Planos",
      "steps": [
        "Abra Tarefas para organizar o que precisa fazer, ou Compromissos para o que tem data e horário.",
        "Consulte os resumos de tarefas abertas e do próximo compromisso. Eles são informações, não botões.",
        "Toque no botão Tarefas para adicionar, ajustar ou concluir uma tarefa.",
        "Toque no botão Compromissos para consultar, cadastrar ou editar um compromisso."
      ],
      "example": "“Separar documentos” pode ser uma tarefa; “Reunião às 15h” pode ser um compromisso.",
      "note": "",
      "placements": [
        {
          "route": "#planos",
          "anchor": "#app .plans-hero"
        }
      ]
    },
    {
      "id": "pendencias",
      "title": "Tarefas",
      "steps": [
        "Toque em Adicionar, escreva a tarefa, ajuste os detalhes que precisar e use Salvar.",
        "Para corrigir algo, toque nos três pontos da tarefa para editar.",
        "Quando terminar, toque no círculo da tarefa para concluí-la.",
        "Use Abertas ou Concluídas para acompanhar o que ainda falta e o que já foi registrado."
      ],
      "example": "“Separar documentos”, duração de 20 minutos e período flexível.",
      "note": "",
      "placements": [
        {
          "route": "#pendencias",
          "anchor": "#app .bertha-task-hero"
        }
      ]
    },
    {
      "id": "compromissos",
      "title": "Compromissos",
      "steps": [
        "Toque em Novo compromisso e informe título, data, horário e duração.",
        "Se for recorrente, confira Repetir? antes de tocar em Salvar.",
        "Use Hoje, Próximos e Recorrentes para consultar os compromissos.",
        "Toque na seta do compromisso para editar. Esta lista não tem um botão próprio de concluir."
      ],
      "example": "“Reunião de planejamento”, às 15h, com duração de 45 minutos.",
      "note": "",
      "placements": [
        {
          "route": "#compromissos",
          "anchor": "#app .plans-hero"
        }
      ]
    },
    {
      "id": "rituais",
      "title": "Rituais",
      "steps": [
        "Abra um ritual para consultar etapas e produtos. Para criar outro, toque em Novo ritual, preencha o nome e use Criar.",
        "Use Editar ritual nos seus rituais ou Editar cuidado/Editar no cuidado do dia, quando aparecer.",
        "Marque Etapas desta execução conforme fizer. Isso não conclui o tempo da atividade: use Concluir na atividade em andamento no Início.",
        "Consulte Ver cronograma no Capilar ou Ver 14 dias no Autocuidado. Em Cuidados & extras, Adicionar permite incluir um cuidado."
      ],
      "example": "No ritual “Pausa para leitura”, escreva uma instrução por linha: separar o livro e ler por alguns minutos.",
      "note": "",
      "placements": [
        {
          "route": "#rituais",
          "anchor": "#app .bertha-ritual-hero"
        },
        {
          "routePrefix": "#ritual-",
          "anchor": "#app .bertha-ritual-detail-hero"
        }
      ]
    },
    {
      "id": "dia-ideal",
      "title": "Meu Dia Ideal",
      "steps": [
        "Toque em Adicionar ao meu dia ideal ou em Adicionar aqui no período desejado.",
        "Descreva a preferência, escolha Período, Duração e Até quando?, se houver prazo, e toque em Salvar.",
        "Use Editar no cartão da preferência para ajustar esses detalhes.",
        "Em Referências da minha vida, abra uma dimensão e use Salvar referência. Depois consulte Meu Progresso no Início."
      ],
      "example": "“Ler um livro”, à Noite, por 20 minutos, sem data final.",
      "note": "",
      "placements": [
        {
          "route": "#dia-ideal",
          "anchor": "#app .bertha-ideal-hero"
        }
      ]
    },
    {
      "id": "progresso",
      "title": "Meu Progresso",
      "steps": [
        "No Início, abra Meu Progresso e escolha Semanal, Mensal ou Anual.",
        "Consulte os indicadores em Dimensões da vida.",
        "Em Evidências do período, confira os totais exibidos. Um traço indica que aquele indicador ainda não tem dados suficientes.",
        "Para ajustar suas referências, vá a Mais, Meu Dia Ideal e Referências da minha vida. Os registros são feitos nos respectivos módulos, não nesta tela."
      ],
      "example": "Escolha Mensal para consultar as conclusões registradas ao longo do mês.",
      "note": "Pagamentos em dia usa o mês atual; metas usam os valores acumulados cadastrados. Esses indicadores não seguem o seletor do painel.",
      "placements": [
        {
          "route": "#progresso",
          "anchor": "#app .progress-hero"
        }
      ]
    },
    {
      "id": "trabalho",
      "title": "Trabalho",
      "steps": [
        "Abra uma frente ou use Nova frente de trabalho para criar outra.",
        "Em adicionar, descreva a tarefa, escolha área, prazo e duração e toque em Salvar.",
        "Use o lápis para editar. Mais opções reúne horário, frequência, status e observação.",
        "Toque em Começar ao iniciar e, quando aparecer, Concluir. Reveja o registro em Concluídas."
      ],
      "example": "Na frente “Ateliê Aurora”, cadastre “Revisar proposta”, com duração de 30 minutos. O registro não envia mensagem a clientes.",
      "note": "",
      "placements": [
        {
          "route": "#trabalho",
          "anchor": "#app .work13-hero"
        },
        {
          "routePrefix": "#trabalho-",
          "anchor": "#app .work12-subhero"
        }
      ]
    },
    {
      "id": "estudos",
      "title": "Estudos",
      "steps": [
        "Use Mapa para organizar os temas e Conteúdo para cadastrar o que vai estudar.",
        "Toque em Começar para iniciar. Use Concluir estudo quando aparecer, ou conclua a atividade correspondente no Início.",
        "Para ajustar um conteúdo, use seus três pontos. Registrar passado permite anotar um estudo já feito e o tempo real.",
        "Em Ver mapas, acompanhe 1ª, Q e D. Para marcar D, conclua primeiro 1ª e Q."
      ],
      "example": "Registre “Revisão de porcentagem” com 30 minutos. O exemplo não inicia estudo nem marca uma etapa.",
      "note": "",
      "placements": [
        {
          "route": "#estudos",
          "anchor": "#app .study-hero"
        }
      ]
    },
    {
      "id": "casa",
      "title": "Casa",
      "steps": [
        "Em Rotinas da Casa, escolha uma área e use Adicionar rotina nesta área.",
        "Abra Editar para ajustar os detalhes da rotina. Como fazer aparece quando há instruções cadastradas.",
        "Use Começar ao iniciar e Concluir ao terminar, conforme os controles disponíveis na atividade.",
        "Para um reparo ou melhoria, abra Manutenção e toque em Adicionar manutenção."
      ],
      "example": "“Organizar a varanda”, com duração de 10 minutos e repetição semanal.",
      "note": "",
      "placements": [
        {
          "route": "#casa",
          "anchor": "#app .casa-hero-v121"
        }
      ]
    },
    {
      "id": "exercicios",
      "title": "Exercícios",
      "steps": [
        "Use Adicionar treino para cadastrar um treino; toque no cartão para editar seus detalhes.",
        "No treino de hoje, use Começar treino e Concluir treino. Já fiz registra o treino e a duração cadastrados; Fiz outro permite escolher ou registrar um treino diferente.",
        "Use Novo ciclo para organizar um ciclo e Ajustar semana para revisar a semana.",
        "Consulte Registro e use Editar no registro que precisar corrigir."
      ],
      "example": "Um treino chamado “Caminhada leve”, com duração cadastrada de 20 minutos. É só um exemplo de preenchimento, não uma recomendação de exercício.",
      "note": "",
      "placements": [
        {
          "route": "#exercicios",
          "anchor": "#app .exercise-hero"
        }
      ]
    },
    {
      "id": "alimentacao",
      "title": "Alimentação",
      "steps": [
        "Use Novo cardápio para organizar as refeições.",
        "Use Editar cardápios ou Editar na semana desejada para ajustar o planejamento.",
        "Nas refeições de hoje dos seus cardápios, marque Comi ou Não comi. Ver receita aparece quando há receita vinculada.",
        "O preparo em Cozinha quinzenal é separado do consumo: use Concluir cozinha ao terminar e Programar próxima para planejar outra."
      ],
      "example": "No lanche de segunda-feira, “iogurte com fruta”. É um exemplo de cadastro, não uma orientação alimentar.",
      "note": "",
      "placements": [
        {
          "route": "#alimentacao",
          "anchor": "#app .food-v115-hero"
        }
      ]
    },
    {
      "id": "receitas",
      "title": "Receitas",
      "steps": [
        "Use Nova receita e preencha ingredientes e modo de preparo.",
        "Busque por nome ou ingrediente, filtre por categoria e abra Ver receita. Use Editar para ajustar.",
        "Em Ingredientes à lista, revise a seleção antes de acrescentar os itens à lista de compras.",
        "O consumo das refeições é registrado em Alimentação. Receitas guarda os detalhes do preparo."
      ],
      "example": "“Sopa da casa”, com rendimento de quatro porções e ingredientes descritos por quantidade.",
      "note": "",
      "placements": [
        {
          "route": "#receitas",
          "anchor": "#app .recipe-hero"
        }
      ]
    },
    {
      "id": "financeiro",
      "title": "Financeiro",
      "steps": [
        "Use Nova conta prevista para cadastrar um vencimento e Editar para corrigir. Só após pagar, use Marcar paga e confira Confirmar pagamento.",
        "Em Gastos do mês, use Registrar para anotar um gasto que aconteceu.",
        "Consulte os totais do mês e as fontes de dinheiro. Use Nova fonte quando precisar cadastrar outra origem.",
        "Em Metas financeiras, use Nova meta, Editar ou Adicionar aporte para acompanhar o que foi reservado."
      ],
      "example": "Uma conta “Internet”, de R$ 100, com vencimento no dia 10.",
      "note": "Registrar um pagamento ou aporte aqui não movimenta dinheiro nem paga uma conta no banco.",
      "placements": [
        {
          "route": "#financeiro",
          "anchor": "#app .finance-hero"
        }
      ]
    },
    {
      "id": "ideias",
      "title": "Ideias",
      "steps": [
        "Toque em Adicionar e escolha Ideia, Plano ou Projeto.",
        "Abra o cartão ou os três pontos para ajustar os detalhes.",
        "Nos projetos, preencha o tempo e os blocos desejados. Para sugestões no dia, revise Quero que a BERTA acompanhe este projeto e Sugerir quando houver uma janela compatível.",
        "Acompanhe o andamento no cartão. Uma ideia não inicia um tempo de atividade; não há botão próprio Concluir projeto nesta lista."
      ],
      "example": "“Organizar a estante”, como projeto de duas horas em blocos de 30 minutos.",
      "note": "",
      "placements": [
        {
          "route": "#ideias",
          "anchor": "#app .idea-hero"
        }
      ]
    },
    {
      "id": "compras",
      "title": "Lista de Compras",
      "steps": [
        "Use Adicionar item para colocar o que falta na lista.",
        "Depois de comprar, marque o item e confira quantidade, valor e a opção de adicionar ao estoque.",
        "Quando houver itens comprados ainda abertos, Encerrar compra fica disponível. Revise o fechamento e os itens que vão para a base.",
        "Use Ajustar estoque para corrigir o que há em casa."
      ],
      "example": "“Arroz”, quantidade de 2 kg. O exemplo não adiciona itens nem registra uma compra.",
      "note": "",
      "placements": [
        {
          "route": "#compras",
          "anchor": "#app .shop-hero"
        }
      ]
    },
    {
      "id": "saude",
      "title": "Saúde",
      "steps": [
        "No cartão Saúde do Início, use Adicionar para cadastrar um item e Editar para corrigir.",
        "Informe nome, tipo, uso contínuo ou prazo e os dados de reposição que precisar.",
        "Consulte os prazos e valores informados. À lista coloca o item na lista de compras, evitando um item pendente duplicado.",
        "Este cartão organiza cadastro e reposição. Não registra doses tomadas nem conclui um tratamento."
      ],
      "example": "Um item chamado “Suplemento de exemplo”, com data de reposição informada por você. Não é recomendação de uso.",
      "note": "",
      "placements": [
        {
          "route": "#meu-dia",
          "anchor": "#app .home-health-mini .section-head"
        }
      ]
    },
    {
      "id": "satelites",
      "title": "Rede",
      "steps": [
        "Use Adicionar pessoa, informe nome e tipo e revise as permissões antes de Salvar.",
        "Para conectar essa pessoa em outro aparelho, siga o Convite do cadastro. Se solicitado, conecte a conta do Owner e confira o código e o link exibidos.",
        "Copiar convite completo apenas copia o texto. Compartilhe com a pessoa; essa mensagem de acesso não é enviada automaticamente.",
        "Em Pendências do Owner, use Ver atividade para revisar e Validar conclusão quando a conclusão estiver pendente."
      ],
      "example": "“Alex”, Adulto, recebe somente a permissão Casa e tarefas compartilhadas. Nenhum cadastro, código ou mensagem é criado pelo guia.",
      "note": "Salvar uma nova pessoa já inicia a emissão do código ou o fluxo de conexão. Revise nome, tipo e permissões antes de salvar.",
      "placements": [
        {
          "route": "#satelites",
          "anchor": "#app .s156-hero"
        }
      ]
    },
    {
      "id": "convites",
      "title": "Convites",
      "steps": [
        "Use Novo convite e preencha Convite e Quando?. Este módulo organiza encontros, não códigos de acesso.",
        "Revise as pessoas selecionadas antes de salvar. Só aparecem cadastros com permissão para convites.",
        "Salvar convite guarda o encontro e pode iniciar o compartilhamento com Helpers autorizados se a rede estiver conectada. Confira o aviso; convites Kids deste fluxo ficam no cadastro local.",
        "Use Editar para ajustar ou Ver respostas para acompanhar. Compartilhar com Helpers permite tentar o compartilhamento pela rede, sem comprovar entrega."
      ],
      "example": "“Caminhada no parque”, “Sábado · 9h”, somente “Alex” selecionado. O exemplo não envia convite nem confirma presença.",
      "note": "",
      "placements": [
        {
          "route": "#convites",
          "anchor": "#app .sat-hero"
        }
      ]
    },
    {
      "id": "premiacoes",
      "title": "Premiações",
      "steps": [
        "Escolha Owner, Kids ou Reconhecimentos conforme o que quer consultar.",
        "Em Owner, abra Sala de Troféus para ver registros. Personalizar conquistas do Owner permite ajustar critérios e recorrência.",
        "Em Kids, selecione a criança e consulte pontos e acessórios. Concluir pet só fica disponível ao chegar a 5/5 acessórios.",
        "Para agradecer a alguém específico, vá ao cartão da pessoa em Rede e toque em Reconhecer. Confira a mensagem antes de Enviar reconhecimento."
      ],
      "example": "Um reconhecimento para “Alex”: “Obrigada pela ajuda de hoje”. O guia não envia a mensagem nem concede prêmios.",
      "note": "Em Kids, mudanças de Coleção e Pet são salvas imediatamente. Ver uma imagem na Sala de Troféus não significa conquista obtida; envio de reconhecimento não comprova leitura.",
      "placements": [
        {
          "route": "#premiacoes",
          "anchor": "#app .r147-hero"
        }
      ]
    }
  ]
};
}());
