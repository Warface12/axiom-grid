import Script from "next/script";

export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!ga) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`} strategy="lazyOnload" />
      <Script id="toppick-ga" strategy="lazyOnload">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${ga}', { anonymize_ip: true });
      `}</Script>
    </>
  );
}
