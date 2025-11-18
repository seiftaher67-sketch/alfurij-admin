import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const Uploader = ({ title, name, file, icon, accept, onChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (file && file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      onChange({ target: { name, value: selectedFile } });
    }
  }, [name, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      {icon}
      <p className="mt-2 text-sm text-gray-600">{title}</p>
      {previewUrl && (
        <div className="mt-4">
          <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded" />
        </div>
      )}
    </div>
  );
};

export default Uploader;
