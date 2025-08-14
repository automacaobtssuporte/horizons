import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';

const PainelResumoQuebras = ({ itensInventario }) => {
  let totalQuebrasQtd = 0;
  let totalQuebrasValor = 0;
  let totalSobrasQtd = 0;
  let totalSobrasValor = 0;

  itensInventario.forEach(item => {
    const divergencia = parseFloat(item.divergencia) || 0;
    const divergenciaValor = parseFloat(item.divergencia_valor) || 0;

    if (divergencia < 0) { // Quebra (Estoque Físico < Calculado)
      totalQuebrasQtd += Math.abs(divergencia);
      totalQuebrasValor += Math.abs(divergenciaValor);
    } else if (divergencia > 0) { // Sobra (Estoque Físico > Calculado)
      totalSobrasQtd += divergencia;
      totalSobrasValor += divergenciaValor;
    }
  });

  const saldoGeralQtd = totalSobrasQtd - totalQuebrasQtd;
  const saldoGeralValor = totalSobrasValor - totalQuebrasValor;

  const ResumoCard = ({ title, quantidade, valor, icon, colorClass }) => (
    <Card className={`glass-card border-l-4 ${colorClass}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{quantidade.toLocaleString('pt-BR')}</p>
        <p className="text-sm text-muted-foreground">Quantidade</p>
        <p className="text-2xl font-bold mt-2">{valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        <p className="text-sm text-muted-foreground">Valor Financeiro</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="my-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gradient-secondary">Resumo Financeiro das Quebras e Sobras</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResumoCard 
          title="Total de Quebras" 
          quantidade={totalQuebrasQtd} 
          valor={totalQuebrasValor} 
          icon={<TrendingDown className="h-6 w-6 text-red-500" />}
          colorClass="border-red-500"
        />
        <ResumoCard 
          title="Total de Sobras" 
          quantidade={totalSobrasQtd} 
          valor={totalSobrasValor} 
          icon={<TrendingUp className="h-6 w-6 text-green-500" />}
          colorClass="border-green-500"
        />
        <ResumoCard 
          title="Saldo Geral (Qtd)" 
          quantidade={saldoGeralQtd} 
          valor={0} /* Valor não se aplica diretamente ao saldo de qtd */
          icon={<Package className={`h-6 w-6 ${saldoGeralQtd >= 0 ? 'text-green-500' : 'text-red-500'}`} />}
          colorClass={saldoGeralQtd >= 0 ? 'border-green-500' : 'border-red-500'}
        />
         <ResumoCard 
          title="Saldo Geral (R$)" 
          quantidade={0} /* Qtd não se aplica diretamente ao saldo de valor */
          valor={saldoGeralValor} 
          icon={<DollarSign className={`h-6 w-6 ${saldoGeralValor >= 0 ? 'text-green-500' : 'text-red-500'}`} />}
          colorClass={saldoGeralValor >= 0 ? 'border-green-500' : 'border-red-500'}
        />
      </div>
    </div>
  );
};

export default PainelResumoQuebras;