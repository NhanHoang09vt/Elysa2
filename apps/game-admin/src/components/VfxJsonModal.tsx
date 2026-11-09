import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Upload,
  Copy,
  Check,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { VFXRegistry, VFXSkillConfig } from '@elysia/vfx-engine';

export function VfxJsonModal({
  onClose,
  onImportSuccess,
}: {
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [jsonText, setJsonText] = useState(() => VFXRegistry.getInstance().exportToJSON());
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string }>({});

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elysia-skills-vfx-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const res = VFXRegistry.getInstance().importFromJSON(jsonText);
    if (res.success) {
      setImportStatus({ success: true, message: `Thành công! Đã nạp ${res.count} cấu hình kỹ năng vào hệ thống.` });
      onImportSuccess(res.count);
    } else {
      setImportStatus({ success: false, message: `Lỗi nạp JSON: ${res.error}` });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      const res = VFXRegistry.getInstance().importFromJSON(content);
      if (res.success) {
        setImportStatus({ success: true, message: `Đã nạp file thành công! Cập nhật ${res.count} kỹ năng.` });
        onImportSuccess(res.count);
      } else {
        setImportStatus({ success: false, message: `File JSON không hợp lệ: ${res.error}` });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-[#10141f] border border-[#2b354d] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="p-4 px-6 bg-[#161a28] border-b border-[#232a3d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Quản Lý File Cấu Hình Kỹ Năng (JSON Config)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#20273a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#232a3d] bg-[#0c0f18] px-6 pt-2">
          <button
            onClick={() => {
              setActiveTab('export');
              setJsonText(VFXRegistry.getInstance().exportToJSON());
              setImportStatus({});
            }}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" /> Xuất File (Export JSON)
          </button>
          <button
            onClick={() => {
              setActiveTab('import');
              setImportStatus({});
            }}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" /> Nạp File (Import JSON)
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 flex-1 flex flex-col gap-3 overflow-hidden text-xs">
          {importStatus.message && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
                importStatus.success
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}
            >
              {importStatus.success ? <FileCheck className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{importStatus.message}</span>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="p-3 bg-[#151926] border border-dashed border-[#2b354d] rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Tải Lên File JSON Từ Thiết Bị</span>
                <span className="text-[11px] text-slate-400">Hỗ trợ các file định dạng chuẩn VFXSkillConfig[]</span>
              </div>
              <label className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold cursor-pointer transition-colors text-xs flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Chọn File JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-[260px]">
            <label className="text-[11px] text-slate-400 mb-1 font-mono">
              {activeTab === 'export' ? 'Mã Nguồn Cấu Hình Kỹ Năng Xuất Ra:' : 'Dán Nội Dung JSON Hoặc Chỉnh Sửa Trực Tiếp:'}
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              readOnly={activeTab === 'export'}
              className="w-full flex-1 bg-[#090b12] border border-[#20273a] rounded-lg p-3 font-mono text-xs text-slate-200 outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 px-6 bg-[#161a28] border-t border-[#232a3d] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            {VFXRegistry.getInstance().getAllSkillConfigs().length} kỹ năng đã đăng ký
          </span>

          <div className="flex gap-2">
            {activeTab === 'export' ? (
              <>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-lg bg-[#1f2638] hover:bg-[#28324a] text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Đã Sao Chép!' : 'Sao Chép'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Download className="w-4 h-4" /> Tải Xuống File (.json)
                </button>
              </>
            ) : (
              <button
                onClick={handleImport}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Upload className="w-4 h-4" /> Xác Nhận Nạp Cấu Hình
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
