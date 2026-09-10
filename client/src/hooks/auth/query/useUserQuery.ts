import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slice/userSlice";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export const USER_PROFILE_QUERY_KEY = ["auth", "userProfile"] as const;

function getUserProfile(): Promise<UserProfile> {
  return request.get<UserProfile>(API_URLS.AUTH.ME);
}

export function useUserQuery() {
  const dispatch = useAppDispatch();

  return useQuery<UserProfile, ApiError>({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const data = await getUserProfile();
      if (data) {
        dispatch(
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
          }),
        );
      }
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
