import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Trash2, Edit3, Save, XCircle, Calculator, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import ItemInventarioRow from '@/components/inventario/ItemInventarioRow';

const ListaItensInventario = ({
  itensInventario,
  setItensInventario,
  loading,
  currentUser,
  fetchInventario,
  handleUpdateItemAnalise,
  calcularAnaliseQuebraItem,
  handleSaveItemAnalise
}) => {
  const { toast } = useToast();
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItemData, setEditedItemData] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleDeleteItem = async (id) => {
    if (!id || !currentUser || !currentUser.id) return;
    if (!window.confirm('Tem certeza que deseja excluir este item?')) return;
    
    try {
      const { error } = await supabase
        .from('inventario_fisico')
        .delete()
        .match({ id: id, user_id: currentUser.id }); 

      if (error) throw error;
      
      setItensInventario(prevItens => prevItens.filter(item => item.id !== id));
      toast({ title: "Sucesso", description: "Item removido do inventário." });
    } catch (error) {
      toast({ title: "Erro ao Remover Item", description: error.message, variant: "destructive" });
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setEditedItemData({ 
      codigo: item.codigo, 
      nome: item.nome, 
      quantidade: String(item.quantidade), 
      unidade: item.unidade,
      parte_boi: item.parte_boi || ''
    });
  };

  const handleSaveEdit = async (itemId) => {
    if (!currentUser || !currentUser.id) {
      toast({ title: "Erro de Autenticação", variant: "destructive" });
      return;
    }
    setIsSavingEdit(true);
    try {
      const { data, error } = await supabase
        .from('inventario_fisico')
        .update({ 
          codigo: editedItemData.codigo,
          nome: editedItemData.nome,
          quantidade: parseFloat(editedItemData.quantidade),
          unidade: editedItemData.unidade,
          parte_boi: editedItemData.parte_boi,
         })
        .eq('id', itemId)
        .eq('user_id', currentUser.id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setItensInventario(prev => prev.map(item => item.id === itemId ? {...item, ...data[0]} : item));
        toast({ title: "Sucesso", description: "Item atualizado."});
      }
      setEditingItemId(null);
    } catch (error) {
      toast({ title: "Erro ao Atualizar", description: error.message, variant: "destructive"});
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditedItemData({});
  };

  const handleInputChange = (field, value) => {
    setEditedItemData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="glass-card">
      <CardHeader><CardTitle>Itens no Inventário e Análise de Quebras</CardTitle></CardHeader>
      <CardContent>
        {itensInventario.length === 0 && !loading ? (
          <p className="text-muted-foreground text-center py-4">Nenhum item no inventário. Adicione itens manualmente ou importe uma planilha.</p>
        ) : (
          <div className="space-y-4">
            {itensInventario.map(item => (
              <ItemInventarioRow 
                key={item.id}
                item={item}
                editingItemId={editingItemId}
                editedItemData={editedItemData}
                isSavingEdit={isSavingEdit}
                onEditItem={handleEditItem}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onInputChange={handleInputChange}
                onDeleteItem={handleDeleteItem}
                onUpdateItemAnalise={handleUpdateItemAnalise}
                onCalcularAnaliseQuebraItem={calcularAnaliseQuebraItem}
                onSaveItemAnalise={handleSaveItemAnalise}
              />
            ))}
          </div>
        )}
        {loading && <div className="text-center py-4"><LoadingSpinner /> Carregando itens...</div>}
      </CardContent>
    </Card>
  );
};

export default ListaItensInventario;