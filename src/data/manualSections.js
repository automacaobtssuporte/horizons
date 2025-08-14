export const manualSections = [
  {
    id: 'introducao',
    title: 'Introdução',
    content: {
      overview: 'O Sistema de Gestão de Desossa Premium é uma solução completa para frigoríficos e açougues gerenciarem todo o processo de desossa, desde a entrada de matéria-prima até a análise de lucratividade.',
      features: [
        'Controle completo do inventário físico',
        'Cálculos detalhados de desossa para bovinos e suínos',
        'Gestão de notas fiscais com integração automática',
        'Análise de quebras e sobras',
        'Simulação de preços de venda',
        'Relatórios em Excel e PDF',
        'Histórico completo por CNPJ'
      ],
      benefits: [
        'Redução de perdas e desperdícios',
        'Maior controle sobre custos',
        'Otimização da margem de lucro',
        'Relatórios precisos para tomada de decisão',
        'Integração com dados fiscais'
      ]
    }
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    content: {
      overview: 'O Dashboard oferece uma visão geral dos principais indicadores do seu negócio em tempo real.',
      features: [
        'Total de notas fiscais processadas',
        'Valor total movimentado',
        'Estimativa de peças processadas',
        'Rendimento médio das desossas',
        'Gráficos de atividade recente',
        'Comparativo de performance'
      ],
      howTo: [
        'Acesse o Dashboard através do menu lateral',
        'Visualize os KPIs principais nos cards superiores',
        'Acompanhe a atividade recente na seção inferior',
        'Use os gráficos para análise de tendências'
      ]
    }
  },
  {
    id: 'inventario',
    title: 'Inventário Físico',
    content: {
      overview: 'Controle completo do estoque com análise detalhada de quebras e sobras.',
      features: [
        'Cadastro manual de itens',
        'Importação via planilha Excel',
        'Análise de quebras por item',
        'Cálculo de divergências financeiras',
        'Resumo consolidado de perdas',
        'Exportação de relatórios'
      ],
      howTo: [
        'Adicione itens manualmente ou importe planilha',
        'Preencha dados de movimentação (entradas/saídas)',
        'Execute o cálculo de quebras',
        'Analise os resultados no painel de resumo',
        'Exporte relatórios para análise externa'
      ],
      tips: [
        'Use códigos padronizados para facilitar a gestão',
        'Mantenha o inventário sempre atualizado',
        'Monitore quebras acima de 2% - podem indicar problemas',
        'Sobras podem indicar problemas de controle ou oportunidades'
      ]
    }
  },
  {
    id: 'desossa',
    title: 'Cálculos de Desossa',
    content: {
      overview: 'Módulo principal para cálculos detalhados de rendimento e custos de desossa.',
      features: [
        'Suporte para bovinos e suínos',
        'Cálculo automático de rendimentos',
        'Análise de custos por corte',
        'Margem de lucro por produto',
        'Análise de lucratividade por parte',
        'Exportação em Excel e PDF',
        'Histórico de desossas'
      ],
      howTo: [
        'Selecione o tipo de animal (bovino/suíno)',
        'Preencha dados da carcaça (peso, custo, nota fiscal)',
        'Adicione os cortes manualmente ou importe planilha',
        'Defina preços de venda para cada corte',
        'Execute o cálculo para obter resultados',
        'Analise a lucratividade por parte',
        'Salve ou exporte os resultados'
      ],
      calculations: [
        'Rendimento Individual = (Peso do Corte / Peso Total) × 100',
        'Índice de Participação = (Receita do Corte / Receita Total) × 100',
        'Novo Custo = Preço de Venda × Índice de Participação %',
        'Margem de Lucro = ((Preço Venda - Custo) / Preço Venda) × 100'
      ],
      tips: [
        'Mantenha histórico de desossas para comparações',
        'Use preços de venda realistas para cálculos precisos',
        'Monitore rendimentos abaixo do esperado',
        'Analise a lucratividade por parte para otimizar processos'
      ]
    }
  },
  {
    id: 'notas-fiscais',
    title: 'Notas Fiscais',
    content: {
      overview: 'Gestão completa de notas fiscais com integração automática ao inventário.',
      features: [
        'Cadastro manual de notas',
        'Importação via planilha Excel',
        'Busca inteligente de produtos',
        'Aplicação automática de rendimentos',
        'Atualização automática do estoque',
        'Histórico completo de movimentações'
      ],
      howTo: [
        'Adicione notas manualmente ou importe planilha',
        'Use a busca inteligente para selecionar produtos',
        'Para partes do boi, use "Calcular e Adicionar Cortes"',
        'Revise os dados antes de salvar',
        'O estoque será atualizado automaticamente'
      ],
      smartFeatures: [
        'Busca produtos do inventário e desossas anteriores',
        'Cálculo automático baseado em médias históricas',
        'Distribuição proporcional de custos',
        'Validação automática de parâmetros'
      ],
      tips: [
        'Use códigos padronizados para facilitar a busca',
        'Configure parâmetros de rendimento antes de usar cálculos automáticos',
        'Revise sempre os cálculos automáticos antes de salvar',
        'Mantenha backup das planilhas importadas'
      ]
    }
  },
  {
    id: 'parametros',
    title: 'Parâmetros de Rendimento',
    content: {
      overview: 'Configuração de parâmetros de rendimento para cálculos automáticos.',
      features: [
        'Cadastro por tipo de peça',
        'Percentual de rendimento esperado',
        'Códigos personalizados',
        'Gestão completa (criar, editar, excluir)'
      ],
      howTo: [
        'Acesse "Parâmetros de Rendimento" no menu',
        'Clique em "Adicionar Parâmetro"',
        'Defina código, descrição e percentual esperado',
        'Salve o parâmetro',
        'Use os códigos nas notas fiscais para cálculos automáticos'
      ],
      examples: [
        'DIANTEIRO - Dianteiro Completo - 45%',
        'TRASEIRO - Traseiro Serrote - 55%',
        'COSTELA - Costela Bovina - 25%'
      ],
      tips: [
        'Use códigos curtos e padronizados',
        'Baseie percentuais em dados históricos',
        'Revise parâmetros periodicamente',
        'Mantenha consistência entre equipes'
      ]
    }
  },
  {
    id: 'simulacao',
    title: 'Simulação de Preços',
    content: {
      overview: 'Ferramenta para simular diferentes cenários de preços e margens.',
      features: [
        'Importação de itens de notas fiscais',
        'Cálculo de margens atuais',
        'Simulação por nova margem',
        'Simulação por preço de oferta',
        'Comparação lado a lado',
        'Análise de impacto financeiro'
      ],
      howTo: [
        'Carregue itens de uma nota fiscal ou adicione manualmente',
        'Preencha custos e preços atuais',
        'Defina nova margem OU preço de oferta',
        'Analise o novo preço calculado',
        'Compare com margens atuais',
        'Use para definir estratégias de preço'
      ],
      scenarios: [
        'Promoções e ofertas especiais',
        'Ajuste de margens por categoria',
        'Competitividade de mercado',
        'Otimização de lucratividade'
      ],
      tips: [
        'Use dados reais de custo para simulações precisas',
        'Considere custos indiretos nos cálculos',
        'Teste diferentes cenários antes de implementar',
        'Monitore o impacto das mudanças no volume de vendas'
      ]
    }
  },
  {
    id: 'historico',
    title: 'Histórico CNPJ',
    content: {
      overview: 'Consulta histórica de todas as movimentações por CNPJ.',
      features: [
        'Busca por CNPJ específico',
        'Histórico de notas fiscais',
        'Ordenação cronológica',
        'Detalhes de movimentações',
        'Filtros por período'
      ],
      howTo: [
        'Digite o CNPJ desejado no campo de busca',
        'Clique em "Pesquisar"',
        'Analise o histórico apresentado',
        'Use para auditoria e controle'
      ],
      uses: [
        'Auditoria de movimentações',
        'Análise de fornecedores',
        'Controle de regularidade',
        'Relatórios gerenciais'
      ]
    }
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    content: {
      overview: 'Configurações da conta, loja e gerenciamento de dados.',
      features: [
        'Identidade da loja (nome, CNPJ, logo)',
        'Exportação de dados',
        'Importação de backup',
        'Limpeza de dados',
        'Modelos de planilhas'
      ],
      howTo: [
        'Atualize informações da loja',
        'Faça upload do logo',
        'Use exportação para backup',
        'Importe dados de outros sistemas',
        'Configure conforme necessário'
      ],
      security: [
        'Dados criptografados',
        'Backup automático',
        'Controle de acesso por usuário',
        'Auditoria de alterações'
      ],
      tips: [
        'Mantenha dados da loja sempre atualizados',
        'Faça backup regular dos dados',
        'Use logos em alta qualidade',
        'Teste importações em ambiente controlado'
      ]
    }
  }
];

export const workflows = [
  {
    title: 'Fluxo Completo de Desossa',
    steps: [
      'Cadastrar parâmetros de rendimento',
      'Registrar entrada via nota fiscal',
      'Executar cálculos de desossa',
      'Analisar lucratividade por parte',
      'Simular preços de venda',
      'Gerar relatórios finais'
    ]
  },
  {
    title: 'Controle de Inventário',
    steps: [
      'Importar ou cadastrar itens',
      'Registrar movimentações',
      'Calcular quebras e sobras',
      'Analisar divergências',
      'Exportar relatórios',
      'Tomar ações corretivas'
    ]
  },
  {
    title: 'Análise de Rentabilidade',
    steps: [
      'Coletar dados de custos',
      'Executar desossas detalhadas',
      'Simular cenários de preços',
      'Comparar margens por produto',
      'Identificar oportunidades',
      'Implementar melhorias'
    ]
  }
];