import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';

const TabelaResultadosRendimento = ({ resultados }) => {
  if (!resultados || resultados.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12 mb-4" />
          <p>Os resultados do cálculo de rendimento aparecerão aqui.</p>
          <p className="text-sm">Preencha o peso do boi e clique em "Calcular".</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Resultados do Cálculo de Rendimento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peça</TableHead>
                <TableHead className="text-right">Peso (kg)</TableHead>
                <TableHead className="text-right">Preço Venda (R$/kg)</TableHead>
                <TableHead className="text-right">Valor Peça (R$)</TableHead>
                <TableHead className="text-right">% Peso</TableHead>
                <TableHead className="text-right">% Venda</TableHead>
                <TableHead className="text-right">Novo Custo (R$/kg)</TableHead>
                <TableHead className="text-right">Margem (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultados.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.nome} <span className="text-muted-foreground">({item.codigo_peca})</span></TableCell>
                  <TableCell className="text-right">{item.peso}</TableCell>
                  <TableCell className="text-right">R$ {item.precoVendaKg}</TableCell>
                  <TableCell className="text-right">R$ {item.valorPeca}</TableCell>
                  <TableCell className="text-right">{item.percentualPeso}</TableCell>
                  <TableCell className="text-right">{item.percentualVenda}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">R$ {item.novoCustoUnitario}</TableCell>
                  <TableCell className="text-right font-semibold text-green-500">{item.margem}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabelaResultadosRendimento;