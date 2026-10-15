"use client";

import React, { useState, useMemo, memo } from "react";
import {
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Badge,
  Button,
  TextInput,
  Loader,
} from "@mantine/core";
import { useQuery } from "@apollo/client/react";
import { ChatHistoryDocument, ChatHistoryItem } from "@/generated/graphql";
import {
  RiChat3Line,
  RiAddLine,
  RiSearchLine,
  RiHistoryLine,
  RiCloseLine,
} from "react-icons/ri";
import classes from "./ChatHistory.module.scss";

interface ChatHistoryProps {
  currentConversationId: string | null;
  onSelectConversation: (item: {
    conversationId: string;
    title: string;
  }) => void;
  onNewChat: () => void;
}

const formatDate = (val?: string | number | Date | null) => {
  if (!val) return "";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const ChatHistory: React.FC<ChatHistoryProps> = ({
  currentConversationId,
  onSelectConversation,
  onNewChat,
}) => {
  const [search, setSearch] = useState("");

  const { data, loading } = useQuery(ChatHistoryDocument, {
    fetchPolicy: "cache-first",
  });

  const historyList = useMemo(() => {
    const items: ChatHistoryItem[] = data?.chatHistory ?? [];
    if (!search.trim()) return items;
    const query = search.toLowerCase();
    return items.filter((item) => item.title?.toLowerCase().includes(query));
  }, [data?.chatHistory, search]);

  const totalCount = data?.chatHistory?.length ?? 0;

  return (
    <div className={classes.historyWrapper}>
      {totalCount > 0 && (
        <div className={classes.searchSection}>
          <TextInput
            placeholder="Search conversations..."
            size="xs"
            radius="md"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<RiSearchLine size={14} />}
            rightSection={
              search ? (
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <RiCloseLine size={12} />
                </ActionIcon>
              ) : null
            }
          />
        </div>
      )}

      {loading && !data?.chatHistory?.length ? (
        <div className={classes.loadingContainer}>
          <Loader size="sm" type="dots" />
          <Text size="xs" c="dimmed">
            Loading conversations...
          </Text>
        </div>
      ) : totalCount === 0 ? (
        <EmptyState onNewChat={onNewChat} />
      ) : historyList.length === 0 ? (
        <div className={classes.emptyState}>
          <Text size="sm" fw={500} c="dimmed">
            No matching conversations
          </Text>
          <Text size="xs" c="dimmed">
            Try a different search term
          </Text>
          <Button
            size="xs"
            variant="subtle"
            onClick={() => setSearch("")}
            mt="xs"
          >
            Clear Filter
          </Button>
        </div>
      ) : (
        <div className={classes.historyList}>
          {historyList.map((item) => {
            const isActive = item.conversationId === currentConversationId;
            return (
              <div
                key={item.conversationId}
                className={`${classes.historyCard} ${
                  isActive ? classes.historyCardActive : ""
                }`}
                onClick={() =>
                  onSelectConversation({
                    conversationId: item.conversationId,
                    title: item.title,
                  })
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectConversation({
                      conversationId: item.conversationId,
                      title: item.title,
                    });
                  }
                }}
              >
                <div className={classes.historyCardHeader}>
                  <Group gap={8} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                    <RiChat3Line
                      size={16}
                      className={
                        isActive
                          ? classes.historyIconActive
                          : classes.historyIcon
                      }
                    />
                    <Tooltip
                      label={item.title}
                      position="top-start"
                      disabled={item.title.length < 32}
                      multiline
                      w={280}
                      zIndex={1000}
                    >
                      <Text
                        size="sm"
                        fw={isActive ? 600 : 500}
                        className={classes.historyTitle}
                      >
                        {item.title}
                      </Text>
                    </Tooltip>
                  </Group>

                  {isActive && (
                    <Badge size="xs" variant="filled" color="blue">
                      Active
                    </Badge>
                  )}
                </div>

                <div className={classes.historyCardFooter}>
                  <div className={classes.timeGroup}>
                    <Text size="xs" c="dimmed">
                      {formatDate(item.updatedAt || item.createdAt)}
                    </Text>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default memo(ChatHistory);

const EmptyState = ({ onNewChat }: { onNewChat: () => void }) => {
  return (
    <div className={classes.emptyState}>
      <div className={classes.emptyIconCircle}>
        <RiHistoryLine size={26} />
      </div>
      <Text fw={600} size="sm">
        No Conversations Yet
      </Text>
      <Text size="xs" c="dimmed" maw={260}>
        Ask the AI assistant to plan or create events. Your saved conversations
        will appear here.
      </Text>
      <Button
        size="xs"
        variant="light"
        leftSection={<RiAddLine size={14} />}
        onClick={onNewChat}
        mt="xs"
      >
        Start a Chat
      </Button>
    </div>
  );
};
