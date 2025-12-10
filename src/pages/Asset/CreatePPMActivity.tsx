import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import ChecklistCreateForm from '../../components/forms/ChecklistCreateForm';

const CreatePPMActivity: React.FC = () => {
  return (
    <div className="p-6">
      <PageTitle 
        title="Add PPM Activity" 
        breadcrumbs={[
          { label: 'Asset', path: '/asset' }, 
          { label: 'PPM Activity', path: '/asset/ppm-activity' },
          { label: 'Add PPM Activity' }
        ]} 
      />
      
      <ChecklistCreateForm checklistType="ppm" />
    </div>
  );
};

export default CreatePPMActivity;
