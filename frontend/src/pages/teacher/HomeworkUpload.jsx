import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { ChevronLeft, UploadCloud, FileText, CheckCircle, Zap, Shield } from 'lucide-react';

const HomeworkUpload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    minStudyTime: 60,
    rewardXp: 50,
    dueDate: ''
  });
  const [file, setFile] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadedHomeworkId, setUploadedHomeworkId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, minStudyTime, rewardXp, dueDate } = formData;

    if (!title || !description || !minStudyTime || !rewardXp || !dueDate || !file) {
      return setErrorMsg('All fields, including PDF document, are required.');
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setStatusMsg('');

    // Prepare multipart data
    const uploadForm = new FormData();
    uploadForm.append('title', title);
    uploadForm.append('description', description);
    uploadForm.append('minStudyTime', minStudyTime);
    uploadForm.append('rewardXp', rewardXp);
    uploadForm.append('dueDate', dueDate);
    uploadForm.append('pdf', file);

    try {
      const res = await api.post('/homework', uploadForm);
      setUploadedHomeworkId(res.data._id);
      setStatusMsg('Protocol details and PDF file uploaded successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Server upload failed. Only PDFs are allowed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/teacher')}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-brandCyan font-bold uppercase tracking-wider transition-colors"
        >
          <ChevronLeft size={16} /> Back to command
        </button>
      </div>

      {uploadedHomeworkId ? (
        // Success panel redirect options
        <div className="glass-panel p-8 rounded-2xl border border-green-500/20 shadow-glass-cyan text-center space-y-6">
          <div className="inline-flex p-4 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
            <CheckCircle size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Study Protocol Created!</h3>
            <p className="text-xs text-white/50 mt-1">The assignment specifications and PDF resources have been saved to database.</p>
          </div>
          
          <div className="p-4 rounded-xl bg-brandPurple/10 border border-brandPurple/20 text-left space-y-2 max-w-md mx-auto">
            <span className="text-xs font-bold text-white block">Next Sequence: Attach MCQ Quiz</span>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Before students can complete this study cycle, they must be tested. Link multiple-choice questions to this assignment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <button
              onClick={() => navigate('/teacher')}
              className="px-5 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-bold transition-all text-white flex-1"
            >
              Exit to Dashboard
            </button>
            <button
              onClick={() => navigate(`/teacher/create-quiz?homeworkId=${uploadedHomeworkId}`)}
              className="px-5 py-3 bg-gradient-to-r from-brandPurple to-brandBlue text-white font-extrabold rounded-xl text-xs hover:opacity-90 transition-all shadow-glass-purple flex-1 flex items-center justify-center gap-1"
            >
              Build Quiz Now
            </button>
          </div>
        </div>
      ) : (
        // Upload form
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
          <div>
            <h3 className="font-extrabold text-white text-base">Upload Assignment Details</h3>
            <p className="text-[11px] text-white/40 mt-0.5">Specify PDF viewing rules and reward conditions.</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 block font-bold">Study Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Introduction to Quantum Physics"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3 px-4 text-white outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 block font-bold">Description / Goals</label>
              <textarea
                name="description"
                placeholder="Provide directions or focus parameters for this document..."
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3 px-4 text-white outline-none transition-all resize-none"
              />
            </div>

            {/* Timing & XP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-white/40 block font-bold flex items-center gap-1"><Shield size={13} /> Minimum Study Lock (Seconds)</label>
                <input
                  type="number"
                  name="minStudyTime"
                  min="10"
                  value={formData.minStudyTime}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3 px-4 text-white outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/40 block font-bold flex items-center gap-1"><Zap size={13} /> Points Value (XP Reward)</label>
                <input
                  type="number"
                  name="rewardXp"
                  min="5"
                  value={formData.rewardXp}
                  onChange={handleChange}
                  className="w-full bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3 px-4 text-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 block font-bold">Assignment Deadline</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full bg-slate-950/50 hover:bg-slate-950/70 border border-white/10 focus:border-brandCyan text-xs rounded-xl py-3 px-4 text-white outline-none transition-all"
              />
            </div>

            {/* File Drag / Input */}
            <div className="space-y-2">
              <label className="text-xs text-white/40 block font-bold">Select PDF Document</label>
              <div className="border-2 border-dashed border-white/10 hover:border-brandCyan/40 rounded-xl p-6 text-center cursor-pointer bg-slate-950/20 hover:bg-slate-950/40 transition-all relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={32} className="text-brandCyan animate-pulse" />
                    <span className="text-xs text-white font-bold">{file.name}</span>
                    <span className="text-[10px] text-white/40">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud size={32} className="text-white/30" />
                    <span className="text-xs text-white/60">Drag PDF here or click to browse</span>
                    <span className="text-[9px] text-white/30">Maximum file size: 10MB</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-brandBlue to-brandCyan text-slate-950 font-black rounded-xl text-xs hover:opacity-90 transition-all shadow-glass-cyan flex items-center justify-center gap-2 uppercase"
            >
              {isSubmitting ? 'UPLOADING Spec...' : 'Publish Study Protocol'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeworkUpload;
