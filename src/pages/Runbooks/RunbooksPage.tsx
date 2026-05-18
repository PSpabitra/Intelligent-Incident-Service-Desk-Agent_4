import React, { useState } from 'react'
import { Book, Upload, Search, Filter, FileText, Database, Layers, Clock, Eye, Trash2, ExternalLink } from 'lucide-react'
import api from '../../services/api'

export default function RunbooksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/api/documents/upload', formData);
      alert('File uploaded successfully!');
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const stats = [
    { label: 'TOTAL ARTICLES', value: '4', icon: Book, color: '#3b82f6' },
    { label: 'ACTIVE', value: '0', icon: FileText, color: '#22c55e' },
    { label: 'PROCESSING', value: '0', icon: Database, color: '#f59e0b' },
    { label: 'INDEXED CHUNKS', value: '140', icon: Layers, color: '#06b6d4' },
  ]

  const runbooks = [
    {
      id: 1,
      title: 'Machine Learning: Zero to Job-Ready - 4-Week Intensive Course for Engineering Students',
      description: 'This course is structured to equip final-year engineering students...',
      category: 'EDUCATIONAL TRAINING PROGRAM',
      source: 'PDF',
      chunks: 35,
      status: 'INACTIVE',
      updated: '2d ago'
    },
    {
      id: 2,
      title: 'Databricks_advanced.pdf',
      description: 'No description available.',
      category: 'GENERAL',
      source: 'PDF',
      chunks: 35,
      status: 'INACTIVE',
      updated: '2d ago'
    }
  ]

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen" style={{ background: '#f8fafc', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Book size={32} className="text-slate-900" />
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Knowledge Base
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Upload PDF/DOCX articles · stored locally · indexed into the RAG vector store
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20 text-sm"
        >
          <Upload size={18} />
          UPLOAD ARTICLE
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl border bg-white shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
              <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100">
                <stat.icon size={18} style={{ color: stat.color }} />
              </span>
            </div>
            <div className="text-4xl font-black text-slate-900">{stat.value}</div>
            {stat.label === 'TOTAL RUNBOOKS' && (
              <p className="text-xs text-slate-400 mt-2 font-medium">Indexed operational SOPs</p>
            )}
            {stat.label === 'ACTIVE' && (
              <p className="text-xs text-slate-400 mt-2 font-medium">Indexed in vector DB</p>
            )}
            {stat.label === 'PROCESSING' && (
              <p className="text-xs text-slate-400 mt-2 font-medium">being chunked & embedded</p>
            )}
            {stat.label === 'INDEXED CHUNKS' && (
              <p className="text-xs text-slate-400 mt-2 font-medium">vectors in Chroma</p>
            )}
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search runbooks, tags, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl text-sm font-medium outline-none border border-slate-200 focus:border-blue-500/50 transition-all bg-white shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
          {['ALL', 'ACTIVE', 'PROCESSING', 'FAILED', 'ARCHIVED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'rgba(241, 245, 249, 0.5)' }}>
                {['RUNBOOK', 'CATEGORY', 'SOURCE', 'CHUNKS', 'STATUS', 'UPDATED', 'ACTIONS'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runbooks.map((rb) => (
                <tr key={rb.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 max-w-md">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 mt-1">
                        <FileText size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{rb.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{rb.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 px-2.5 py-1 rounded-md bg-slate-100">
                      {rb.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-500">{rb.source}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-900">{rb.chunks}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                      {rb.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-500">{rb.updated}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-blue-500">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl border" style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Upload size={20} />
                </span>
                <h3 className="text-xl font-bold text-slate-900">Upload Article</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <span className="text-slate-500 text-sm">✕</span>
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              Supported formats: <strong>PDF, DOCX</strong>. Max file size: <strong>20 MB</strong>.
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload size={32} className="text-slate-400" />
              <div className="text-center">
                {selectedFile ? (
                  <p className="text-sm font-bold text-blue-600">{selectedFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">or select a file from your computer</p>
                  </>
                )}
              </div>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                accept=".pdf,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 20 * 1024 * 1024) {
                      alert('File size exceeds 20 MB limit!');
                      e.target.value = ''; // Reset input
                      return;
                    }
                    setSelectedFile(file);
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedFile(null); }} 
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase text-slate-600 hover:bg-slate-100 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-colors shadow-lg ${
                  uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                }`}
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
