"use client";

import React, { useState, useEffect } from "react";
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
  Center,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useParams, useRouter } from "next/navigation";
import { useEventBySlugQuery } from "@/hooks/events/query/useEventBySlugQuery";
import { useUpdateEventMutation } from "@/hooks/events/mutation/useUpdateEventMutation";
import { UpdateEventPayload } from "@/hooks/events/types";
import { API_BASE_URL } from "@/hooks/api-urls";
import {
  FiUpload,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiTag,
  FiCheckCircle,
} from "react-icons/fi";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const router = useRouter();

  const { data: event, isLoading, isError } = useEventBySlugQuery(id);
  const updateEventMutation = useUpdateEventMutation();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

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
    validate: {
      title: (val) => (val.trim().length === 0 ? "Title is required" : null),
      description: (val) =>
        val.trim().length === 0 ? "Description is required" : null,
      startDate: (val) => (!val ? "Start date is required" : null),
      endDate: (val) => (!val ? "End date is required" : null),
      availableSeats: (val, values) => {
        if (!val) return "Available seats required";
        if (event && val < event.registeredCount) {
          return `Cannot be less than booked seats (${event.registeredCount})`;
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (event) {
      form.setValues({
        title: event.title,
        description: event.description,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        availableSeats: event.availableSeats,
        price: event.price,
        tags: event.tags ? event.tags.join(", ") : "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  if (isLoading) {
    return (
      <Center py={80}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (isError || !event) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder radius="md" ta="center">
          <Title order={3} c="red" mb="xs">
            Event Not Found
          </Title>
          <Text size="sm" c="dimmed">
            The event you are trying to edit does not exist.
          </Text>
        </Paper>
      </Container>
    );
  }

  const isOngoingOrPast = new Date(event.startDate) <= new Date();

  if (isOngoingOrPast) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" withBorder radius="md" ta="center">
          <Title order={3} c="orange" mb="xs">
            Edit Restricted
          </Title>
          <Text size="sm" c="dimmed" mb="lg">
            This event has already started or finished. Ongoing or past events
            cannot be edited.
          </Text>
          <Button variant="default" onClick={() => router.back()}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

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

  const currentImagePreview = imageFile
    ? imagePreview
    : event?.image
      ? getImageUrl(event.image)
      : null;

  const handleSubmit = (values: typeof form.values) => {
    if (!values.startDate || new Date(values.startDate) <= new Date()) {
      notifications.show({
        title: "Invalid Start Time",
        message: "Event must be scheduled for a future date and time.",
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

    const payload: UpdateEventPayload = {
      title: values.title.trim(),
      description: values.description.trim(),
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      availableSeats: Number(values.availableSeats),
      tags: tagsArray,
    };

    if (imageFile) {
      payload.image = imageFile;
    }

    updateEventMutation.mutate(
      { id: event?.id || event._id || "", data: payload },
      {
        onSuccess: () => {
          notifications.show({
            title: "Event Updated Successfully!",
            message: `Your event "${payload.title}" has been updated.`,
            color: "green",
          });
          const redirectSlug = event.slug || event.id || event._id;
          router.push(`/event/${redirectSlug}`);
        },
        onError: (err) => {
          notifications.show({
            title: "Update Failed",
            message: err.message || "Failed to update event.",
            color: "red",
          });
        },
      },
    );
  };

  return (
    <Container size="md" py="xl">
      <Paper radius="md" p="xl" withBorder shadow="sm">
        <Stack gap="lg">
          <div>
            <Title order={2} fw={700}>
              Edit Event
            </Title>
            <Text size="sm" c="dimmed">
              Update the details of your upcoming event
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Event Title"
                placeholder="E.g., Tech Conference 2026"
                withAsterisk
                {...form.getInputProps("title")}
              />

              <Textarea
                label="Description"
                placeholder="What is this event about?"
                minRows={4}
                withAsterisk
                {...form.getInputProps("description")}
              />

              <Group grow align="flex-start">
                <DateTimePicker
                  label="Start Date & Time"
                  placeholder="Pick date and time"
                  withAsterisk
                  leftSection={<FiCalendar size={16} />}
                  {...form.getInputProps("startDate")}
                />
                <DateTimePicker
                  label="End Date & Time"
                  placeholder="Pick date and time"
                  withAsterisk
                  leftSection={<FiCalendar size={16} />}
                  {...form.getInputProps("endDate")}
                />
              </Group>

              <Group grow align="flex-start">
                <NumberInput
                  label="Available Seats"
                  min={event.registeredCount || 1}
                  description={`At least ${event.registeredCount || 0} seats must be available since they are already booked.`}
                  leftSection={<FiUsers size={16} />}
                  {...form.getInputProps("availableSeats")}
                />
                <NumberInput
                  label="Ticket Price ($)"
                  description="Price cannot be changed for an existing event."
                  disabled
                  leftSection={<FiDollarSign size={16} />}
                  {...form.getInputProps("price")}
                />
              </Group>

              <TextInput
                label="Tags (Optional)"
                placeholder="E.g., technology, networking, workshop"
                description="Comma separated list of tags"
                leftSection={<FiTag size={16} />}
                {...form.getInputProps("tags")}
              />

              <FileInput
                label="Event Banner Image (Optional)"
                placeholder="Upload new image to replace current"
                accept="image/png,image/jpeg,image/webp"
                leftSection={<FiUpload size={16} />}
                onChange={handleImageChange}
                clearable
              />

              {currentImagePreview && (
                <Box mt="xs">
                  <Text size="sm" fw={500} mb={4}>
                    Banner Preview
                  </Text>
                  <Paper radius="md" style={{ overflow: "hidden" }} shadow="xs">
                    <Image
                      src={currentImagePreview}
                      alt="Banner Preview"
                      height={200}
                    />
                  </Paper>
                </Box>
              )}

              <Button
                type="submit"
                size="lg"
                mt="xl"
                loading={updateEventMutation.isPending}
                leftSection={<FiCheckCircle size={20} />}
              >
                Update Event
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
