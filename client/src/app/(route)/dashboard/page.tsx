"use client";

import DashboardCard from "@/components/ui/dashboard-card/DashboardCard";
import { InfiniteScrollList } from "@/components/ui/infinite-list/InfiniteScrollList";
import {
  EventEntity,
  EventsDocument,
  EventTimeline,
  SortOrder,
} from "@/generated/graphql";
import { useSearchParameterFilter } from "@/hooks/common/useSearchParameterFilter";
import { useAppSelector } from "@/store/hooks";
import { useQuery } from "@apollo/client/react";
import {
  Button,
  Container,
  Group,
  Menu,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiCheck, FiFilter, FiPlus, FiSearch } from "react-icons/fi";

type TTimeline = "upcoming" | "ongoing" | "past";
type TSortOrder = "asc" | "desc";

const PAGE_LIMIT = 6;

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [page, setPage] = useState(1);

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
        limit: PAGE_LIMIT,
        page: 1,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  const events = useMemo(() => {
    return data?.events.data || [];
  }, [data]);

  const fetchNextPage = async () => {
    if (!data?.events.meta.hasNextPage) return;

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
          limit: PAGE_LIMIT,
          page: page + 1,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.events.data.length === 0)
          return prev;
        return Object.assign({}, prev, {
          events: {
            ...fetchMoreResult.events,
            data: [...prev.events.data, ...fetchMoreResult.events.data],
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
          hasNextPage={data?.events.meta?.hasNextPage ?? false}
          isFetchingNextPage={networkStatus === 3}
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
