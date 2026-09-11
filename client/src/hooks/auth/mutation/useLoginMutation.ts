import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slice/userSlice";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { queryClient } from "@/app/providers";

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

const loginUser = (payload: LoginPayload) => {
  return request.post<LoginResponse>(API_URLS.AUTH.LOGIN, payload);
};

export function useLoginMutation() {
  const dispatch = useAppDispatch();

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
      queryClient.invalidateQueries({ queryKey: ["auth", "userProfile"] });
    },
  });
}
