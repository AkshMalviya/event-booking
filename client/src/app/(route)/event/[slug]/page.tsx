"use client";
import React, { useState } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Badge,
  Button,
  Group,
  SimpleGrid,
  Center,
  Loader,
  Paper,
  Image,
  Box,
  NumberInput,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useEventBySlugQuery } from "@/hooks/events/query/useEventBySlugQuery";
import { useCreateBookingMutation } from "@/hooks/bookings/mutation/useCreateBookingMutation";
import { API_BASE_URL } from "@/hooks/api-urls";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUsers,
  FiInfo,
  FiAlertTriangle,
  FiAlertCircle,
  FiSlash,
} from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi2";

export default function EventDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  const {
    data: event,
    isLoading,
    isError,
    refetch,
  } = useEventBySlugQuery(slug);
  const createBookingMutation = useCreateBookingMutation();

  const [ticketCount, setTicketCount] = useState<number | string>(1);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  if (isLoading) {
    return (
      <Center py={80}>
        <Stack align="center" gap="sm">
          <Loader size="lg" />
        </Stack>
      </Center>
    );
  }

  if (isError || !event) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder radius="md" ta="center">
          <Title order={3} c="red" mb="xs">
            Event Not Found
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            The event you are looking for does not exist or may have been
            removed.
          </Text>
          <Group justify="center">
            <Button variant="default" onClick={() => router.push("/dashboard")}>
              Back to All Events
            </Button>
            <Button onClick={() => refetch()}>Retry</Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  const seatsLeft = event.availableSeats - (event.registeredCount || 0);
  const isSoldOut = seatsLeft <= 0;
  const isOrganizer = !!user.id && user.id === event.userId;

  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isUpcoming = startDate > now;
  const isStarted = startDate <= now && endDate > now;
  const isEnded = endDate <= now;

  const imageUrl = getImageUrl(event.image);
  const count = Number(ticketCount) || 1;
  const totalPrice = count * event.price;

  const handleBookTickets = () => {
    if (isOrganizer) {
      notifications.show({
        title: "Booking Restricted",
        message: "You cannot book tickets for your own event.",
        color: "orange",
      });
      return;
    }

    if (isEnded) {
      notifications.show({
        title: "Booking Closed",
        message: "This event has already ended. Bookings are closed.",
        color: "red",
      });
      return;
    }

    if (isStarted || !isUpcoming) {
      notifications.show({
        title: "Booking Closed",
        message:
          "This event has already started. You can only book tickets for upcoming events.",
        color: "orange",
      });
      return;
    }

    modals.openConfirmModal({
      title: "Confirm Your Booking",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to book <strong>{count} ticket(s)</strong> for{" "}
          <strong>{event.title}</strong>? This will cost{" "}
          <strong>${totalPrice}</strong>.
        </Text>
      ),
      labels: { confirm: "Confirm Booking", cancel: "Cancel" },
      confirmProps: { color: "blue" },
      onConfirm: () => {
        createBookingMutation.mutate(
          {
            eventId: event.id || event._id || "",
            ticketsCount: count,
          },
          {
            onSuccess: () => {
              notifications.show({
                title: "Booking Confirmed!",
                message: `You have successfully booked ${count} ticket(s) for "${event.title}".`,
                color: "green",
              });
              router.push("/bookings");
            },
            onError: (err) => {
              notifications.show({
                title: "Booking Failed",
                message:
                  err.message || "Failed to book tickets. Please try again.",
                color: "red",
              });
            },
          },
        );
      },
    });
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Back navigation */}
        <Group>
          <Button
            variant="subtle"
            size="sm"
            leftSection={<FiArrowLeft size={16} />}
            onClick={() => router.push("/dashboard")}
          >
            Back to All Events
          </Button>
        </Group>

        {/* Hero Event Banner Image */}
        {imageUrl ? (
          <Paper radius="md" style={{ overflow: "hidden" }} shadow="sm">
            <Image
              src={imageUrl}
              height={320}
              alt={event.title}
              fallbackSrc="https://placehold.co/1200x400?text=Event+Banner"
            />
          </Paper>
        ) : (
          <Box
            h={220}
            style={{
              borderRadius: 12,
              background: "linear-gradient(135deg, #1c7ed6 0%, #22b8cf 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Title c="white" order={1} ta="center" px="md">
              {event.title}
            </Title>
          </Box>
        )}

        {/* Event Content Grid */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {/* Main Info Column */}
          <Stack gap="lg" style={{ gridColumn: "span 2" }}>
            <div>
              <Group justify="space-between" align="flex-start">
                <Title order={1} fw={700}>
                  {event.title}
                </Title>
                <Badge
                  color={isSoldOut ? "red" : "blue"}
                  variant="light"
                  size="xl"
                >
                  {event.price > 0 ? `$${event.price}` : "Free"}
                </Badge>
              </Group>

              {event.tags && event.tags.length > 0 && (
                <Group gap="xs" mt="sm">
                  {event.tags.map((tag) => (
                    <Badge key={tag} size="sm" variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              )}
            </div>

            <Divider />

            {/* Event Dates and Logistics */}
            <Card withBorder radius="md" p="md">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <div>
                  <Group gap={6} mb={2}>
                    <FiCalendar size={14} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Start Date & Time
                    </Text>
                  </Group>
                  <Text fw={600} size="sm">
                    {new Date(event.startDate).toLocaleString()}
                  </Text>
                </div>
                <div>
                  <Group gap={6} mb={2}>
                    <FiClock size={14} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      End Date & Time
                    </Text>
                  </Group>
                  <Text fw={600} size="sm">
                    {new Date(event.endDate).toLocaleString()}
                  </Text>
                </div>
                <div>
                  <Group gap={6} mb={2}>
                    <FiUsers size={14} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Available Capacity
                    </Text>
                  </Group>
                  <Text fw={600} size="sm">
                    {event.availableSeats} total seats
                  </Text>
                </div>
                <div>
                  <Group gap={6} mb={2}>
                    <HiOutlineTicket
                      size={14}
                      color="var(--mantine-color-dimmed)"
                    />
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Seats Left
                    </Text>
                  </Group>
                  <Text
                    fw={600}
                    size="sm"
                    c={isSoldOut ? "red" : seatsLeft <= 5 ? "orange" : "teal"}
                  >
                    {isSoldOut ? "Sold Out" : `${seatsLeft} seats remaining`}
                  </Text>
                </div>
              </SimpleGrid>
            </Card>

            {/* Event Description */}
            <Stack gap="xs">
              <Title order={3} fw={600}>
                About This Event
              </Title>
              <Text style={{ whiteSpace: "pre-line" }} c="dimmed" lh={1.7}>
                {event.description}
              </Text>
            </Stack>
          </Stack>

          {/* Booking Side Panel */}
          <Stack gap="md">
            <Card withBorder shadow="sm" radius="md" p="xl">
              <Stack gap="md">
                <Title order={3} fw={700}>
                  Book Tickets
                </Title>
                <Divider />

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Price per ticket
                  </Text>
                  <Text fw={600}>
                    {event.price > 0 ? `$${event.price}` : "Free"}
                  </Text>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Availability
                  </Text>
                  <Badge
                    color={isSoldOut ? "red" : "green"}
                    variant="light"
                    size="sm"
                  >
                    {isSoldOut ? "Sold Out" : `${seatsLeft} available`}
                  </Badge>
                </Group>

                {isOrganizer ? (
                  <Paper p="sm" withBorder radius="md" bg="blue.0">
                    <Group gap="xs" align="center">
                      <FiInfo size={16} color="var(--mantine-color-blue-8)" />
                      <Text size="xs" c="blue.9" fw={500}>
                        You are the organizer of this event. You cannot book
                        tickets for your own event.
                      </Text>
                    </Group>
                  </Paper>
                ) : isEnded ? (
                  <Paper p="sm" withBorder radius="md" bg="gray.1">
                    <Group gap="xs" align="center">
                      <FiSlash size={16} color="var(--mantine-color-gray-8)" />
                      <Text size="xs" c="gray.8" fw={500}>
                        This event has already ended. Bookings are closed.
                      </Text>
                    </Group>
                  </Paper>
                ) : isStarted ? (
                  <Paper p="sm" withBorder radius="md" bg="yellow.0">
                    <Group gap="xs" align="center">
                      <FiAlertTriangle
                        size={16}
                        color="var(--mantine-color-yellow-8)"
                      />
                      <Text size="xs" c="yellow.9" fw={500}>
                        This event has already started. You can only book
                        tickets for upcoming events.
                      </Text>
                    </Group>
                  </Paper>
                ) : isSoldOut ? (
                  <Paper p="sm" withBorder radius="md" bg="red.0">
                    <Group gap="xs" align="center">
                      <FiAlertCircle
                        size={16}
                        color="var(--mantine-color-red-8)"
                      />
                      <Text size="xs" c="red.9" fw={500}>
                        All seats have been reserved. This event is sold out.
                      </Text>
                    </Group>
                  </Paper>
                ) : (
                  <>
                    <NumberInput
                      label="Select Ticket Quantity"
                      description={`Max ${seatsLeft} tickets`}
                      value={ticketCount}
                      onChange={(val) => setTicketCount(val)}
                      min={1}
                      max={seatsLeft}
                      step={1}
                    />

                    <Divider />

                    <Group justify="space-between">
                      <Text fw={600}>Total Amount</Text>
                      <Text fw={700} fz="xl" c="blue">
                        ${totalPrice}
                      </Text>
                    </Group>
                  </>
                )}

                <Button
                  fullWidth
                  size="md"
                  radius="md"
                  leftSection={
                    !isSoldOut && !isOrganizer && isUpcoming ? (
                      <HiOutlineTicket size={18} />
                    ) : undefined
                  }
                  disabled={isSoldOut || isOrganizer || !isUpcoming}
                  loading={createBookingMutation.isPending}
                  onClick={handleBookTickets}
                >
                  {isEnded
                    ? "Event Ended"
                    : isStarted
                      ? "Event Started"
                      : isSoldOut
                        ? "Sold Out"
                        : "Book Now"}
                </Button>
              </Stack>
            </Card>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
