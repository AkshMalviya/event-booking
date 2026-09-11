import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slice/userSlice";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";
import { queryClient } from "@/app/providers";

const logoutUser = () => {
  return request.post<{ message: string }>(API_URLS.AUTH.LOGOUT);
};

export function useLogoutMutation() {
  const dispatch = useAppDispatch();

  return useMutation<{ message: string }, ApiError>({
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(clearUser());
      queryClient.clear();
    },
  });
}
