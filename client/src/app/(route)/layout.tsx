"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader, Stack } from "@mantine/core";
import { useQuery } from "@apollo/client/react";
import { UserDocument } from "@/generated/graphql";
import MainLayout from "@/components/layout/MainLayout";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slice/userSlice";

export default function ProtectedRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, loading: isLoading, error } = useQuery(UserDocument);
  const user = data?.me;
  const isError = !!error;

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace("/login");
    } else {
      if (user) {
        dispatch(
          setUser({ id: user.id, email: user?.email, name: user?.name }),
        );
      }
    }
  }, [isLoading, isError, user, router]);

  if (isLoading) {
    return (
      <Center style={{ height: "100vh", width: "100%" }}>
        <Stack align="center" gap="sm">
          <Loader size="lg" type="dots" />
        </Stack>
      </Center>
    );
  }

  if (!user) {
    return null;
  }

  return <MainLayout>{children}</MainLayout>;
}
