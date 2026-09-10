import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import React, { memo } from "react";
import { useRouter } from "next/navigation";
import { FiCalendar, FiClock, FiDollarSign, FiXCircle } from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi2";
import { BookingItem } from "@/hooks/bookings/types";
import { getImageUrl } from "@/utils/getImagePath";

interface IProps {
  booking: BookingItem;
  onCancel: () => void;
  cancelLoading: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "green";
    case "CANCELLED":
      return "red";
    case "PENDING":
      return "yellow";
    default:
      return "gray";
  }
};

const BookingCard = ({ booking, onCancel, cancelLoading }: IProps) => {
  const router = useRouter();
  const bookingId = booking.id || booking._id || "";
  const isCancelled = booking.status === "CANCELLED";
  const event = booking.event;
  const eventSlug = event?.slug || booking.eventId;
  const eventTitle = event?.title || "Event Details";
  const imageUrl = getImageUrl(event?.image);

  const handleNavigateToEvent = () => {
    if (eventSlug) {
      router.push(`/event/${eventSlug}`);
    }
  };

  return (
    <Card
      key={bookingId}
      shadow="sm"
      padding="lg"
      radius="md"
      pt={0}
      withBorder
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <Stack gap="sm">
        {/* Clickable Event Image Banner */}
        <Card.Section
          onClick={handleNavigateToEvent}
          style={{
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
          title="Click to view event details"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              height={160}
              alt={eventTitle}
              fallbackSrc="https://placehold.co/600x400?text=Event+Banner"
              style={{
                transition: "transform 0.2s ease",
              }}
            />
          ) : (
            <Box
              h={140}
              style={{
                background: "linear-gradient(135deg, #1c7ed6 0%, #22b8cf 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
              }}
            >
              <Text c="white" fw={700} fz="lg" ta="center" lineClamp={2}>
                {eventTitle}
              </Text>
            </Box>
          )}
        </Card.Section>

        {/* Title and Status */}
        <Group justify="space-between" align="flex-start" mt="xs" wrap="nowrap">
          <Title
            order={4}
            fw={600}
            lineClamp={1}
            style={{ flex: 1, cursor: "pointer" }}
            onClick={handleNavigateToEvent}
            title={eventTitle}
          >
            {eventTitle}
          </Title>
          <Badge
            color={getStatusColor(booking.status)}
            variant="light"
            size="md"
            style={{ flexShrink: 0 }}
          >
            {booking.status}
          </Badge>
        </Group>

        {/* Event Date (if available) */}
        {event?.startDate && (
          <Group gap={6}>
            <FiCalendar size={13} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {new Date(event.startDate).toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </Group>
        )}

        <Divider my={2} />

        {/* Booking Details */}
        <Group justify="space-between">
          <Text size="xs" c="dimmed" fw={600}>
            Booking ID:
          </Text>
          <Text size="xs" c="dimmed" fw={600} ff="monospace">
            #{bookingId.slice(-8).toUpperCase()}
          </Text>
        </Group>

        <Group justify="space-between">
          <Group gap={6}>
            <HiOutlineTicket size={16} color="var(--mantine-color-dimmed)" />
            <Text size="sm" c="dimmed">
              Tickets:
            </Text>
          </Group>
          <Text size="sm" fw={600}>
            {booking.ticketsCount}
          </Text>
        </Group>

        <Group justify="space-between">
          <Group gap={6}>
            <FiDollarSign size={16} color="var(--mantine-color-dimmed)" />
            <Text size="sm" c="dimmed">
              Total Paid:
            </Text>
          </Group>
          <Text size="md" fw={700} c="blue">
            ${booking.totalPrice}
          </Text>
        </Group>

        {booking.createdAt && (
          <Group justify="space-between">
            <Group gap={6}>
              <FiClock size={14} color="var(--mantine-color-dimmed)" />
              <Text size="xs" c="dimmed">
                Booked on:
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {new Date(booking.createdAt).toLocaleDateString()}
            </Text>
          </Group>
        )}
      </Stack>

      <Box mt="md">
        {!isCancelled ? (
          <Button
            variant="outline"
            color="red"
            fullWidth
            radius="md"
            leftSection={<FiXCircle size={16} />}
            loading={cancelLoading}
            onClick={onCancel}
          >
            Cancel Booking
          </Button>
        ) : (
          <Button variant="light" color="gray" fullWidth radius="md" disabled>
            Booking Cancelled
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default memo(BookingCard);
