"use client";
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Group,
  SimpleGrid,
  Paper,
  SegmentedControl,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import React from "react";
import { useInfiniteMyBookingsQuery } from "@/hooks/bookings/query/useInfiniteMyBookingsQuery";
import { useCancelBookingMutation } from "@/hooks/bookings/mutation/useCancelBookingMutation";
import { BookingItem } from "@/hooks/bookings/types";
import BookingCard from "@/components/ui/booking-card/BookingCard";
import { InfiniteScrollList } from "@/components/ui/infinite-list/InfiniteScrollList";
import { useSearchParameterFilter } from "@/hooks/common/useSearchParameterFilter";

type TFilter = "all" | "ongoing" | "upcoming" | "past";

export default function BookingsPage() {
  const { filters, updateFilter } = useSearchParameterFilter({
    filter: "all" as TFilter,
  });

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMyBookingsQuery({ filter: filters.filter, limit: 9 });

  const bookings = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const cancelBookingMutation = useCancelBookingMutation();

  const handleCancelBooking = (booking: BookingItem) => {
    const bookingId = (booking.id || booking._id) as string;

    modals.openConfirmModal({
      title: "Cancel Booking",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to cancel this booking for{" "}
          <strong>{booking.ticketsCount} ticket(s)</strong>? This action cannot
          be undone.
        </Text>
      ),
      labels: { confirm: "Yes, Cancel Booking", cancel: "Keep Booking" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        cancelBookingMutation.mutate(bookingId, {
          onSuccess: () => {
            notifications.show({
              title: "Booking Cancelled",
              message: "Your booking has been cancelled successfully.",
              color: "green",
            });
          },
          onError: (err) => {
            notifications.show({
              title: "Cancellation Failed",
              message: err.message || "Could not cancel booking.",
              color: "red",
            });
          },
        });
      },
    });
  };

  if (isError) {
    return (
      <Paper p="xl" withBorder radius="md" ta="center">
        <Text c="red" fw={500} mb="sm">
          Failed to load bookings.
        </Text>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </Paper>
    );
  }
  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Title order={2} fw={700}>
              My Bookings
            </Title>
            <Text size="sm" c="dimmed">
              View and manage all your reserved tickets
            </Text>
          </Stack>
        </Group>

        <SegmentedControl
          value={filters.filter}
          onChange={(val) => updateFilter({ filter: val })}
          data={[
            { label: "All Bookings", value: "all" },
            { label: "Ongoing", value: "ongoing" },
            { label: "Upcoming", value: "upcoming" },
            { label: "Past", value: "past" },
          ]}
          size="md"
          color="blue"
          radius="lg"
        />

        <InfiniteScrollList<BookingItem>
          items={bookings}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          emptyMessage={`No ${filters.filter === "all" ? "" : filters.filter} bookings found.`}
          gridComponent={SimpleGrid}
          gridProps={{ cols: { base: 1, sm: 2, lg: 3 }, spacing: "lg" }}
          renderItem={(booking) => {
            const bookingId = (booking.id || booking._id) as string;
            return (
              <BookingCard
                booking={booking}
                key={bookingId}
                onCancel={() => handleCancelBooking(booking)}
                cancelLoading={
                  cancelBookingMutation.isPending &&
                  cancelBookingMutation.variables === bookingId
                }
              />
            );
          }}
        />
      </Stack>
    </Container>
  );
}
