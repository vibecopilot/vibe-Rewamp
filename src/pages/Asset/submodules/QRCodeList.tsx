import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DataCard from '../../../components/ui/DataCard';
import DataTable, { TableColumn } from '../../../components/ui/DataTable';
import StatusBadge, { StatusType } from '../../../components/ui/StatusBadge';
import { assetService, Asset } from '../../../services/asset.service';
import { Loader2, QrCode, AlertCircle, RefreshCw, Download, Printer, Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

interface QRCodeListProps {
  viewMode: 'grid' | 'table';
  searchValue: string;
  perPage?: number;
}

const QRCodeList: React.FC<QRCodeListProps> = ({ viewMode, searchValue, perPage = 10 }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [downloadingQR, setDownloadingQR] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [pagination, setPagination] = useState({ page: 1, perPage, total: 0, totalPages: 0 });

  useEffect(() => {
    setPagination(prev => ({ ...prev, perPage, page: 1 }));
  }, [perPage]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await assetService.getAssets(pagination.page, pagination.perPage, { search: searchValue });
      const data = response.data;
      const assetList = Array.isArray(data) ? data : data?.site_assets || data?.data || [];
      setAssets(assetList);
      setPagination(prev => ({
        ...prev,
        total: data.total || data.total_count || assetList.length,
        totalPages: data.total_pages || Math.ceil((data.total || assetList.length) / prev.perPage),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, searchValue]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const getAssetStatus = (asset: Asset): StatusType => {
    const status = asset.status?.toLowerCase();
    if (status === 'active' || status === 'in_use') return 'in-use';
    if (status === 'maintenance' || status === 'under_maintenance') return 'pending';
    if (status === 'retired' || status === 'disposed') return 'breakdown';
    return 'available';
  };

  const filteredAssets = assets.filter(asset =>
    !searchValue ||
    asset.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    asset.asset_number?.toLowerCase().includes(searchValue.toLowerCase()) ||
    asset.oem_name?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleDownloadQRCodes = async () => {
    if (selectedRows.length === 0) {
      toast.error('Please select at least one asset to download QR codes');
      return;
    }

    setDownloadingQR(true);
    try {
      const response = await assetService.downloadQrCodes(selectedRows);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-codes-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded QR codes for ${selectedRows.length} asset(s)`);
    } catch (err) {
      toast.error('Failed to download QR codes');
    } finally {
      setDownloadingQR(false);
    }
  };

  const handlePrintQRCode = (asset: Asset) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${asset.name || asset.asset_number}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: system-ui, sans-serif; }
              .qr-container { text-align: center; padding: 20px; }
              .asset-name { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .asset-number { font-size: 14px; color: #666; margin-bottom: 20px; }
              @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="asset-name">${asset.name || 'Asset'}</div>
              <div class="asset-number">${asset.asset_number || ''}</div>
              <svg id="qr-code"></svg>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
            <script>
              QRCode.toString('ASSET:${asset.id}', { type: 'svg' }, function(err, svg) {
                document.getElementById('qr-code').outerHTML = svg;
                setTimeout(function() { window.print(); window.close(); }, 500);
              });
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const columns: TableColumn<Asset>[] = [
    {
      key: 'qr_code',
      header: 'QR Code',
      width: '100px',
      render: (_, row) => (
        <div className="p-1 bg-white rounded border border-border">
          <QRCodeSVG value={`ASSET:${row.id}`} size={50} level="M" />
        </div>
      )
    },
    { key: 'asset_number', header: 'Asset #', render: (v) => v || '-' },
    { key: 'name', header: 'Asset Name', sortable: true, render: (v) => v || '-' },
    { key: 'oem_name', header: 'OEM', render: (v) => v || '-' },
    { key: 'building_name', header: 'Location', render: (v, row) => `${v || '-'}${row.floor_name ? `, ${row.floor_name}` : ''}` },
    { key: 'status', header: 'Status', render: (_, row) => <StatusBadge status={getAssetStatus(row)} /> },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setPreviewAsset(row); }}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Preview QR"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrintQRCode(row); }}
            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Print QR"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  if (loading && assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading QR Codes...</p>
      </div>
    );
  }

  if (error && assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-error mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load QR Codes</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={fetchAssets} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border">
        <QrCode className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No QR Codes Found</h3>
        <p className="text-muted-foreground mb-4">{searchValue ? `No assets match "${searchValue}"` : 'No assets added yet'}</p>
        <Link to="/asset/create" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">+ Add Asset</Link>
      </div>
    );
  }

  return (
    <>
      {/* QR Code Actions Bar */}
      <div className="flex items-center justify-between mb-4 p-3 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <QrCode className="w-5 h-5" />
          <span>{filteredAssets.length} asset(s) with QR codes</span>
          {selectedRows.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {selectedRows.length} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadQRCodes}
            disabled={selectedRows.length === 0 || downloadingQR}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {downloadingQR ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download Selected
          </button>
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 mb-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Refreshing...</span></div>}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className={`bg-card border rounded-xl p-4 hover:border-primary/50 transition-all cursor-pointer ${selectedRows.includes(String(asset.id)) ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              onClick={() => setSelectedRows(prev => prev.includes(String(asset.id)) ? prev.filter(r => r !== String(asset.id)) : [...prev, String(asset.id)])}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg border border-border flex-shrink-0">
                  <QRCodeSVG value={`ASSET:${asset.id}`} size={80} level="M" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{asset.name || `Asset #${asset.id}`}</h4>
                  <p className="text-sm text-muted-foreground truncate">{asset.asset_number || '-'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{asset.building_name || '-'}</p>
                  <div className="mt-2">
                    <StatusBadge status={getAssetStatus(asset)} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrintQRCode(asset); }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredAssets}
          selectable
          selectedRows={selectedRows}
          onSelectRow={(id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])}
          onSelectAll={() => setSelectedRows(selectedRows.length === filteredAssets.length ? [] : filteredAssets.map(a => String(a.id)))}
          viewPath={(row) => `/asset/${row.id}`}
        />
      )}

      {filteredAssets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-card border border-border rounded-lg">
          <div className="text-sm text-muted-foreground">Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} records</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagination(prev => ({ ...prev, page: 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">«</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">‹ Prev</button>
            <span className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">{pagination.page}</span>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">Next ›</button>
            <button onClick={() => setPagination(prev => ({ ...prev, page: prev.totalPages }))} disabled={pagination.page >= pagination.totalPages} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent disabled:opacity-50">»</button>
          </div>
          <select value={pagination.perPage} onChange={(e) => setPagination(prev => ({ ...prev, perPage: Number(e.target.value), page: 1 }))} className="px-2 py-1.5 text-sm border border-border rounded-md bg-background">
            <option value={10}>10 / page</option><option value={12}>12 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option>
          </select>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewAsset(null)}>
          <div className="bg-card rounded-xl p-6 shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">{previewAsset.name || 'Asset QR Code'}</h3>
              <p className="text-sm text-muted-foreground mb-4">{previewAsset.asset_number || `ID: ${previewAsset.id}`}</p>
              <div className="inline-block p-6 bg-white rounded-xl border border-border">
                <QRCodeSVG value={`ASSET:${previewAsset.id}`} size={200} level="H" includeMargin />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Scan this QR code to view asset details</p>
                <p className="mt-1 font-mono bg-muted px-2 py-1 rounded inline-block">ASSET:{previewAsset.id}</p>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => handlePrintQRCode(previewAsset)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRCodeList;
