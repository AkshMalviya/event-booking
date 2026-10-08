"use client";

import React, { useState } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Group,
  Stack,
  FileInput,
  Image,
  Box,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import {
  CreateEventDocument,
  GenerateSuggestionDocument,
} from "@/generated/graphql";
import { yupResolver } from "mantine-form-yup-resolver";
import { createEventSchema } from "@/validation/event.schema";
import {
  FiUpload,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiTag,
  FiCheckCircle,
} from "react-icons/fi";
import { RiSparkling2Fill } from "react-icons/ri";

type TSuggestion = {
  title: string[];
  description: string[];
};

function SuggestionItem({
  text,
  onAccept,
}: Readonly<{
  text: string;
  onAccept: () => void;
}>) {
  return (
    <Paper
      py="4px"
      px={"xs"}
      style={{
        backgroundColor: "var(--mantine-color-blue-light)",
        transition: "background-color 0.2s ease",
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text size="sm">{text}</Text>

        <Tooltip label="Accept Suggestion">
          <ActionIcon
            variant="subtle"
            size={"input-sm"}
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
          >
            <FiCheckCircle />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Paper>
  );
}

export default function CreateEventPage() {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<TSuggestion>({
    title: [],
    description: [],
  });
  const [loadingType, setLoadingType] = useState<
    "title" | "description" | null
  >(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [createEvent, { loading: isPending }] =
    useMutation(CreateEventDocument);
  const [generateSuggestion, { loading: isSuggestionPending }] = useMutation(
    GenerateSuggestionDocument,
  );
  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      startDate: null as Date | null,
      endDate: null as Date | null,
      availableSeats: 5,
      price: 0,
      tags: "",
      idempotencyKey: crypto.randomUUID(),
    },
    validate: yupResolver(createEventSchema),
  });

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.startDate || new Date(values.startDate) <= new Date()) {
      notifications.show({
        title: "Invalid Start Time",
        message:
          "Event must be scheduled for a future date and time (upcoming).",
        color: "red",
      });
      return;
    }

    if (
      !values.endDate ||
      new Date(values.endDate) <= new Date(values.startDate)
    ) {
      notifications.show({
        title: "Invalid End Time",
        message: "End date & time must be after start date & time.",
        color: "red",
      });
      return;
    }

    const tagsArray = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    await createEvent({
      variables: {
        data: {
          title: values.title.trim(),
          description: values.description.trim(),
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
          availableSeats: Number(values.availableSeats),
          price: Number(values.price),
          tags: tagsArray,
          image: imageFile,
        },
        idempotencyKey: values.idempotencyKey,
      },
      onCompleted: (result) => {
        const newEvent = result.createEvent;
        notifications.show({
          title: "Event Created Successfully!",
          message: `Your event "${newEvent.title}" has been published.`,
          color: "green",
        });
        const redirectSlug = newEvent.slug || newEvent.id;
        if (redirectSlug) {
          router.push(`/event/${redirectSlug}`);
        } else {
          router.push("/dashboard");
        }
      },
      onError: (err) => {
        notifications.show({
          title: "Event Creation Failed",
          message:
            err.message || "Failed to create event. Please check your input.",
          color: "red",
        });
      },
    });
  };

  const handleSuggestion = async (type: "title" | "description") => {
    const value =
      type === "title" ? form.values.title : form.values.description;

    if (value.trim().length < 5) {
      notifications.show({
        title: "Input Too Short",
        message: `Please enter at least 5 characters for the ${type} to generate suggestions.`,
        color: "yellow",
      });
      return;
    }

    setLoadingType(type);
    try {
      const generate = await generateSuggestion({
        variables: {
          input: {
            type: type,
            userPreferences: value,
          },
        },
      });

      if (generate.data?.generateSuggestion.suggestions) {
        setSuggestion((prev) => {
          if (type === "title") {
            return {
              ...prev,
              title: generate.data?.generateSuggestion?.suggestions || [],
            };
          } else {
            return {
              ...prev,
              description: generate.data?.generateSuggestion?.suggestions || [],
            };
          }
        });
      }
    } catch (err: any) {
      notifications.show({
        title: "Suggestion Failed",
        message:
          err.message || "Failed to generate suggestions. Please try again.",
        color: "red",
      });
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <Container size="md" py="xl">
      <Paper radius="md" p="xl" withBorder shadow="sm">
        <Stack gap="lg">
          <div>
            <Title order={2} fw={700}>
              Create New Event
            </Title>
            <Text size="sm" c="dimmed">
              Fill in the details below to publish your upcoming event
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Event Title"
                placeholder="e.g. Next.js & AI Developers Summit 2026"
                {...form.getInputProps("title")}
                rightSection={
                  <Tooltip label="Suggest Title">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleSuggestion("title")}
                      loading={isSuggestionPending && loadingType === "title"}
                    >
                      <RiSparkling2Fill />
                    </ActionIcon>
                  </Tooltip>
                }
              />
              {suggestion.title.length > 0 && (
                <Stack gap="xs" mt="-xs">
                  {suggestion.title.map((title, index) => (
                    <SuggestionItem
                      key={index}
                      text={title}
                      onAccept={() => {
                        form.setFieldValue("title", title);
                        setSuggestion((prev) => ({ ...prev, title: [] }));
                      }}
                    />
                  ))}
                </Stack>
              )}

              <Textarea
                label={
                  <Group gap="xs" mb={4}>
                    <Text component="span" size="sm" fw={500}>
                      Description
                    </Text>
                    <Tooltip label="Suggest Description">
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        onClick={() => handleSuggestion("description")}
                        loading={
                          isSuggestionPending && loadingType === "description"
                        }
                      >
                        <RiSparkling2Fill />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                }
                placeholder="Provide details about the event schedule, speakers, topics, and venue..."
                rows={4}
                {...form.getInputProps("description")}
              />
              {suggestion.description.length > 0 && (
                <Stack gap="xs" mt="-xs">
                  {suggestion.description.map((desc, index) => (
                    <SuggestionItem
                      key={index}
                      text={desc}
                      onAccept={() => {
                        form.setFieldValue("description", desc);
                        setSuggestion((prev) => ({ ...prev, description: [] }));
                      }}
                    />
                  ))}
                </Stack>
              )}

              {/* Single Image Upload via Multer */}
              <div>
                <FileInput
                  label="Event Banner Image"
                  description="Upload a banner image for your event (JPG, PNG, WebP up to 5MB)"
                  placeholder="Click to select an image"
                  accept="image/png,image/jpeg,image/webp"
                  leftSection={<FiUpload size={16} />}
                  value={imageFile}
                  onChange={handleImageChange}
                  clearable
                />

                {imagePreview && (
                  <Box mt="sm">
                    <Text size="xs" c="dimmed" mb={4}>
                      Image Preview:
                    </Text>
                    <Image
                      src={imagePreview}
                      alt="Banner Preview"
                      height={180}
                      radius="md"
                      fit="cover"
                    />
                  </Box>
                )}
              </div>

              {/* Mantine DateTimePicker for Start and End Date & Time */}
              <Group grow align="flex-start">
                <DateTimePicker
                  label="Start Date & Time"
                  placeholder="Pick start date and time"
                  minDate={new Date()}
                  valueFormat="YYYY-MM-DD HH:mm"
                  leftSection={<FiCalendar size={16} />}
                  clearable
                  {...form.getInputProps("startDate")}
                />

                <DateTimePicker
                  label="End Date & Time"
                  placeholder="Pick end date and time"
                  minDate={form.values.startDate || new Date()}
                  valueFormat="YYYY-MM-DD HH:mm"
                  leftSection={<FiCalendar size={16} />}
                  clearable
                  {...form.getInputProps("endDate")}
                />
              </Group>

              <Group grow align="flex-start">
                <NumberInput
                  label="Available Seats"
                  min={1}
                  description={`The maximum number of attendees for this event.`}
                  leftSection={<FiUsers size={16} />}
                  {...form.getInputProps("availableSeats")}
                />

                <NumberInput
                  label="Price ($ USD)"
                  min={0}
                  step={1}
                  leftSection={<FiDollarSign size={16} />}
                  description="Set to 0 for a free event"
                  {...form.getInputProps("price")}
                />
              </Group>

              <TextInput
                label="Tags"
                placeholder="e.g. technology, react, summit, workshop (comma-separated)"
                leftSection={<FiTag size={16} />}
                {...form.getInputProps("tags")}
              />

              <Group justify="flex-end" mt="lg">
                <Button
                  variant="default"
                  onClick={() => router.push("/dashboard")}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftSection={<FiCheckCircle size={16} />}
                  loading={isPending}
                >
                  Create Event
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
