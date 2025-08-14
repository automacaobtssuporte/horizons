import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LogIn, Beef, UserPlus } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabaseClient';
import { APP_NAME, AUTH_KEY } from '@/config/constants';
import LoadingSpinner from '@/components/LoadingSpinner';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.hash.substring(location.hash.indexOf('?')));
    const error_description = params.get('error_description');
    
    if (error_description) {
      toast({
        title: "Erro",
        description: error_description,
        variant: "destructive",
        duration: 7000,
      });
    }
  }, [location.hash, toast]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Erro de Login", description: "Email e senha são obrigatórios.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        toast({ title: "Erro de Login", description: error.message || "Credenciais inválidas.", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username || data.user.email,
          cnpj: data.user.user_metadata?.cnpj || '',
          storeName: data.user.user_metadata?.store_name || data.user.user_metadata?.storeName || `Loja ${data.user.user_metadata?.cnpj?.slice(0,5) || 'Nova'}`
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        toast({ title: "Login Bem-Sucedido!", description: `Bem-vindo, ${userData.username}!`});
        navigate('/app/dashboard');
      } else {
         toast({ title: "Erro de Login", description: "Não foi possível autenticar. Tente novamente.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro de Login", description: "Ocorreu um erro inesperado.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-primary/20 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Card className="w-full max-w-md glass-card shadow-2xl">
        <CardHeader className="text-center">
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <Beef className="w-16 h-16 mx-auto text-primary" />
          </motion.div>
          <CardTitle className="text-3xl font-bold text-gradient-brand">{APP_NAME}</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar a desossa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-input/50" disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-input/50" disabled={loading} />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 hover-lift" disabled={loading}>
              {loading ? <LoadingSpinner className="mr-2" /> : <LogIn className="mr-2 h-5 w-5" />}
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col items-center gap-4">
            <Link to="/signup" className="w-full">
              <Button variant="outline" className="w-full hover-lift">
                <UserPlus className="mr-2 h-5 w-5" /> Cadastrar Novo Usuário
              </Button>
            </Link>
            <ThemeToggle />
        </CardFooter>
      </Card>
      <p className="text-xs text-muted-foreground mt-8">© {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.</p>
    </motion.div>
  );
}

export default LoginPage;