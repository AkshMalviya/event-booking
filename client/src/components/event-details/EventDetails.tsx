import { EventBySlugQuery } from "@/generated/graphql";
import { getImageUrl } from "@/utils/getImagePath";
import { ErrorLike } from "@apollo/client";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { memo } from "react";
import { FiArrowLeft, FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import { HiOutlineTicket } from "react-icons/hi2";
import BookingCard from "./components/BookingCard/BookingCard";
import Link from "next/link";

interface IProps {
  event?: EventBySlugQuery["event"];
  error?: ErrorLike;
}

const EventDetails = ({ event, error }: IProps) => {
  const isError = !!error;

  if (isError || !event) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder radius="md" ta="center">
          <Title order={3} c="red" mb="xs">
            Event Not Found
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            The event you are looking for does not exist or may have been
            removed.
          </Text>
        </Paper>
      </Container>
    );
  }

  const seatsLeft = event.availableSeats - (event.registeredCount || 0);
  const isSoldOut = seatsLeft <= 0;

  const imageUrl = getImageUrl(event.image ?? "");

  return (
    <Container size="xl">
      <Stack gap="md">
        <Link href="/dashboard" passHref>
          <Button
            variant="light"
            size="sm"
            leftSection={<FiArrowLeft size={16} />}
          >
            All Events
          </Button>
        </Link>

        {/* Event Content Grid */}
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          <Stack gap="lg" style={{ gridColumn: "span 2" }}>
            <div>
              <Title order={1} fw={700} mb={"lg"}>
                {event.title}
              </Title>
              {/* Hero Event Banner Image */}
              {imageUrl ? (
                <Paper radius="md" style={{ overflow: "hidden" }} shadow="sm">
                  <Image
                    src={imageUrl}
                    height={320}
                    alt={event.title}
                    fallbackSrc="https://placehold.co/1200x400?text=Event+Banner"
                  />
                </Paper>
              ) : (
                <Box
                  h={220}
                  style={{
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, #1c7ed6 0%, #22b8cf 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Title c="white" order={1} ta="center" px="md">
                    {event.title}
                  </Title>
                </Box>
              )}
              <Divider my={"lg"} />

              {event.tags && event.tags.length > 0 && (
                <Stack gap="xs" mb="lg">
                  <Text size="sm" fw={600} c="dimmed" tt="uppercase">
                    Tags
                  </Text>
                  <Group gap="xs">
                    {event.tags.map((tag, index) => (
                      <Badge
                        key={`${tag}-${index}`}
                        size="lg"
                        variant="light"
                        color="blue"
                        radius="md"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                </Stack>
              )}
            </div>

            {/* Event Dates and Logistics */}
            <Card withBorder radius="lg" p="xl" shadow="sm">
              <Title order={3} fw={600} mb="xl">
                When & Where
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size={48} radius="md" variant="light" color="blue">
                    <FiCalendar size={24} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                      Start
                    </Text>
                    <Text fw={600} size="md">
                      {new Date(event?.startDate ?? "").toLocaleDateString()}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {new Date(event?.startDate ?? "").toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                </Group>

                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon size={48} radius="md" variant="light" color="blue">
                    <FiClock size={24} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                      End
                    </Text>
                    <Text fw={600} size="md">
                      {new Date(event?.endDate ?? "").toLocaleDateString()}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {new Date(event?.endDate ?? "").toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                </Group>

                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon
                    size={48}
                    radius="md"
                    variant="light"
                    color="grape"
                  >
                    <FiUsers size={24} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                      Capacity
                    </Text>
                    <Text fw={600} size="md">
                      {event.availableSeats} Seats
                    </Text>
                  </div>
                </Group>

                <Group wrap="nowrap" align="flex-start">
                  <ThemeIcon
                    size={48}
                    radius="md"
                    variant="light"
                    color={
                      isSoldOut ? "red" : seatsLeft <= 5 ? "orange" : "teal"
                    }
                  >
                    <HiOutlineTicket size={24} />
                  </ThemeIcon>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                      Availability
                    </Text>
                    <Text
                      fw={600}
                      size="md"
                      c={isSoldOut ? "red" : seatsLeft <= 5 ? "orange" : "teal"}
                    >
                      {isSoldOut ? "Sold Out" : `${seatsLeft} Available`}
                    </Text>
                  </div>
                </Group>
              </SimpleGrid>
            </Card>

            {/* Event Description */}
            <Card withBorder radius="md" p="xl" shadow="sm">
              <Stack gap="md">
                <Title order={3} fw={600}>
                  About This Event
                </Title>
                <Divider />
                <Text
                  style={{ whiteSpace: "pre-line" }}
                  c="gray.8"
                  lh={1.8}
                  size="md"
                >
                  {event.description}
                </Text>
              </Stack>
            </Card>
          </Stack>

          {/* Booking Side Panel */}
          <BookingCard
            availableSeats={event.availableSeats}
            registeredCount={event.registeredCount}
            price={event.price}
            startDate={event.startDate}
            endDate={event.endDate}
            userId={event.userId}
            eventId={event.id}
          />
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default memo(EventDetails);
