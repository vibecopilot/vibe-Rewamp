import React from 'react';
import { Construction } from 'lucide-react';

const SecurityPatrolling: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-80">
      <Construction className="w-16 h-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">Patrolling</h3>
      <p className="text-muted-foreground">This section is under construction</p>
    </div>
  );
};

export default SecurityPatrolling;
