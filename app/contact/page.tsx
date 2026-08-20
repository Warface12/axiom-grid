import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact — Nivaro",
  description: "Contact the Nivaro team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="container page legal-page">
      <h1>Contact</h1>
      <p>For partnership, affiliate or general inquiries, reach us at:</p>
      <p><strong>Email:</strong> contact@nivaro.com</p>
      <form className="contact-form">
        <label className="admin-field"><span>Name</span><input name="name" required /></label>
        <label className="admin-field"><span>Email</span><input type="email" name="email" required /></label>
        <label className="admin-field"><span>Message</span><textarea name="message" rows={5} required /></label>
        <button type="submit" className="primary-btn">Send message</button>
      </form>
      <p className="notice">Contact form backend can be connected to your email service or CRM.</p>
    </main>
  );
}
