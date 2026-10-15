"use client";

import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import {
  ActionIcon,
  Tooltip,
  TextInput,
  Text,
  Loader,
  Group,
  Avatar,
} from "@mantine/core";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import {
  ChatDocument,
  ChatMessageItem,
  ConversationMessagesDocument,
  ConversationMessagesQuery,
  EventDraft,
} from "@/generated/graphql";
import {
  RiSparkling2Fill,
  RiSendPlaneFill,
  RiRobot2Fill,
  RiCloseLine,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiHistoryLine,
  RiAddLine,
} from "react-icons/ri";
import { marked } from "marked";
import EventDraftPreview from "./EventDraftPreview";
import ChatHistory from "./ChatHistory";
import classes from "./ChatBot.module.scss";
import { useRouter } from "next/navigation";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  eventDraft?: EventDraft | null;
};

interface ChatBotProps {
  onApplyDraft?: (draft: EventDraft) => void;
}

type ConversationMessage =
  ConversationMessagesQuery["conversationMessages"]["messages"][number];

const ChatBot = ({ onApplyDraft }: ChatBotProps = {}) => {
  const [opened, setOpened] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your AI event assistant. Need help planning your event or writing a description?",
    },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const shouldScrollBottomRef = useRef(true);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [chat, { loading }] = useMutation(ChatDocument);
  const [fetchConversationMessages] = useLazyQuery(
    ConversationMessagesDocument,
    {
      fetchPolicy: "cache-first",
    },
  );

  useEffect(() => {
    if (!showHistory && shouldScrollBottomRef.current) {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    }
  }, [messages, loading, opened, showHistory, loadingConversation]);

  const mapToMessage = (m: ConversationMessage | ChatMessageItem): Message => ({
    id: m._id ?? `${m.role}-${m.timestamp || Date.now()}`,
    sender: m.role === "user" ? "user" : "ai",
    text: m.content,
    eventDraft: m.draftedEvent as EventDraft,
  });

  const handleNewChat = useCallback(() => {
    setConversationId(null);
    setNextCursor(null);
    setHasMore(false);
    shouldScrollBottomRef.current = true;
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Hello! I am your AI event assistant. Need help planning your event or writing a description?",
      },
    ]);
    setShowHistory(false);
  }, []);

  const handleSelectConversation = async (item: {
    conversationId: string;
    title: string;
  }) => {
    setConversationId(item.conversationId);
    setShowHistory(false);
    setLoadingConversation(true);
    setNextCursor(null);
    setHasMore(false);
    shouldScrollBottomRef.current = true;

    try {
      const res = await fetchConversationMessages({
        variables: {
          conversationId: item.conversationId,
          limit: 20,
        },
      });

      const data = res.data?.conversationMessages;
      if (data?.messages && data.messages.length > 0) {
        setMessages(data.messages.map((e) => mapToMessage(e)));
        setNextCursor(data.nextCursor ?? null);
        setHasMore(Boolean(data.hasMore));
      } else {
        setMessages([
          {
            id: `resumed-${item.conversationId}`,
            sender: "ai",
            text: `Resumed conversation: **${item.title}**\n\nYou can continue asking questions or updating your event details.`,
          },
        ]);
        setNextCursor(null);
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load conversation messages:", err);
      setMessages([
        {
          id: `resumed-${item.conversationId}`,
          sender: "ai",
          text: `Resumed conversation: **${item.title}**\n\nYou can continue asking questions or updating your event details.`,
        },
      ]);
    } finally {
      setLoadingConversation(false);
    }
  };

  const loadMoreOlderMessages = async () => {
    if (
      !conversationId ||
      !hasMore ||
      !nextCursor ||
      loadingMore ||
      loadingConversation
    ) {
      return;
    }

    const container = viewportRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;
    const prevScrollTop = container?.scrollTop ?? 0;

    setLoadingMore(true);
    shouldScrollBottomRef.current = false;

    try {
      const res = await fetchConversationMessages({
        variables: {
          conversationId,
          cursor: nextCursor,
          limit: 20,
        },
      });

      const data = res.data?.conversationMessages;
      if (data?.messages && data.messages.length > 0) {
        const olderMessages = data.messages.map(mapToMessage);
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const existingSignatures = new Set(
            prev.map((m) => `${m.sender}:${m.text.trim()}`),
          );
          const uniqueOlder = olderMessages.filter(
            (m) =>
              !existingIds.has(m.id) &&
              !existingSignatures.has(`${m.sender}:${m.text.trim()}`),
          );
          if (uniqueOlder.length === 0) {
            return prev;
          }
          return [...uniqueOlder, ...prev];
        });
        setNextCursor(data.nextCursor ?? null);
        setHasMore(Boolean(data.hasMore));

        requestAnimationFrame(() => {
          if (viewportRef.current) {
            const newScrollHeight = viewportRef.current.scrollHeight;
            viewportRef.current.scrollTop =
              newScrollHeight - prevScrollHeight + prevScrollTop;
          }
        });
      } else {
        setHasMore(false);
        setNextCursor(null);
      }
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (
      e.currentTarget.scrollTop < 40 &&
      hasMore &&
      !loadingMore &&
      !loadingConversation &&
      conversationId &&
      nextCursor
    ) {
      void loadMoreOlderMessages();
    }
  };

  const handleSend = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage("");
    shouldScrollBottomRef.current = true;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user" as const,
        text: userMessage,
      },
    ]);

    try {
      const { data } = await chat({
        variables: {
          input: {
            message: userMessage,
            ...(conversationId ? { conversationId } : {}),
          },
        },
      });

      const result = data?.chat;
      if (result) {
        if (!conversationId && result.conversationId) {
          setConversationId(result.conversationId);
        }

        shouldScrollBottomRef.current = true;
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-ai`,
            sender: "ai" as const,
            text: result.reply,
            eventDraft: result.eventDraft,
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      shouldScrollBottomRef.current = true;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          sender: "ai" as const,
          text: "Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);
    }
  };

  return (
    <>
      <Tooltip
        label={opened ? "Close Assistant" : "Ask AI Assistant"}
        position="left"
        zIndex={100000}
      >
        <ActionIcon
          onClick={() => {
            setOpened((prev) => {
              if (prev) {
                setIsFullScreen(false);
                setShowHistory(false);
              }
              return !prev;
            });
          }}
          size={50}
          radius="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan", deg: 90 }}
          className={classes.chatButton}
          aria-label={opened ? "Close Assistant" : "Ask AI Assistant"}
        >
          {opened ? <RiCloseLine size={26} /> : <RiSparkling2Fill size={26} />}
        </ActionIcon>
      </Tooltip>

      {opened && (
        <div
          className={`${classes.chatWindow} ${
            isFullScreen ? classes.fullScreen : ""
          }`}
        >
          <div className={classes.chatHeader}>
            <Group gap="sm">
              <Avatar color="blue" radius="xl" size="sm">
                <RiRobot2Fill size={18} />
              </Avatar>
              <Text
                fw={600}
                size="sm"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 90 }}
              >
                AI Event Assistant
              </Text>
            </Group>

            <Group gap={12} align="center">
              <Tooltip label="Start New Chat" zIndex={1000}>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  size="md"
                  onClick={handleNewChat}
                  aria-label="Start New Chat"
                >
                  <RiAddLine size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip
                label={showHistory ? "Back to Chat" : "Chat History"}
                zIndex={1000}
              >
                <ActionIcon
                  variant={showHistory ? "light" : "subtle"}
                  color={showHistory ? "blue" : "gray"}
                  size="md"
                  onClick={() => setShowHistory((prev) => !prev)}
                  aria-label="Chat History"
                >
                  <RiHistoryLine size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip
                label={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                zIndex={1000}
              >
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="md"
                  onClick={() => setIsFullScreen((prev) => !prev)}
                  aria-label={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullScreen ? (
                    <RiFullscreenExitLine size={18} />
                  ) : (
                    <RiFullscreenLine size={18} />
                  )}
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Close Assistant" zIndex={1000}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="md"
                  onClick={() => {
                    setOpened(false);
                    setIsFullScreen(false);
                    setShowHistory(false);
                  }}
                  aria-label="Close Assistant"
                >
                  <RiCloseLine size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>

          {showHistory ? (
            <ChatHistory
              currentConversationId={conversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={handleNewChat}
            />
          ) : loadingConversation ? (
            <div className={classes.centerLoader}>
              <Loader size="sm" color="blue" />
              <Text size="xs" c="dimmed">
                Loading messages...
              </Text>
            </div>
          ) : (
            <>
              <div
                ref={viewportRef}
                className={classes.messagesList}
                onScroll={handleScroll}
              >
                {loadingMore && (
                  <div className={classes.loadingMoreContainer}>
                    <Loader size="xs" color="blue" />
                    <Text size="xs" c="dimmed">
                      Loading older messages...
                    </Text>
                  </div>
                )}

                {hasMore && !loadingMore && (
                  <button
                    type="button"
                    onClick={loadMoreOlderMessages}
                    className={classes.loadMoreBtn}
                  >
                    Load earlier messages ↑
                  </button>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${classes.messageRow} ${
                      msg.sender === "user" ? classes.userRow : classes.aiRow
                    }`}
                  >
                    <div
                      className={`${classes.messageBubble} ${
                        msg.sender === "user"
                          ? classes.userBubble
                          : classes.aiBubble
                      }`}
                    >
                      {msg.sender === "ai" ? (
                        <div
                          className={classes.markdownContent}
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(msg.text) as string,
                          }}
                        />
                      ) : (
                        <Text size="sm">{msg.text}</Text>
                      )}
                    </div>

                    {msg.sender === "ai" && msg.eventDraft && (
                      <EventDraftPreview
                        draft={msg.eventDraft}
                        onApply={
                          onApplyDraft
                            ? () => {
                                onApplyDraft(msg.eventDraft!);
                              }
                            : undefined
                        }
                      />
                    )}
                  </div>
                ))}

                {loading && (
                  <div className={`${classes.messageRow} ${classes.aiRow}`}>
                    <div className={classes.loadingBubble}>
                      <Loader size="xs" type="dots" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className={classes.form}>
                <TextInput
                  placeholder="Ask to create or update your event..."
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  disabled={loading}
                  radius="xl"
                  size="sm"
                  rightSection={
                    <ActionIcon
                      type="submit"
                      variant="filled"
                      color="blue"
                      radius="xl"
                      size={28}
                      disabled={!message.trim() || loading}
                      mr={4}
                    >
                      <RiSendPlaneFill size={14} />
                    </ActionIcon>
                  }
                />
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default memo(ChatBot);
