import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CalculadoraRendimento = ({ 
  pesoBoi, 
  setPesoBoi, 
  handleCalcular, 
  isLoading,
  partesDisponiveis,
  selectedParte,
  setSelectedParte
}) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Simular Rendimento</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-1">
          <Label htmlFor="pesoTotalBoi">Peso Total do Boi (kg)</Label>
          <Input
            id="pesoTotalBoi"
            type="number"
            placeholder="Ex: 250.5"
            value={pesoBoi}
            onChange={(e) => setPesoBoi(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="md:col-span-1">
          <Label htmlFor="parteAnimalFiltro">Filtrar por Parte do Animal</Label>
          <Select value={selectedParte} onValueChange={setSelectedParte} disabled={isLoading}>
            <SelectTrigger id="parteAnimalFiltro">
              <SelectValue placeholder="Selecione uma parte..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Partes</SelectItem>
              {partesDisponiveis.map(parte => (
                <SelectItem key={parte} value={parte}>{parte}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCalcular} className="w-full" disabled={isLoading}>
          <Calculator className="mr-2 h-4 w-4" />
          Calcular Rendimento
        </Button>
      </CardContent>
    </Card>
  );
};

export default CalculadoraRendimento;