import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../components/ui/PageTitle';
import ListToolbar from '../../components/ui/ListToolbar';
import TabNavigation from '../../components/ui/TabNavigation';
import { AMCList, MeterList, ChecklistList, RoutineTaskList, PPMChecklistList, PPMActivityList, PPMCalendar, StockItemsList } from './submodules';

const ASSET_TABS = [
  { id: 'amc', label: 'AMC' },
  { id: 'meter', label: 'Meter' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'routine-task', label: 'Routine Task' },
  { id: 'ppm-checklist', label: 'PPM Checklist' },
  { id: 'ppm-activity', label: 'PPM Activity' },
  { id: 'ppm-calendar', label: 'PPM Calendar' },
  { id: 'stock-items', label: 'Stock Items' },
];

const AssetList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('amc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => setSearchValue(value);

  const getAddPath = () => {
    const paths: Record<string, string> = {
      'amc': '/asset/amc/create',
      'meter': '/asset/meter/create',
      'checklist': '/asset/checklist/create',
      'routine-task': '/asset/routine-task/create',
      'ppm-checklist': '/asset/ppm-checklist/create',
      'ppm-activity': '/asset/ppm-activity/create',
      'stock-items': '/asset/stock-items/create',
    };
    return paths[activeTab] || '/asset/create';
  };

  const getAddLabel = () => {
    const labels: Record<string, string> = {
      'amc': 'Add AMC',
      'meter': 'Add Meter',
      'checklist': 'Add Checklist',
      'routine-task': 'Add Task',
      'ppm-checklist': 'Add PPM Checklist',
      'ppm-activity': 'Add PPM Activity',
      'ppm-calendar': '',
      'stock-items': 'Add Stock Item',
    };
    return labels[activeTab] || 'Add';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'amc': return <AMCList viewMode={viewMode} searchValue={searchValue} />;
      case 'meter': return <MeterList viewMode={viewMode} searchValue={searchValue} />;
      case 'checklist': return <ChecklistList viewMode={viewMode} searchValue={searchValue} />;
      case 'routine-task': return <RoutineTaskList viewMode={viewMode} searchValue={searchValue} />;
      case 'ppm-checklist': return <PPMChecklistList viewMode={viewMode} searchValue={searchValue} />;
      case 'ppm-activity': return <PPMActivityList viewMode={viewMode} searchValue={searchValue} />;
      case 'ppm-calendar': return <PPMCalendar searchValue={searchValue} />;
      case 'stock-items': return <StockItemsList viewMode={viewMode} searchValue={searchValue} />;
      default: return <AMCList viewMode={viewMode} searchValue={searchValue} />;
    }
  };

  return (
    <div className="p-6">
      <PageTitle title="Assets" breadcrumbs={[{ label: 'Asset', path: '/asset' }, { label: activeTab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) }]} />

      <TabNavigation tabs={ASSET_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <ListToolbar
        searchPlaceholder={`Search ${activeTab.replace('-', ' ')}...`}
        searchValue={searchValue}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={activeTab !== 'ppm-calendar'}
        onFilter={() => {}}
        onExport={() => {}}
        onAdd={getAddLabel() ? () => navigate(getAddPath()) : undefined}
        addLabel={getAddLabel()}
        showQrCode={activeTab === 'meter'}
        onQrCode={activeTab === 'meter' ? () => {} : undefined}
      />

      {renderContent()}
    </div>
  );
};

export default AssetList;
