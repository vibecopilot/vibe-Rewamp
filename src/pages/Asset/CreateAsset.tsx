import React from 'react';
import PageTitle from '../../components/ui/PageTitle';
import AddAsset from '../SubPages/AddAsset';

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
      
      {/* Hide inner navbar with CSS, keep form functionality */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden [&_.hidden.md\\:block]:!hidden">
        <AddAsset />
      </div>
    </div>
  );
};

export default CreateAsset;
