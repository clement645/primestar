import WhatsAppButton from "@/components/WhatsAppButton";

/** Mobile-only sticky WhatsApp CTA (section 5, 52). */
export default function StickyWhatsApp() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-lighter bg-white/95 p-3 backdrop-blur lg:hidden">
      <WhatsAppButton
        variant="primary"
        className="w-full"
        message="Hello Primestar, I am interested in Shangi potato seeds. Please give me more information."
      >
        Chat With Primestar on WhatsApp Directly or through +254728623619
      </WhatsAppButton>
    </div>
  );
}
