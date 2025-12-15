import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Clock, User, Truck, Package, Loader2, AlertCircle, RefreshCw, Calendar, FileText } from 'lucide-react';
import PageTitle from '../../components/ui/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';
import { getGoodsDetails, domainPrefix } from '../../api';
import { dateFormat, formatTime } from '../../utils/dateUtils';

interface GoodsDetails {
  id: number;
  ward_type?: 'in' | 'out';
  person_name?: { name: string } | string;
  vehicle_no?: string;
  goods_in_time?: string;
  goods_out_time?: string;
  gate_no?: string;
  company_name?: string;
  mobile_no?: string;
  description?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  goods_documents?: { id: number; document: string }[];
}

const GoodsView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goods, setGoods] = useState<GoodsDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoods = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getGoodsDetails(id);
      setGoods(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch goods details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoods();
  }, [id]);

  const getPersonName = (): string => {
    if (!goods) return 'N/A';
    if (typeof goods.person_name === 'object') {
      return goods.person_name?.name || 'N/A';
    }
    return goods.person_name || 'N/A';
  };

  const isImage = (filePath: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const extension = filePath.split('.').pop()?.split('?')[0].toLowerCase() || '';
    return imageExtensions.includes(extension);
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop()?.split('?')[0] || 'Document';
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title="Goods Details"
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Goods In/Out', path: '/vms/goods-in-out' },
            { label: 'View' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading goods details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !goods) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PageTitle
          title="Goods Details"
          breadcrumbs={[
            { label: 'VMS', path: '/vms' },
            { label: 'Goods In/Out', path: '/vms/goods-in-out' },
            { label: 'View' }
          ]}
        />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Goods</h3>
          <p className="text-muted-foreground mb-4">{error || 'Goods not found'}</p>
          <div className="flex gap-3">
            <button
              onClick={fetchGoods}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => navigate('/vms/goods-in-out')}
              className="px-4 py-2 border border-border rounded-lg hover:bg-accent"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const personName = getPersonName();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageTitle
        title={`Goods ${goods.ward_type === 'in' ? 'Inward' : 'Outward'} - ${goods.id}`}
        breadcrumbs={[
          { label: 'VMS', path: '/vms' },
          { label: 'Goods In/Out', path: '/vms/goods-in-out' },
          { label: `#${goods.id}` }
        ]}
        actions={
          <button
            onClick={() => navigate(`/vms/goods-in-out/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Goods #{goods.id}</h2>
                <p className="text-sm text-muted-foreground">{personName}</p>
              </div>
            </div>
            <StatusBadge status={goods.ward_type === 'in' ? 'approved' : 'pending'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Person Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{personName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{goods.vehicle_no || 'N/A'}</span>
                </div>
                {goods.company_name && (
                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{goods.company_name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Goods Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    goods.ward_type === 'in' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                  }`}>
                    {goods.ward_type === 'in' ? 'Inward' : 'Outward'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gate No</span>
                  <span className="text-foreground font-medium">{goods.gate_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="text-foreground font-medium">{goods.mobile_no || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {goods.description && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Description</h3>
              <p className="text-sm text-foreground">{goods.description}</p>
            </div>
          )}

          {/* Remarks */}
          {goods.remarks && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Remarks</h3>
              <p className="text-sm text-foreground">{goods.remarks}</p>
            </div>
          )}

          {/* Attachments */}
          {goods.goods_documents && goods.goods_documents.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Attachments</h3>
              <div className="flex flex-wrap gap-4">
                {goods.goods_documents.map((doc) => (
                  <div key={doc.id} className="relative">
                    {isImage(doc.document) ? (
                      <img
                        src={domainPrefix + doc.document}
                        alt="Attachment"
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(domainPrefix + doc.document, '_blank')}
                      />
                    ) : (
                      <a
                        href={domainPrefix + doc.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center w-24 h-24 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <FileText className="w-8 h-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground text-center px-1 truncate w-full">
                          {getFileName(doc.document)}
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Info */}
        <div className="space-y-4">
          {/* Timing Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Timing</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goods In Time</span>
                <span className="text-foreground font-medium">{goods.goods_in_time ? formatTime(goods.goods_in_time) : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goods Out Time</span>
                <span className="text-foreground font-medium">{goods.goods_out_time ? formatTime(goods.goods_out_time) : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Timestamps Card */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Timestamps</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground font-medium">{dateFormat(goods.created_at) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span className="text-foreground font-medium">{dateFormat(goods.updated_at) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsView;
