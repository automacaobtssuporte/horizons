import { useState, useCallback } from 'react';

export const useDesossaCalculations = () => {
  const [rendimentoTotalCalculado, setRendimentoTotalCalculado] = useState(0);
  const [custoTotalAposDesossaCalculado, setCustoTotalAposDesossaCalculado] = useState(0);
  const [receitaTotalVendaCalculada, setReceitaTotalVendaCalculada] = useState(0);
  const [lucroTotalEstimado, setLucroTotalEstimado] = useState(0);
  const [custoTotalDescarte, setCustoTotalDescarte] = useState(0);
  const [dadosAnalisePartes, setDadosAnalisePartes] = useState([]);
  const [cortesCalculados, setCortesCalculados] = useState([]);

  const calcularResultados = useCallback((cortes, pesoInicialBoi, custoTotalCarcaça) => {
    const pesoInicialNum = parseFloat(pesoInicialBoi);
    const custoTotalCarcaçaNum = parseFloat(custoTotalCarcaça);

    if (isNaN(pesoInicialNum) || pesoInicialNum <= 0 || isNaN(custoTotalCarcaçaNum) || custoTotalCarcaçaNum < 0) {
      return { error: "Peso Inicial e Custo Total da Carcaça são obrigatórios e devem ser maiores ou iguais a zero." };
    }
    if (cortes.some(c => !c.nome || isNaN(parseFloat(c.peso)) || parseFloat(c.peso) < 0 || (c.parte_boi !== 'descarte' && c.parte_animal !== 'descarte' && (isNaN(parseFloat(c.preco_venda_kg)) || parseFloat(c.preco_venda_kg) < 0)))) {
      return { error: "Verifique se todos os cortes têm nome, peso e preço de venda (exceto para descarte) preenchidos corretamente com valores não negativos." };
    }
    
    // --- PASS 1: Calculate total revenue to find the sale index ---
    let receitaTotalVenda = 0;
    cortes.forEach(corte => {
      const pesoCorteNum = parseFloat(corte.peso) || 0;
      const isDescarte = corte.parte_boi === 'descarte' || corte.parte_animal === 'descarte';
      if (!isDescarte) {
        const precoVendaKgNum = parseFloat(corte.preco_venda_kg) || 0;
        receitaTotalVenda += pesoCorteNum * precoVendaKgNum;
      }
    });

    if (receitaTotalVenda <= 0) {
      return { error: "A Receita Total de Venda é zero ou negativa. Não é possível calcular o rateio de custos. Verifique os preços e pesos dos cortes." };
    }

    // --- PASS 2: Calculate costs and margins for each cut based on sale index ---
    let pesoTotalCortesComercializaveis = 0;
    let pesoTotalCortesDescarte = 0;
    let custoTotalVerificado = 0;
    
    const cortesProcessados = cortes.map(corte => {
      const pesoCorteNum = parseFloat(corte.peso) || 0;
      const isDescarte = corte.parte_boi === 'descarte' || corte.parte_animal === 'descarte';
      const precoVendaKgNum = isDescarte ? 0 : (parseFloat(corte.preco_venda_kg) || 0);
      
      const valorVendaCorte = pesoCorteNum * precoVendaKgNum;
      const indiceVenda = receitaTotalVenda > 0 ? valorVendaCorte / receitaTotalVenda : 0;
      
      const custoTotalPeca = isDescarte ? 0 : indiceVenda * custoTotalCarcaçaNum;
      const novoCustoKg = pesoCorteNum > 0 ? custoTotalPeca / pesoCorteNum : 0;

      const margem = precoVendaKgNum > 0 
        ? ((precoVendaKgNum - novoCustoKg) / precoVendaKgNum) * 100
        : 0;

      if (isDescarte) {
        pesoTotalCortesDescarte += pesoCorteNum;
      } else {
        pesoTotalCortesComercializaveis += pesoCorteNum;
      }
      custoTotalVerificado += custoTotalPeca;
      
      return { 
        ...corte,
        id: corte.id,
        nome: corte.nome,
        pesoNum: pesoCorteNum,
        precoVendaKgNum,
        isDescarte,
        indiceVenda: (indiceVenda * 100).toFixed(2) + "%",
        receitaVendaCorte: valorVendaCorte.toFixed(2),
        novoCustoKg: novoCustoKg.toFixed(2),
        novoCustoTotal: custoTotalPeca.toFixed(2),
        margem: margem.toFixed(2) + "%",
      };
    });

    const rendTotal = pesoInicialNum > 0 ? (pesoTotalCortesComercializaveis / pesoInicialNum) * 100 : 0;
    
    // Custo do descarte é o que sobra do custo total da carcaça após rateio
    const custoDescarteTotal = custoTotalCarcaçaNum - custoTotalVerificado;

    // Sumariza por parte do animal
    const analisePorParte = {};
    cortesProcessados.forEach(corte => {
        const parte = corte.parte_boi || corte.parte_animal || 'nao_definida';
        if (!analisePorParte[parte]) {
            analisePorParte[parte] = { nome: parte, receitaTotal: 0, custoTotal: 0, pesoTotal: 0, itens: 0 };
        }
        analisePorParte[parte].receitaTotal += parseFloat(corte.receitaVendaCorte);
        analisePorParte[parte].custoTotal += parseFloat(corte.novoCustoTotal);
        analisePorParte[parte].pesoTotal += corte.pesoNum;
        analisePorParte[parte].itens += 1;
    });

    const dadosAnaliseFinal = Object.values(analisePorParte).map(p => ({
        ...p,
        lucroPrejuizo: (p.receitaTotal - p.custoTotal).toFixed(2),
        receitaTotal: p.receitaTotal.toFixed(2),
        custoTotal: p.custoTotal.toFixed(2),
        pesoTotal: p.pesoTotal.toFixed(2),
    }));

    setRendimentoTotalCalculado(rendTotal.toFixed(2));
    setReceitaTotalVendaCalculada(receitaTotalVenda.toFixed(2));
    setCortesCalculados(cortesProcessados);
    setDadosAnalisePartes(dadosAnaliseFinal);
    setCustoTotalAposDesossaCalculado(custoTotalVerificado.toFixed(2));
    setCustoTotalDescarte(custoDescarteTotal.toFixed(2));
    setLucroTotalEstimado((receitaTotalVenda - custoTotalCarcaçaNum).toFixed(2));

    return { success: true };
  }, []);

  const resetCalculations = () => {
    setRendimentoTotalCalculado(0);
    setCustoTotalAposDesossaCalculado(0);
    setReceitaTotalVendaCalculada(0);
    setLucroTotalEstimado(0);
    setCustoTotalDescarte(0);
    setDadosAnalisePartes([]);
    setCortesCalculados([]);
  };

  return {
    resultados: {
      rendimentoTotalCalculado,
      custoTotalAposDesossaCalculado,
      receitaTotalVendaCalculada,
      lucroTotalEstimado,
      custoTotalDescarte,
      dadosAnalisePartes,
      cortesCalculados,
    },
    calcularResultados,
    resetCalculations,
  };
};