"use client";
import React from "react";
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
import { useInfiniteMyEventsQuery } from "@/hooks/events/query/useInfiniteMyEventsQuery";
import { EventItem } from "@/hooks/events/types";
import { InfiniteScrollList } from "@/components/ui/infinite-list/InfiniteScrollList";
import MyEventCard from "@/components/ui/my-event-card/MyEventCard";

export default function MyEventsPage() {
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMyEventsQuery({ limit: 10 });

  const events = React.useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

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

        <InfiniteScrollList<EventItem>
          items={events}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          emptyMessage="You haven't created any events yet."
          renderItem={(event) => {
            const eventId = event.id || event._id || "";
            return <MyEventCard event={event} key={eventId} />;
          }}
        />
      </Stack>
    </Container>
  );
}
