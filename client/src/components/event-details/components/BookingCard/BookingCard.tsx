"use client";
import { CreateBookingDocument, MyBookingsDocument } from "@/generated/graphql";
import { useAppSelector } from "@/store/hooks";
import { useMutation } from "@apollo/client/react";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import React, { memo, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi2";

interface IProps {
  price: number;
  userId: string;
  startDate: Date;
  endDate: Date;
  availableSeats: number;
  registeredCount: number;
  eventId: string;
}

const BookingCard = ({
  availableSeats,
  registeredCount,
  price,
  userId,
  endDate,
  startDate,
  eventId,
}: IProps) => {
  const user = useAppSelector((state) => state.user);
  const router = useRouter();

  const [ticketCount, setTicketCount] = useState<number | string>(1);
  const [createBooking, { loading: isBookingLoading }] = useMutation(
    CreateBookingDocument,
  );

  const seatsLeft = availableSeats - (registeredCount || 0);
  const isSoldOut = seatsLeft <= 0;
  const isOrganizer = !!user.id && user.id === userId;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const isUpcoming = start > now;
  const isStarted = start <= now && end > now;
  const isEnded = end <= now;

  const showMessage = getMessageAndColor({
    isOrganizer: isOrganizer,
    isEnded,
    isStarted,
    isSoldOut,
  });

  const count = Number(ticketCount) || 1;
  const totalPrice = count * price;

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
          Are you sure you want to book <strong>{count} ticket(s)</strong>? This
          will cost <strong>${totalPrice}</strong>.
        </Text>
      ),
      labels: { confirm: "Confirm Booking", cancel: "Cancel" },
      confirmProps: { color: "blue" },
      onConfirm: () => {
        createBooking({
          variables: {
            data: {
              eventId: eventId,
              ticketsCount: count,
            },
          },
          refetchQueries: [MyBookingsDocument],
          onCompleted: () => {
            notifications.show({
              title: "Booking Confirmed!",
              message: `You have successfully booked ${count} ticket(s)".`,
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
        });
      },
    });
  };
  return (
    <Stack
      gap="md"
      style={{ position: "sticky", top: 100, alignSelf: "flex-start" }}
    >
      <Card
        withBorder
        shadow="md"
        radius="lg"
        p={0}
        style={{ overflow: "hidden" }}
      >
        <Box
          p="lg"
          bg="blue.0"
          style={{
            borderBottom: "1px solid var(--mantine-color-gray-3)",
          }}
        >
          <Title order={3} fw={700} c="blue.9">
            Reserve Your Spot
          </Title>
          <Text size="sm" c="blue.8" mt={4}>
            Join this amazing event before it sells out.
          </Text>
        </Box>

        <Stack gap="sm" p="md">
          <Group justify="space-between" align="flex-end">
            <Text size="sm" c="dimmed" fw={600}>
              Price per ticket
            </Text>
            <Text fw={800} size="xl" c="dark">
              {price > 0 ? `$${price}` : "Free"}
            </Text>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed" fw={600}>
              Availability
            </Text>
            <Badge color={isSoldOut ? "red" : "green"} variant="dot" size="lg">
              {isSoldOut ? "Sold Out" : `${seatsLeft} Available`}
            </Badge>
          </Group>

          {showMessage ? (
            <Paper
              p="md"
              withBorder
              radius="md"
              bg="red.0"
              style={{ borderColor: "var(--mantine-color-red-2)" }}
            >
              <Group gap="sm" align="flex-start" wrap="nowrap">
                <FiAlertCircle
                  size={20}
                  color={showMessage.color}
                  style={{ marginTop: 2 }}
                />
                <Text size="sm" c={showMessage.color} fw={500} lh={1.4}>
                  {showMessage.message}
                </Text>
              </Group>
            </Paper>
          ) : (
            <>
              <Divider my="xs" variant="dashed" />

              <NumberInput
                label="Select Ticket Quantity"
                description={`Max ${seatsLeft} tickets allowed`}
                value={ticketCount}
                onChange={(val) => setTicketCount(val)}
                min={1}
                max={seatsLeft}
                step={1}
                size="sm"
                radius="md"
              />

              <Group justify="space-between">
                <Text fw={600}>Total Amount</Text>
                <Text fw={800} fz="xl" c="blue.6">
                  ${totalPrice}
                </Text>
              </Group>
            </>
          )}

          <Button
            fullWidth
            size="md"
            radius="md"
            color={isSoldOut || isEnded || isOrganizer ? "gray" : "blue"}
            variant={isSoldOut || isEnded || isOrganizer ? "light" : "filled"}
            leftSection={
              !isSoldOut && !isOrganizer && isUpcoming ? (
                <HiOutlineTicket size={20} />
              ) : undefined
            }
            disabled={isSoldOut || isOrganizer || !isUpcoming}
            loading={isBookingLoading}
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
  );
};

export default memo(BookingCard);

const getMessageAndColor = ({
  isOrganizer,
  isEnded,
  isStarted,
  isSoldOut,
}: {
  isOrganizer: boolean;
  isEnded: boolean;
  isStarted: boolean;
  isSoldOut: boolean;
}) => {
  if (isOrganizer) {
    return {
      message:
        "You are the organizer of this event. You cannot book tickets for your own event.",
      color: "var(--mantine-color-blue-8)",
    };
  }
  if (isEnded) {
    return {
      message: "This event has already ended. Bookings are closed.",
      color: "var(--mantine-color-gray-8)",
    };
  }
  if (isStarted) {
    return {
      message:
        "This event has already started. You can only book tickets for upcoming events.",
      color: "var(--mantine-color-yellow-8)",
    };
  }
  if (isSoldOut) {
    return {
      message: "All seats have been reserved. This event is sold out.",
      color: "var(--mantine-color-red-8)",
    };
  }

  return null;
};
