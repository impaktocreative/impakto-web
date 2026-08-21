import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloating from "@/components/layout/WhatsAppFloating";
import AsesorFlotante from "@/components/chat/AsesorFlotante";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <WhatsAppFloating />
      <AsesorFlotante />
      <Footer />
    </>
  );
}
