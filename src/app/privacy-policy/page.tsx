import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Primestar Potato Seeds privacy policy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page py-14">
      <div className="prose prose-headings:font-heading prose-headings:text-brand-dark mx-auto max-w-3xl text-brand-dark/80">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2>Overview</h2>
        <p>
          Primestar Potato Seeds (&quot;Primestar&quot;, &quot;we&quot;,
          &quot;us&quot;) operates this website to share information about
          Shangi potato seeds and potato farming, and to allow farmers to
          contact us on WhatsApp. This policy explains what information we
          process and why.
        </p>

        <h2>Referral Attribution Technology</h2>
        <p>
          Primestar works with independent workers who share personal
          referral links with farmers. When a visitor opens a referral link
          (e.g. <code>?ref=WORKERCODE</code>), our system records that a
          referral click occurred, so we can measure the traffic each worker
          generates.
        </p>
        <p>
          To prevent the same visit being counted multiple times, we process
          the visitor&apos;s IP address using a one-way cryptographic
          function (HMAC) with a secret key stored only on our servers. We
          store this resulting hash — not the raw IP address — together with
          the worker&apos;s referral code, and use a database rule so that
          only one click per IP address is counted per worker.
        </p>
        <p>
          This means several people sharing the same public IP address (for
          example, farmers using the same Wi-Fi network) may be counted as a
          single referral visit for that worker. This is an intentional
          limitation of IP-based counting, not an error.
        </p>

        <h2>Referral Cookie</h2>
        <p>
          When a valid referral link is used, we set a first-party cookie
          recording the referral code so that the same worker remains
          credited as you browse other pages on our site. This cookie
          expires after a configurable period (30 days by default).
        </p>

        <h2>WhatsApp Click Tracking</h2>
        <p>
          When you click a &quot;Chat With Primestar&quot; or similar
          WhatsApp button, we record that a WhatsApp click occurred,
          including the page you clicked from and (if applicable) the
          referring worker&apos;s code. We can only confirm that the button
          was clicked and WhatsApp was opened — we cannot see whether you
          actually sent a message unless a separate WhatsApp Business
          integration is added in future.
        </p>

        <h2>Farmer Accounts</h2>
        <p>
          If you choose to create a farmer account, we store the details you
          provide (such as name, email/phone, and farm location) to provide
          personalized features such as weather alerts and crop-stage
          reminders. This information is never shown to other farmers,
          workers, or the public.
        </p>

        <h2>Location Data</h2>
        <p>
          If you use the &quot;Use My Current Field Location&quot; feature,
          your browser will ask for temporary permission to share your GPS
          location. We use this only to fetch weather information for that
          request and do not continuously track your location. We do not
          store precise coordinates unless you explicitly choose to save
          them to your profile.
        </p>

        <h2>What We Do Not Collect</h2>
        <p>
          Visitors do not need an account to browse the website, read
          farming content, use the public calculator, or contact us on
          WhatsApp. We do not collect unnecessary personal information from
          general visitors.
        </p>

        <h2>Contact</h2>
        <p>Questions about this policy can be sent to us on WhatsApp.</p>
      </div>
    </div>
  );
}
