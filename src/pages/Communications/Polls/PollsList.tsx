import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BarChart3 } from 'lucide-react';
import { getPolls } from '../../../api/index';

const PollsList: React.FC = () => {
  const navigate = useNavigate();
  const [polls, setPolls] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPolls(); }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await getPolls();
      setPolls(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolls = polls.filter(p => p.poll_title?.toLowerCase().includes(searchValue.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <input type="text" placeholder="Search by title..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="flex-1 min-w-[200px] max-w-md px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <button onClick={() => navigate('/crm/communications/polls/create')} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolls.map((poll) => (
            <div key={poll.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">{poll.poll_title || 'Untitled Poll'}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{poll.poll_description || 'No description'}</p>
              <div className="text-xs text-muted-foreground"><span className="font-medium">Responses:</span> {poll.response_count || 0}</div>
            </div>
          ))}
        </div>
      )}
      {!loading && filteredPolls.length === 0 && <div className="text-center py-16"><p className="text-muted-foreground">No polls found</p></div>}
    </div>
  );
};

export default PollsList;
