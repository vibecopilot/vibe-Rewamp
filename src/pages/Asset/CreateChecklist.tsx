import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import ChecklistCreateForm from '../../components/forms/ChecklistCreateForm';

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
      
      <ChecklistCreateForm checklistType="routine" />
    </div>
  );
};

export default CreateChecklist;
