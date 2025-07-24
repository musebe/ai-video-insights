// Unified Cloudinary type definitions

// --- Upload Widget Types ---
export interface CloudinaryUploadWidgetInfo {
    public_id: string;
    secure_url: string;
    original_filename?: string;
    eager?: Array<{ secure_url: string }>;
    version: number;
}

export interface CloudinaryUploadWidgetResult {
    event: 'success';
    info: CloudinaryUploadWidgetInfo;
}

export interface CloudinaryUploadWidget {
    open: () => void;
}

// --- Video Player Types ---
interface CloudinaryTextTrackOptions {
    backgroundColor?: string;
    color?: string;
    fontFamily?: string;
}

interface CloudinaryTextTracks {
    setDefaults: (options: CloudinaryTextTrackOptions) => void;
}

export interface CloudinaryVideoPlayer {
    source: (source: unknown) => void;
    textTracks: () => CloudinaryTextTracks;
}

// --- Global Window Extension ---
declare global {
    interface Window {
        cloudinary: {
            createUploadWidget: (
                options: Record<string, unknown>,
                callback: (error: Error | null, result: CloudinaryUploadWidgetResult | null) => void
            ) => CloudinaryUploadWidget;
            videoPlayer: (
                element: HTMLVideoElement,
                options: Record<string, unknown>
            ) => CloudinaryVideoPlayer;
        };
    }
  }