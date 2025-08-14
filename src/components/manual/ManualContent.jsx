import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Info,
  Zap,
  Play,
  Calculator,
  Eye,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  Target,
  Users,
  CheckCircle,
  DollarSign,
  Beef
} from 'lucide-react';

const ManualContent = ({ currentSection }) => {
  if (!currentSection) return null;

  return (
    <motion.div
      key={currentSection.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">{currentSection.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Visão Geral
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {currentSection.content.overview}
            </p>
          </div>

          {currentSection.content.features && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Principais Funcionalidades
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentSection.content.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection.content.howTo && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Play className="h-5 w-5 text-green-500" />
                Como Usar
              </h3>
              <div className="space-y-2">
                {currentSection.content.howTo.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection.content.calculations && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-purple-500" />
                Fórmulas de Cálculo
              </h3>
              <div className="space-y-2">
                {currentSection.content.calculations.map((calc, index) => (
                  <div key={index} className="bg-muted/30 p-3 rounded-md">
                    <code className="text-sm font-mono">{calc}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection.content.examples && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-500" />
                Exemplos
              </h3>
              <div className="space-y-2">
                {currentSection.content.examples.map((example, index) => (
                  <div key={index} className="bg-primary/5 p-3 rounded-md border-l-4 border-primary">
                    <span className="text-sm font-mono">{example}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection.content.benefits && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Benefícios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentSection.content.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection.content.tips && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Dicas e Boas Práticas
              </h3>
              <div className="space-y-2">
                {currentSection.content.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection.content.smartFeatures && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Funcionalidades Inteligentes
              </h3>
              <div className="space-y-2">
                {currentSection.content.smartFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Beef className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection.content.scenarios && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Cenários de Uso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentSection.content.scenarios.map((scenario, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="text-sm">{scenario}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection.content.uses && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Principais Usos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentSection.content.uses.map((use, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    <span className="text-sm">{use}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSection.content.security && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Segurança e Backup
              </h3>
              <div className="space-y-2">
                {currentSection.content.security.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ManualContent;