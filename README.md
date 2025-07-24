

# AI-Powered Video Insights with Cloudinary and Next.js

[**Live Demo**](https://ai-video-insights.vercel.app)

This is a full-stack application built with Next.js that demonstrates how to turn raw video content into actionable intelligence. It uses Cloudinary for robust video processing and transcription, and the OpenAI API for generating AI-powered insights like summaries, social media posts, and interactive chat.

![Project Screenshot](https://res.cloudinary.com/hackit-africa/image/upload/v1753345689/demo_video_insights.png) 



## ✨ Features

* **Folder Management:** Organize videos into folders.
* **Robust Video Uploads:** Uses the Cloudinary Upload Widget to handle large video files directly from the client, bypassing server limits.
* **Automated Transcription:** A Cloudinary Upload Preset automatically triggers transcription (using Google or Azure add-ons) and generates `.srt` and `.vtt` subtitle files.
* **Asynchronous Updates:** A webhook securely receives notifications from Cloudinary to update the application's database when transcription is complete.
* **AI-Powered Summaries:** Generate concise summaries of video content using OpenAI.
* **AI Social Posts:** Create promotional content for LinkedIn, Twitter, and Facebook based on the video's transcript.
* **Conversational Video Chat:** An interactive chat interface (powered by the Vercel AI SDK) allows users to ask questions about the video's content.
* **Editable Transcripts:** Load the generated `.vtt` file into a timestamped editor to review and correct the transcript.
* **Dynamic Subtitle Styling:** Change the font, text color, and background color of subtitles in real-time.



## 🛠️ Technology Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
* **Database:** [PostgreSQL](https://www.postgresql.org/) (via Neon/Supabase)
* **ORM:** [Prisma](https://www.prisma.io/)
* **Video & Transcription:** [Cloudinary](https://cloudinary.com/)
* **AI Language Model:** [OpenAI](https://openai.com/)
* **AI Chat Streaming:** [Vercel AI SDK](https://sdk.vercel.ai/)
* **Deployment:** [Vercel](https://vercel.com/)



## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/musebe/ai-video-insights.git
cd ai-video-insights
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and include all the following environment variables:

```env
# Database
# Direct connection for Prisma CLI and pooled for app use
DATABASE_URL="your_postgresql_connection_string"

# Cloudinary (Client + Server)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Use your ngrok URL during testing

# OpenAI
OPENAI_API_KEY="sk-..."
```

### 4. Set Up Cloudinary Upload Preset

Create an **unsigned** preset in Cloudinary (e.g., `ai_video_final`) with these settings:

* **Add-on:** Enable Google AI or Microsoft Azure transcription.
* **Auto transcription:** ON (under Manage and Analyze).
* **Advanced:** Set the **Notification URL** to your public webhook (e.g., `https://<your-ngrok-url>/api/cloudinary/webhook`).

### 5. Sync Database Schema

```bash
npx prisma db push
```

### 6. Run the Development Server

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

Use [ngrok](https://ngrok.com/) to expose your local server if you're testing webhook functionality.


