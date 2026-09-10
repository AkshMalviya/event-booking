import { Center } from "@mantine/core";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Center
      w="100%"
      px="md"
      py="xl"
      style={{ minHeight: "100vh", backgroundColor: "#ecdde1ff" }}
    >
      {children}
    </Center>
  );
};

export default AuthLayout;
