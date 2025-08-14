import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Trash2, Upload, FileSpreadsheet } from 'lucide-react';
import { AUTH_KEY, DATA_KEY_PREFIX } from '@/config/constants';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import * as XLSX from 'xlsx';

const Configuracoes = () => {
  const { toast } = useToast();
  const [storedUser, setStoredUser] = useState(JSON.parse(localStorage.getItem(AUTH_KEY)));
  
  const [logoUrl, setLogoUrl] = useState('');
  const [storeName, setStoreName] = useState(storedUser?.storeName || '');
  const [currentCnpj, setCurrentCnpj] = useState(storedUser?.cnpj || '');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem(AUTH_KEY));
    setStoredUser(userFromStorage);
    setStoreName(userFromStorage?.storeName || '');
    setCurrentCnpj(userFromStorage?.cnpj || '');
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!storedUser || !storedUser.id || !storedUser.cnpj) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('loja_configuracoes')
          .select('*')
          .eq('user_id', storedUser.id)
          .eq('cnpj', storedUser.cnpj)
          .single();

        if (error && error.code !== 'PGRST116') {
          if (!error.message?.includes('406')) {
            toast({ title: "Erro ao Carregar Configurações", description: error.message, variant: "destructive" });
          }
        }
        if (data) {
          setStoreName(data.nome_loja || storedUser.storeName);
          setLogoUrl(data.url_logo || '');
        } else {
          setStoreName(storedUser.storeName || '');
          setLogoUrl('');
        }
      } catch (error) {
        if (!error.message?.includes('406') && !error.message?.includes('Failed to fetch')) {
          toast({ title: "Erro ao Carregar Configurações", description: error.message, variant: "destructive" });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [toast, storedUser]);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !storedUser || !storedUser.id || !storedUser.cnpj) {
      toast({ title: "Erro", description: "Selecione um arquivo e certifique-se que está logado.", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith('image/')) {
        toast({ title: "Erro", description: "Por favor, selecione um arquivo de imagem.", variant: "destructive" });
        return;
    }
    setIsSaving(true);

    try {
      const filePath = `${storedUser.id}/${storedUser.cnpj}-${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('logos-lojas')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('logos-lojas')
        .getPublicUrl(filePath);
      
      const newLogoUrl = publicUrlData.publicUrl;
      setLogoUrl(newLogoUrl);

      const { error: dbError } = await supabase
        .from('loja_configuracoes')
        .upsert({ 
            user_id: storedUser.id, 
            cnpj: storedUser.cnpj, 
            url_logo: newLogoUrl,
            nome_loja: storeName 
        }, { onConflict: 'user_id, cnpj' });

      if (dbError) {
        if (!dbError.message?.includes('406')) {
          toast({ title: "Erro ao Salvar Logo", description: dbError.message, variant: "destructive" });
        }
      } else {
        toast({ title: "Sucesso", description: "Logo atualizada." });
      }
    } catch (error) {
      if (!error.message?.includes('400') && !error.message?.includes('Failed to fetch')) {
        toast({ title: "Erro no Upload da Logo", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!storedUser || !storedUser.id || !storedUser.cnpj) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    if (!storeName.trim() || !currentCnpj.trim()) {
      toast({ title: "Erro", description: "Nome da Loja e CNPJ são obrigatórios.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const { data: updatedAuthUser, error: userUpdateError } = await supabase.auth.updateUser({
        data: { store_name: storeName, cnpj: currentCnpj } 
      });

      if (userUpdateError && !userUpdateError.message?.includes('406')) {
        toast({ title: "Erro ao Atualizar Usuário", description: userUpdateError.message, variant: "destructive" });
        return;
      }

      const { error: configError } = await supabase
        .from('loja_configuracoes')
        .upsert({ 
            user_id: storedUser.id, 
            cnpj: currentCnpj, 
            nome_loja: storeName,
            url_logo: logoUrl 
        }, { onConflict: 'user_id, cnpj' });
      
      if (configError && !configError.message?.includes('406')) {
        toast({ title: "Erro ao Salvar Configurações", description: configError.message, variant: "destructive" });
        return;
      }
      
      const { error: customUserTableError } = await supabase
        .from('usuarios')
        .update({ nome_loja: storeName, cnpj: currentCnpj })
        .eq('auth_user_id', storedUser.id);

      if (customUserTableError && customUserTableError.code !== 'PGRST116' && !customUserTableError.message?.includes('406')) { 
         console.warn("Aviso: Falha ao atualizar tabela 'usuarios'", customUserTableError.message);
      }

      const newLocalUser = { ...storedUser, storeName: storeName, cnpj: currentCnpj };
      localStorage.setItem(AUTH_KEY, JSON.stringify(newLocalUser));
      setStoredUser(newLocalUser);
      
      toast({ title: "Sucesso", description: "Configurações salvas." });
    } catch (error) {
      if (!error.message?.includes('406') && !error.message?.includes('Failed to fetch')) {
        toast({ title: "Erro ao Salvar Configurações", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAllData = async () => {
    if (!storedUser || !storedUser.id || !storedUser.cnpj) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" }); return;
    }
    if(window.confirm(`TEM CERTEZA? Todos os dados associados ao CNPJ ${storedUser.cnpj} (notas, inventário, configurações, etc.) serão apagados permanentemente. Esta ação não pode ser desfeita.`)){
        setIsSaving(true);
        try {
            const tablesToDeleteFrom = ['notas_fiscais', 'inventario_fisico', 'desossas_registradas', 'parametros_rendimento_boi'];
            for (const table of tablesToDeleteFrom) {
                const cnpjField = table === 'notas_fiscais' ? 'cnpj_emitente' : (table === 'inventario_fisico' ? 'cnpj_loja' : 'cnpj_empresa');
                const { error } = await supabase.from(table).delete().eq('user_id', storedUser.id).eq(cnpjField, storedUser.cnpj);
                if (error && !error.message?.includes('406')) {
                  console.error(`Erro ao apagar ${table}:`, error.message);
                }
            }
            const { error: configError } = await supabase.from('loja_configuracoes').delete().eq('user_id', storedUser.id).eq('cnpj', storedUser.cnpj);
            if (configError && !configError.message?.includes('406')) {
              console.error("Erro ao apagar config:", configError.message);
            }
            
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(DATA_KEY_PREFIX + storedUser.cnpj)) localStorage.removeItem(key);
            });
            
            toast({ title: "Dados Apagados", description: `Todos os dados do CNPJ ${storedUser.cnpj} foram removidos.`, variant: "destructive" });
        } catch (error) {
            if (!error.message?.includes('406') && !error.message?.includes('Failed to fetch')) {
              toast({ title: "Erro ao Apagar Dados", description: error.message, variant: "destructive" });
            }
        } finally {
            setIsSaving(false);
        }
    }
  };
  
  const handleExportData = async () => {
    if (!storedUser || !storedUser.id || !storedUser.cnpj) { toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" }); return; }
    setIsSaving(true);
    try {
        const dataToExport = {};
        const tablesToExport = ['notas_fiscais', 'inventario_fisico', 'loja_configuracoes', 'desossas_registradas', 'parametros_rendimento_boi'];
        
        for (const tableName of tablesToExport) {
            const cnpjField = tableName === 'notas_fiscais' ? 'cnpj_emitente' : (tableName === 'inventario_fisico' ? 'cnpj_loja' : (tableName === 'loja_configuracoes' ? 'cnpj' : 'cnpj_empresa'));
            const { data, error } = await supabase.from(tableName).select('*').eq('user_id', storedUser.id).eq(cnpjField, storedUser.cnpj);
            if (error && error.code !== 'PGRST116' && !error.message?.includes('406')) {
              console.warn(`Erro ao exportar ${tableName}:`, error.message);
            }
            dataToExport[tableName] = data || [];
        }
        dataToExport.auth_user_info = JSON.parse(localStorage.getItem(AUTH_KEY));
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `dados_app_${storedUser.cnpj}_${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        toast({ title: "Dados Exportados", description: "Arquivo JSON baixado." });
    } catch (error) {
        if (!error.message?.includes('406') && !error.message?.includes('Failed to fetch')) {
          toast({ title: "Erro ao Exportar Dados", description: error.message, variant: "destructive" });
        }
    } finally {
        setIsSaving(false);
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file || !storedUser || !storedUser.id || !storedUser.cnpj) { toast({ title: "Erro", description: "Selecione arquivo e logue.", variant: "destructive" }); return; }
    if (file.type !== 'application/json') { toast({ title: "Erro", description: "Selecione arquivo JSON.", variant: "destructive" }); return; }
    setIsSaving(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        let importedCount = 0;

        const upsertTable = async (tableName, dataArray, cnpjField, conflictFields = ['id']) => {
            if (dataArray && dataArray.length > 0) {
                const validData = dataArray
                    .filter(item => item[cnpjField] === storedUser.cnpj) 
                    .map(item => ({ ...item, user_id: storedUser.id })); 
                
                if (validData.length > 0) {
                    const onConflictStr = Array.isArray(conflictFields) ? conflictFields.join(',') : conflictFields;

                    const { error } = await supabase.from(tableName).upsert(validData, { onConflict: onConflictStr }); 
                    if (error && !error.message?.includes('406')) {
                      console.warn(`Erro ao importar ${tableName}:`, error.message);
                    } else {
                      importedCount += validData.length;
                    }
                }
            }
        };

        await upsertTable('notas_fiscais', importedData.notas_fiscais, 'cnpj_emitente');
        await upsertTable('inventario_fisico', importedData.inventario_fisico, 'cnpj_loja');
        await upsertTable('desossas_registradas', importedData.desossas_registradas, 'cnpj_empresa');
        await upsertTable('parametros_rendimento_boi', importedData.parametros_rendimento_boi, 'cnpj_empresa');
        await upsertTable('loja_configuracoes', importedData.loja_configuracoes, 'cnpj', 'user_id,cnpj');
        
        if (importedCount > 0) {
          toast({ title: "Dados Importados", description: `${importedCount} registros importados/atualizados. Recarregue.` });
        } else {
          toast({ title: "Importação Concluída", description: "Nenhum dado correspondente ao CNPJ.", variant:"default" });
        }
      } catch (error) {
        toast({ title: "Erro na Importação", description: `Detalhe: ${error.message}`, variant: "destructive" });
      } finally {
        setIsSaving(false);
        event.target.value = null; 
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadPlanilhaModelo = () => {
    if (typeof XLSX === 'undefined') {
        toast({ title: "Erro", description: "Biblioteca de planilha (XLSX) não está disponível.", variant: "destructive" });
        return;
    }
    const worksheetData = [
        ["codigo_produto", "nome_produto", "quantidade_inicial", "custo_unitario_entrada"],
        ["EX001", "Picanha KG", 10.5, 35.90],
        ["EX002", "Contra Filé KG", 22.3, 28.50],
        ["EX003", "Alcatra KG", 15.0, 30.00]
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ModeloInventario");
    XLSX.writeFile(workbook, "Modelo_Planilha_Inventario.xlsx");
    toast({ title: "Download Iniciado", description: "Modelo de planilha baixado."});
  };

  if (loading && !storedUser) { return <div className="flex justify-center items-center h-64"><LoadingSpinner size={48} /> <p className="ml-3">Aguardando dados do usuário...</p></div>; }
  if (loading && storedUser) { return <div className="flex justify-center items-center h-64"><LoadingSpinner size={48} /> <p className="ml-3">Carregando configurações...</p></div>;}

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações da Conta e Loja</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader><CardTitle>Identidade da Loja</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="storeNameConfig">Nome da Loja</Label>
              <Input id="storeNameConfig" value={storeName} onChange={e => setStoreName(e.target.value)} disabled={isSaving || loading} />
            </div>
             <div>
              <Label htmlFor="cnpjConfig">CNPJ da Loja (para exibição e filtros)</Label>
              <Input id="cnpjConfig" value={currentCnpj} onChange={e => setCurrentCnpj(e.target.value)} disabled={isSaving || loading} />
            </div>
            <div>
              <Label htmlFor="logoUploadConfig">Logo da Loja</Label>
              <Input id="logoUploadConfig" type="file" accept="image/*" onChange={handleLogoUpload} disabled={isSaving || loading} />
              {logoUrl && <img src={logoUrl} alt="Prévia da Logo" className="mt-2 max-h-24 border p-1 rounded object-contain"/>}
            </div>
            <Button onClick={handleSaveSettings} disabled={isSaving || loading}>
                {(isSaving || loading) ? <LoadingSpinner className="mr-2" /> : null} Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle>Gerenciamento de Dados</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleDownloadPlanilhaModelo} variant="outline" className="w-full" disabled={isSaving || loading}><FileSpreadsheet className="mr-2 h-4 w-4"/> Baixar Planilha Modelo (Inventário)</Button>
            <p className="text-xs text-muted-foreground">Este modelo é para a funcionalidade de importação de inventário via planilha (ainda em desenvolvimento).</p>
            
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-semibold">Exportar Dados</h4>
              <Button onClick={handleExportData} variant="outline" className="w-full" disabled={isSaving || loading}>
                {(isSaving || loading) ? <LoadingSpinner className="mr-2" /> : <Upload className="mr-2 h-4 w-4"/>} Exportar Dados (JSON)
              </Button>
            </div>
            <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold">Importar Dados</h4>
                <Input type="file" accept=".json" onChange={handleImportData} className="w-full" disabled={isSaving || loading} />
                <p className="text-xs text-muted-foreground">Importe de JSON. Dados devem corresponder ao CNPJ atual.</p>
            </div>
          </CardContent>
        </Card>
      </div>
       <Card className="glass-card border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/> Zona de Perigo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">A ação abaixo é irreversível.</p>
            <Button variant="destructive" onClick={handleClearAllData} className="w-full" disabled={isSaving || loading}>
              {(isSaving || loading) ? <LoadingSpinner className="mr-2" /> : <Trash2 className="mr-2 h-4 w-4"/>} Apagar Dados Deste CNPJ
            </Button>
          </CardContent>
        </Card>
    </div>
  );
};

export default Configuracoes;