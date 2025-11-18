import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const Uploader = ({ title, name, file, icon, accept, onChange }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ target: { name, value: reader.result } });
      };
      reader.readAsDataURL(file);
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
      {file && (
        <div className="mt-4">
          <img src={file} alt="Preview" className="max-w-full h-auto rounded" />
        </div>
      )}
    </div>
  );
};

export default Uploader;
