import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Home, Package, Calculator, FileText, Percent, LineChart, History, Settings } from 'lucide-react';
import { manualSections, workflows } from '@/data/manualSections';
import ManualNavigation from '@/components/manual/ManualNavigation';
import ManualContent from '@/components/manual/ManualContent';
import WorkflowsSection from '@/components/manual/WorkflowsSection';
import QuickActionsSection from '@/components/manual/QuickActionsSection';

const ManualSistema = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('introducao');

  const sectionsWithIcons = manualSections.map(section => ({
    ...section,
    icon: getSectionIcon(section.id)
  }));

  function getSectionIcon(sectionId) {
    const iconMap = {
      'introducao': <BookOpen className="h-5 w-5" />,
      'dashboard': <Home className="h-5 w-5" />,
      'inventario': <Package className="h-5 w-5" />,
      'desossa': <Calculator className="h-5 w-5" />,
      'notas-fiscais': <FileText className="h-5 w-5" />,
      'parametros': <Percent className="h-5 w-5" />,
      'simulacao': <LineChart className="h-5 w-5" />,
      'historico': <History className="h-5 w-5" />,
      'configuracoes': <Settings className="h-5 w-5" />
    };
    return iconMap[sectionId] || <BookOpen className="h-5 w-5" />;
  }

  const filteredSections = sectionsWithIcons.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.overview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentSection = sectionsWithIcons.find(s => s.id === activeSection);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gradient-brand">Manual do Sistema</h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar no manual..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ManualNavigation
            sections={sectionsWithIcons}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            filteredSections={filteredSections}
          />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <ManualContent currentSection={currentSection} />

          {activeSection === 'introducao' && (
            <WorkflowsSection workflows={workflows} />
          )}

          {activeSection === 'introducao' && (
            <QuickActionsSection />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualSistema;