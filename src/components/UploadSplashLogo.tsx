/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { useApiInstance } from '@/hooks/useApiInstance';
import { handleResponse } from '@/utils/handleResponse';
import { isFailureResponse } from '@/utils/isFailureResponse';
import { useParams } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadSplashLogo({ isOpen, onClose }: Props) {
  const api = useApiInstance();
  const { id } = useParams();
  const [selectedFiles, setSelectedFiles] = useState<File | null>(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchUploadToken();
  }, []);

  const fetchUploadToken = async () => {
    try {
      const response = await handleResponse(
        api.authenticatedGet('/get-upload-token', {
          category: 'MERCHANT_SPLASH_BANNER',
        }),
      );

      if (response) {
        setToken(response.upload_token);
      }
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Error in getting Upload token');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      toast.error("Can't upload multiple files");
      return;
    }
    setSelectedFiles(acceptedFiles[0]);
  }, []);

  const removeFile = () => {
    setSelectedFiles(null);
  };

  const handleUploadLogo = async () => {
    if (!selectedFiles || token === '') return;

    const formData = new FormData();
    formData.append('file', selectedFiles);

    try {
      const response = await handleResponse(
        api.post(`/upload-file?MerchantUUID=${id}`, formData, {
          Authorization: `Bearer ${token}`,
        }),
      );

      if (response) {
        toast.success('Uploaded Successfully');
      }
    } catch (error) {
      if (isFailureResponse(error)) {
        toast.error(error.message || 'Upload Failed');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      removeFile();
      onClose();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    multiple: false,
    onDrop,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSelectedFiles(null);
        onClose();
      }}
      title="Upload Splash Banner"
      onConfirm={handleUploadLogo}
      disableButtons={!selectedFiles}
      width="w-[26rem]"
      height="h-[20rem]"
    >
      <div className="flex flex-col items-center p-4">
        <div
          {...getRootProps()}
          className="border-2 border-dashed p-6 w-full text-center cursor-pointer rounded-lg"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-gray-500">Drop the file here...</p>
          ) : (
            <p className="text-gray-500">
              Drag & drop a PNG or JPG (600x400) here, or click to select
            </p>
          )}
        </div>

        {selectedFiles && (
          <div className="mt-4 w-full flex justify-between items-center border p-2 rounded">
            <span>{selectedFiles.name}</span>
            <button type="button" className="text-red-500" onClick={removeFile}>
              ✖
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
