import { Resend } from 'resend'

// TODO: set RESEND_API_KEY in environment to enable real email sending.
// When unset, both functions log a dry-run preview and resolve successfully so
// the application flow still completes (DB write + thank-you page).

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const NOTIFY_EMAIL = process.env.NEW_APPLICATION_NOTIFY_EMAIL
const FROM_NOREPLY = process.env.EMAIL_FROM_NOREPLY ?? 'FightCraft Careers <noreply@fightcraft.com>'
const FROM_HUMAN = process.env.EMAIL_FROM_HUMAN ?? 'FightCraft Careers <careers@fightcraft.com>'
const SIGNER_NAME = process.env.EMAIL_SIGNER_NAME ?? 'Josh'

const escape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const paragraphs = (text: string) =>
  escape(text)
    .split(/\n\s*\n/)
    .map(p => `<p style="margin:0 0 12px;line-height:1.55;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

interface NotifyArgs {
  applicationId: string
  roleSlug: string
  roleTitle: string
  fullName: string
  email: string
  phone?: string | null
  linkedinUrl?: string | null
  resumeUrl?: string | null
  whyThisRole: string
  keyExperience: string
  twoYearVision: string
  createdAt: Date
}

export async function sendNotificationEmail(args: NotifyArgs): Promise<void> {
  if (!NOTIFY_EMAIL) {
    console.log('[career-emails] NEW_APPLICATION_NOTIFY_EMAIL not set — skipping hiring-manager email', {
      applicationId: args.applicationId,
    })
    return
  }

  const subject = `New application: ${args.roleTitle} — ${args.fullName}`
  const html = `
<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;max-width:680px;margin:0 auto;padding:24px;">
  <h2 style="font-size:18px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">New Application</h2>
  <p style="margin:0 0 24px;color:#555;">${escape(args.roleTitle)}</p>

  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:6px 0;color:#666;width:140px;">Name</td><td style="padding:6px 0;">${escape(args.fullName)}</td></tr>
    <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;"><a href="mailto:${escape(args.email)}">${escape(args.email)}</a></td></tr>
    ${args.phone ? `<tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${escape(args.phone)}</td></tr>` : ''}
    ${args.linkedinUrl ? `<tr><td style="padding:6px 0;color:#666;">LinkedIn / portfolio</td><td style="padding:6px 0;"><a href="${escape(args.linkedinUrl)}">${escape(args.linkedinUrl)}</a></td></tr>` : ''}
    ${args.resumeUrl ? `<tr><td style="padding:6px 0;color:#666;">Resume</td><td style="padding:6px 0;"><a href="${escape(args.resumeUrl)}">${escape(args.resumeUrl)}</a></td></tr>` : ''}
  </table>

  <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:32px 0 8px;">Why this role</h3>
  ${paragraphs(args.whyThisRole)}

  <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:24px 0 8px;">A hard moment, handled</h3>
  ${paragraphs(args.keyExperience)}

  <h3 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:24px 0 8px;">Two-year vision</h3>
  ${paragraphs(args.twoYearVision)}

  <hr style="border:none;border-top:1px solid #ddd;margin:32px 0 16px;">
  <p style="font-size:12px;color:#888;margin:0;">
    Application ID: ${args.applicationId}<br>
    Submitted: ${args.createdAt.toISOString()}<br>
    Role slug: ${escape(args.roleSlug)}
  </p>
</body></html>`

  if (!resend) {
    console.log('[career-emails] DRY RUN notification email', { to: NOTIFY_EMAIL, subject, applicationId: args.applicationId })
    return
  }

  try {
    await resend.emails.send({
      from: FROM_NOREPLY,
      to: NOTIFY_EMAIL,
      replyTo: args.email,
      subject,
      html,
    })
  } catch (err) {
    console.error('[career-emails] notification send failed', err)
  }
}

interface ConfirmationArgs {
  applicantEmail: string
  fullName: string
  roleTitle: string
}

export async function sendApplicantConfirmation(args: ConfirmationArgs): Promise<void> {
  const firstName = (args.fullName.trim().split(/\s+/)[0] || 'there').replace(/[^A-Za-z'-]/g, '') || 'there'

  const subject = 'We got your application — here is what happens next'
  const html = `
<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;max-width:560px;margin:0 auto;padding:24px;font-size:15px;line-height:1.55;">
  <p style="margin:0 0 16px;">Hi ${escape(firstName)},</p>
  <p style="margin:0 0 16px;">Thanks for applying for the ${escape(args.roleTitle)} role. Your application is in.</p>
  <p style="margin:0 0 16px;">Here is what happens next: someone on our team reads every application that comes in. We respond to all of them, usually within 5 business days. If we want to move forward, the next step is a 20-minute phone screen.</p>
  <p style="margin:0 0 16px;">In the meantime, no need to follow up — we will reach out either way.</p>
  <p style="margin:24px 0 4px;">Talk soon,</p>
  <p style="margin:0;">${escape(SIGNER_NAME)}</p>
</body></html>`

  if (!resend) {
    console.log('[career-emails] DRY RUN confirmation email', { to: args.applicantEmail, subject })
    return
  }

  try {
    await resend.emails.send({
      from: FROM_HUMAN,
      to: args.applicantEmail,
      subject,
      html,
    })
  } catch (err) {
    console.error('[career-emails] confirmation send failed', err)
  }
}
