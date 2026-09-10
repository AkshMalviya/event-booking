import { useMutation } from "@tanstack/react-query";
import request, { ApiError } from "@/lib/request.axios";
import { API_URLS } from "@/hooks/api-urls";

export interface SignupPayload {
  email: string;
  name: string;
  password: string;
}

export interface SignupResponse {
  id: string;
  name: string;
  email: string;
}

export function signupUser(payload: SignupPayload): Promise<SignupResponse> {
  return request.post<SignupResponse>(API_URLS.AUTH.REGISTER, payload);
}

export function useSignupMutation() {
  return useMutation<SignupResponse, ApiError, SignupPayload>({
    mutationFn: signupUser,
  });
}
