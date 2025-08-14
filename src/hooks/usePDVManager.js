import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { AUTH_KEY } from '@/config/constants';

export const usePDVManager = () => {
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userFromStorage = localStorage.getItem(AUTH_KEY);
        if (userFromStorage) {
            const parsedUser = JSON.parse(userFromStorage);
            setCurrentUser(parsedUser);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inventario_fisico')
                .select('id, codigo, nome, quantidade, unidade, custo_medio_unitario')
                .eq('user_id', currentUser.id)
                .eq('cnpj_loja', currentUser.cnpj)
                .gt('quantidade', 0); // Only fetch products with stock > 0

            if (error) throw error;
            
            const productsWithPrice = data.map(p => ({
                ...p,
                valor_venda: p.custo_medio_unitario ? (p.custo_medio_unitario * 1.3) : 0 // Example: 30% markup
            }));

            setProducts(productsWithPrice);
        } catch (error) {
            toast({
                title: 'Erro ao buscar produtos',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [currentUser, toast]);
    
    useEffect(() => {
        if (currentUser) {
            fetchProducts();
        }
    }, [currentUser, fetchProducts]);

    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.codigo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.valor_venda * item.quantity, 0);
    }, [cart]);

    const handleAddToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                if (existingItem.quantity < product.quantidade) {
                    return prevCart.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                } else {
                     toast({ title: "Estoque máximo atingido", variant: "default" });
                     return prevCart;
                }
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (productId, newQuantity) => {
        const productInStock = products.find(p => p.id === productId);
        if (newQuantity <= 0) {
            handleRemoveFromCart(productId);
            return;
        }
        if (productInStock && newQuantity > productInStock.quantidade) {
            toast({ title: `Estoque máximo para este item é ${productInStock.quantidade}`, variant: "default" });
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const handleCancelSale = () => {
        setCart([]);
        toast({ title: 'Venda cancelada' });
    };

    const handleFinalizeSale = async () => {
        if (cart.length === 0 || !currentUser) return;

        setIsProcessing(true);
        try {
            const saleData = {
                numero_cupom: `CUPOM-${Date.now()}`,
                status: 'finalizada',
                dados: {
                    items: cart.map(item => ({
                        id: item.id,
                        codigo: item.codigo,
                        nome: item.nome,
                        quantity: item.quantity,
                        valor_venda: item.valor_venda,
                        total_item: item.valor_venda * item.quantity,
                    })),
                    total: cartTotal,
                },
                loja_id: currentUser.cnpj,
                usuario_id: currentUser.id,
            };

            const { error: saleError } = await supabase
                .from('notas_fiscais_saida')
                .insert([saleData]);
                
            if (saleError) throw saleError;

            // Update inventory
            const updates = cart.map(item => {
                const product = products.find(p => p.id === item.id);
                return supabase
                    .from('inventario_fisico')
                    .update({ quantidade: product.quantidade - item.quantity })
                    .eq('id', item.id);
            });

            const results = await Promise.all(updates);
            const updateErrors = results.filter(res => res.error);

            if (updateErrors.length > 0) {
                throw new Error('Erro ao atualizar o estoque de um ou mais itens.');
            }

            toast({
                title: 'Venda finalizada com sucesso!',
                description: `Cupom ${saleData.numero_cupom} gerado.`,
            });
            setCart([]);
            fetchProducts(); // Refresh products to show updated stock
        } catch (error) {
            toast({
                title: 'Erro ao finalizar a venda',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        filteredProducts,
        cart,
        loading,
        isProcessing,
        handleAddToCart,
        handleUpdateQuantity,
        handleRemoveFromCart,
        handleCancelSale,
        handleFinalizeSale,
        cartTotal
    };
};