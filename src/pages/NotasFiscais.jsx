import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, Edit2, FileSpreadsheet, Download, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ModalNotaFiscal from '@/components/notas_fiscais/ModalNotaFiscal';
import { useNotasFiscaisManager } from '@/hooks/useNotasFiscaisManager';
import { APP_NAME } from '@/config/constants';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';

const NotasFiscais = () => {
  const {
    currentUser,
    modalOpen,
    currentNota,
    searchTerm,
    loading,
    isSaving,
    produtosInventario,
    produtosDesossa,
    desossasRegistradas,
    filteredNotas,
    setModalOpen,
    setSearchTerm,
    handleOpenModal,
    handleNotaChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    handleSaveNota,
    handleDeleteNota,
    handleFileUploadNF,
    handleAplicarRendimento
  } = useNotasFiscaisManager();

  const { toast } = useToast();

  const handleDownloadPlanilhaModeloNF = () => {
    const worksheetData = [ 
      ["numero_nota", "data_nota", "cnpj_emitente_nota", "codigo_produto_item", "descricao_item", "quantidade_item", "valor_unitario_item", "observacoes_nota"], 
      ["12345", "2025-06-10", "00.000.000/0001-00", "P001", "DIANTEIRO BOVINO", "150.5", "20.50", "Compra gado"] 
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ModeloNotasFiscais");
    XLSX.writeFile(workbook, `Modelo_Notas_Fiscais_${APP_NAME}.xlsx`);
    toast({ title: "Download Iniciado", description: "Modelo de planilha baixado."});
  };

  if (loading) { 
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={48} /> 
        <p className="ml-3">Carregando...</p>
      </div>
    ); 
  }
  
  if (!currentUser && !loading) { 
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Erro ao carregar usuário.</p>
      </div>
    ); 
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Gerenciamento de Notas Fiscais</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input 
            type="search" 
            placeholder="Pesquisar por nº, data ou item..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="max-w-xs"
          />
          <Button onClick={() => handleOpenModal()} className="whitespace-nowrap">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Manual
          </Button>
        </div>
      </div>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Importar Notas de Planilha</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
            <Button onClick={handleDownloadPlanilhaModeloNF} variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4"/> Baixar Modelo
            </Button>
            <div className="w-full sm:w-auto">
              <Label htmlFor="uploadPlanilhaNF" className="sr-only">Carregar</Label>
              <Input 
                id="uploadPlanilhaNF" 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileUploadNF} 
                className="w-full"
              />
            </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Use o modelo. Linhas com mesmo "numero_nota" serão agrupadas.
          </p>
        </CardFooter>
      </Card>
      
      {filteredNotas.length === 0 && !loading ? (
        <Card className="glass-card text-center py-12">
          <CardContent>
            <FileSpreadsheet className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">Nenhuma nota fiscal encontrada.</p>
            {searchTerm && <p className="text-sm text-muted-foreground mt-2">Tente um termo de busca diferente.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotas.map(nota => (
            <motion.div 
              key={nota.id} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card h-full flex flex-col">
                <CardHeader>
                  <CardTitle>NF-e: {nota.numero_nota}</CardTitle>
                  <CardDescription>
                    Data: {nota.data_nota ? new Date(nota.data_nota + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'} | CNPJ: {nota.cnpj_emitente}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="font-semibold">Itens ({nota.items ? nota.items.length : 0}):</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground max-h-24 overflow-y-auto">
                    {nota.items && nota.items.slice(0,3).map((item, idx) => (
                      <li key={idx}>{item.descricao} ({item.quantidade})</li>
                    ))}
                    {nota.items && nota.items.length > 3 && (
                      <li>... e mais {nota.items.length - 3}</li>
                    )}
                  </ul>
                  <p className="mt-2 font-bold text-lg">
                    Total: <span className="text-primary">
                      {parseFloat(nota.total_calculado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {nota.link_pdf && (
                    <Button asChild variant="secondary" size="sm">
                      <a href={nota.link_pdf} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-1 h-3 w-3"/> Ver PDF
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleOpenModal(nota)} disabled={isSaving}>
                    <Edit2 className="mr-1 h-3 w-3"/> Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteNota(nota.id)} disabled={isSaving}>
                    {isSaving && currentNota?.id === nota.id ? (
                      <LoadingSpinner size={12} className="mr-1" />
                    ) : (
                      <Trash2 className="mr-1 h-3 w-3"/>
                    )} 
                    Excluir
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {modalOpen && (
        <ModalNotaFiscal 
          open={modalOpen} 
          setOpen={setModalOpen} 
          currentNota={currentNota} 
          handleNotaChange={handleNotaChange} 
          handleItemChange={handleItemChange} 
          handleAddItem={handleAddItem} 
          handleRemoveItem={handleRemoveItem} 
          handleSaveNota={handleSaveNota} 
          isSaving={isSaving} 
          handleAplicarRendimento={handleAplicarRendimento} 
          produtosInventario={produtosInventario}
          produtosDesossa={produtosDesossa}
          desossasRegistradas={desossasRegistradas}
        />
      )}
    </div>
  );
};

export default NotasFiscais;