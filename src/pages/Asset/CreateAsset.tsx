import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import AssetCreateForm from '../../components/forms/AssetCreateForm';

const CreateAsset: React.FC = () => {
  return (
    <div className="p-6">
      <PageTitle 
        title="Add Asset" 
        breadcrumbs={[
          { label: 'Asset', path: '/asset' }, 
          { label: 'Add Asset' }
        ]} 
      />
      
      <AssetCreateForm />
    </div>
  );
};

export default CreateAsset;
