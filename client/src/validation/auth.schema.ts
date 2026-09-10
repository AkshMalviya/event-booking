import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .matches(/^\S+@\S+$/, "Invalid email"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password should include at least 6 characters"),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;

export const signupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(2, "Name is required"),
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .matches(/^\S+@\S+$/, "Invalid email"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password should include at least 6 characters"),
});

export type SignupFormValues = yup.InferType<typeof signupSchema>;
