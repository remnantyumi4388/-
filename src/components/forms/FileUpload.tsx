"use client";

import { UploadCloud } from "lucide-react";
import { getFileType, isAllowedFileName } from "@/lib/file";

export function FileUpload() {
  return (
    <label className="grid cursor-pointer gap-3 rounded-lg border border-dashed border-white/20 bg-white/[0.04] p-5 text-center transition hover:bg-white/10">
      <UploadCloud className="mx-auto text-cyan-200" size={28} />
      <span className="font-semibold">PDF, PPT, 이미지, ZIP 업로드</span>
      <span className="text-sm text-slate-400">Mock 모드에서는 선택한 파일명을 확인하고, Supabase 연결 후 Storage 업로드로 확장합니다.</span>
      <input
        className="sr-only"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          const invalid = files.find((file) => !isAllowedFileName(file.name));
          if (invalid) {
            alert(`${invalid.name} 파일 형식은 허용되지 않습니다.`);
            event.target.value = "";
            return;
          }
          if (files.length) {
            alert(files.map((file) => `${file.name} (${getFileType(file.name)})`).join("\n"));
          }
        }}
        type="file"
      />
    </label>
  );
}
