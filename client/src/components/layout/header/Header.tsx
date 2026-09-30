import { LogoutDocument } from "@/generated/graphql";
import { useAppSelector } from "@/store/hooks";
import { useMutation } from "@apollo/client/react";
import {
  Avatar,
  Box,
  Burger,
  Button,
  Group,
  Menu,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JSX, memo } from "react";
import { FiChevronDown, FiLogOut, FiPlusCircle } from "react-icons/fi";
import classes from "./index.module.scss";

interface IProps {
  opened: boolean;
  toggle: () => void;
  navItem: {
    label: string;
    description: string;
    icon: JSX.Element;
    href: string;
    active: boolean;
  }[];
}

const Header = ({ opened, toggle, navItem }: IProps) => {
  const router = useRouter();
  const [logout, { loading: isPending }] = useMutation(LogoutDocument);
  const user = useAppSelector((state) => state.user);

  const handleLogout = () => {
    logout({
      onCompleted: () => {
        router.push("/login");
      },
      onError: () => {
        router.push("/login");
      },
    });
  };

  return (
    <div className={classes.root}>
      <Group gap="sm">
        <Burger
          opened={opened}
          onClick={toggle}
          className={classes.burger}
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

      <Group gap={"24px"} className={classes.navItems}>
        {navItem.map((item) => {
          return (
            <Link
              href={item.href}
              key={item.href}
              className={item.active ? classes.active : classes.item}
            >
              <Text fw={600} size="sm">
                {item.label}
              </Text>
            </Link>
          );
        })}

        <Button
          leftSection={<FiPlusCircle size={18} />}
          variant="gradient"
          onClick={() => router.push("/events/create")}
        >
          Create Event
        </Button>
      </Group>

      <Group gap="md">
        <Menu shadow="md" width={220} position="bottom" withArrow>
          <Menu.Target>
            <UnstyledButton p={6}>
              <Group gap="xs">
                <Avatar size="sm" radius="xl" color="blue">
                  {user.name ? user.name[0].toUpperCase() : "A"}
                </Avatar>
                <FiChevronDown size={14} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Box p="xs">
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
              disabled={isPending}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </div>
  );
};

export default memo(Header);
