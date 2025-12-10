import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageTitle from '../../components/ui/PageTitle';
import ListToolbar from '../../components/ui/ListToolbar';
import { AssetMainList, AMCList, MeterList, ChecklistList, RoutineTaskList, PPMChecklistList, PPMActivityList, PPMCalendar, StockItemsList } from './submodules';

const AssetList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid'); // Default to grid
  const [searchValue, setSearchValue] = useState('');
  
  // Records per page: 12 for grid, 10 for table
  const recordsPerPage = viewMode === 'grid' ? 12 : 10;

  // Derive active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/asset') return 'asset';
    if (path === '/asset/amc') return 'amc';
    if (path === '/asset/meter') return 'meter';
    if (path === '/asset/checklist') return 'checklist';
    if (path === '/asset/routine-task') return 'routine-task';
    if (path === '/asset/ppm-checklist') return 'ppm-checklist';
    if (path === '/asset/ppm-activity') return 'ppm-activity';
    if (path === '/asset/ppm-calendar') return 'ppm-calendar';
    if (path === '/asset/stock-items') return 'stock-items';
    return 'asset';
  };

  const activeTab = getActiveTab();

  const handleSearch = (value: string) => setSearchValue(value);

  // Only submodules with existing create pages
  const submodulesWithCreate = ['asset', 'amc', 'checklist', 'ppm-activity'];

  const getAddPath = () => {
    if (!submodulesWithCreate.includes(activeTab)) return '';
    const paths: Record<string, string> = {
      'asset': '/asset/create',
      'amc': '/asset/amc/create',
      'checklist': '/asset/checklist/create',
      'ppm-activity': '/asset/ppm-activity/create',
    };
    return paths[activeTab] || '';
  };

  const getAddLabel = () => {
    if (!submodulesWithCreate.includes(activeTab)) return '';
    const labels: Record<string, string> = {
      'asset': 'Add Asset',
      'amc': 'Add AMC',
      'checklist': 'Add Checklist',
      'ppm-activity': 'Add PPM Activity',
    };
    return labels[activeTab] || '';
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      'asset': 'Assets',
      'amc': 'AMC',
      'meter': 'Meter',
      'checklist': 'Checklist',
      'routine-task': 'Routine Task',
      'ppm-checklist': 'PPM Checklist',
      'ppm-activity': 'PPM Activity',
      'ppm-calendar': 'PPM Calendar',
      'stock-items': 'Stock Items',
    };
    return titles[activeTab] || 'Assets';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'asset': return <AssetMainList viewMode={viewMode} searchValue={searchValue} perPage={recordsPerPage} />;
      case 'amc': return <AMCList viewMode={viewMode} searchValue={searchValue} perPage={recordsPerPage} />;
      case 'meter': return <MeterList viewMode={viewMode} searchValue={searchValue} perPage={recordsPerPage} />;
      case 'checklist': return <ChecklistList viewMode={viewMode} searchValue={searchValue} perPage={recordsPerPage} />;
      case 'routine-task': return <RoutineTaskList viewMode={viewMode} searchValue={searchValue} perPage={recordsPerPage} />;
      case 'ppm-checklist': return <PPMChecklistList viewMode={viewMode} searchValue={searchValue} perPage={recordsPerPage} />;
      case 'ppm-activity': return <PPMActivityList viewMode={viewMode} searchValue={searchValue} perPage={recordsPerPage} />;
      case 'ppm-calendar': return <PPMCalendar searchValue={searchValue} />;
      case 'stock-items': return <StockItemsList viewMode={viewMode} searchValue={searchValue} perPage={recordsPerPage} />;
      default: return <AssetMainList viewMode={viewMode} searchValue={searchValue} perPage={recordsPerPage} />;
    }
  };

  return (
    <div className="p-6">
      {/* Removed PageTitle to save space - navigation already shows context */}

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
        showQrCode={activeTab === 'meter' || activeTab === 'asset'}
        onQrCode={(activeTab === 'meter' || activeTab === 'asset') ? () => {} : undefined}
      />

      {renderContent()}
    </div>
  );
};

export default AssetList;
