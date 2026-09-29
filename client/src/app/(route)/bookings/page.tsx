"use client";
import BookingCard from "@/components/ui/booking-card/BookingCard";
import { InfiniteScrollList } from "@/components/ui/infinite-list/InfiniteScrollList";
import {
  BookingEntity,
  BookingTimelineFilter,
  CancelBookingDocument,
  MyBookingsDocument,
} from "@/generated/graphql";
import { useSearchParameterFilter } from "@/hooks/common/useSearchParameterFilter";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  Button,
  Container,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useMemo, useState } from "react";

export default function BookingsPage() {
  const { filters, updateFilter } = useSearchParameterFilter({
    filter: "all" as string,
  });

  const [page, setPage] = useState(1);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const {
    data,
    loading: isLoading,
    error,
    refetch,
    fetchMore,
    networkStatus,
  } = useQuery(MyBookingsDocument, {
    variables: {
      query: {
        filter:
          filters.filter !== "all"
            ? (filters.filter.toUpperCase() as BookingTimelineFilter)
            : undefined,
        limit: 9,
        page: 1,
      },
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const bookings = useMemo(() => {
    return data?.myBookings.data || [];
  }, [data]);

  const fetchNextPage = async () => {
    if (!data?.myBookings.meta.hasNextPage) return;

    await fetchMore({
      variables: {
        query: {
          filter:
            filters.filter !== "all"
              ? (filters.filter.toUpperCase() as BookingTimelineFilter)
              : undefined,
          limit: 9,
          page: page + 1,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.myBookings.data.length === 0)
          return prev;
        return Object.assign({}, prev, {
          myBookings: {
            ...fetchMoreResult.myBookings,
            data: [...prev.myBookings.data, ...fetchMoreResult.myBookings.data],
          },
        });
      },
    });
    setPage((p) => p + 1);
  };

  const [cancelBooking] = useMutation(CancelBookingDocument);

  const handleCancelBooking = (booking: BookingEntity) => {
    const bookingId = booking.id as string;

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
        setCancelingId(bookingId);
        cancelBooking({
          variables: { id: bookingId },
          onCompleted: () => {
            notifications.show({
              title: "Booking Cancelled",
              message: "Your booking has been cancelled successfully.",
              color: "green",
            });
            refetch();
            setCancelingId(null);
          },
          onError: (err) => {
            notifications.show({
              title: "Cancellation Failed",
              message: err.message || "Could not cancel booking.",
              color: "red",
            });
            setCancelingId(null);
          },
        });
      },
    });
  };

  if (error) {
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
          onChange={(val) => {
            updateFilter({ filter: val });
            setPage(1);
          }}
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

        <InfiniteScrollList<BookingEntity>
          items={bookings as BookingEntity[]}
          isLoading={isLoading}
          hasNextPage={data?.myBookings.meta?.hasNextPage ?? false}
          isFetchingNextPage={networkStatus === 3}
          fetchNextPage={fetchNextPage}
          emptyMessage={`No ${filters.filter === "all" ? "" : filters.filter} bookings found.`}
          gridComponent={SimpleGrid}
          gridProps={{ cols: { base: 1, sm: 2, lg: 3 }, spacing: "lg" }}
          renderItem={(booking) => {
            const bookingId = booking.id as string;
            return (
              <BookingCard
                booking={booking}
                key={bookingId}
                onCancel={() => handleCancelBooking(booking)}
                cancelLoading={cancelingId === bookingId}
              />
            );
          }}
        />
      </Stack>
    </Container>
  );
}
