import { useCallback } from "react";
import { toast } from "sonner";

type UploadEndpoint = "lawFirmProfileImage" | "document" | "chatFile" | "settingsFile" | "clientProfileFile";

export function useUploadthing(endpoint: UploadEndpoint) {
  const uploadFiles = useCallback(
    async (files: File[]) => {
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch(`/api/uploadthing?actionType=upload`, {
          method: "POST",
          body: formData,
          headers: {
            "X-Uploadthing-Endpoint": endpoint,
          },
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Nie udało się przesłać pliku");
        throw error;
      }
    },
    [endpoint]
  );

  return { uploadFiles };
}