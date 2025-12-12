import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Folder, FileText, Plus, Upload, MoreVertical, Share2, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Modal from '../../components/ui/Modal';
import { 
  getFolderDocumentPersonal, 
  getFolderDocumentCommon, 
  getSharedwith,
  getSubFolderDocumentCommon,
  postFolderDocumentCommon,
  postFileDocumentCommon,
  deleteFolderPersonal,
  deleteFilePersonal,
  deleteShareFolder,
  deleteShareFile,
  postSharePersonal,
  getSetupUsers,
  domainPrefix
} from '../../api';
import { getItemInLocalStorage } from '../../utils/localStorage';

interface FolderItem {
  id: number;
  folderId?: number;
  name: string;
  parent_id?: number;
  type: 'folder';
}

interface FileItem {
  id: number;
  documentId?: number;
  name: string;
  document_url?: string;
  type: 'file';
}

interface BreadcrumbItem {
  id: number | null;
  name: string;
}

type TabType = 'personal' | 'common' | 'shared';

const DocumentsList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userID = getItemInLocalStorage("UserId");
  const siteID = getItemInLocalStorage("SITEID");

  // State
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: 'Root' }]);
  const [parentID, setParentID] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [shareData, setShareData] = useState<{ folderId: number | null; fileId: number | null }>({ folderId: null, fileId: null });
  const [shareUserId, setShareUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<{ value: number; label: string }[]>([]);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive active tab from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/documents/common')) setActiveTab('common');
    else if (path.includes('/documents/shared')) setActiveTab('shared');
    else setActiveTab('personal');
  }, [location.pathname]);

  // Fetch users for sharing
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getSetupUsers();
        const formattedUsers = response.data.map((user: any) => ({
          value: user.id,
          label: `${user.firstname} ${user.lastname}`,
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data based on tab
  const fetchData = async (tab: TabType, folderId: number | null = null) => {
    setLoading(true);
    try {
      if (folderId) {
        // Fetch subfolder contents
        const response = await getSubFolderDocumentCommon(folderId);
        if (response.data.success) {
          const { folders: subFolders, documents } = response.data;
          setFolders(subFolders.map((folder: any) => ({
            id: folder.id,
            name: folder.name,
            parent_id: folder.parent_id,
            type: 'folder' as const,
          })));
          setFiles(documents.map((file: any) => ({
            id: file.id,
            name: file.image_file_name || file.file_name,
            document_url: file.document_url,
            type: 'file' as const,
          })));
        }
      } else {
        // Fetch root level contents
        let response;
        if (tab === 'personal') {
          response = await getFolderDocumentPersonal();
        } else if (tab === 'common') {
          response = await getFolderDocumentCommon();
        } else {
          response = await getSharedwith();
        }

        if (response.data.success) {
          if (tab === 'shared') {
            const documents = response.data.documents || [];
            const folderData: FolderItem[] = [];
            const fileData: FileItem[] = [];
            
            documents.forEach((doc: any) => {
              if (doc.folder) {
                folderData.push({
                  id: doc.id,
                  folderId: doc.folder.id,
                  name: doc.folder.name,
                  type: 'folder',
                });
              } else if (doc.document) {
                fileData.push({
                  id: doc.id,
                  documentId: doc.document.id,
                  name: doc.document.image_file_name,
                  document_url: doc.document.document_url,
                  type: 'file',
                });
              }
            });
            
            setFolders(folderData);
            setFiles(fileData);
          } else {
            const { folders: folderList, documents } = response.data;
            setFolders(folderList.map((folder: any) => ({
              id: folder.id,
              name: folder.name,
              parent_id: folder.parent_id,
              type: 'folder' as const,
            })));
            setFiles(documents.map((file: any) => ({
              id: file.id,
              name: file.image_file_name || file.file_name,
              document_url: file.document_url,
              type: 'file' as const,
            })));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and tab change
  useEffect(() => {
    setBreadcrumbs([{ id: null, name: 'Root' }]);
    setParentID(null);
    fetchData(activeTab);
  }, [activeTab]);

  // Tab navigation
  const handleTabChange = (tab: TabType) => {
    const paths = {
      personal: '/documents',
      common: '/documents/common',
      shared: '/documents/shared',
    };
    navigate(paths[tab]);
  };

  // Open folder
  const handleOpenFolder = async (folder: FolderItem) => {
    const folderId = folder.folderId || folder.id;
    setBreadcrumbs(prev => [...prev, { id: folderId, name: folder.name }]);
    setParentID(folderId);
    await fetchData(activeTab, folderId);
  };

  // Navigate to breadcrumb
  const handleBreadcrumbClick = async (index: number) => {
    const selectedBreadcrumb = breadcrumbs[index];
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setParentID(selectedBreadcrumb.id);
    await fetchData(activeTab, selectedBreadcrumb.id);
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    const sendData = new FormData();
    sendData.append('folder[name]', folderName);
    sendData.append('folder[structure]', 'folder');
    sendData.append('folder[folder_type]', activeTab === 'personal' ? 'personal' : 'common');
    if (parentID) {
      sendData.append('folder[parent_id]', parentID.toString());
    }
    sendData.append('folder[uploaded_by]', userID);
    sendData.append('folder[site_id]', siteID);

    try {
      const response = await postFolderDocumentCommon(sendData);
      if (response.data.success) {
        toast.success('Folder created successfully');
        setFolderName('');
        setIsCreateFolderModalOpen(false);
        await fetchData(activeTab, parentID);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  // Upload file
  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const sendData = new FormData();
    sendData.append('folder_document[content]', 'file');
    sendData.append('folder_document[document_type]', activeTab === 'personal' ? 'personal' : 'common');
    if (parentID) {
      sendData.append('folder_document[parent_id]', parentID.toString());
    }
    sendData.append('folder_document[folder_document]', file);
    sendData.append('folder_document[uploaded_by]', userID);
    sendData.append('folder_document[site_id]', siteID);

    try {
      await postFileDocumentCommon(sendData);
      toast.success('File uploaded successfully');
      await fetchData(activeTab, parentID);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folder: FolderItem) => {
    try {
      if (activeTab === 'shared') {
        await deleteShareFolder(folder.id);
      } else {
        await deleteFolderPersonal(folder.folderId || folder.id);
      }
      toast.success('Folder deleted successfully');
      await fetchData(activeTab, parentID);
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
    setMenuOpen(null);
  };

  // Delete file
  const handleDeleteFile = async (file: FileItem) => {
    try {
      if (activeTab === 'shared') {
        await deleteShareFile(file.id);
      } else {
        await deleteFilePersonal(file.documentId || file.id);
      }
      toast.success('File deleted successfully');
      await fetchData(activeTab, parentID);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
    setMenuOpen(null);
  };

  // Share item
  const handleShare = async () => {
    if (!shareUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      const payload = {
        user_id: shareUserId,
        shared_by: userID,
        folder_id: shareData.folderId,
        document_id: shareData.fileId,
      };
      await postSharePersonal(payload);
      toast.success('Item shared successfully');
      setIsShareModalOpen(false);
      setShareData({ folderId: null, fileId: null });
      setShareUserId(null);
    } catch (error) {
      console.error('Error sharing item:', error);
      toast.error('Failed to share item');
    }
  };

  // Open share modal
  const openShareModal = (id: number, type: 'folder' | 'file') => {
    setShareData({
      folderId: type === 'folder' ? id : null,
      fileId: type === 'file' ? id : null,
    });
    setIsShareModalOpen(true);
    setMenuOpen(null);
  };

  // Breadcrumb items for component
  const breadcrumbItems = breadcrumbs.map((crumb, index) => ({
    label: crumb.name,
    path: index < breadcrumbs.length - 1 ? '#' : undefined,
  }));

  // Tabs
  const tabs = [
    { id: 'personal', label: 'Personal' },
    { id: 'common', label: 'Common' },
    { id: 'shared', label: 'Shared with me' },
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={[{ label: 'Documents', path: '/documents' }]} />
      
      {/* Tabs */}
      <div className="flex justify-center my-4">
        <div className="flex gap-1 p-1 bg-muted rounded-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Folder Path Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id || 'root'}>
            {index > 0 && <span>/</span>}
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`hover:text-primary transition-colors ${
                index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''
              }`}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* Action Buttons */}
      {activeTab !== 'shared' && (
        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUploadFile}
            className="hidden"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders Section */}
          {folders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Folders</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="relative group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <button
                      onClick={() => handleOpenFolder(folder)}
                      className="flex flex-col items-center w-full"
                    >
                      <Folder className="w-12 h-12 text-amber-400 mb-2" />
                      <span className="text-sm font-medium text-center text-foreground truncate w-full">
                        {folder.name}
                      </span>
                    </button>
                    
                    {/* Menu Button */}
                    <div className="absolute top-2 right-2" ref={menuOpen === folder.id ? menuRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === folder.id ? null : folder.id);
                        }}
                        className="p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      
                      {menuOpen === folder.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-popover border border-border rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => openShareModal(folder.folderId || folder.id, 'folder')}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                          <button
                            onClick={() => handleDeleteFolder(folder)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-destructive hover:bg-accent transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {files.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Files</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="relative group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    {file.document_url ? (
                      <a
                        href={`${domainPrefix}/${file.document_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center w-full"
                      >
                        <FileText className="w-12 h-12 text-blue-400 mb-2" />
                        <span className="text-sm font-medium text-center text-foreground truncate w-full">
                          {file.name}
                        </span>
                      </a>
                    ) : (
                      <div className="flex flex-col items-center w-full">
                        <FileText className="w-12 h-12 text-blue-400 mb-2" />
                        <span className="text-sm font-medium text-center text-foreground truncate w-full">
                          {file.name}
                        </span>
                      </div>
                    )}
                    
                    {/* Menu Button */}
                    <div className="absolute top-2 right-2" ref={menuOpen === file.id + 10000 ? menuRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === file.id + 10000 ? null : file.id + 10000);
                        }}
                        className="p-1 rounded hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      
                      {menuOpen === file.id + 10000 && (
                        <div className="absolute right-0 mt-1 w-32 bg-popover border border-border rounded-lg shadow-lg z-10">
                          {file.document_url && (
                            <a
                              href={`${domainPrefix}/${file.document_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          )}
                          <button
                            onClick={() => openShareModal(file.documentId || file.id, 'file')}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-destructive hover:bg-accent transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {folders.length === 0 && files.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No folders or files found</p>
            </div>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal
        isOpen={isCreateFolderModalOpen}
        onClose={() => {
          setIsCreateFolderModalOpen(false);
          setFolderName('');
        }}
        title="Create Folder"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsCreateFolderModalOpen(false);
                setFolderName('');
              }}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCreateFolder}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create Folder
            </button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareData({ folderId: null, fileId: null });
          setShareUserId(null);
        }}
        title="Share"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select User
            </label>
            <select
              value={shareUserId || ''}
              onChange={(e) => setShareUserId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.value} value={user.value}>
                  {user.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsShareModalOpen(false);
                setShareData({ folderId: null, fileId: null });
                setShareUserId(null);
              }}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentsList;
