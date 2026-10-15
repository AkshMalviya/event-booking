"use client";

import React, { memo, useState } from "react";
import {
  Card,
  Stack,
  Group,
  ThemeIcon,
  Text,
  Badge,
  Divider,
  SimpleGrid,
  Button,
  Skeleton,
} from "@mantine/core";
import {
  RiCalendarEventLine,
  RiGroupLine,
  RiCheckLine,
  RiCheckDoubleLine,
  RiPriceTag3Line,
  RiInformationLine,
  RiSparkling2Line,
  RiExternalLinkLine,
} from "react-icons/ri";
import classes from "./EventDraftPreview.module.scss";
import { formatDraftDisplayDates } from "@/utils/draft.utils";
import { useRouter, usePathname } from "next/navigation";

export type EventDraft = {
  title: string;
  description: string;
  capacity: number;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  price?: number | null;
  tags?: string | null;
  imageUrl?: string | null;
  location?: string | null;
};

interface EventDraftPreviewProps {
  draft: EventDraft;
  onApply?: () => void;
  canApply?: boolean;
}

const EventDraftPreview = ({
  draft,
  onApply,
  canApply = true,
}: EventDraftPreviewProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isCreatePage = pathname === "/events/create";

  const [isAccepted, setIsAccepted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleApply = () => {
    setIsAccepted(true);
    if (onApply) {
      onApply();
    } else {
      if (isCreatePage) {
        window.dispatchEvent(
          new CustomEvent("apply_event_draft", { detail: draft }),
        );
      } else {
        sessionStorage.setItem("pending_event_draft", JSON.stringify(draft));
        router.push("/events/create");
      }
    }
  };

  const dateInfo = formatDraftDisplayDates(
    draft.startDate,
    draft.endDate,
    draft.date,
  );

  return (
    <Card
      mt="sm"
      radius="lg"
      padding="md"
      withBorder
      shadow="sm"
      className={classes.draftCard}
    >
      <Stack gap="sm">
        {/* Header */}
        <div className={classes.headerContainer}>
          <Group gap="xs">
            <ThemeIcon
              variant="gradient"
              gradient={
                isAccepted
                  ? { from: "teal", to: "green", deg: 45 }
                  : { from: "blue", to: "cyan", deg: 45 }
              }
              size="md"
              radius="md"
            >
              {isAccepted ? (
                <RiCheckDoubleLine size={17} />
              ) : (
                <RiSparkling2Line size={17} />
              )}
            </ThemeIcon>
            <div>
              <Text fw={700} size="sm" style={{ lineHeight: 1.2 }}>
                Event Draft Preview
              </Text>
              <Text size="10px" c="dimmed">
                Ready to review & insert
              </Text>
            </div>
          </Group>

          <Badge
            color={isAccepted ? "teal" : "blue"}
            variant="light"
            size="sm"
            radius="sm"
          >
            {isAccepted ? "✓ Inserted" : "Draft"}
          </Badge>
        </div>

        <Divider />

        {/* Event Poster Banner (if generated) */}
        {draft.imageUrl && (
          <div className={classes.posterWrapper}>
            {!imageLoaded && (
              <Skeleton
                height="100%"
                width="100%"
                radius="md"
                animate
                style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
              />
            )}
            <img
              src={draft.imageUrl}
              alt={draft.title || "Event Poster"}
              className={classes.posterImage}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
            <div className={classes.posterBadge}>
              <Badge size="xs" variant="filled" color="dark">
                🎨 AI Poster • 720p HD
              </Badge>
            </div>
            <a
              href={draft.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.externalLink}
              title="Open full resolution in new tab"
            >
              <RiExternalLinkLine size={14} />
            </a>
          </div>
        )}

        {/* Title */}
        <Stack gap={2}>
          <Text className={classes.sectionLabel}>Event Title</Text>
          <Text className={classes.eventTitle}>{draft.title}</Text>
        </Stack>

        {/* Description */}
        <Stack gap={4}>
          <Text className={classes.sectionLabel}>Description</Text>
          <div className={classes.descriptionBox}>
            <Text className={classes.descriptionText}>{draft.description}</Text>
          </div>
        </Stack>

        {/* Dates Bar */}
        <div className={classes.metricCard}>
          <ThemeIcon color="blue" variant="light" size="md" radius="md">
            <RiCalendarEventLine size={17} />
          </ThemeIcon>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={classes.metricLabel}>Dates & Duration</div>
            <Group gap="xs" justify="space-between" wrap="nowrap">
              <Text className={classes.metricValue} truncate>
                {dateInfo.label}
              </Text>
              {dateInfo.duration && (
                <Badge size="xs" variant="light" color="blue" radius="sm">
                  {dateInfo.duration}
                </Badge>
              )}
            </Group>
          </div>
        </div>

        {/* Capacity & Price Metrics */}
        <SimpleGrid cols={2} spacing="xs">
          <div className={classes.metricCard}>
            <ThemeIcon color="violet" variant="light" size="md" radius="md">
              <RiGroupLine size={17} />
            </ThemeIcon>
            <div>
              <div className={classes.metricLabel}>Capacity</div>
              <div className={classes.metricValue}>
                {draft.capacity ? `${draft.capacity} seats` : "Not set"}
              </div>
            </div>
          </div>

          <div className={classes.metricCard}>
            <ThemeIcon
              color={draft.price === 0 ? "teal" : "green"}
              variant="light"
              size="md"
              radius="md"
            >
              <RiPriceTag3Line size={17} />
            </ThemeIcon>
            <div>
              <div className={classes.metricLabel}>Price</div>
              <div className={classes.priceValue}>
                {draft.price === 0 ||
                draft.price === null ||
                draft.price === undefined
                  ? "Free (₹0)"
                  : `₹${Number(draft.price).toLocaleString("en-IN")}`}
              </div>
            </div>
          </div>
        </SimpleGrid>

        {/* Tags */}
        {draft.tags && (
          <Stack gap={4}>
            <Text className={classes.sectionLabel}>Tags</Text>
            <Group gap={6} wrap="wrap">
              {draft.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag, idx) => (
                  <Badge
                    key={idx + "i"}
                    variant="light"
                    color="blue"
                    size="sm"
                    className={classes.tagPill}
                  >
                    #
                    {tag
                      .split(/\s+/)
                      .map(
                        (w) =>
                          w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                      )
                      .join(" ")}
                  </Badge>
                ))}
            </Group>
          </Stack>
        )}

        {/* Action Button */}
        {canApply && (
          <Button
            fullWidth
            variant={isAccepted ? "light" : "gradient"}
            color={isAccepted ? "teal" : undefined}
            gradient={
              isAccepted ? undefined : { from: "blue", to: "cyan", deg: 90 }
            }
            leftSection={
              isAccepted ? (
                <RiCheckDoubleLine size={18} />
              ) : (
                <RiCheckLine size={18} />
              )
            }
            onClick={handleApply}
            radius="md"
            className={classes.actionButton}
            disabled={isAccepted}
          >
            {isAccepted
              ? "Inserted"
              : isCreatePage
              ? "Insert into Form"
              : "Apply & Go to Create Event"}
          </Button>
        )}

        {/* Footer Note */}
        <div className={classes.footerNote}>
          <RiInformationLine size={16} />
          <span>
            {isAccepted
              ? "Details inserted into the form. You can review or edit anytime."
              : isCreatePage
              ? "Click Insert to populate your form, or ask for changes."
              : "Click Apply to open Create Event page with these details."}
          </span>
        </div>
      </Stack>
    </Card>
  );
};

export default memo(EventDraftPreview);
