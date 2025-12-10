import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import AddAMC from '../SubPages/AddAMC';

const CreateAMC: React.FC = () => {
  return (
    <div className="p-6">
      <PageTitle 
        title="Add AMC" 
        breadcrumbs={[
          { label: 'Asset', path: '/asset' }, 
          { label: 'AMC', path: '/asset/amc' },
          { label: 'Add AMC' }
        ]} 
      />
      
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden [&_.hidden.md\\:block]:!hidden">
        <AddAMC />
      </div>
    </div>
  );
};

export default CreateAMC;
