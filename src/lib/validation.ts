
import { z } from "zod";

// Enhanced URL validation
const urlSchema = z.string().url("Please enter a valid URL").refine(
  (url) => {
    try {
      const parsedUrl = new URL(url);
      // Allow http and https protocols only
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  },
  "URL must use http or https protocol"
);

// LinkedIn URL validation
const linkedinUrlSchema = z.string().url("Please enter a valid LinkedIn URL").refine(
  (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname === 'www.linkedin.com' || parsedUrl.hostname === 'linkedin.com';
    } catch {
      return false;
    }
  },
  "Please enter a valid LinkedIn URL"
);

// Google Drive URL validation
const googleDriveUrlSchema = z.string().url("Please enter a valid Google Drive URL").refine(
  (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname === 'drive.google.com' && 
             (parsedUrl.pathname.includes('/file/d/') || parsedUrl.pathname.includes('/open'));
    } catch {
      return false;
    }
  },
  "Please enter a valid Google Drive sharing URL"
);

// Enhanced email validation
const emailSchema = z.string().email("Please enter a valid email address").refine(
  (email) => {
    // Additional email validation beyond basic regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
  },
  "Please enter a valid email address"
);

// Name validation (prevent common injection attempts)
const nameSchema = z.string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .refine(
    (name) => !/[<>{}[\]\\\/]/.test(name),
    "Name contains invalid characters"
  );

// Company name validation
const companyNameSchema = z.string()
  .min(2, "Company name must be at least 2 characters")
  .max(200, "Company name must be less than 200 characters")
  .refine(
    (name) => !/[<>{}[\]\\\/]/.test(name),
    "Company name contains invalid characters"
  );

// Location validation
const locationSchema = z.string()
  .max(100, "Location must be less than 100 characters")
  .refine(
    (location) => !/[<>{}[\]\\\/]/.test(location),
    "Location contains invalid characters"
  )
  .optional();

// Venmo handle validation
const venmoHandleSchema = z.string()
  .refine(
    (handle) => !handle || handle.startsWith('@'),
    "Venmo handle must start with @"
  )
  .refine(
    (handle) => !handle || /^@[a-zA-Z0-9_-]{5,30}$/.test(handle),
    "Invalid Venmo handle format"
  )
  .optional();

export const formSchema = z.object({
  reporterName: nameSchema,
  reporterEmail: emailSchema,
  ghostName: nameSchema,
  companyName: companyNameSchema,
  ghostPhotoURL: linkedinUrlSchema,
  dateGhosted: z.date({
    required_error: "Date is required"
  }).refine(
    (date) => date <= new Date(),
    "Date cannot be in the future"
  ),
  evidenceURL: googleDriveUrlSchema,
  venmoHandle: venmoHandleSchema,
  location: locationSchema
});

export type FormValues = z.infer<typeof formSchema>;
