"use client";
import React, { useMemo } from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Group,
  Paper,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import { useQuery } from "@apollo/client/react";
import { MyEventsDocument, EventEntity } from "@/generated/graphql";
import { InfiniteScrollList } from "@/components/ui/infinite-list/InfiniteScrollList";
import MyEventCard from "@/components/ui/my-event-card/MyEventCard";

export default function MyEventsPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);

  const {
    data,
    loading: isLoading,
    error,
    refetch,
    fetchMore,
    networkStatus,
  } = useQuery(MyEventsDocument, {
    variables: {
      query: { limit: 10, page: 1 },
    },
    notifyOnNetworkStatusChange: true,
  });

  const isError = !!error;
  const isFetchingNextPage = networkStatus === 3;
  const events = data?.myEvents || [];

  const hasNextPage = events.length > 0 && events.length % 10 === 0;

  const fetchNextPage = async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchMore({
      variables: {
        query: { limit: 10, page: page + 1 },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.myEvents.length === 0)
          return prev;
        return Object.assign({}, prev, {
          myEvents: [...prev.myEvents, ...fetchMoreResult.myEvents],
        });
      },
    });
    setPage((p) => p + 1);
  };

  if (isError) {
    return (
      <Paper p="xl" withBorder radius="md" ta="center">
        <Text c="red" fw={500} mb="sm">
          Failed to load your events.
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
        <Group justify="space-between" align="center" wrap="wrap">
          <Stack gap={2}>
            <Title order={2} fw={700}>
              My Events
            </Title>
            <Text size="sm" c="dimmed">
              Manage the events you have organized and view attendees.
            </Text>
          </Stack>

          <Button
            radius="md"
            leftSection={<FiPlus size={16} />}
            onClick={() => router.push("/events/create")}
          >
            Create Event
          </Button>
        </Group>

        <InfiniteScrollList<EventEntity>
          items={events as EventEntity[]}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          emptyMessage="You haven't created any events yet."
          renderItem={(event) => {
            const eventId = event.id || "";
            return <MyEventCard event={event} key={eventId} />;
          }}
        />
      </Stack>
    </Container>
  );
}
