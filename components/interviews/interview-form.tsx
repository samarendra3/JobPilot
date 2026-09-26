"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { interviewSchema, type InterviewInput } from "@/schemas/interview.schema";
import { INTERVIEW_TYPES, INTERVIEW_TYPE_LABELS } from "@/constants/interview-types";
import ApplicationSelect from "@/components/interviews/application-select";

export interface InterviewFormValues {
  applicationId: string;
  type: string;
  date: string;
  time: string;
  meetingUrl: string;
  interviewer: string;
  notes: string;
}

interface InterviewFormProps {
  defaultValues?: Partial<InterviewFormValues>;
  onSubmit: (values: InterviewInput) => Promise<void>;
  submitLabel: string;
}

const EMPTY_VALUES: InterviewFormValues = {
  applicationId: "",
  type: "HR",
  date: "",
  time: "",
  meetingUrl: "",
  interviewer: "",
  notes: "",
};

const inputClass =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";
const labelClass = "text-sm font-medium text-foreground";

export default function InterviewForm({ defaultValues, onSubmit, submitLabel }: InterviewFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<InterviewFormValues>({
    defaultValues: { ...EMPTY_VALUES, ...defaultValues },
  });

  const submit = async (values: InterviewFormValues) => {
    setApiError(null);

    if (!values.date || !values.time) {
      setApiError("Please select both a date and a time");
      return;
    }

    const scheduledAt = new Date(`${values.date}T${values.time}`);
    if (Number.isNaN(scheduledAt.getTime())) {
      setApiError("Enter a valid date and time");
      return;
    }

    const parsed = interviewSchema.safeParse({
      applicationId: values.applicationId,
      type: values.type,
      scheduledAt: scheduledAt.toISOString(),
      meetingUrl: values.meetingUrl,
      interviewer: values.interviewer,
      notes: values.notes,
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "scheduledAt") {
          setError("date", { type: "validation", message: issue.message });
        } else if (typeof field === "string" && field in EMPTY_VALUES) {
          setError(field as keyof InterviewFormValues, { type: "validation", message: issue.message });
        }
      }
      setApiError(parsed.error.issues[0]?.message ?? "Please check the form for errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="applicationId" className={labelClass}>
          Application
        </label>
        <ApplicationSelect
          registration={register("applicationId", { required: true })}
          error={errors.applicationId?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="type" className={labelClass}>
            Interview Type
          </label>
          <select id="type" className={inputClass} {...register("type", { required: true })}>
            {INTERVIEW_TYPES.map((type) => (
              <option key={type} value={type}>
                {INTERVIEW_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="interviewer" className={labelClass}>
            Interviewer
          </label>
          <input id="interviewer" placeholder="e.g. Jane Doe, Engineering Manager" className={inputClass} {...register("interviewer")} />
          {errors.interviewer && <p className="text-sm text-destructive">{errors.interviewer.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date" className={labelClass}>
            Date <span className="text-destructive">*</span>
          </label>
          <input
            id="date"
            type="date"
            aria-invalid={!!errors.date}
            className={inputClass}
            {...register("date", { required: true })}
          />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="time" className={labelClass}>
            Time <span className="text-destructive">*</span>
          </label>
          <input
            id="time"
            type="time"
            aria-invalid={!!errors.time}
            className={inputClass}
            {...register("time", { required: true })}
          />
          {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="meetingUrl" className={labelClass}>
            Meeting URL
          </label>
          <input
            id="meetingUrl"
            type="url"
            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
            aria-invalid={!!errors.meetingUrl}
            className={inputClass}
            {...register("meetingUrl")}
          />
          {errors.meetingUrl && <p className="text-sm text-destructive">{errors.meetingUrl.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          placeholder="Prep notes, topics to review, panel details..."
          className={inputClass}
          {...register("notes")}
        />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      {apiError && <p className="text-sm text-destructive">{apiError}</p>}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
