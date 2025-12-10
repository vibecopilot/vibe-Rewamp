import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import AMCCreateForm from '../../components/forms/AMCCreateForm';

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
      
      <AMCCreateForm />
    </div>
  );
};

export default CreateAMC;
