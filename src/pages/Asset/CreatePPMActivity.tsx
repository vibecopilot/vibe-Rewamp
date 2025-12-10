import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import AddPPMActivity from '../SubPages/AddPPMActivity';

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
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden [&_.hidden.md\\:block]:!hidden">
        <AddPPMActivity />
      </div>
    </div>
  );
};

export default CreatePPMActivity;
