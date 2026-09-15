"use client";

import React, { useMemo } from "react";
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
import { useInfiniteEventsQuery } from "@/hooks/events/query/useInfiniteEventsQuery";
import { FiPlus, FiSearch, FiFilter, FiCheck } from "react-icons/fi";
import DashboardCard from "@/components/ui/dashboard-card/DashboardCard";
import { InfiniteScrollList } from "@/components/ui/infinite-list/InfiniteScrollList";
import { EventItem } from "@/hooks/events/types";
import { useSearchParameterFilter } from "@/hooks/common/useSearchParameterFilter";
import { useDebouncedValue } from "@mantine/hooks";

type TTimeline = "upcoming" | "ongoing" | "past";
type TSortOrder = "asc" | "desc";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

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
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteEventsQuery({
    search: debouncedSearch || undefined,
    isFree: filters.isFree || undefined,
    sortBy: filters.sortBy || undefined,
    sortOrder: filters.sortOrder || undefined,
    timeline: filters.timeline,
    limit: 9,
  });

  const events = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

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
            onChange={(e) => updateFilter({ search: e.currentTarget.value })}
            style={{ flex: 1, minWidth: 250 }}
          />
          <Group>
            <Select
              value={filters.timeline}
              onChange={(v) => updateFilter({ timeline: v as TTimeline })}
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
              onChange={(e) =>
                updateFilter({ isFree: e.currentTarget.checked })
              }
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
                  onClick={() =>
                    updateFilter({ sortBy: "price", sortOrder: "asc" })
                  }
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
                  onClick={() =>
                    updateFilter({ sortBy: "price", sortOrder: "desc" })
                  }
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
                  onClick={() =>
                    updateFilter({ sortBy: "startDate", sortOrder: "desc" })
                  }
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
                  onClick={() =>
                    updateFilter({ sortBy: "startDate", sortOrder: "asc" })
                  }
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

            <Button variant="filled" color="gray" onClick={resetFilters}>
              Reset
            </Button>
          </Group>
        </Group>

        {/* All Events Section */}
        <InfiniteScrollList<EventItem>
          items={events}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          emptyMessage="No events found matching your criteria."
          gridComponent={SimpleGrid}
          gridProps={{ cols: { base: 1, sm: 2, lg: 3 }, spacing: "lg" }}
          renderItem={(event) => {
            const eventId = event.id || event._id || "";
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
