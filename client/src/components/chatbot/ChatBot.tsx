"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import {
  ActionIcon,
  Tooltip,
  TextInput,
  Text,
  Loader,
  Group,
  Avatar,
} from "@mantine/core";
import { useMutation } from "@apollo/client/react";
import { UseFormReturnType } from "@mantine/form";
import { ChatDocument } from "@/generated/graphql";
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
import EventDraftPreview, { EventDraft } from "./EventDraftPreview";
import ChatHistory from "./ChatHistory";
import classes from "./ChatBot.module.scss";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  eventDraft?: EventDraft | null;
};

interface ChatBotProps {
  form?: UseFormReturnType<unknown>;
  onApplyDraft?: (draft: EventDraft) => void;
}

const ChatBot = ({ form, onApplyDraft }: ChatBotProps = {}) => {
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
  const viewportRef = useRef<HTMLDivElement>(null);

  const [chat, { loading }] = useMutation(ChatDocument);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!showHistory) {
      scrollToBottom();
    }
  }, [messages, loading, opened, showHistory]);

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Hello! I am your AI event assistant. Need help planning your event or writing a description?",
      },
    ]);
    setShowHistory(false);
  };

  const handleSelectConversation = (item: {
    conversationId: string;
    title: string;
  }) => {
    setConversationId(item.conversationId);
    setMessages([
      {
        id: `resumed-${item.conversationId}`,
        sender: "ai",
        text: `Resumed conversation: **${item.title}**\n\nYou can continue asking questions or updating your event details.`,
      },
    ]);
    setShowHistory(false);
  };

  const handleApplyDraft = (draft: EventDraft) => {
    if (onApplyDraft) {
      onApplyDraft(draft);
      return;
    }

    if (form) {
      if (draft.title) {
        form.setFieldValue("title", draft.title);
      }
      if (draft.description) {
        form.setFieldValue("description", draft.description);
      }
      if (draft.capacity) {
        form.setFieldValue("availableSeats", Number(draft.capacity));
      }

      const dateToUse = draft.startDate || draft.date;
      if (dateToUse) {
        const parsedStart = new Date(
          dateToUse.includes("T") ? dateToUse : `${dateToUse}T10:00:00`,
        );
        if (!Number.isNaN(parsedStart.getTime())) {
          form.setFieldValue("startDate", parsedStart);

          if (draft.endDate) {
            const parsedEnd = new Date(
              draft.endDate.includes("T")
                ? draft.endDate
                : `${draft.endDate}T18:00:00`,
            );
            if (!Number.isNaN(parsedEnd.getTime())) {
              form.setFieldValue("endDate", parsedEnd);
            } else {
              const fallbackEnd = new Date(
                parsedStart.getTime() + 2 * 60 * 60 * 1000,
              );
              form.setFieldValue("endDate", fallbackEnd);
            }
          } else {
            const fallbackEnd = new Date(
              parsedStart.getTime() + 2 * 60 * 60 * 1000,
            );
            form.setFieldValue("endDate", fallbackEnd);
          }
        }
      }

      if (draft.price !== undefined && draft.price !== null) {
        form.setFieldValue("price", Number(draft.price));
      }

      if (draft.tags) {
        const formattedTags = draft.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((tag) =>
            tag
              .split(/\s+/)
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
              )
              .join(" "),
          )
          .join(", ");
        form.setFieldValue("tags", formattedTags);
      }
    }
  };

  const handleSend = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage("");

    setMessages((prev) =>
      [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "user" as const,
          text: userMessage,
        },
      ].slice(-60),
    );

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

        setMessages((prev) =>
          [
            ...prev,
            {
              id: `${Date.now()}-ai`,
              sender: "ai" as const,
              text: result.reply,
              eventDraft: result.eventDraft,
            },
          ].slice(-60),
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        [
          ...prev,
          {
            id: `${Date.now()}-error`,
            sender: "ai" as const,
            text: "Sorry, I'm having trouble connecting right now. Please try again.",
          },
        ].slice(-60),
      );
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
              onClose={() => setShowHistory(false)}
            />
          ) : (
            <>
              <div ref={viewportRef} className={classes.messagesList}>
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
                          form || onApplyDraft
                            ? () => handleApplyDraft(msg.eventDraft!)
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
