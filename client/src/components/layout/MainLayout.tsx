"use client";
import {
  ActionIcon,
  Affix,
  AppShell,
  NavLink,
  Stack,
  Transition,
} from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { FiCalendar } from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi2";
import { MdEvent } from "react-icons/md";
import Header from "./header/Header";
import { FaArrowUpLong } from "react-icons/fa6";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const [scroll, scrollTo] = useWindowScroll();

  const navItems = [
    {
      label: "Discover",
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
  ];

  return (
    <AppShell
      padding="sm"
      header={{
        height: 70,
      }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
      }}
    >
      <AppShell.Header bd="none" bg="transparent" zIndex={100}>
        <Header opened={opened} toggle={toggle} navItem={navItems} />
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
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition="slide-up" mounted={scroll.y > 0}>
            {(transitionStyles) => (
              <ActionIcon
                size={"input-md"}
                style={transitionStyles}
                onClick={() => scrollTo({ y: 0 })}
              >
                <FaArrowUpLong size={16} />
              </ActionIcon>
            )}
          </Transition>
        </Affix>
      </AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
