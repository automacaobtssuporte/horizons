import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Percent, Calculator, BarChart3 } from 'lucide-react';

const DashboardMargem = ({ dadosMargem }) => {
  const {
    receitaTotalEstimada,
    custoTotalEstimado,
    lucroTotalEstimado,
    margemLucroPercentual,
    itensAnalisados
  } = dadosMargem;

  const kpiCard = (title, value, icon, unit = '', color = "text-primary", bgColor = "bg-primary/10") => (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="glass-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${bgColor}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${color}`}>
            {value} <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const getMargemColor = (margem) => {
    const margemNum = parseFloat(margem);
    if (margemNum >= 30) return "text-green-600";
    if (margemNum >= 15) return "text-yellow-600";
    return "text-red-600";
  };

  const getMargemBgColor = (margem) => {
    const margemNum = parseFloat(margem);
    if (margemNum >= 30) return "bg-green-100";
    if (margemNum >= 15) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Dashboard de Margem e Lucratividade
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análise consolidada baseada na fórmula: <strong>Margem = Lucro ÷ Receita Total Estimada</strong>
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {kpiCard(
            "Receita Total Estimada", 
            formatCurrency(receitaTotalEstimada), 
            <DollarSign className="h-4 w-4 text-blue-600" />,
            "",
            "text-blue-600",
            "bg-blue-100"
          )}
          {kpiCard(
            "Custo Total Estimado", 
            formatCurrency(custoTotalEstimado), 
            <Calculator className="h-4 w-4 text-orange-600" />,
            "",
            "text-orange-600",
            "bg-orange-100"
          )}
          {kpiCard(
            "Lucro Total Estimado", 
            formatCurrency(lucroTotalEstimado), 
            <TrendingUp className="h-4 w-4 text-green-600" />,
            "",
            parseFloat(lucroTotalEstimado) >= 0 ? "text-green-600" : "text-red-600",
            parseFloat(lucroTotalEstimado) >= 0 ? "bg-green-100" : "bg-red-100"
          )}
          {kpiCard(
            "Margem de Lucro", 
            parseFloat(margemLucroPercentual).toFixed(2), 
            <Percent className="h-4 w-4" />,
            "%",
            getMargemColor(margemLucroPercentual),
            getMargemBgColor(margemLucroPercentual)
          )}
          {kpiCard(
            "Itens Analisados", 
            itensAnalisados, 
            <BarChart3 className="h-4 w-4 text-purple-600" />,
            "",
            "text-purple-600",
            "bg-purple-100"
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="text-sm font-medium text-muted-foreground">Fórmula do Novo Custo</div>
              <div className="text-lg font-semibold text-blue-600 mt-1">
                (Quantidade × Preço de Venda) × Índice de Participação % × QUANTIDADE
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="text-sm font-medium text-muted-foreground">Fórmula da Margem</div>
              <div className="text-lg font-semibold text-green-600 mt-1">
                Lucro ÷ Receita Total Estimada × 100
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <div className="text-sm font-medium text-muted-foreground">Interpretação da Margem</div>
              <div className="text-sm mt-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>≥ 30%: Excelente</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>15-29%: Boa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>&lt; 15%: Atenção</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardMargem;