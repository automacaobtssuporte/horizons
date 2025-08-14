import React, { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, PlusCircle, Save, FilePlus, Search, Download, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

import FormularioDadosIniciais from '@/components/calculos_desossa/FormularioDadosIniciais';
import FormularioCortes from '@/components/calculos_desossa/FormularioCortes';
import ResultadosConsolidadosDisplay from '@/components/calculos_desossa/ResultadosConsolidadosDisplay';
import ModalPesquisaDesossa from '@/components/calculos_desossa/ModalPesquisaDesossa';
import PlanilhaActions from '@/components/calculos_desossa/PlanilhaActions';
import AnaliseLucratividadePorParte from '@/components/calculos_desossa/AnaliseLucratividadePorParte';
import { useDesossaCalculations } from '@/hooks/useDesossaCalculations';
import { useDesossaFormManager } from '@/components/calculos_desossa/DesossaFormManager';
import { useDesossaExportManager } from '@/components/calculos_desossa/DesossaExportManager';

const CalculosDesossa = () => {
  const { toast } = useToast();
  const { resultados, calcularResultados, resetCalculations } = useDesossaCalculations();
  const { handleExportResultadosExcel, handleExportResultadosPDF } = useDesossaExportManager();
  
  const {
    // Estados
    currentUser,
    isSaving,
    isSearching,
    isLoadingForm,
    tipoAnimal,
    numeroNotaFiscal,
    dataChegada,
    pesoInicialBoi,
    custoTotalCarcaça,
    cortes,
    searchTermDesossa,
    searchModalOpen,
    searchResults,
    currentDesossaId,
    
    // Setters
    setTipoAnimal,
    setNumeroNotaFiscal,
    setDataChegada,
    setPesoInicialBoi,
    setCustoTotalCarcaça,
    setCortes,
    setSearchTermDesossa,
    setSearchModalOpen,
    
    // Handlers
    resetForm,
    handleAddCorte,
    handleRemoveCorte,
    handleCorteChange,
    handleDownloadPlanilhaModeloDesossa,
    handleFileUpload,
    loadDesossaToForm,
    handleSaveDesossa,
    handleSearchDesossas
  } = useDesossaFormManager();

  const handleTriggerCalculation = () => {
    const result = calcularResultados(cortes, pesoInicialBoi, custoTotalCarcaça);
    if (result.error) {
      toast({ title: "Erro no Cálculo", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Cálculo Realizado", description: "Resultados atualizados!" });
    }
  };

  useEffect(() => {
    if (resultados.cortesCalculados.length > 0) {
      setCortes(resultados.cortesCalculados);
    }
  }, [resultados.cortesCalculados, setCortes]);

  const handleResetForm = () => {
    resetForm();
    resetCalculations();
  };

  if (isLoadingForm) { 
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={48} /> 
        <p className="ml-3">Carregando...</p>
      </div>
    ); 
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gradient-brand">Cálculos Detalhados de Desossa</h1>
        <div className="flex flex-wrap gap-2">
            <Button onClick={handleResetForm} variant="outline" className="hover-lift">
              <FilePlus className="mr-2 h-4 w-4"/> Nova
            </Button>
            <Button onClick={handleSaveDesossa} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white hover-lift">
                {isSaving ? <LoadingSpinner className="mr-2" /> : <Save className="mr-2 h-4 w-4"/>}
                {currentDesossaId ? 'Atualizar' : 'Salvar'}
            </Button>
            <Button 
              onClick={() => handleExportResultadosExcel(
                tipoAnimal, numeroNotaFiscal, dataChegada, pesoInicialBoi, custoTotalCarcaça, cortes, resultados
              )} 
              variant="outline" 
              className="bg-teal-600 hover:bg-teal-700 text-white hover-lift"
            >
                <Download className="mr-2 h-4 w-4"/> Excel
            </Button>
            <Button 
              onClick={() => handleExportResultadosPDF(
                tipoAnimal, numeroNotaFiscal, dataChegada, pesoInicialBoi, custoTotalCarcaça, cortes, resultados
              )} 
              variant="outline" 
              className="bg-red-600 hover:bg-red-700 text-white hover-lift"
            >
                <FileText className="mr-2 h-4 w-4"/> PDF
            </Button>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>Pesquisar Desossas Lançadas</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-grow">
                <Label htmlFor="searchTermDesossa">Nº Nota Fiscal ou Data (AAAA-MM-DD)</Label>
                <Input 
                  id="searchTermDesossa" 
                  type="text" 
                  placeholder="Buscar..." 
                  value={searchTermDesossa} 
                  onChange={e => setSearchTermDesossa(e.target.value)} 
                />
            </div>
            <Button onClick={handleSearchDesossas} disabled={isSearching} className="w-full sm:w-auto">
                {isSearching ? <LoadingSpinner className="mr-2" /> : <Search className="mr-2 h-4 w-4"/>} 
                Pesquisar
            </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormularioDadosIniciais
          numeroNotaFiscal={numeroNotaFiscal} setNumeroNotaFiscal={setNumeroNotaFiscal}
          dataChegada={dataChegada} setDataChegada={setDataChegada}
          pesoInicialBoi={pesoInicialBoi} setPesoInicialBoi={setPesoInicialBoi}
          custoTotalCarcaça={custoTotalCarcaça} setCustoTotalCarcaça={setCustoTotalCarcaça}
          tipoAnimal={tipoAnimal} setTipoAnimal={setTipoAnimal}
        />
        <PlanilhaActions onDownloadModelo={handleDownloadPlanilhaModeloDesossa} onFileUpload={handleFileUpload} />
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detalhes dos Cortes</CardTitle>
          <Button onClick={handleAddCorte} size="sm" variant="outline" className="hover-lift">
            <PlusCircle className="mr-2 h-4 w-4"/> Adicionar
          </Button>
        </CardHeader>
        <CardContent>
          <FormularioCortes 
            cortes={cortes} 
            handleCorteChange={handleCorteChange} 
            handleRemoveCorte={handleRemoveCorte} 
            tipoAnimal={tipoAnimal}
          />
          {cortes.length > 0 && (
            <Button 
              onClick={handleTriggerCalculation} 
              className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 hover-lift"
            >
              <Calculator className="mr-2 h-5 w-5"/> Calcular
            </Button>
          )}
        </CardContent>
      </Card>

      <ResultadosConsolidadosDisplay
        rendimentoTotal={resultados.rendimentoTotalCalculado}
        custoVerificado={resultados.custoTotalAposDesossaCalculado}
        receitaTotal={resultados.receitaTotalVendaCalculada}
        lucroEstimado={resultados.lucroTotalEstimado}
        totalDescarte={resultados.custoTotalDescarte}
      />
      
      {resultados.dadosAnalisePartes && resultados.dadosAnalisePartes.length > 0 && (
          <AnaliseLucratividadePorParte dadosAnalise={resultados.dadosAnalisePartes} />
      )}

      <ModalPesquisaDesossa
        open={searchModalOpen}
        setOpen={setSearchModalOpen}
        results={searchResults}
        isLoading={isSearching}
        searchTerm={searchTermDesossa}
        loadDesossaToForm={loadDesossaToForm}
      />
    </div>
  );
};

export default CalculosDesossa;