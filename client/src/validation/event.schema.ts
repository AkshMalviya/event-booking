import * as yup from "yup";

export const createEventSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters"),
  description: yup
    .string()
    .trim()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  startDate: yup
    .date()
    .nullable()
    .typeError("Start date & time is required")
    .test("required", "Start date & time is required", (val) => val != null)
    .test(
      "is-future",
      "Start date & time must be in the future for upcoming events",
      (val) => {
        if (!val) return true;
        return new Date(val).getTime() > Date.now();
      }
    ),
  endDate: yup
    .date()
    .nullable()
    .typeError("End date & time is required")
    .test("required", "End date & time is required", (val) => val != null)
    .test(
      "is-after-start",
      "End date & time must be after start date & time",
      function (val) {
        if (!val) return true;
        const { startDate } = this.parent;
        if (!startDate) return true;
        return new Date(val).getTime() > new Date(startDate).getTime();
      }
    ),
  availableSeats: yup
    .number()
    .typeError("Available seats must be a number")
    .required("At least 1 seat is required")
    .min(1, "At least 1 seat is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price cannot be negative")
    .min(0, "Price cannot be negative"),
  tags: yup.string().optional(),
});

export type CreateEventFormValues = yup.InferType<typeof createEventSchema>;
