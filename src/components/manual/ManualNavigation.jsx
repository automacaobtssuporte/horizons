import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const ManualNavigation = ({ sections, activeSection, setActiveSection, filteredSections }) => {
  return (
    <Card className="glass-card sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Navegação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {filteredSections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveSection(section.id)}
          >
            <span className="ml-2">{section.title}</span>
            {activeSection === section.id && <ChevronRight className="ml-auto h-4 w-4" />}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default ManualNavigation;