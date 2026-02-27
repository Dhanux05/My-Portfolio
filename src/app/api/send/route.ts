import { EmailTemplate } from "@/components/email-template";
import { config } from "@/data/config";
import { Resend } from "resend";
import { z } from "zod";

const resendApiKey =
  process.env.RESEND_API_KEY ||
  process.env.NEXT_PUBLIC_RESEND_API_KEY ||
  process.env.RESEND_APIKEY ||
  "";

// Initialize Resend only if API key is available (prevents build-time errors)
const resend = resendApiKey
  ? new Resend(resendApiKey)
  : null;
const contactTo = process.env.CONTACT_TO_EMAIL || config.email;
const rawContactFrom = process.env.CONTACT_FROM_EMAIL || "";
const defaultSender = "Portfolio Contact <onboarding@resend.dev>";
const contactFrom =
  rawContactFrom && !rawContactFrom.includes("your-verified-domain.com")
    ? rawContactFrom
    : defaultSender;

const Email = z.object({
  fullName: z.string().min(2, "Full name is invalid!"),
  email: z.string().email({ message: "Email is invalid!" }),
  message: z.string().min(10, "Message is too short!"),
});
export async function POST(req: Request) {
  try {
    // Check if API key is configured
    if (!resendApiKey || !resend) {
      return Response.json(
        {
          error:
            "Email service is not configured. Please set RESEND_API_KEY in .env.local.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      success: zodSuccess,
      data: zodData,
      error: zodError,
    } = Email.safeParse(body);
    
    if (!zodSuccess) {
      return Response.json(
        { error: zodError?.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { data: resendData, error: resendError } = await resend!.emails.send({
      from: contactFrom,
      to: [contactTo],
      replyTo: zodData.email,
      subject: `New message from ${zodData.fullName} via Portfolio`,
      react: EmailTemplate({
        fullName: zodData.fullName,
        email: zodData.email,
        message: zodData.message,
      }),
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return Response.json(
        { error: resendError.message || "Failed to send email. Please try again later." },
        { status: 500 }
      );
    }

    return Response.json({ success: true, data: resendData });
  } catch (error) {
    console.error("Email API error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
