import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import React, { memo } from "react";
import { FiArrowRight, FiCalendar } from "react-icons/fi";
import { EventItem } from "@/hooks/events/types";
import { getImageUrl } from "@/utils/getImagePath";

interface IProps {
  event: EventItem;
  onViewClick: () => void;
}

const DashboardCard = ({ event, onViewClick }: IProps) => {
  const seatsLeft = event.availableSeats - (event.registeredCount || 0);
  const imageUrl = getImageUrl(event.image);

  return (
    <Card
      key={event._id}
      shadow="sm"
      padding="lg"
      radius="md"
      pt={0}
      withBorder
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      {/* Top Section: Image, Title, Price, Description, and Tags */}
      <Stack gap="sm">
        {imageUrl ? (
          <Card.Section
            onClick={onViewClick}
            style={{ cursor: "pointer", overflow: "hidden" }}
            title="Click to view event details"
          >
            <Image
              src={imageUrl}
              height={160}
              alt={event.title}
              fallbackSrc="https://placehold.co/600x400?text=Event+Banner"
              style={{
                transition: "transform 0.2s ease",
              }}
            />
          </Card.Section>
        ) : (
          <Card.Section
            onClick={onViewClick}
            style={{ cursor: "pointer" }}
            title="Click to view event details"
          >
            <Box
              h={140}
              style={{
                background: "linear-gradient(135deg, #1c7ed6 0%, #22b8cf 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                c="white"
                fw={700}
                fz="xl"
                px="md"
                ta="center"
                lineClamp={2}
              >
                {event.title}
              </Text>
            </Box>
          </Card.Section>
        )}

        <Group justify="space-between" align="flex-start" mt="xs" wrap="nowrap">
          <Title
            order={4}
            fw={600}
            lineClamp={1}
            style={{ flex: 1, cursor: "pointer" }}
            onClick={onViewClick}
            title={event.title}
          >
            {event.title}
          </Title>
          <Badge
            color={seatsLeft <= 0 ? "red" : "blue"}
            variant="light"
            size="md"
            style={{ flexShrink: 0 }}
          >
            {event.price > 0 ? `$${event.price}` : "Free"}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {event.description}
        </Text>

        {event.tags && event.tags.length > 0 && (
          <Group gap={6}>
            {event.tags.map((tag) => (
              <Badge key={tag} variant="gradient">
                {tag}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>

      {/* Bottom Section: Date, Seats Remaining, and Button */}
      <Stack gap="sm" mt="md">
        <Group justify="space-between" align="center">
          <Group gap={6}>
            <FiCalendar size={13} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {new Date(event.startDate).toLocaleDateString()}
            </Text>
          </Group>
          <Text
            size="xs"
            fw={500}
            c={seatsLeft <= 0 ? "red" : seatsLeft <= 5 ? "orange" : "teal"}
          >
            {seatsLeft <= 0 ? "Sold Out" : `${seatsLeft} seats left`}
          </Text>
        </Group>

        <Button
          fullWidth
          radius="md"
          variant="light"
          rightSection={<FiArrowRight size={14} />}
          onClick={onViewClick}
        >
          View Details
        </Button>
      </Stack>
    </Card>
  );
};

export default memo(DashboardCard);
