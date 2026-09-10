"use client";
import React, { ReactNode } from "react";
import {
  AppShell,
  Burger,
  Group,
  Title,
  Text,
  Avatar,
  Menu,
  NavLink,
  Stack,
  Box,
  Divider,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useLogoutMutation } from "@/hooks/auth/mutation/useLogoutMutation";
import { FiCalendar, FiPlus, FiLogOut, FiChevronDown } from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi2";
import { MdEvent } from "react-icons/md";
import Link from "next/link";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const [opened, { toggle, close }] = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user);
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      description: "Discover upcoming events",
      icon: <FiCalendar size={18} />,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "My Bookings",
      description: "View your tickets",
      icon: <HiOutlineTicket size={18} />,
      href: "/bookings",
      active: pathname === "/bookings",
    },
    {
      label: "My Events",
      description: "Manage events you created",
      icon: <MdEvent size={18} />,
      href: "/my-events",
      active: pathname === "/my-events",
    },
    {
      label: "Create Event",
      description: "Host and publish a new event",
      href: "/events/create",
      icon: <FiPlus size={18} />,
      active: pathname === "/events/create",
    },
  ];

  return (
    <AppShell
      padding="md"
      header={{ height: { base: 60, md: 70 } }}
      navbar={{
        width: { base: 240, md: 280 },
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
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
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap={4}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                label={item.label}
                description={item.description}
                leftSection={item.icon}
                active={item.active}
                component={Link}
                href={item.href}
                onClick={() => {
                  close();
                }}
                styles={{
                  root: {
                    borderRadius: "8px",
                  },
                }}
              />
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <Box p="xs">
            <Group gap="xs">
              <Avatar size="sm" radius="xl" color="blue">
                {user.name ? user.name[0].toUpperCase() : "A"}
              </Avatar>
              <Stack gap={0} style={{ overflow: "hidden" }}>
                <Text size="xs" fw={600} truncate>
                  {user.name || "Aksh"}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {user.email || "aksh@eventz.com"}
                </Text>
              </Stack>
            </Group>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
