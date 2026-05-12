import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateMyProfile } from "@/src/api/users";
import { uploadProfilePicture } from "@/src/api/cloudinary";
import { useAuth } from "@/src/auth/auth-context";

export function useProfilePictureUpload() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (localUri: string) => {
      const cloudinaryUrl = await uploadProfilePicture(localUri);
      const updatedUser = await updateMyProfile({
        profilePictureUrl: cloudinaryUrl,
      });
      return updatedUser;
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-favorites"] });
    },
  });
}
