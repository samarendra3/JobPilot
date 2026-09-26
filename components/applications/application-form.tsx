"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { applicationSchema, type ApplicationInput } from "@/schemas/application.schema";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS } from "@/constants/application-status";
import { JOB_TYPES, JOB_TYPE_LABELS } from "@/constants/job-type";
import { WORK_MODES, WORK_MODE_LABELS } from "@/constants/work-mode";

export interface ApplicationFormValues {
  company: string;
  jobTitle: string;
  location: string;
  jobType: string;
  workMode: string;
  salary: string;
  jobUrl: string;
  description: string;
  status: string;
  appliedAt: string;
  notes: string;
}

interface ApplicationFormProps {
  defaultValues?: Partial<ApplicationFormValues>;
  onSubmit: (values: ApplicationInput) => Promise<void>;
  submitLabel: string;
}

const EMPTY_VALUES: ApplicationFormValues = {
  company: "",
  jobTitle: "",
  location: "",
  jobType: "",
  workMode: "",
  salary: "",
  jobUrl: "",
  description: "",
  status: "SAVED",
  appliedAt: "",
  notes: "",
};

const inputClass =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground";
const labelClass = "text-sm font-medium text-foreground";

export default function ApplicationForm({ defaultValues, onSubmit, submitLabel }: ApplicationFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    defaultValues: { ...EMPTY_VALUES, ...defaultValues },
  });

  const submit = async (values: ApplicationFormValues) => {
    setApiError(null);

    const parsed = applicationSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in EMPTY_VALUES) {
          setError(field as keyof ApplicationFormValues, { type: "validation", message: issue.message });
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="company" className={labelClass}>
            Company <span className="text-destructive">*</span>
          </label>
          <input
            id="company"
            placeholder="e.g. Acme Corp"
            aria-invalid={!!errors.company}
            className={inputClass}
            {...register("company", { required: true })}
          />
          {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="jobTitle" className={labelClass}>
            Job Title <span className="text-destructive">*</span>
          </label>
          <input
            id="jobTitle"
            placeholder="e.g. Senior Frontend Engineer"
            aria-invalid={!!errors.jobTitle}
            className={inputClass}
            {...register("jobTitle", { required: true })}
          />
          {errors.jobTitle && <p className="text-sm text-destructive">{errors.jobTitle.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input id="location" placeholder="e.g. Bengaluru, India (Remote)" className={inputClass} {...register("location")} />
          {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="jobType" className={labelClass}>
            Job Type
          </label>
          <select id="jobType" className={inputClass} {...register("jobType")}>
            <option value="">Select job type</option>
            {JOB_TYPES.map((type) => (
              <option key={type} value={type}>
                {JOB_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="workMode" className={labelClass}>
            Work Mode
          </label>
          <select id="workMode" className={inputClass} {...register("workMode")}>
            <option value="">Select work mode</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="salary" className={labelClass}>
            Salary
          </label>
          <input id="salary" placeholder="e.g. ₹18–22 LPA" className={inputClass} {...register("salary")} />
          {errors.salary && <p className="text-sm text-destructive">{errors.salary.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="jobUrl" className={labelClass}>
            Job URL
          </label>
          <input
            id="jobUrl"
            type="url"
            placeholder="https://company.com/careers/job-id"
            aria-invalid={!!errors.jobUrl}
            className={inputClass}
            {...register("jobUrl")}
          />
          {errors.jobUrl && <p className="text-sm text-destructive">{errors.jobUrl.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select id="status" className={inputClass} {...register("status")}>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {APPLICATION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="appliedAt" className={labelClass}>
            Applied Date
          </label>
          <input id="appliedAt" type="date" aria-invalid={!!errors.appliedAt} className={inputClass} {...register("appliedAt")} />
          {errors.appliedAt && <p className="text-sm text-destructive">{errors.appliedAt.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Paste the job description or key responsibilities..."
          className={inputClass}
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Referral contact, prep notes, follow-up reminders..."
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
