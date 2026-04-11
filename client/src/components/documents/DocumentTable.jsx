import React from 'react';
import { 
  FiFile, FiEye, FiDownload, FiEdit2, FiTrash2, 
  FiFileText, FiImage 
} from 'react-icons/fi';
import EmptyState from '../common/EmptyState';
import './DocumentTable.css';

const DocumentTable = ({ documents, onPreview, onEdit, onDelete, onDownload }) => {
  if (!documents || documents.length === 0) {
    return (
      <EmptyState 
        icon={<FiFile />} 
        title="No Documents Found" 
        message="No documents matching your filter criteria were found in our library."
      />
    );
  }

  const getFileIcon = (type) => {
    const ext = type?.toLowerCase().replace('.', '');
    if (['jpg', 'jpeg', 'png'].includes(ext)) return <FiImage className="text-warning" />;
    if (['pdf'].includes(ext)) return <FiFileText className="text-danger" />;
    return <FiFile className="text-primary" />;
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'badge-active';
      case 'verified': return 'badge-verified';
      case 'archived': return 'badge-archived';
      case 'pending': return 'badge-pending';
      case 'expiring': return 'badge-expiring';
      default: return 'badge-default';
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-enterprise m-0">
        <thead>
          <tr>
            <th className="px-4 py-3">Document Name</th>
            <th className="px-4 py-3 text-center">Category</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-center">File Size</th>
            <th className="px-4 py-3 text-center">Uploaded On</th>
            <th className="px-4 py-3 text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc._id} className="align-middle">
              <td className="px-4 py-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="doc-type-icon">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="d-flex flex-column">
                    <span className="doc-title-row">{doc.title}</span>
                    <span className="doc-ext-row">{doc.fileType?.replace('.', '') || 'FILE'}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="category-tag">{doc.category}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`status-badge ${getStatusClass(doc.status)}`}>
                  {doc.status}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-muted small font-bold">
                  {doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) : '0.00'} MB
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-muted small font-bold">
                  {new Date(doc.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </td>
              <td className="px-4 py-3 text-end">
                <div className="action-hub d-flex align-items-center justify-content-end gap-1">
                  <button 
                    onClick={() => onPreview(doc)} 
                    className="btn btn-action-icon preview"
                    title="Preview Document"
                  >
                    <FiEye />
                  </button>
                  <button 
                    onClick={() => onDownload(doc)} 
                    className="btn btn-action-icon download"
                    title="Download Copy"
                  >
                    <FiDownload />
                  </button>
                  <button 
                    onClick={() => onEdit(doc)} 
                    className="btn btn-action-icon edit"
                    title="Edit Metadata"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => onDelete(doc._id)} 
                    className="btn btn-action-icon delete"
                    title="Move to Recycle Bin"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentTable;
