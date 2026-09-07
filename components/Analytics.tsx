import Script from "next/script";

export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!ga) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="afterInteractive" />
      <Script id="toppick-ga" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${ga}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}
