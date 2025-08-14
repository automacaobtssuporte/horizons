import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Trash2, Search, Package, Ban, ShoppingCart } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePDVManager } from '@/hooks/usePDVManager';
import { motion, AnimatePresence } from 'framer-motion';

const PDV = () => {
    const {
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
    } = usePDVManager();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            <Card className="lg:col-span-2 flex flex-col glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-6 w-6" />
                        Selecione os Produtos
                    </CardTitle>
                    <Input
                        placeholder="Buscar por nome ou código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-2"
                    />
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <LoadingSpinner size={48} />
                            <p className="ml-3">Carregando produtos...</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                <AnimatePresence>
                                    {filteredProducts.map(product => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                                                <CardHeader className="p-4 flex-grow">
                                                    <CardTitle className="text-base">{product.nome}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0">
                                                    <p className="text-sm text-muted-foreground">Código: {product.codigo}</p>
                                                    <p className="text-sm text-primary font-semibold">
                                                        Estoque: {product.quantidade} {product.unidade}
                                                    </p>
                                                </CardContent>
                                                <CardFooter className="p-4 pt-0">
                                                    <Button 
                                                        className="w-full" 
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={product.quantidade <= 0}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" /> Adicionar
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {!loading && filteredProducts.length === 0 && (
                                     <div className="col-span-full text-center py-10">
                                        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-4 text-muted-foreground">Nenhum produto encontrado</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            <Card className="lg:col-span-1 flex flex-col glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6"/>
                        Cupom de Venda
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        {cart.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                                <div>
                                    <ShoppingCart className="mx-auto h-12 w-12" />
                                    <p className="mt-4">Seu carrinho está vazio.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <motion.div 
                                        key={item.id} 
                                        className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg"
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.nome}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.valor_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={isProcessing}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-6 text-center">{item.quantity}</span>
                                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} disabled={isProcessing}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveFromCart(item.id)} disabled={isProcessing}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex-col gap-4 !p-6 border-t mt-auto">
                    <div className="flex justify-between w-full text-xl font-bold">
                        <span>Total:</span>
                        <span>{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button variant="destructive" onClick={handleCancelSale} disabled={isProcessing || cart.length === 0}>
                            <Ban className="mr-2 h-4 w-4"/> Cancelar
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white" 
                            onClick={handleFinalizeSale}
                            disabled={isProcessing || cart.length === 0}
                        >
                            {isProcessing ? <LoadingSpinner className="mr-2" /> : <ShoppingCart className="mr-2 h-4 w-4"/>}
                            Finalizar Venda
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PDV;