# AI Captions Webapp

A full-stack web application that automatically generates captions for video content using AI technology, built with React, TypeScript, and ElevenLabs API.

## 🚀 Features

- **Video Upload and Processing**
  - Drag-and-drop interface for video uploads
  - Support for MP4 video files
  - Real-time upload progress tracking
  - Server-side video processing

- **AI Transcription**
  - Automated caption generation using ElevenLabs API
  - Support for SRT caption format
  - Speaker diarization for multiple voices
  - Cloud storage integration

- **Authentication & Security**
  - Secure user authentication system
  - Protected video processing routes
  - Secure file handling

- **Cloud Infrastructure**
  - Cloudflare R2 storage integration
  - Presigned URLs for secure file uploads
  - Scalable video processing

## 🛠️ Tech Stack

- **Frontend**
  - React with TypeScript
  - React Router for navigation
  - TailwindCSS for styling
  - Custom UI components

- **Backend**
  - React-Router v7 
  - AWS SDK for S3/R2 integration
  - ElevenLabs API integration

- **Storage**
  - Cloudflare R2 (S3-compatible storage)
  - Secure file management

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/E-Rick-M/ai-captions-webapp.git
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
ELEVEN_LABS=your_eleven_labs_api_key
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=your_better_auth_Url
DB_FILE_NAME=your_local_database_name
```

4. Start the development server:
```bash
npm run dev
```

## 🚀 Usage

1. **Authentication**
   - Create an account or log in
   - Secure session management

2. **Video Upload**
   - Drag and drop MP4 files
   - Monitor upload progress
   - View processing status

3. **Transcription**
   - Automatic caption generation
   - Download captions in SRT format
   - Review and edit transcriptions

## 🏗️ Project Structure

```
app/
├── components/         # Reusable UI components
├── routes/            # Application routes
│   ├── api/          # API endpoints
│   │   ├── presign.ts    # S3 presigned URLs
│   │   └── transcribe.ts # Transcription endpoint
│   ├── auth.tsx      # Authentication routes
│   └── video.tsx     # Video upload interface
└── lib/              # Utility functions
```

## 🔒 Security

- Secure file uploads using presigned URLs
- Protected API endpoints
- Environment variable protection
- Secure user authentication


## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request





