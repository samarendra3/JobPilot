import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

process.env.NEXTAUTH_SECRET ||= "test-secret-key-for-unit-tests-only";
process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/jobpilot-test";
