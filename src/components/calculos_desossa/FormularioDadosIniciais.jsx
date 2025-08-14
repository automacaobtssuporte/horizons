import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tiposAnimais } from '@/config/partesAnimais';

const FormularioDadosIniciais = ({ 
  numeroNotaFiscal, setNumeroNotaFiscal,
  dataChegada, setDataChegada,
  pesoInicialBoi, setPesoInicialBoi,
  custoTotalCarcaça, setCustoTotalCarcaça,
  tipoAnimal, setTipoAnimal
}) => {
  const tipoAnimalLabel = tipoAnimal === 'suino' ? 'Suíno' : 'Bovino';
  const pesoLabel = `Peso Inicial ${tipoAnimalLabel} (kg)`;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Dados da Carcaça</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="tipoAnimal">Tipo de Animal</Label>
          <Select value={tipoAnimal || 'bovino'} onValueChange={setTipoAnimal}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposAnimais.map(tipo => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="numeroNotaFiscal">Número da Nota Fiscal</Label>
          <Input
            id="numeroNotaFiscal"
            type="text"
            placeholder="Ex: 12345"
            value={numeroNotaFiscal}
            onChange={(e) => setNumeroNotaFiscal(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="dataChegada">Data de Chegada</Label>
          <Input
            id="dataChegada"
            type="date"
            value={dataChegada}
            onChange={(e) => setDataChegada(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="pesoInicialBoi">{pesoLabel}</Label>
          <Input
            id="pesoInicialBoi"
            type="number"
            step="0.01"
            placeholder="Ex: 250.5"
            value={pesoInicialBoi}
            onChange={(e) => setPesoInicialBoi(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="custoTotalCarcaça">Custo Total da Carcaça (R$)</Label>
          <Input
            id="custoTotalCarcaça"
            type="number"
            step="0.01"
            placeholder="Ex: 1500.00"
            value={custoTotalCarcaça}
            onChange={(e) => setCustoTotalCarcaça(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FormularioDadosIniciais;