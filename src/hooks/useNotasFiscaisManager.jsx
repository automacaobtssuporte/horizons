import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNotasFiscaisData } from '@/hooks/useNotasFiscaisData';
import { useNotasFiscaisActions } from '@/hooks/useNotasFiscaisActions';

export const useNotasFiscaisManager = () => {
  const { toast } = useToast();
  const { 
    currentUser, 
    notas, 
    setNotas, 
    loading, 
    parametrosRendimento, 
    produtosInventario, 
    produtosDesossa,
    fetchInitialData
  } = useNotasFiscaisData();

  const [modalOpen, setModalOpen] = useState(false);
  const [currentNota, setCurrentNota] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const initialNotaState = useCallback(() => ({
    id: null,
    numero_nota: '',
    data_nota: '',
    cnpj_emitente: currentUser?.cnpj || '',
    items: [{ id: Date.now(), codigoProduto: '', descricao: '', quantidade: '', valorUnitario: '', valorTotal: '', parte_boi: '' }],
    total_calculado: 0,
    observacoes: '',
    user_id: currentUser?.id || null,
  }), [currentUser]);

  const {
    handleSaveNota: performSave,
    handleDeleteNota: performDelete,
    handleFileUploadNF: performUpload,
    handleAplicarRendimento: performAplicarRendimento,
  } = useNotasFiscaisActions({
    currentUser,
    currentNota,
    parametrosRendimento,
    setNotas,
    setCurrentNota,
    setModalOpen,
    setIsSaving,
    fetchInitialData,
    toast
  });

  useEffect(() => {
    if (currentUser && modalOpen && currentNota?.id === null) { 
        setCurrentNota(prev => ({ ...prev, cnpj_emitente: currentUser.cnpj, user_id: currentUser.id }));
    }
  }, [currentUser, modalOpen, currentNota]);

  const handleOpenModal = (nota = null) => {
    if (nota) {
        setCurrentNota({ ...nota, items: nota.items.map((it, idx) => ({...it, id: Date.now() + idx + Math.random()})) });
    } else {
        const newNotaData = initialNotaState(); 
        setCurrentNota({ ...newNotaData, id: `new_${Date.now()}` });
    }
    setModalOpen(true);
  };

  const handleNotaChange = (field, value) => setCurrentNota(prev => ({ ...prev, [field]: value }));

  const handleItemChange = (index, changes) => {
    const items = [...currentNota.items];
    const currentItem = { ...items[index], ...changes };
    items[index] = currentItem;
    
    if (changes.quantidade || changes.valorUnitario) {
      if (currentItem.quantidade && currentItem.valorUnitario) {
        currentItem.valorTotal = (parseFloat(currentItem.quantidade) * parseFloat(currentItem.valorUnitario)).toFixed(2);
      }
    }

    const totalCalculado = items.reduce((sum, item) => sum + parseFloat(item.valorTotal || 0), 0);
    setCurrentNota(prev => ({ ...prev, items, total_calculado: totalCalculado.toFixed(2) }));
  };

  const handleAddItem = () => setCurrentNota(prev => ({ ...prev, items: [...prev.items, { id: Date.now(), codigoProduto: '', descricao: '', quantidade: '', valorUnitario: '', valorTotal: '', parte_boi: '' }]}));

  const handleRemoveItem = (index) => {
    const items = currentNota.items.filter((_, i) => i !== index);
    const totalCalculado = items.reduce((sum, item) => sum + parseFloat(item.valorTotal || 0), 0);
    setCurrentNota(prev => ({ ...prev, items, total_calculado: totalCalculado.toFixed(2) }));
  };

  const filteredNotas = notas.filter(nota => 
    nota.numero_nota?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    nota.data_nota?.includes(searchTerm) || 
    (nota.items && nota.items.some(item => item.descricao?.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return {
    currentUser,
    notas,
    modalOpen,
    currentNota,
    searchTerm,
    loading,
    isSaving,
    parametrosRendimento,
    produtosInventario,
    produtosDesossa,
    filteredNotas,
    setModalOpen,
    setCurrentNota,
    setSearchTerm,
    handleOpenModal,
    handleNotaChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    handleSaveNota: performSave,
    handleDeleteNota: performDelete,
    handleFileUploadNF: performUpload,
    handleAplicarRendimento: performAplicarRendimento,
    initialNotaState
  };
};