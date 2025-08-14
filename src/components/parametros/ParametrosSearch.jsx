import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

const ParametrosSearch = ({ searchTerm, setSearchTerm, handleSearch, isSearching }) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Pesquisar Parâmetros</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-grow">
          <Label htmlFor="searchTermParametros">Código ou Nome da Peça</Label>
          <Input
            id="searchTermParametros"
            type="text"
            placeholder="Ex: 1 ou Alcatra"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching} className="w-full sm:w-auto">
          {isSearching ? <LoadingSpinner className="mr-2" /> : <Search className="mr-2 h-4 w-4" />}
          Pesquisar
        </Button>
      </CardContent>
    </Card>
  );
};

export default ParametrosSearch;