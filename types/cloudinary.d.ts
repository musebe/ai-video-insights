// types/cloudinary.d.ts

// --- Type definitions for the Upload Widget ---
interface CloudinaryUploadWidgetInfo {
    public_id: string;
    secure_url: string;
    original_filename?: string;
    // FIX: Add the optional 'eager' property
    eager?: Array<{ secure_url: string }>;
}
interface CloudinaryUploadWidgetResult {
    event: 'success';
    info: CloudinaryUploadWidgetInfo;
}
interface CloudinaryUploadWidget {
    open: () => void;
}

// --- Type definitions for the Video Player ---

// FIX: Define the specific shape of the player's source object
interface CloudinaryTextTrack {
    src: string;
    label: string;
    language: string;
    kind: 'subtitles' | 'captions';
    default?: boolean;
}
interface CloudinaryPlayerSource {
    publicId: string;
    info?: {
        textTracks?: CloudinaryTextTrack[];
    };
}
interface CloudinaryVideoPlayer {
    source: (source: CloudinaryPlayerSource) => void;
}

// --- The final, unified global definition ---
declare global {
    interface Window {
        cloudinary: {
            createUploadWidget: (
                options: Record<string, unknown>,
                callback: (error: Error | null, result: CloudinaryUploadWidgetResult | null) => void
            ) => CloudinaryUploadWidget;
            videoPlayer: (
                ref: HTMLVideoElement,
                options: Record<string, unknown>
            ) => CloudinaryVideoPlayer;
        };
    }
}

// This empty export is needed to make the file a module
export { };