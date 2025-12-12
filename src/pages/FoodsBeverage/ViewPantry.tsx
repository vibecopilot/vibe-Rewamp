import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, ChevronLeft, Edit2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getPantryDetails } from '../../api';

interface PantryItem {
  id: number;
  item_name: string;
  stock: number;
  description?: string;
  created_at: string;
  attachfiles?: Array<{ document_url?: string }>;
  ordered_by_name?: {
    firstname?: string;
    lastname?: string;
  };
}

const ViewPantry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<PantryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPantryItem = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getPantryDetails(id);
      setItem(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pantry item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPantryItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading pantry item...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Pantry Item</h3>
        <p className="text-muted-foreground mb-4">{error || 'Item not found'}</p>
        <button
          onClick={fetchPantryItem}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const orderedByName = item.ordered_by_name 
    ? `${item.ordered_by_name.firstname || ''} ${item.ordered_by_name.lastname || ''}`.trim()
    : '-';

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/fb/pantry" className="hover:text-primary">Pantry Management</Link>
        <span>/</span>
        <span className="text-foreground">{item.item_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{item.item_name}</h1>
            <p className="text-sm text-muted-foreground">Pantry Item Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/fb/pantry')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={() => navigate(`/fb/pantry/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Item Name</label>
              <p className="mt-1 text-foreground">{item.item_name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stock</label>
              <p className="mt-1 text-foreground">{item.stock ?? '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ordered By</label>
              <p className="mt-1 text-foreground">{orderedByName}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="mt-1 text-foreground">{item.description || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="mt-1 text-foreground">
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {item.attachfiles && item.attachfiles.length > 0 && (
          <div className="mt-6">
            <label className="text-sm font-medium text-muted-foreground">Images</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              {item.attachfiles.map((file, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border border-border">
                  <img 
                    src={file.document_url} 
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPantry;
