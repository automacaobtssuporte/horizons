import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Scale, Calculator, Trash2, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ResultadosConsolidadosDisplay = ({ 
  rendimentoTotal, 
  custoVerificado, 
  receitaTotal, 
  lucroEstimado, 
  totalDescarte 
}) => {
  const rendimentoNum = parseFloat(rendimentoTotal) || 0;
  const custoNum = parseFloat(custoVerificado) || 0;
  const receitaNum = parseFloat(receitaTotal) || 0;
  const lucroNum = parseFloat(lucroEstimado) || 0;
  const descarteNum = parseFloat(totalDescarte) || 0;

  const margemLucro = receitaNum > 0 ? (lucroNum / receitaNum) * 100 : 0;

  const getRendimentoColor = (rendimento) => {
    if (rendimento >= 70) return 'text-green-600';
    if (rendimento >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLucroColor = (lucro) => {
    if (lucro > 0) return 'text-green-600';
    if (lucro === 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMargemColor = (margem) => {
    if (margem >= 20) return 'bg-green-100 text-green-800';
    if (margem >= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Resultados Consolidados da Desossa
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm text-muted-foreground space-y-1 mt-2 cursor-help flex items-center">
                <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                <span>Hover para detalhes da nova fórmula de custo (rateio por venda)</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white p-3 rounded-md shadow-lg max-w-xs">
              <p className="font-bold mb-2">Nova Fórmula de Custo por Rateio:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li><strong>Índice de Venda:</strong> (Preço Venda × Peso) / Receita Total</li>
                <li><strong>Custo Total Peça (R$):</strong> Índice de Venda × Custo Total Carcaça</li>
                <li><strong>Novo Custo (R$/kg):</strong> Custo Total Peça / Peso da Peça</li>
                <li><strong>Margem %:</strong> (Preço Venda/kg - Novo Custo/kg) / Preço Venda/kg</li>
              </ol>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Rendimento Total</p>
                <p className={`text-2xl font-bold ${getRendimentoColor(rendimentoNum)}`}>
                  {rendimentoNum.toFixed(2)}%
                </p>
              </div>
              <Scale className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {rendimentoNum >= 70 ? 'Excelente' : rendimentoNum >= 60 ? 'Bom' : 'Atenção'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Custo Total Verificado</p>
                <p className="text-2xl font-bold text-purple-700">
                  R$ {custoNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-1">Soma dos custos das peças</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-700">
                  R$ {receitaNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">Receita estimada dos cortes</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Lucro Estimado</p>
                <p className={`text-2xl font-bold ${getLucroColor(lucroNum)}`}>
                  R$ {lucroNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {lucroNum >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-500" /> : 
                <TrendingDown className="h-8 w-8 text-red-500" />
              }
            </div>
            <Badge className={getMargemColor(margemLucro)}>
              {margemLucro.toFixed(1)}% margem
            </Badge>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Descarte</p>
                <p className="text-2xl font-bold text-gray-700">
                  R$ {descarteNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Trash2 className="h-8 w-8 text-gray-500" />
            </div>
            <p className="text-xs text-gray-600 mt-1">Custo não recuperável (ossos, etc.)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultadosConsolidadosDisplay;