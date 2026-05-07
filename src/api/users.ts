import { apiClient } from "@/src/api/client";
import {
  Page,
  PostResponse,
  PublicUserProfileResponse,
  UpdateProfileRequest,
  UserProfileResponse,
} from "@/src/api/types";

export async function fetchUserById(
  id: number,
): Promise<PublicUserProfileResponse> {
  const res = await apiClient.get<PublicUserProfileResponse>(
    `/api/v1/users/${id}`,
  );
  return res.data;
}

export async function updateMyProfile(
  data: UpdateProfileRequest,
): Promise<UserProfileResponse> {
  const res = await apiClient.put<UserProfileResponse>(
    "/api/v1/users/me",
    data,
  );
  return res.data;
}

export async function deleteMyAccount(password: string): Promise<void> {
  await apiClient.delete("/api/v1/users/me", { data: { password } });
}

export async function fetchUserPosts(
  userId: number,
  page = 0,
  size = 20,
): Promise<Page<PostResponse>> {
  const res = await apiClient.get<Page<PostResponse>>(
    `/api/v1/users/${userId}/posts`,
    { params: { page, size } },
  );
  return res.data;
}
