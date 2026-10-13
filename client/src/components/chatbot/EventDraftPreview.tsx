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
} from "@mantine/core";
import {
  RiCalendarEventLine,
  RiGroupLine,
  RiCheckLine,
  RiCheckDoubleLine,
  RiPriceTag3Line,
  RiInformationLine,
  RiSparkling2Line,
} from "react-icons/ri";
import classes from "./EventDraftPreview.module.scss";

export type EventDraft = {
  title: string;
  description: string;
  capacity: number;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  price?: number | null;
  tags?: string | null;
};

interface EventDraftPreviewProps {
  draft: EventDraft;
  onApply?: () => void;
  canApply?: boolean;
}

const formatDates = (
  startDate?: string | null,
  endDate?: string | null,
  fallbackDate?: string | null,
): { label: string; duration: string | null } => {
  const start = startDate || fallbackDate;
  if (!start) return { label: "Not specified", duration: null };

  const parsedStart = new Date(
    start.includes("T") ? start : `${start}T00:00:00`,
  );
  if (Number.isNaN(parsedStart.getTime())) {
    return { label: start, duration: null };
  }

  const startDay = parsedStart.getDate();
  const startMonth = parsedStart.toLocaleDateString("en-IN", {
    month: "short",
  });
  const startYear = parsedStart.getFullYear();

  if (!endDate || endDate === start) {
    return {
      label: `${startDay} ${startMonth} ${startYear}`,
      duration: "1 day",
    };
  }

  const parsedEnd = new Date(
    endDate.includes("T") ? endDate : `${endDate}T00:00:00`,
  );
  if (Number.isNaN(parsedEnd.getTime())) {
    return {
      label: `${startDay} ${startMonth} ${startYear} - ${endDate}`,
      duration: null,
    };
  }

  const endDay = parsedEnd.getDate();
  const endMonth = parsedEnd.toLocaleDateString("en-IN", { month: "short" });
  const endYear = parsedEnd.getFullYear();

  const diffTime = parsedEnd.getTime() - parsedStart.getTime();
  const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const durationStr = diffDays === 1 ? "1 day" : `${diffDays} days`;

  if (startYear === endYear && startMonth === endMonth) {
    return {
      label: `${startDay} - ${endDay} ${startMonth} ${startYear}`,
      duration: durationStr,
    };
  }

  if (startYear === endYear) {
    return {
      label: `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`,
      duration: durationStr,
    };
  }

  return {
    label: `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`,
    duration: durationStr,
  };
};

const EventDraftPreview = ({
  draft,
  onApply,
  canApply = true,
}: EventDraftPreviewProps) => {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleApply = () => {
    if (onApply) {
      onApply();
      setIsAccepted(true);
    }
  };

  const dateInfo = formatDates(draft.startDate, draft.endDate, draft.date);

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
        {onApply && canApply && (
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
            {isAccepted ? "Inserted" : "Insert"}
          </Button>
        )}

        {/* Footer Note */}
        <div className={classes.footerNote}>
          <RiInformationLine size={16} />
          <span>
            {isAccepted
              ? "Details inserted into the form. You can review or edit anytime."
              : "Click Insert to populate your form, or ask for changes."}
          </span>
        </div>
      </Stack>
    </Card>
  );
};

export default memo(EventDraftPreview);
