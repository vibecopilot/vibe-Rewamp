import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Bookmark, AlertTriangle, EyeOff, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { getForum, likeForum, deleteForum, PostSavedForum, domainPrefix } from '../../../api/index';
import { FormattedDateToShowProperly } from '../../../utils/dateUtils';
import toast from 'react-hot-toast';

const ForumFeed: React.FC = () => {
  const navigate = useNavigate();
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => { fetchForums(); }, []);

  const fetchForums = async () => {
    try {
      setLoading(true);
      const res = await getForum();
      setForums(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: number) => {
    try { await likeForum(id); fetchForums(); toast.success('Liked!'); } catch { toast.error('Failed'); }
  };

  const handleSave = async (id: number) => {
    try { await PostSavedForum(id); toast.success('Saved!'); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: number) => {
    try { await deleteForum(id); setForums(f => f.filter(x => x.id !== id)); toast.success('Deleted!'); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-4">
        <button onClick={() => navigate('/crm/communications/forum/create')} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"><Plus className="w-4 h-4" /> Create</button>
        <Link to="/crm/communications/forum/saved" className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"><Bookmark className="w-4 h-4" /> Saved</Link>
        <Link to="/crm/communications/forum/reported" className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"><AlertTriangle className="w-4 h-4" /> Reported</Link>
        <Link to="/crm/communications/forum/hidden" className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"><EyeOff className="w-4 h-4" /> Hidden</Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {forums.map((forum) => (
            <div key={forum.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">{forum.created_by_name?.firstname?.charAt(0) || 'U'}</div>
                  <div><p className="font-medium text-foreground">{forum.created_by_name?.firstname} {forum.created_by_name?.lastname}</p><p className="text-xs text-muted-foreground">{FormattedDateToShowProperly(forum.created_at)}</p></div>
                </div>
                <div className="relative">
                  <button onClick={() => setActiveDropdown(activeDropdown === forum.id ? null : forum.id)} className="p-1 hover:bg-muted rounded-lg"><MoreHorizontal className="w-5 h-5" /></button>
                  {activeDropdown === forum.id && (
                    <div className="absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg py-1 z-10 w-28">
                      <button onClick={() => { handleSave(forum.id); setActiveDropdown(null); }} className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted">Save</button>
                      <button onClick={() => { handleDelete(forum.id); setActiveDropdown(null); }} className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted text-destructive">Delete</button>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{forum.thread_title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{forum.thread_description}</p>
              {forum.forums_image?.[0] && <img src={domainPrefix + forum.forums_image[0].document} alt="" className="w-full rounded-lg mb-3" />}
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button onClick={() => handleLike(forum.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><Heart className="w-4 h-4" /> {forum.liked_count || 0}</button>
                <span className="flex items-center gap-1 text-sm text-muted-foreground"><MessageCircle className="w-4 h-4" /> {forum.comment_count || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && forums.length === 0 && <div className="text-center py-16"><p className="text-muted-foreground">No forum posts found</p></div>}
    </div>
  );
};

export default ForumFeed;
