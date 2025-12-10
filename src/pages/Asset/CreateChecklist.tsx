import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import AddChecklist from '../SubPages/AddChecklist';

const CreateChecklist: React.FC = () => {
  return (
    <div className="p-6">
      <PageTitle 
        title="Add Checklist" 
        breadcrumbs={[
          { label: 'Asset', path: '/asset' }, 
          { label: 'Checklist', path: '/asset/checklist' },
          { label: 'Add Checklist' }
        ]} 
      />
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden [&_.hidden.md\\:block]:!hidden">
        <AddChecklist />
      </div>
    </div>
  );
};

export default CreateChecklist;
