import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slice/userSlice";
import { USER_PROFILE_QUERY_KEY } from "../query/useUserQuery";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  return request.post<LoginResponse>(API_URLS.AUTH.LOGIN, payload);
}

export function useLoginMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, ApiError, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.user) {
        dispatch(
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
          }),
        );
      }
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
  });
}
