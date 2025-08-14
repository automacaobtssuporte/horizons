import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  LayoutDashboard,
  Package,
  Calculator,
  LineChart,
  FileText,
  Percent,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  BookOpen,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { APP_NAME } from '@/config/constants';
import { useToast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { to: 'dashboard', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
  { to: 'pdv', icon: <ShoppingCart className="h-5 w-5" />, label: 'PDV / Vendas' },
  { to: 'inventario', icon: <Package className="h-5 w-5" />, label: 'Inventário' },
  { to: 'calculos', icon: <Calculator className="h-5 w-5" />, label: 'Cálculos de Desossa' },
  { to: 'simulacao', icon: <LineChart className="h-5 w-5" />, label: 'Simulação de Preços' },
  { to: 'notas', icon: <FileText className="h-5 w-5" />, label: 'Notas (Entrada)' },
  { to: 'parametros', icon: <Percent className="h-5 w-5" />, label: 'Parâmetros' },
  { to: 'dre', icon: <TrendingUp className="h-5 w-5" />, label: 'DRE' },
  { to: 'historico', icon: <History className="h-5 w-5" />, label: 'Histórico CNPJ' },
  { to: 'manual', icon: <BookOpen className="h-5 w-5" />, label: 'Manual' },
];

const Sidebar = ({ isSidebarOpen }) => (
  <aside className={`bg-card border-r transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col`}>
    <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} h-16 px-4 border-b`}>
      {isSidebarOpen && <h1 className="text-xl font-bold text-gradient-brand">{APP_NAME}</h1>}
    </div>
    <nav className="flex-1 px-2 py-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center p-2 rounded-lg transition-colors duration-200 ${
              isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`
          }
          title={item.label}
        >
          {item.icon}
          {isSidebarOpen && <span className="ml-3">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
    <div className="px-2 py-4 border-t">
      <NavLink
        to="/app/configuracoes"
        className={({ isActive }) =>
          `flex items-center p-2 rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
          } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`
        }
        title="Configurações"
      >
        <Settings className="h-5 w-5" />
        {isSidebarOpen && <span className="ml-3">Configurações</span>}
      </NavLink>
    </div>
  </aside>
);

const Header = ({ user, toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: 'Erro no Logout', description: error.message, variant: 'destructive' });
    } else {
      localStorage.clear();
      navigate('/login');
      toast({ title: 'Logout realizado com sucesso!' });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-card border-b h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:inline-flex">
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={user.avatarUrl} alt={user.username} />
                <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/configuracoes')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

const MobileNav = ({ isMobileNavOpen, setMobileNavOpen }) => {
  const navigate = useNavigate();
  
  const handleNavigation = (to) => {
    navigate(to);
    setMobileNavOpen(false);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${isMobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileNavOpen(false)}>
      <div className={`fixed top-0 left-0 h-full bg-card w-64 transform transition-transform z-50 ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-gradient-brand">{APP_NAME}</h1>
          <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-lg transition-colors duration-200 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

const MainAppLayout = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <MobileNav isMobileNavOpen={isMobileNavOpen} setMobileNavOpen={setMobileNavOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainAppLayout;