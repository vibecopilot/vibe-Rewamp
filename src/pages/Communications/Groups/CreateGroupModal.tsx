import React, { useState, useEffect } from 'react';
import { X, Users, Upload } from 'lucide-react';
import { getSetupUsers, postGroups } from '../../../api/index';
import { getItemInLocalStorage } from '../../../utils/localStorage';
import toast from 'react-hot-toast';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    groupName: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    try {
      const res = await getSetupUsers();
      const membersList = res.data?.map((emp: any) => ({
        value: emp.id,
        label: `${emp.firstname} ${emp.lastname}`
      })) || [];
      setMembers(membersList);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setSelectedMembers(selectedValues);
  };

  const handleSubmit = async () => {
    if (!formData.groupName) {
      toast.error('Please enter group name');
      return;
    }

    setLoading(true);
    try {
      const user_id = getItemInLocalStorage('UserId');
      const postData = new FormData();
      postData.append('group[group_name]', formData.groupName);
      postData.append('group[group_description]', formData.description);
      postData.append('group[created_by_id]', user_id);

      selectedMembers.forEach((memberId) => {
        postData.append('group[member_ids][]', memberId.toString());
      });

      if (attachment) {
        postData.append('attachment', attachment);
      }

      await postGroups(postData);
      toast.success('Group created successfully');
      
      // Reset form
      setFormData({ groupName: '', description: '' });
      setSelectedMembers([]);
      setAttachment(null);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Create Group</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Group Name <span className="text-destructive">*</span></label>
            <input
              type="text"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              placeholder="Enter group name"
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Select Members</label>
            <select
              multiple
              value={selectedMembers.map(String)}
              onChange={handleMemberChange}
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]"
            >
              {members.map((member) => (
                <option key={member.value} value={member.value}>{member.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple members</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter group description"
              className="px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Group Profile Picture</label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="group-image"
              />
              <label htmlFor="group-image" className="cursor-pointer">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">
                  {attachment ? attachment.name : 'Click to upload'}
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
