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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useCreateEventMutation } from "@/hooks/events/mutation/useCreateEventMutation";
import { CreateEventPayload } from "@/hooks/events/types";
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

export default function CreateEventPage() {
  const router = useRouter();
  const createEventMutation = useCreateEventMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      startDate: null as Date | null,
      endDate: null as Date | null,
      availableSeats: 50,
      price: 0,
      tags: "",
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

  const handleSubmit = (values: typeof form.values) => {
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

    const payload: CreateEventPayload = {
      title: values.title.trim(),
      description: values.description.trim(),
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      availableSeats: Number(values.availableSeats),
      price: Number(values.price),
      tags: tagsArray,
      image: imageFile,
    };

    createEventMutation.mutate(payload, {
      onSuccess: (newEvent) => {
        notifications.show({
          title: "Event Created Successfully!",
          message: `Your event "${newEvent.title}" has been published.`,
          color: "green",
        });
        const redirectSlug = newEvent.slug || newEvent.id || newEvent._id;
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
              />

              <Textarea
                label="Description"
                placeholder="Provide details about the event schedule, speakers, topics, and venue..."
                minRows={4}
                {...form.getInputProps("description")}
              />

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
                  disabled={createEventMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  leftSection={<FiCheckCircle size={16} />}
                  loading={createEventMutation.isPending}
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
