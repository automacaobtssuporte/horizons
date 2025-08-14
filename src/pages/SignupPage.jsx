import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { UserPlus, Beef, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabaseClient';
import { APP_NAME } from '@/config/constants';
import LoadingSpinner from '@/components/LoadingSpinner';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !username || !cnpj || !storeName) {
      toast({ title: "Erro de Cadastro", description: "Todos os campos são obrigatórios.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Erro de Cadastro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Erro de Cadastro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            cnpj: cnpj,
            store_name: storeName, // Este é o nome que o Supabase usa internamente
          }
        }
      });

      if (signUpError) {
        toast({ title: "Erro de Cadastro", description: signUpError.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      if (signUpData.user) {
        // Inserir na tabela customizada 'usuarios'
        const { error: usuariosInsertError } = await supabase
          .from('usuarios')
          .insert({
            auth_user_id: signUpData.user.id,
            username: username,
            cnpj: cnpj,
            nome_loja: storeName
          });

        if (usuariosInsertError) {
          // Mesmo que isso falhe, o usuário auth foi criado. Pode ser um problema de RLS ou trigger.
          // No entanto, para o usuário, o cadastro principal (auth) funcionou.
          console.warn("Aviso: Falha ao inserir na tabela 'usuarios'", usuariosInsertError.message);
          toast({ title: "Aviso", description: "Seu cadastro principal foi criado, mas houve um problema ao salvar detalhes adicionais. Contate o suporte se necessário.", variant: "default", duration: 7000});
        }

        // Inserir/Atualizar na tabela 'loja_configuracoes'
        const { error: lojaConfigInsertError } = await supabase
          .from('loja_configuracoes')
          .upsert({
            user_id: signUpData.user.id,
            cnpj: cnpj,
            nome_loja: storeName,
            // url_logo pode ser deixado como null/undefined aqui, a ser preenchido depois
          }, { onConflict: 'user_id, cnpj' });

        if (lojaConfigInsertError) {
           console.warn("Aviso: Falha ao inserir/atualizar 'loja_configuracoes'", lojaConfigInsertError.message);
           // Não é crítico para o fluxo de login, mas o usuário deve saber.
           toast({ title: "Aviso", description: "Seu cadastro foi criado, mas houve um problema ao salvar configurações da loja. Você pode configurá-la manualmente mais tarde.", variant: "default", duration: 7000});
        }
        
        toast({ title: "Cadastro Realizado!", description: "Usuário cadastrado com sucesso! Você já pode fazer login.", duration: 7000 });
        navigate('/login');
      } else {
        toast({ title: "Erro de Cadastro", description: "Não foi possível criar o usuário. Tente novamente.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro de Cadastro", description: "Ocorreu um erro inesperado.", variant: "destructive" });
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
      <Card className="w-full max-w-lg glass-card shadow-2xl">
        <CardHeader className="text-center">
          <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <Beef className="w-16 h-16 mx-auto text-primary" />
          </motion.div>
          <CardTitle className="text-3xl font-bold text-gradient-brand">Criar Nova Conta</CardTitle>
          <CardDescription>Junte-se ao {APP_NAME} e otimize sua gestão.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input id="username" type="text" placeholder="Seu nome" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-input/50" disabled={loading} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-input/50" disabled={loading} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-input/50" disabled={loading} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input id="confirmPassword" type="password" placeholder="Repita a senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-input/50" disabled={loading} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="cnpj">CNPJ da Loja</Label>
                <Input id="cnpj" type="text" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="bg-input/50" disabled={loading} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="storeName">Nome da Loja</Label>
                <Input id="storeName" type="text" placeholder="Nome Fantasia" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="bg-input/50" disabled={loading} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 hover-lift" disabled={loading}>
              {loading ? <LoadingSpinner className="mr-2" /> : <UserPlus className="mr-2 h-5 w-5" />}
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex flex-col items-center gap-4">
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full hover-lift">
                <ArrowLeft className="mr-2 h-5 w-5" /> Voltar para Login
              </Button>
            </Link>
            <ThemeToggle />
        </CardFooter>
      </Card>
      <p className="text-xs text-muted-foreground mt-8">© {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.</p>
    </motion.div>
  );
}

export default SignupPage;