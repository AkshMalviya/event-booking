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
import { notifications } from "@mantine/notifications";
import { yupResolver } from "mantine-form-yup-resolver";
import { loginSchema } from "@/validation/auth.schema";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import { useMutation } from "@apollo/client/react";
import { LoginUserDocument } from "@/generated/graphql";

const Login = () => {
  const router = useRouter();
  const [loginMutation, { loading }] = useMutation(LoginUserDocument);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: yupResolver(loginSchema),
  });

  const handleSubmit = (values: typeof form.values) => {
    loginMutation({
      variables: { input: values },
      onCompleted() {
        router.push("/dashboard");
        notifications.show({
          message: "Successfully Logged In",
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
    <Paper w={"100%"} maw={380} radius="lg" p="lg" withBorder shadow="sm">
      <Text size="xl" fw={600}>
        Welcome to Eventz
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Enter your email and password to log in
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
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
            placeholder="Your password"
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
            href="/signup"
            size="xs"
          >
            Don&apos;t have an account? Register
          </Anchor>
          <Button
            type="submit"
            radius="md"
            size="md"
            leftSection={<FiLogIn size={16} />}
            loading={loading}
          >
            Login
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default Login;
