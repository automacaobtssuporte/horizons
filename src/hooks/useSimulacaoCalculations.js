import { useToast } from '@/components/ui/use-toast';

export const useSimulacaoCalculations = () => {
  const { toast } = useToast();

  const calcularMargemAtual = (custo, precoVenda) => {
    const c = parseFloat(custo);
    const pV = parseFloat(precoVenda);
    if (!isNaN(c) && !isNaN(pV) && pV > 0) {
      return (((pV - c) / pV) * 100).toFixed(2) + '%';
    }
    return 'N/A';
  };

  const calcularTotalVendaAtual = (precoVenda, peso) => {
    const pV = parseFloat(precoVenda);
    const p = parseFloat(peso);
    if (!isNaN(pV) && !isNaN(p) && p > 0) {
      return (pV * p).toFixed(2);
    }
    return 'N/A';
  };

  const calcularNovoCusto = (quantidade, precoVenda, indiceParticipacao) => {
    // NOVA FÓRMULA ATUALIZADA: NOVO CUSTO = (Quantidade × Preço de Venda) × Índice de Participação % × QUANTIDADE
    const qtd = parseFloat(quantidade);
    const preco = parseFloat(precoVenda);
    const indice = parseFloat(indiceParticipacao);
    
    if (!isNaN(qtd) && !isNaN(preco) && !isNaN(indice) && qtd > 0 && preco > 0) {
      // Primeiro calcula (Quantidade × Preço de Venda)
      const totalVenda = qtd * preco;
      // Depois multiplica pelo índice de participação
      const custoComIndice = totalVenda * (indice / 100);
      // Finalmente multiplica pela quantidade novamente
      const novoCusto = custoComIndice * qtd;
      return novoCusto.toFixed(2);
    }
    return '0';
  };

  const calcularDashboardMargem = (itens) => {
    const itensValidos = itens.filter(item => 
      item.codigo || item.nome && 
      parseFloat(item.totalVenda) > 0 && 
      parseFloat(item.novoCusto) > 0
    );

    if (itensValidos.length === 0) {
      return {
        receitaTotalEstimada: 0,
        custoTotalEstimado: 0,
        lucroTotalEstimado: 0,
        margemLucroPercentual: 0,
        itensAnalisados: 0
      };
    }

    const receitaTotalEstimada = itensValidos.reduce((sum, item) => 
      sum + parseFloat(item.totalVenda || 0), 0
    );

    const custoTotalEstimado = itensValidos.reduce((sum, item) => 
      sum + parseFloat(item.novoCusto || 0), 0
    );

    const lucroTotalEstimado = receitaTotalEstimada - custoTotalEstimado;

    // Dashboard para margem: lucro dividido pela receita total estimada
    const margemLucroPercentual = receitaTotalEstimada > 0 ? 
      (lucroTotalEstimado / receitaTotalEstimada) * 100 : 0;

    return {
      receitaTotalEstimada: receitaTotalEstimada.toFixed(2),
      custoTotalEstimado: custoTotalEstimado.toFixed(2),
      lucroTotalEstimado: lucroTotalEstimado.toFixed(2),
      margemLucroPercentual: margemLucroPercentual.toFixed(2),
      itensAnalisados: itensValidos.length
    };
  };

  const processarItemChange = (item, field, value) => {
    const updatedItem = { ...item, [field]: value };
    const custo = parseFloat(updatedItem.custoAtual);
    const peso = parseFloat(updatedItem.peso);

    const calcularNovosValores = (precoVendaKg) => {
        updatedItem.novoPrecoVenda = precoVendaKg.toFixed(2);
        if (custo > 0) {
            updatedItem.markup = (((precoVendaKg - custo) / custo) * 100).toFixed(2);
        } else {
            updatedItem.markup = 'inf';
        }
        if (precoVendaKg > 0) {
            updatedItem.novaMargemCalculada = (((precoVendaKg - custo) / precoVendaKg) * 100).toFixed(2);
        } else {
            updatedItem.novaMargemCalculada = '0.00';
        }
        
        if (!isNaN(peso) && peso > 0) {
            const totalVenda = precoVendaKg * peso;
            updatedItem.totalVenda = totalVenda.toFixed(2);
            updatedItem.novoCusto = calcularNovoCusto(peso, precoVendaKg, 100);
        }
    };
    
    if (field === 'novaMargem' && updatedItem.novaMargem && !isNaN(custo)) {
      const margem = parseFloat(updatedItem.novaMargem) / 100;
      if (margem >= 0 && margem < 1) {
        const precoVendaKg = custo / (1 - margem);
        calcularNovosValores(precoVendaKg);
        updatedItem.precoOferta = '';
      } else {
        updatedItem.novoPrecoVenda = '';
        updatedItem.novaMargemCalculada = '';
        updatedItem.markup = '';
        updatedItem.totalVenda = '';
        updatedItem.novoCusto = '';
        if(margem >= 1) {
          toast({title: "Margem Inválida", description: "Nova margem deve ser menor que 100%.", variant: "destructive"});
        }
      }
    } else if (field === 'precoOferta' && updatedItem.precoOferta && !isNaN(custo)) {
      const precoO = parseFloat(updatedItem.precoOferta);
      calcularNovosValores(precoO);
      updatedItem.novaMargem = '';
    } else if (field === 'peso' && updatedItem.novoPrecoVenda && !isNaN(peso)) {
      const precoVenda = parseFloat(updatedItem.novoPrecoVenda);
      if (!isNaN(precoVenda) && peso > 0) {
        const totalVenda = precoVenda * peso;
        updatedItem.totalVenda = totalVenda.toFixed(2);
        updatedItem.novoCusto = calcularNovoCusto(peso, precoVenda, 100);
      } else {
        updatedItem.totalVenda = '';
        updatedItem.novoCusto = '';
      }
    }
    
    return updatedItem;
  };

  return {
    calcularMargemAtual,
    calcularTotalVendaAtual,
    calcularNovoCusto,
    calcularDashboardMargem,
    processarItemChange
  };
};