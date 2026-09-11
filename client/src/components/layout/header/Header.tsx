import { useLogoutMutation } from "@/hooks/auth/mutation/useLogoutMutation";
import { useAppSelector } from "@/store/hooks";
import {
  Avatar,
  Box,
  Burger,
  Group,
  Menu,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import React, { memo } from "react";
import { FiChevronDown, FiLogOut } from "react-icons/fi";

interface IProps {
  opened: boolean;
  toggle: () => void;
}

const Header = ({ opened, toggle }: IProps) => {
  const router = useRouter();
  const logoutMutation = useLogoutMutation();
  const user = useAppSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title
          order={3}
          fw={700}
          c="blue"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/dashboard")}
        >
          Eventz
        </Title>
      </Group>

      {/* User profile dropdown and status */}
      <Group gap="md">
        <Menu shadow="md" width={220} position="bottom-end">
          <Menu.Target>
            <UnstyledButton
              p={6}
              style={{
                borderRadius: "8px",
                transition: "background-color 150ms ease",
              }}
              className="user-profile-btn"
            >
              <Group gap="xs">
                <Avatar size="sm" radius="xl" color="blue">
                  {user.name ? user.name[0].toUpperCase() : "A"}
                </Avatar>
                <Stack gap={0} visibleFrom="sm">
                  <Text size="sm" fw={600} lh={1.2}>
                    {user.name || "Aksh"}
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.2}>
                    {user.email || "aksh@eventz.com"}
                  </Text>
                </Stack>
                <FiChevronDown size={14} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Box p="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                User Profile
              </Text>
              <Text fw={600} size="sm">
                {user.name || "Aksh"}
              </Text>
              <Text size="xs" c="dimmed">
                {user.email || "aksh@eventz.com"}
              </Text>
            </Box>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<FiLogOut size={16} />}
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};

export default memo(Header);
