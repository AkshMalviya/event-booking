"use client";
import { useForm } from "@mantine/form";
import {
  Anchor,
  Button,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/hooks/auth/mutation/useSignupMutation";
import { notifications } from "@mantine/notifications";
import { signupSchema } from "@/validation/auth.schema";
import { yupResolver } from "mantine-form-yup-resolver";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";

const Signup = () => {
  const router = useRouter();
  const signupMutation = useSignupMutation();

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validate: yupResolver(signupSchema),
  });

  const handleSubmit = (values: typeof form.values) => {
    signupMutation.mutate(values, {
      onSuccess: () => {
        router.push("/login");
        notifications.show({
          title: "Successfully Signed Up.",
          message: "Redirecting to Login Page ...",
          color: "green",
        });
      },
      onError: (error) => {
        notifications.show({
          message: error.message || "Failed to log in",
          color: "red",
        });
      },
    });
  };

  return (
    <Paper w={"100%"} maw={420} radius="lg" p="md" withBorder shadow="sm">
      <Text size="xl" fw={600}>
        Create an Account
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Join Eventz to organize and book exciting events
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Your full name"
            leftSection={<FiUser size={16} />}
            {...form.getInputProps("name")}
            radius="md"
            size="md"
          />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            leftSection={<FiMail size={16} />}
            {...form.getInputProps("email")}
            radius="md"
            size="md"
          />

          <PasswordInput
            label="Password"
            placeholder="At least 6 characters"
            leftSection={<FiLock size={16} />}
            {...form.getInputProps("password")}
            radius="md"
            size="md"
          />
        </Stack>

        <Group justify="space-between" mt="xl">
          <Anchor
            component={Link}
            type="button"
            c="gray"
            href="/login"
            size="xs"
          >
            Already have an account? Login
          </Anchor>
          <Button
            type="submit"
            radius="md"
            size="md"
            leftSection={<FiUserPlus size={16} />}
            loading={signupMutation.isPending}
          >
            Signup
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default Signup;
