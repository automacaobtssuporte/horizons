import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Target, BarChart3, TrendingUp } from 'lucide-react';

const WorkflowsSection = ({ workflows }) => {
  const workflowIcons = [
    <Target className="h-6 w-6" />,
    <BarChart3 className="h-6 w-6" />,
    <TrendingUp className="h-6 w-6" />
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Fluxos de Trabalho Principais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflows.map((workflow, index) => (
            <motion.div
              key={index}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {workflowIcons[index]}
                </div>
                <h3 className="font-semibold">{workflow.title}</h3>
              </div>
              <div className="space-y-2">
                {workflow.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5 flex-shrink-0">
                      {stepIndex + 1}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowsSection;