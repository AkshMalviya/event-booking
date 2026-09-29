"use client";
import { InfiniteScrollList } from "@/components/ui/infinite-list/InfiniteScrollList";
import MyEventCard from "@/components/ui/my-event-card/MyEventCard";
import { EventEntity, MyEventsDocument } from "@/generated/graphql";
import { useQuery } from "@apollo/client/react";
import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";

export default function MyEventsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

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

  const events = useMemo(() => {
    return data?.myEvents.data || [];
  }, [data]);

  const fetchNextPage = async () => {
    if (!data?.myEvents.meta.hasNextPage) return;

    await fetchMore({
      variables: {
        query: { limit: 10, page: page + 1 },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.myEvents.data.length === 0)
          return prev;
        return Object.assign({}, prev, {
          myEvents: {
            ...fetchMoreResult.myEvents,
            data: [...prev.myEvents.data, ...fetchMoreResult.myEvents.data],
          },
        });
      },
    });
    setPage((p) => p + 1);
  };

  if (error) {
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
          hasNextPage={data?.myEvents.meta?.hasNextPage ?? false}
          isFetchingNextPage={networkStatus === 3}
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
