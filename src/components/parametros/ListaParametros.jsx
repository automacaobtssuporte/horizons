import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Settings2 } from 'lucide-react';

const TabelaParametros = ({ parametros, handleParametroUpdate, handleOpenModal, handleDeleteParametro }) => {
  if (parametros.length === 0) {
    return (
      <Card className="glass-card text-center py-12">
        <CardContent>
          <Settings2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground">Nenhum parâmetro cadastrado.</p>
          <p className="text-sm text-muted-foreground">Clique em "Adicionar Parâmetro" para começar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Parâmetros Cadastrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cód. Peça</TableHead>
                <TableHead>Nome da Peça</TableHead>
                <TableHead>Parte do Animal</TableHead>
                <TableHead className="text-right">Rendimento (%)</TableHead>
                <TableHead>Preço Venda (R$/kg)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parametros.map(param => (
                <TableRow key={param.id}>
                  <TableCell>{param.codigo_peca}</TableCell>
                  <TableCell className="font-medium">{param.nome_peca}</TableCell>
                  <TableCell>{param.nome_parte_animal}</TableCell>
                  <TableCell className="text-right">{param.rendimento_percentual}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={param.preco_venda_kg || ''}
                      onChange={(e) => handleParametroUpdate(param.id, 'preco_venda_kg', e.target.value)}
                      placeholder="R$ 0.00"
                      className="min-w-[120px]"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="icon" onClick={() => handleOpenModal(param)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteParametro(param.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabelaParametros;