import { EmailTemplate } from "@/components/email-template";
import { config } from "@/data/config";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set. Email functionality will not work.");
}

const Email = z.object({
  fullName: z.string().min(2, "Full name is invalid!"),
  email: z.string().email({ message: "Email is invalid!" }),
  message: z.string().min(10, "Message is too short!"),
});
export async function POST(req: Request) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        { error: "Email service is not configured. Please set RESEND_API_KEY environment variable." },
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

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [config.email],
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
        { error: "Failed to send email. Please try again later." },
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
