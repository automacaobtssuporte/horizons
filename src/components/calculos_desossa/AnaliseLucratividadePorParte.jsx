import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { BarChart3, TrendingUp, TrendingDown, Bone } from 'lucide-react';

const AnaliseLucratividadePorParte = ({ dadosAnalise }) => {
  const [tipoAnimalFiltro, setTipoAnimalFiltro] = useState('todos');

  if (!dadosAnalise || dadosAnalise.length === 0) {
    return null;
  }

  const getParteLabel = (parteValue) => {
    const partesMap = {
      // Bovino
      dianteiro: "Dianteiro",
      traseiro: "Traseiro",
      serrote: "Serrote",
      boi_inteiro: "Boi Inteiro",
      ponta_de_agulha: "Ponta de Agulha",
      costela: "Costela",
      // Suíno
      pernil: "Pernil",
      paleta: "Paleta",
      lombo: "Lombo",
      costela_suino: "Costela Suíno",
      panceta: "Panceta (Barriga)",
      copa: "Copa",
      papada: "Papada",
      pé: "Pé",
      rabo: "Rabo",
      suino_inteiro: "Suíno Inteiro",
      // Comum
      descarte: "Descarte",
      outro: "Outro",
      nao_definida: "Não Definida"
    };
    return partesMap[parteValue.toLowerCase()] || parteValue;
  };

  const isParteBovina = (parte) => {
    const partesBovinas = ['dianteiro', 'traseiro', 'serrote', 'boi_inteiro', 'ponta_de_agulha', 'costela'];
    return partesBovinas.includes(parte.toLowerCase());
  };

  const isParteSuina = (parte) => {
    const partesSuinas = ['pernil', 'paleta', 'lombo', 'costela_suino', 'panceta', 'copa', 'papada', 'pé', 'rabo', 'suino_inteiro'];
    return partesSuinas.includes(parte.toLowerCase());
  };

  const dadosFiltrados = dadosAnalise.filter(parte => {
    if (tipoAnimalFiltro === 'todos') return true;
    if (tipoAnimalFiltro === 'bovino') return isParteBovina(parte.nome) || (!isParteBovina(parte.nome) && !isParteSuina(parte.nome));
    if (tipoAnimalFiltro === 'suino') return isParteSuina(parte.nome);
    return true;
  });

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BarChart3 className="mr-3 h-6 w-6 text-primary" />
          Análise de Lucratividade por Parte
        </CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <Label htmlFor="tipoAnimalFiltro">Filtrar por Tipo de Animal:</Label>
          <Select value={tipoAnimalFiltro} onValueChange={setTipoAnimalFiltro}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="bovino">Apenas Bovino</SelectItem>
              <SelectItem value="suino">Apenas Suíno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dadosFiltrados.map((parte) => {
            const lucro = parseFloat(parte.lucroPrejuizo);
            const isLucro = lucro >= 0;
            const Icon = isLucro ? TrendingUp : TrendingDown;
            const corTexto = isLucro ? 'text-green-500' : 'text-red-500';
            const corBg = isLucro ? 'bg-green-500/10' : 'bg-red-500/10';
            const IconParte = parte.nome === 'descarte' ? Bone : BarChart3;

            // Determinar cor do ícone baseado no tipo de animal
            let corIcone = 'text-indigo-500';
            if (isParteBovina(parte.nome)) {
              corIcone = 'text-blue-600';
            } else if (isParteSuina(parte.nome)) {
              corIcone = 'text-pink-600';
            } else if (parte.nome === 'descarte') {
              corIcone = 'text-gray-500';
            }

            return (
              <Card key={parte.nome} className={`shadow-md hover:shadow-lg transition-shadow duration-300 ${corBg}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <IconParte className={`mr-2 h-5 w-5 ${corIcone}`} />
                    {getParteLabel(parte.nome)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p><strong>Peso Total:</strong> {parte.pesoTotal} kg ({parte.itens} {parte.itens === 1 ? 'corte' : 'cortes'})</p>
                  <p><strong>Receita:</strong> R$ {parte.receitaTotal}</p>
                  <p><strong>Custo:</strong> R$ {parte.custoTotal}</p>
                  <p className={`font-bold text-base ${corTexto}`}>
                    {isLucro ? 'Lucro:' : 'Prejuízo:'} R$ {Math.abs(lucro).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {dadosFiltrados.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma parte encontrada para o filtro selecionado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnaliseLucratividadePorParte;