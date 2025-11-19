import { useCallback } from "react";
import { toast } from "sonner";

type UploadEndpoint = "lawFirmProfileImage" | "document" | "chatFile" | "settingsFile" | "clientProfileFile";

export function useUploadthing(endpoint: UploadEndpoint) {
  const uploadFiles = useCallback(
    async (files: File[]) => {
      try {
        const uploadedFiles = [];

        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(`/api/upload`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed for ${file.name}`);
          }

          const data = await response.json();
          uploadedFiles.push({
            ...data,
            name: file.name,
            size: file.size,
            type: file.type,
          });
        }

        return uploadedFiles;
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