import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

const LicencaExpirada = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleWhatsApp = () => {
    const phoneNumber = '5571983032979';
    const message = 'Olá! Minha licença do sistema de gestão de desossa expirou. Gostaria de renovar minha assinatura.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = () => {
    const email = 'robisoncosta972@gmail.com';
    const subject = 'Renovação de Licença - Sistema de Gestão de Desossa';
    const body = 'Olá!\n\nMinha licença do sistema de gestão de desossa expirou e gostaria de renovar minha assinatura.\n\nAguardo retorno.\n\nObrigado!';
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-500/10 via-background to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md shadow-2xl border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 rounded-full p-3 w-fit mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold text-destructive">
              Licença Expirada
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              O seu acesso ao sistema foi suspenso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground mb-6">
              A licença de uso para a sua loja venceu. Para continuar utilizando todas as funcionalidades do sistema, entre em contato conosco para renovar sua assinatura.
            </p>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Entre em Contato:</h3>
              
              <Button onClick={handleWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp: (71) 98303-2979
              </Button>
              
              <Button onClick={handleEmail} variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Email: robisoncosta972@gmail.com
              </Button>
              
              <div className="flex items-center justify-center text-sm text-muted-foreground mt-4">
                <Phone className="mr-2 h-4 w-4" />
                <span>Telefone: (71) 98303-2979</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleLogout} variant="secondary" className="w-full">
              Sair do Sistema
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LicencaExpirada;