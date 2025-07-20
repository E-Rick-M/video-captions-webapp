
import { useRef, useState } from "react";
import { useNavigate, Form, type ActionFunctionArgs } from "react-router";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { signOut } from "~/lib/auth-client";

export default function VideoRoute() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(
    null
  );
  const [transcriptionSuccess, setTranscriptionSuccess] = useState(false);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function logOut() {
    await signOut();
    navigate("/");
  }

  function handleDrag(e:React.DragEvent) {
    e.preventDefault()
    e.stopPropagation();
    if(e.type==='dragenter' || e.type=== 'dragover'){
        setDragActive(true)
    }else if(e.type==='dragleave'){
        setDragActive(false)
    }
  }
  function handleDrop(e:React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files=e.dataTransfer.files;
    if(files && files.length >0){
        const file=files[0];
        if(file.type==='video/mp4'){
            setSelectedFile(file)
            if (fileInputRef.current){
                const dt=new DataTransfer()
                dt.items.add(file);
                fileInputRef.current.files=dt.files
            }
            resetUploadState()
        }else{
             alert('Please Select an MP4 file')
        }
    }
  }

  function handleFileSelect(e :React.ChangeEvent<HTMLInputElement>) {
    const files=e.target.files;

    if(files && files.length>0){
        const file=files[0];

        if (file.type === 'video/mp4'){
            setSelectedFile(file);
            resetUploadState()
        }else{
            alert('Please Select an MP4 file')
        }
    }
  }

  function openFileDialog() {
    fileInputRef.current?.click()
  }
  function removeFile() {
    setSelectedFile(null)
    resetUploadState()

    if(fileInputRef.current){
        fileInputRef.current.value=''
    }
  }

  function resetUploadState() {
    setUploading(false)
    setUploadProgress(0)
    setUploadError(null)
    setUploadSuccess(false)
    setTranscribing(false)
    setTranscriptionError(null)
    setTranscriptionSuccess(false)
    setFileKey(null)
  }

  async function startTranscription(key:string) {
    console.log('Starting Transcription for the Key:', key)
    setTranscribing(true)
    setTranscriptionError(null)

    try{
        const downloadFormData=new FormData()
        downloadFormData.append('action','download');
        downloadFormData.append('key',key)
        const downloadResponse=await fetch('/api/presign',{
            method:'POST',
            body:downloadFormData
        })
        const downloadResult=await downloadResponse.json()
        console.log(downloadResult)

        if(!downloadResponse.ok){
            throw new Error(downloadResult.error || 'Failed to get download URL');
        }

        const transcribeFormData=new FormData()
        transcribeFormData.append('downloadUrl', downloadResult.presignedUrl)
        transcribeFormData.append('fileName', selectedFile?.name || 'video.mp4');

        const transcribeResponse=await fetch('/api/transcribe',{
            method:"POST",
            body:transcribeFormData
        })
        const transcribeResult = await transcribeResponse.json();
         if (!transcribeResponse.ok) {
            throw new Error(transcribeResult.error || 'Transcription failed');
            }
        console.log('Transcription completed:', transcribeResult);
        setTranscriptionSuccess(true);

     
    }catch(error){
        console.error('Transcription error:', error);
      setTranscriptionError(error instanceof Error ? error.message : 'Transcription failed');
    }finally{
         setTranscribing(false);
    }
  }

  async function handleUpload() {
    if(!selectedFile) return

    setUploading(true)
    setUploadError(null)
    setUploadProgress(0);


    try{
        const formdata=new FormData();
        formdata.append('fileName',selectedFile.name)
        formdata.append('fileType',selectedFile.type)

        const response=await fetch('/api/presign',{
            method:'POST',
            body:formdata
        })

        const result=await response.json()
        console.log(result)
        if (!response.ok){
            throw new Error(result.error || 'Failed to get Upload Url')
        }
        setFileKey(result.key)

        await new Promise<void>((resolve,reject)=>{
            const xhr=new XMLHttpRequest();

            xhr.upload.onprogress=(event)=>{
                if (event.lengthComputable){
                const percentComplete=Math.round(
                (event.loaded/event.total)*100
                );
                setUploadProgress(percentComplete)
                }
                
            }

            xhr.onload=()=>{
                if (xhr.status >=200 && xhr.status<300){
                    setUploadProgress(100)
                    setUploadSuccess(true)
                    console.log('File uploaded successfully:', result.uploadUrl);
                    resolve();
                }else{
                    reject(new Error(`Upload failed with status: ${xhr.status}`));
                }
            }

            xhr.onerror=(err)=>{
                console.log(err)
                 reject(new Error('Network error during upload'));
            }


             xhr.onabort = () => {
                reject(new Error('Upload was aborted'));
                };
            xhr.open('PUT', result.presignedUrl);
            xhr.setRequestHeader('Content-Type', selectedFile.type);
            xhr.send(selectedFile);


        })
         if (result.key) {
            await startTranscription(result.key);
            }



    }catch (err){
        console.error('Upload Error: ', err)
        setUploadError(err instanceof Error ? err.message :"Upload failed")
    }finally{
        setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Welcome</h1>

            <Button onClick={logOut}>Logout</Button>
          </div>
        </div>
      </div>

      {/* {main-content} */}

      <div className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-6"> Upload Video</h2>
            <p className="text-gray-600">
              {" "}
              Upload an mp4 File to get started with Video Captioning
            </p>
          </div>
        {/* <Form method="post" encType="multipart/form-data" */}
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : selectedFile
                ? transcriptionSuccess
                  ? 'border-green-400 bg-green-50'
                  : transcriptionError
                  ? 'border-red-400 bg-red-50'
                  : uploadSuccess
                  ? 'border-green-400 bg-green-50'
                  : uploadError
                  ? 'border-red-400 bg-red-50'
                  : 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Input
              ref={fileInputRef}
              name="video"
              type="file"
              accept=".mp4,video/mp4"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer hidden"
            />

            {selectedFile ? (
              <div className="space-y-4">
                <div
                  className={`flex items-center justify-center w-12 h-12 mx-auto rounded-full ${
                    transcriptionSuccess
                      ? 'bg-green-100'
                      : transcriptionError
                      ? 'bg-red-100'
                      : transcribing
                      ? 'bg-blue-100'
                      : uploadSuccess
                      ? 'bg-green-100'
                      : uploadError
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}
                >
                  {uploading || transcribing ? (
                    <svg
                      className="animate-spin w-6 h-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : transcriptionSuccess ? (
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (transcriptionError || uploadError) ? (
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  {uploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                  {transcribing && (
                    <p className="text-sm text-blue-600 mt-2">
                      Processing transcription...
                    </p>
                  )}
                  {uploadError && (
                    <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                  )}
                  {transcriptionError && (
                    <p className="text-sm text-red-600 mt-2">{transcriptionError}</p>
                  )}
                  {transcriptionSuccess && (
                    <p className="text-sm text-green-600 mt-2">
                      Transcription completed successfully!
                    </p>
                  )}
                  {uploadSuccess && !transcribing && !transcriptionSuccess && !transcriptionError && (
                    <p className="text-sm text-green-600 mt-2">
                      Upload completed successfully!
                    </p>
                  )}
                </div>
                {!uploading && !transcribing && !uploadSuccess && (
                  <div className="flex gap-3 justify-center">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFileDialog();
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Choose Different File
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your MP4 file here
                  </p>
                  <p className="text-gray-500">or click to browse</p>
                </div>
                <Button
                  type="button"
                  onClick={openFileDialog}
                  className="mx-auto"
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {selectedFile && !uploading && !uploadSuccess && !transcribing && (
            <div className="mt-6 text-center">
              <Button
                type="button"
                onClick={handleUpload}
                className="w-full"
                size="lg"
                disabled={uploading}
              >
                Upload and Process Video
              </Button>
            </div>
          )}

          {transcriptionSuccess && (
            <div className="mt-6 text-center">
              <Button
                type="button"
                onClick={() => {
                  // Reset for next upload
                  removeFile();
                }}
                className="w-full"
                size="lg"
              >
                Upload Another Video
              </Button>
            </div>
          )}
           {/* </Form> */}
          {/* </div> */}
       
        </Card>
         </div>
    
    </div>
  );
}
