import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar } from 'lucide-react';
import { getGroups } from '../../../api/index';
import { dateFormatSTD } from '../../../utils/dateUtils';

const GroupsList: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await getGroups();
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(g => g.group_name?.toLowerCase().includes(searchValue.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <input type="text" placeholder="Search by group name..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="flex-1 min-w-[200px] max-w-md px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGroups.map((group) => (
            <div key={group.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
                <div><h3 className="font-semibold text-foreground">{group.group_name || 'Untitled Group'}</h3><p className="text-xs text-muted-foreground">{group.group_members?.length || 0} members</p></div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{group.description || 'No description'}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" /> {group.created_at ? dateFormatSTD(group.created_at) : '-'}</div>
              <div className="flex -space-x-2 mt-3">
                {(group.group_members || []).slice(0, 4).map((m: any, i: number) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">{m.firstname?.charAt(0) || 'U'}</div>
                ))}
                {(group.group_members?.length || 0) > 4 && <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">+{group.group_members.length - 4}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && filteredGroups.length === 0 && <div className="text-center py-16"><p className="text-muted-foreground">No groups found</p></div>}
    </div>
  );
};

export default GroupsList;
