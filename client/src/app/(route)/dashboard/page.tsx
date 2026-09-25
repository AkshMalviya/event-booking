"use client";

import React from "react";
import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Button,
  Group,
  Paper,
  TextInput,
  Switch,
  Menu,
  Select,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useQuery } from "@apollo/client/react";
import {
  EventsDocument,
  EventEntity,
  SortOrder,
  EventTimeline,
} from "@/generated/graphql";
import { FiPlus, FiSearch, FiFilter, FiCheck } from "react-icons/fi";
import DashboardCard from "@/components/ui/dashboard-card/DashboardCard";
import { InfiniteScrollList } from "@/components/ui/infinite-list/InfiniteScrollList";
import { useSearchParameterFilter } from "@/hooks/common/useSearchParameterFilter";
import { useDebouncedValue } from "@mantine/hooks";

type TTimeline = "upcoming" | "ongoing" | "past";
type TSortOrder = "asc" | "desc";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [page, setPage] = React.useState(1);

  const { filters, updateFilter, resetFilters } = useSearchParameterFilter({
    search: "",
    isFree: false,
    sortBy: "startDate",
    sortOrder: "asc" as TSortOrder,
    timeline: "upcoming" as TTimeline,
  });

  const [debouncedSearch] = useDebouncedValue(filters.search, 800);

  const {
    data,
    loading: isLoading,
    error,
    refetch,
    fetchMore,
    networkStatus,
  } = useQuery(EventsDocument, {
    variables: {
      query: {
        search: debouncedSearch || undefined,
        isFree: filters.isFree || undefined,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder === "asc" ? SortOrder.Asc : SortOrder.Desc,
        timeline:
          (filters.timeline?.toUpperCase() as EventTimeline) || undefined,
        limit: 9,
        page: 1,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  const isError = !!error;
  const isFetchingNextPage = networkStatus === 3;
  const events = data?.events || [];

  // Since limit is 9, if the last page returned 9 items, there might be more
  // (In real pagination, the backend should return a total count or hasNextPage)
  const hasNextPage = events.length > 0 && events.length % 9 === 0;

  const fetchNextPage = async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    await fetchMore({
      variables: {
        query: {
          search: debouncedSearch || undefined,
          isFree: filters.isFree || undefined,
          sortBy: filters.sortBy || undefined,
          sortOrder:
            filters.sortOrder === "asc" ? SortOrder.Asc : SortOrder.Desc,
          timeline:
            (filters.timeline?.toUpperCase() as EventTimeline) || undefined,
          limit: 9,
          page: page + 1,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.events.length === 0)
          return prev;
        return Object.assign({}, prev, {
          events: [...prev.events, ...fetchMoreResult.events],
        });
      },
    });
    setPage((p) => p + 1);
  };

  // Removing useEffect for page reset as requested

  if (isError) {
    return (
      <Paper p="xl" withBorder radius="md" ta="center">
        <Text c="red" fw={500} mb="sm">
          Failed to load events.
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
              Hii, {user.name || "Aksh"}
            </Title>
            <Text size="sm" c="dimmed">
              Explore upcoming events and check details
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

        <Group align="center" justify="space-between">
          <TextInput
            placeholder="Search events by title, description, or tags..."
            leftSection={<FiSearch size={16} />}
            value={filters.search}
            onChange={(e) => {
              updateFilter({ search: e.currentTarget.value });
              setPage(1);
            }}
            style={{ flex: 1, minWidth: 250 }}
          />
          <Group>
            <Select
              value={filters.timeline}
              onChange={(v) => {
                updateFilter({ timeline: v as TTimeline });
                setPage(1);
              }}
              data={[
                { value: "upcoming", label: "Upcoming" },
                { value: "ongoing", label: "Ongoing" },
                { value: "past", label: "Past" },
              ]}
              w={120}
              allowDeselect={false}
            />
            <Switch
              label="Free Events Only"
              checked={filters.isFree}
              onChange={(e) => {
                updateFilter({ isFree: e.currentTarget.checked });
                setPage(1);
              }}
            />

            <Menu shadow="md" width={220} position="bottom-end">
              <Menu.Target>
                <Button variant="default" leftSection={<FiFilter size={16} />}>
                  Sort
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Price</Menu.Label>
                <Menu.Item
                  onClick={() => {
                    updateFilter({ sortBy: "price", sortOrder: "asc" });
                    setPage(1);
                  }}
                  rightSection={
                    filters.sortBy === "price" &&
                    filters.sortOrder === "asc" ? (
                      <FiCheck size={14} />
                    ) : null
                  }
                >
                  Low to High
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    updateFilter({ sortBy: "price", sortOrder: "desc" });
                    setPage(1);
                  }}
                  rightSection={
                    filters.sortBy === "price" &&
                    filters.sortOrder === "desc" ? (
                      <FiCheck size={14} />
                    ) : null
                  }
                >
                  High to Low
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>Date</Menu.Label>
                <Menu.Item
                  onClick={() => {
                    updateFilter({ sortBy: "startDate", sortOrder: "desc" });
                    setPage(1);
                  }}
                  rightSection={
                    filters.sortBy === "startDate" &&
                    filters.sortOrder === "desc" ? (
                      <FiCheck size={14} />
                    ) : null
                  }
                >
                  New to Old
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    updateFilter({ sortBy: "startDate", sortOrder: "asc" });
                    setPage(1);
                  }}
                  rightSection={
                    filters.sortBy === "startDate" &&
                    filters.sortOrder === "asc" ? (
                      <FiCheck size={14} />
                    ) : null
                  }
                >
                  Old to New
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Button
              variant="filled"
              color="gray"
              onClick={() => {
                resetFilters();
                setPage(1);
              }}
            >
              Reset
            </Button>
          </Group>
        </Group>

        {/* All Events Section */}
        <InfiniteScrollList<EventEntity>
          items={events}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          emptyMessage="No events found matching your criteria."
          gridComponent={SimpleGrid}
          gridProps={{ cols: { base: 1, sm: 2, lg: 3 }, spacing: "lg" }}
          renderItem={(event) => {
            const eventId = event.id || "";
            const eventSlug = event.slug || eventId;
            return (
              <DashboardCard
                event={event}
                key={eventId}
                onViewClick={() => {
                  router.push(`/event/${eventSlug}`);
                }}
              />
            );
          }}
        />
      </Stack>
    </Container>
  );
}
