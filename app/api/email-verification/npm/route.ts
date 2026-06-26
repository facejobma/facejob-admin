import { NextRequest, NextResponse } from "next/server";
import { validate } from "deep-email-validator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VerificationStatus = "valid" | "invalid" | "unknown";

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

async function isAuthenticatedAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization || !backendBaseUrl) {
    return false;
  }

  const response = await fetch(`${backendBaseUrl}/api/v1/user`, {
    headers: {
      Accept: "application/json",
      Authorization: authorization,
    },
    cache: "no-store",
  }).catch(() => null);

  return Boolean(response?.ok);
}

function mapValidatorStatus(result: Awaited<ReturnType<typeof validate>>) {
  if (result.valid) {
    return {
      status: "valid" as VerificationStatus,
      reason: "Adresse acceptee par deep-email-validator",
    };
  }

  const failedLevel = result.reason;
  const failedReason = failedLevel
    ? result.validators[failedLevel]?.reason || failedLevel
    : "Validation impossible";
  const normalizedReason = failedReason.toLowerCase();

  if (failedLevel && ["regex", "typo", "disposable", "mx"].includes(failedLevel)) {
    return {
      status: "invalid" as VerificationStatus,
      reason: failedReason,
    };
  }

  if (
    failedLevel === "smtp" &&
    /(mailbox not found|user unknown|no such user|recipient rejected|does not exist|invalid mailbox)/i.test(
      failedReason,
    )
  ) {
    return {
      status: "invalid" as VerificationStatus,
      reason: failedReason,
    };
  }

  if (
    normalizedReason.includes("timeout") ||
    normalizedReason.includes("connection") ||
    normalizedReason.includes("unable")
  ) {
    return {
      status: "unknown" as VerificationStatus,
      reason: failedReason,
    };
  }

  return {
    status: "unknown" as VerificationStatus,
    reason: failedReason,
  };
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedAdmin(request))) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const senderEmail =
    typeof body.sender_email === "string"
      ? body.sender_email.trim()
      : "contact@facejob.ma";

  if (!email) {
    return NextResponse.json({ message: "Email requis" }, { status: 422 });
  }

  const result = await validate({
    email,
    sender: senderEmail,
    validateRegex: true,
    validateTypo: true,
    validateDisposable: true,
    validateMx: true,
    validateSMTP: true,
  });

  const mapped = mapValidatorStatus(result);

  return NextResponse.json({
    email,
    status: mapped.status,
    reason: mapped.reason,
    smtp_code: null,
    mx_host: null,
    provider: "deep-email-validator",
    validators: result.validators,
  });
}
