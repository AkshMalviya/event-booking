"use client";

import React, { memo } from "react";
import { Badge, Button, Group, Text } from "@mantine/core";
import { useRouter } from "next/navigation";
import {
  RiCalendarEventLine,
  RiGroupLine,
  RiArrowRightLine,
  RiPriceTag3Line,
} from "react-icons/ri";
import dayjs from "dayjs";
import classes from "./EventSuggestionCard.module.scss";

export interface SuggestedEvent {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  availableSeats?: number;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  image?: string;
}

interface EventSuggestionCardProps {
  event: SuggestedEvent;
  onViewDetails?: () => void;
}

const EventSuggestionCard = ({
  event,
  onViewDetails,
}: EventSuggestionCardProps) => {
  const router = useRouter();
  const eventSlug = event.slug || event.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.();
    router.push(`/event/${eventSlug}`);
  };

  const formattedDate = event.startDate
    ? dayjs(event.startDate).format("D MMM YYYY")
    : null;

  const isFree =
    event.price === 0 || event.price === null || event.price === undefined;

  return (
    <div className={classes.eventCard} onClick={handleClick} role="button">
      <div className={classes.titleRow}>
        <Text className={classes.titleText}>{event.title}</Text>
        <Badge
          variant="light"
          color={isFree ? "teal" : "blue"}
          size="sm"
          radius="sm"
        >
          {isFree ? "Free" : `₹${Number(event.price).toLocaleString("en-IN")}`}
        </Badge>
      </div>

      {event.description && (
        <Text className={classes.description}>{event.description}</Text>
      )}

      <div className={classes.metadataGrid}>
        {formattedDate && (
          <div className={classes.metaItem}>
            <RiCalendarEventLine size={13} color="var(--mantine-color-blue-6)" />
            <span>{formattedDate}</span>
          </div>
        )}

        {event.availableSeats !== undefined && event.availableSeats !== null && (
          <div className={classes.metaItem}>
            <RiGroupLine size={13} color="var(--mantine-color-violet-6)" />
            <span>{event.availableSeats} seats</span>
          </div>
        )}
      </div>

      {event.tags && event.tags.length > 0 && (
        <div className={classes.tagsRow}>
          {event.tags.slice(0, 3).map((tag, idx) => (
            <Badge
              key={idx}
              variant="outline"
              color="gray"
              size="xs"
              radius="sm"
            >
              #{tag.trim()}
            </Badge>
          ))}
          {event.tags.length > 3 && (
            <Badge variant="subtle" color="gray" size="xs">
              +{event.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      <Button
        fullWidth
        variant="light"
        color="blue"
        className={classes.actionButton}
        rightSection={<RiArrowRightLine size={14} className={classes.arrowIcon} />}
        onClick={handleClick}
      >
        View Event Details
      </Button>
    </div>
  );
};

export default memo(EventSuggestionCard);
