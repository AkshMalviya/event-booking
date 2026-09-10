"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Loader, Stack } from "@mantine/core";
import { useUserQuery } from "@/hooks/auth/query/useUserQuery";
import MainLayout from "@/components/layout/MainLayout";

export default function ProtectedRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUserQuery();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace("/login");
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
