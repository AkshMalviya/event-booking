import React, { memo, useState } from "react";
import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Collapse,
  Loader,
  Table,
  Center,
  Box,
  ThemeIcon,
} from "@mantine/core";
import {
  FiCalendar,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
  FiImage,
} from "react-icons/fi";
import { EventItem } from "@/hooks/events/types";
import { useEventBookingsQuery } from "@/hooks/events/query/useEventBookingsQuery";
import { getImageUrl } from "@/utils/getImagePath";

const MyEventCard = ({ event }: { event: EventItem }) => {
  const [opened, setOpened] = useState(false);
  const eventId = event.id || event._id || "";

  const {
    data: bookings,
    isLoading,
    isError,
  } = useEventBookingsQuery(opened ? eventId : "");

  const getEventStatus = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now < startDate) return { label: "Upcoming", color: "blue" };
    if (now >= startDate && now <= endDate)
      return { label: "Ongoing", color: "green" };
    return { label: "Past", color: "gray" };
  };

  const status = getEventStatus(event.startDate, event.endDate);

  return (
    <Card
      withBorder
      shadow={"sm"}
      radius="lg"
      p={0}
      style={{
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        overflow: "hidden",
      }}
    >
      <Group wrap="nowrap" align="stretch" gap={0}>
        <Box w={220} mih={160} pos="relative" style={{ display: "flex" }}>
          {event.image ? (
            <Image
              src={getImageUrl(event.image) || event.image}
              alt={event.title}
              h="100%"
              w="100%"
              fit="cover"
              fallbackSrc="https://placehold.co/600x400?text=Image+Not+Found"
            />
          ) : (
            <Center
              h="100%"
              w="100%"
              bg="linear-gradient(135deg, var(--mantine-color-blue-filled) 0%, var(--mantine-color-grape-filled) 100%)"
            >
              <FiImage size={48} color="rgba(255, 255, 255, 0.4)" />
            </Center>
          )}
          <Badge
            pos="absolute"
            top={12}
            left={12}
            variant="filled"
            color={status.color}
            size="md"
            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          >
            {status.label}
          </Badge>
        </Box>

        <Stack p="xl" style={{ flex: 1 }} gap="md">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Group gap="xs">
                <Text fw={800} size="xl" lineClamp={1}>
                  {event.title}
                </Text>
                <Badge variant="light" color="blue" size="md">
                  {event.price === 0 ? "FREE" : `$${event.price}`}
                </Badge>
              </Group>

              <Group gap="lg">
                <Group gap={6}>
                  <ThemeIcon variant="light" color="blue" size="sm" radius="xl">
                    <FiCalendar size={12} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed" fw={500}>
                    {new Date(event.startDate).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </Group>

                <Group gap={6}>
                  <ThemeIcon
                    variant="light"
                    color="grape"
                    size="sm"
                    radius="xl"
                  >
                    <FiUsers size={12} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed" fw={500}>
                    {event.registeredCount} / {event.availableSeats} Booked
                  </Text>
                </Group>
              </Group>
            </Stack>

            <Button
              variant={opened ? "light" : "filled"}
              color={opened ? "gray" : "blue"}
              radius="xl"
              rightSection={opened ? <FiChevronUp /> : <FiChevronDown />}
              onClick={() => setOpened((o) => !o)}
            >
              {opened ? "Hide Attendees" : "View Attendees"}
            </Button>
          </Group>
        </Stack>
      </Group>

      <Collapse expanded={opened}>
        <Box
          p="xl"
          bg="var(--mantine-color-gray-0)"
          style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
        >
          <Group justify="space-between" mb="md">
            <Text fw={700} size="md">
              Attendee List ({bookings?.length || 0})
            </Text>
          </Group>

          {isLoading && (
            <Center p="xl">
              <Loader type="dots" color="blue" />
            </Center>
          )}

          {isError && (
            <Center p="xl">
              <Text c="red" fw={500}>
                Failed to load bookings. Please try again.
              </Text>
            </Center>
          )}

          {bookings && bookings.length === 0 && (
            <Center
              p="xl"
              bg="white"
              style={{
                borderRadius: 8,
                border: "1px dashed var(--mantine-color-gray-3)",
              }}
            >
              <Text c="dimmed">
                Nobody has booked tickets for this event yet.
              </Text>
            </Center>
          )}

          {bookings && bookings.length > 0 && (
            <Card withBorder radius="md" p={0}>
              <Table
                striped
                highlightOnHover
                verticalSpacing="sm"
                horizontalSpacing="md"
              >
                <Table.Thead bg="var(--mantine-color-gray-1)">
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Tickets</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Purchased On</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody bg="white">
                  {bookings.map((booking) => {
                    const bookingId = booking.id || booking._id || "";
                    return (
                      <Table.Tr key={bookingId}>
                        <Table.Td>
                          <Text fw={500} size="sm">
                            {booking.user?.name || "Unknown User"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {booking.user?.email || "No email"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="dot" color="blue">
                            {booking.ticketsCount} Ticket
                            {booking.ticketsCount > 1 ? "s" : ""}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              booking.status === "CONFIRMED"
                                ? "green"
                                : booking.status === "CANCELLED"
                                  ? "red"
                                  : "orange"
                            }
                            variant="light"
                          >
                            {booking.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {booking.createdAt
                              ? new Date(booking.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "N/A"}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Card>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default memo(MyEventCard);
