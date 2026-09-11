import { useMutation } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";

interface SignupPayload {
  email: string;
  name: string;
  password: string;
}

interface SignupResponse {
  id: string;
  name: string;
  email: string;
}

const signupUser = (payload: SignupPayload) => {
  return request.post<SignupResponse>(API_URLS.AUTH.REGISTER, payload);
};

export const useSignupMutation = () => {
  return useMutation<SignupResponse, ApiError, SignupPayload>({
    mutationFn: signupUser,
  });
};
