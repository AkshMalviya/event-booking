import React, { ReactNode, useEffect } from "react";
import {
  Center,
  Loader,
  Text,
  Paper,
  Stack,
  SimpleGridProps,
} from "@mantine/core";
import { useIntersection } from "@mantine/hooks";

interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  isLoading: boolean;
  emptyMessage?: string;
  gridComponent?: React.ElementType;
  gridProps?: SimpleGridProps;
}

export function InfiniteScrollList<T>({
  items,
  renderItem,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  emptyMessage = "No items found.",
  gridComponent: GridComponent = "div",
  gridProps = {},
}: Readonly<InfiniteScrollListProps<T>>) {
  const { ref, entry } = useIntersection({
    threshold: 0.1,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && items.length === 0) {
    return (
      <Center py="xl" style={{ minHeight: 250 }}>
        <Loader size="md" />
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <Paper p="xl" withBorder radius="md" ta="center" py={50}>
        <Stack align="center" gap="md">
          <Text fw={600} size="lg">
            {emptyMessage}
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <GridComponent {...gridProps}>
        {items.map((item, i) => renderItem(item, i))}
      </GridComponent>

      {hasNextPage && (
        <Center ref={ref} py="md">
          {isFetchingNextPage ? (
            <Loader size="sm" />
          ) : (
            <div style={{ height: 1 }} />
          )}
        </Center>
      )}

      {!hasNextPage && items.length > 0 && (
        <Center py="md">
          <Text size="sm" c="dimmed">
            You have reached the end of the list.
          </Text>
        </Center>
      )}
    </div>
  );
}
