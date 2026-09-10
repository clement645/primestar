import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Primestar Potato Seeds terms of use.",
};

export default function TermsOfUsePage() {
  return (
    <div className="container-page py-14">
      <div className="prose prose-headings:font-heading prose-headings:text-brand-dark mx-auto max-w-3xl text-brand-dark/80">
        <h1>Terms of Use</h1>
        <p>Last updated: {new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2>Use of This Website</h2>
        <p>
          This website provides general information about Shangi potato
          seeds and potato farming practices for educational purposes. It
          does not require visitors to create an account to browse content,
          use the public calculator, or contact us on WhatsApp.
        </p>

        <h2>No Agronomic or Financial Guarantee</h2>
        <p>
          Farming guidance, calculator results, weather alerts, and crop-stage
          reminders on this website are estimates and general guidance only.
          They are not a guarantee of yield, quality, profit, or crop
          performance. Actual results depend on many factors including
          weather, soil, seed quality, farm management and market conditions.
          Always use your own judgment and seek qualified agricultural advice
          where appropriate.
        </p>

        <h2>Worker Referral Program</h2>
        <p>
          Workers who share Primestar referral links agree that referral
          click and WhatsApp conversion statistics are determined solely by
          our server-side systems and database records, and cannot be
          manually adjusted by a worker. Attempting to manipulate referral
          statistics (for example, generating artificial traffic) may result
          in account suspension.
        </p>

        <h2>Accounts</h2>
        <p>
          Worker and admin accounts are provided for authorized personnel
          only. Farmer accounts are optional and may be created and closed
          by the account holder at any time. Do not share your account
          credentials with others.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the
          website after changes are posted constitutes acceptance of the
          updated terms.
        </p>

        <h2>Contact</h2>
        <p>Questions about these terms can be sent to us on WhatsApp.</p>
      </div>
    </div>
  );
}
