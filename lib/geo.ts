export type GeoLocale = {
  code: string;
  label: string;
};

export type GeoMarket = {
  code: string;
  name: string;
  flag: string;
  defaultLanguage: string;
  languages: GeoLocale[];
  currency?: string;
  regions?: { code: string; name: string }[];
  featured?: boolean;
};

export const GEO_MARKETS: GeoMarket[] = [
  { code: "gb", name: "United Kingdom", flag: "🇬🇧", defaultLanguage: "en", currency: "GBP", featured: true, languages: [{ code: "en", label: "English" }] },
  { code: "dk", name: "Denmark", flag: "🇩🇰", defaultLanguage: "da", currency: "DKK", featured: true, languages: [{ code: "da", label: "Dansk" }, { code: "en", label: "English" }] },
  { code: "ca", name: "Canada", flag: "🇨🇦", defaultLanguage: "en", currency: "CAD", featured: false, languages: [{ code: "en", label: "English" }], regions: [{ code: "ontario", name: "Ontario" }] },
];

export function getGeoMarket(code: string) {
  return GEO_MARKETS.find((market) => market.code === code.toLowerCase());
}

export function isGeoLanguage(market: GeoMarket, language: string) {
  return market.languages.some((item) => item.code === language.toLowerCase());
}

export function marketPath(code: string, language?: string) {
  const market = getGeoMarket(code);
  if (!market) return "/markets";
  const lang = language || market.defaultLanguage;
  return `/markets/${market.code}/${lang}`;
}

type MarketCopy = {
  eyebrow: string;
  title: (market: string) => string;
  description: (market: string) => string;
  verifiedLabel: string;
  regionsLabel: string;
  emptyTitle: string;
  emptyText: string;
  regionEyebrow: string;
  regionTitle: (region: string) => string;
  regionDescription: (region: string, market: string) => string;
};

const MARKET_COPY: Record<string, MarketCopy> = {
  en: {
    eyebrow: "LOCAL CASINO DISCOVERY",
    title: (market) => `${market} online casinos`,
    description: (market) => `Compare NivaroBet partner casinos whose market eligibility is explicitly approved for ${market}. Review current offers, payment details, availability and monitoring signals before visiting an operator.`,
    verifiedLabel: "Market-approved listings",
    regionsLabel: "Regional guides",
    emptyTitle: "No approved listings yet",
    emptyText: "This market is prepared in the platform but stays out of promotional placements until market eligibility and partner permission are confirmed.",
    regionEyebrow: "REGIONAL CASINO GUIDE",
    regionTitle: (region) => `${region} online casinos`,
    regionDescription: (region, market) => `Partner casino information explicitly tagged for ${region}, ${market}. Regional availability and offer terms are monitored independently when reliable sources are available.`,
  },
  de: {
    eyebrow: "LOKALE CASINO-SUCHE",
    title: (market) => `Online-Casinos in ${market}`,
    description: (market) => `Vergleiche NivaroBet-Partnercasinos, deren Verfügbarkeit für ${market} ausdrücklich bestätigt wurde. Prüfe aktuelle Boni, Zahlungsmethoden, Verfügbarkeit und Verifizierungsdaten.`,
    verifiedLabel: "Verifizierte Angebote",
    regionsLabel: "Regionale Guides",
    emptyTitle: "Noch keine verifizierten Einträge",
    emptyText: "Dieser Markt ist technisch vorbereitet, wird aber erst beworben, sobald verifizierte Partnerdaten verfügbar sind.",
    regionEyebrow: "REGIONALER CASINO-GUIDE",
    regionTitle: (region) => `Online-Casinos in ${region}`,
    regionDescription: (region, market) => `Partnercasino-Informationen mit bestätigter Zuordnung zu ${region}, ${market}. Regionale Verfügbarkeit und Angebote werden bei belastbaren Quellen separat überwacht.`,
  },
  fr: {
    eyebrow: "DÉCOUVERTE CASINO LOCALE",
    title: (market) => `Casinos en ligne au ${market}`,
    description: (market) => `Comparez les casinos partenaires NivaroBet dont la disponibilité est explicitement vérifiée pour ${market}. Consultez les bonus, paiements, disponibilités et signaux de vérification actuels.`,
    verifiedLabel: "Offres vérifiées",
    regionsLabel: "Guides régionaux",
    emptyTitle: "Aucune offre vérifiée pour le moment",
    emptyText: "Ce marché est prêt techniquement mais n'est pas mis en avant tant que des données partenaires vérifiées ne sont pas disponibles.",
    regionEyebrow: "GUIDE CASINO RÉGIONAL",
    regionTitle: (region) => `Casinos en ligne en ${region}`,
    regionDescription: (region, market) => `Informations sur les casinos partenaires explicitement associées à ${region}, ${market}. La disponibilité régionale et les offres sont suivies séparément lorsque des sources fiables existent.`,
  },
  es: {
    eyebrow: "DESCUBRIMIENTO DE CASINOS LOCALES",
    title: (market) => `Casinos online en ${market}`,
    description: (market) => `Compara casinos asociados de NivaroBet con disponibilidad verificada explícitamente para ${market}. Revisa bonos actuales, pagos, disponibilidad y señales de verificación.`,
    verifiedLabel: "Listados verificados",
    regionsLabel: "Guías regionales",
    emptyTitle: "Aún no hay listados verificados",
    emptyText: "Este mercado está preparado técnicamente, pero no se promociona hasta que existan datos verificados de socios.",
    regionEyebrow: "GUÍA REGIONAL DE CASINOS",
    regionTitle: (region) => `Casinos online en ${region}`,
    regionDescription: (region, market) => `Información de casinos asociados etiquetada explícitamente para ${region}, ${market}. La disponibilidad regional y las ofertas se supervisan de forma independiente cuando existen fuentes fiables.`,
  },
  it: {
    eyebrow: "SCOPERTA CASINÒ LOCALE",
    title: (market) => `Casinò online in ${market}`,
    description: (market) => `Confronta i casinò partner NivaroBet con disponibilità verificata esplicitamente per ${market}. Controlla bonus, pagamenti, disponibilità e segnali di verifica aggiornati.`,
    verifiedLabel: "Elenco verificato",
    regionsLabel: "Guide regionali",
    emptyTitle: "Nessun elenco verificato al momento",
    emptyText: "Questo mercato è già predisposto tecnicamente, ma non viene promosso finché non sono disponibili dati partner verificati.",
    regionEyebrow: "GUIDA CASINÒ REGIONALE",
    regionTitle: (region) => `Casinò online in ${region}`,
    regionDescription: (region, market) => `Informazioni sui casinò partner associate esplicitamente a ${region}, ${market}. Disponibilità e offerte regionali vengono monitorate separatamente quando esistono fonti affidabili.`,
  },
  nl: {
    eyebrow: "LOKALE CASINO-ONTDEKKING",
    title: (market) => `Online casino's in ${market}`,
    description: (market) => `Vergelijk NivaroBet-partnercasino's waarvan de beschikbaarheid voor ${market} expliciet is geverifieerd. Bekijk actuele bonussen, betalingen, beschikbaarheid en verificatiesignalen.`,
    verifiedLabel: "Geverifieerde vermeldingen",
    regionsLabel: "Regionale gidsen",
    emptyTitle: "Nog geen geverifieerde vermeldingen",
    emptyText: "Deze markt is technisch voorbereid, maar wordt pas gepromoot zodra geverifieerde partnergegevens beschikbaar zijn.",
    regionEyebrow: "REGIONALE CASINOGIDS",
    regionTitle: (region) => `Online casino's in ${region}`,
    regionDescription: (region, market) => `Partnercasino-informatie die expliciet is gekoppeld aan ${region}, ${market}. Regionale beschikbaarheid en aanbiedingen worden afzonderlijk gemonitord wanneer betrouwbare bronnen beschikbaar zijn.`,
  },
  pt: {
    eyebrow: "DESCOBERTA DE CASINOS LOCAIS",
    title: (market) => `Casinos online em ${market}`,
    description: (market) => `Compare casinos parceiros da NivaroBet com disponibilidade explicitamente verificada para ${market}. Consulte bónus atuais, pagamentos, disponibilidade e sinais de verificação.`,
    verifiedLabel: "Listagens verificadas",
    regionsLabel: "Guias regionais",
    emptyTitle: "Ainda não existem listagens verificadas",
    emptyText: "Este mercado está preparado tecnicamente, mas só é promovido quando existem dados de parceiros verificados.",
    regionEyebrow: "GUIA REGIONAL DE CASINOS",
    regionTitle: (region) => `Casinos online em ${region}`,
    regionDescription: (region, market) => `Informação de casinos parceiros explicitamente associada a ${region}, ${market}. A disponibilidade regional e as ofertas são monitorizadas separadamente quando existem fontes fiáveis.`,
  },

  no: {
    eyebrow: "LOKAL CASINOOVERSIKT",
    title: (market) => `Nettcasinoer i ${market}`,
    description: (market) => `Sammenlign NivaroBet-partnercasinoer som er eksplisitt bekreftet tilgjengelige i ${market}. Se oppdaterte bonuser, betalinger, tilgjengelighet og verifiseringssignaler.`,
    verifiedLabel: "Verifiserte oppføringer", regionsLabel: "Regionale guider",
    emptyTitle: "Ingen verifiserte oppføringer ennå", emptyText: "Markedet er teknisk klargjort, men promoteres ikke før verifiserte partnerdata er tilgjengelige.",
    regionEyebrow: "REGIONAL CASINOGUIDE", regionTitle: (region) => `Nettcasinoer i ${region}`, regionDescription: (region, market) => `Partnercasino-informasjon eksplisitt knyttet til ${region}, ${market}. Regional tilgjengelighet og tilbud overvåkes separat når pålitelige kilder finnes.`,
  },
  da: {
    eyebrow: "LOKAL CASINOOVERSIGT",
    title: (market) => `Online casinoer i ${market}`,
    description: (market) => `Sammenlign NivaroBet-partnercasinoer med eksplicit verificeret tilgængelighed i ${market}. Se aktuelle bonusser, betalinger, tilgængelighed og verificeringssignaler.`,
    verifiedLabel: "Verificerede lister", regionsLabel: "Regionale guides",
    emptyTitle: "Ingen verificerede lister endnu", emptyText: "Markedet er teknisk klargjort, men promoveres først, når verificerede partnerdata er tilgængelige.",
    regionEyebrow: "REGIONAL CASINOGUIDE", regionTitle: (region) => `Online casinoer i ${region}`, regionDescription: (region, market) => `Partnercasino-information eksplicit knyttet til ${region}, ${market}. Regional tilgængelighed og tilbud overvåges separat, når pålidelige kilder findes.`,
  },
  fi: {
    eyebrow: "PAIKALLINEN KASINOVERTAILU",
    title: (market) => `Nettikasinot – ${market}`,
    description: (market) => `Vertaa NivaroBet-kumppanikasinoita, joiden saatavuus alueella ${market} on vahvistettu. Tarkista ajantasaiset bonukset, maksutavat, saatavuus ja varmennustiedot.`,
    verifiedLabel: "Vahvistetut listaukset", regionsLabel: "Alueelliset oppaat",
    emptyTitle: "Ei vielä vahvistettuja listauksia", emptyText: "Markkina on teknisesti valmis, mutta sitä ei nosteta esiin ennen kuin vahvistettua kumppanidataa on saatavilla.",
    regionEyebrow: "ALUEELLINEN KASINO-OPAS", regionTitle: (region) => `Nettikasinot – ${region}`, regionDescription: (region, market) => `Kumppanikasinoiden tiedot, jotka on nimenomaisesti liitetty alueeseen ${region}, ${market}. Alueellista saatavuutta ja tarjouksia seurataan erikseen luotettavien lähteiden perusteella.`,
  },
  sv: {
    eyebrow: "LOKAL CASINOUPPTÄCKT",
    title: (market) => `Onlinecasinon i ${market}`,
    description: (market) => `Jämför NivaroBet-partnercasinon vars tillgänglighet för ${market} uttryckligen har verifierats. Se aktuella bonusar, betalningar, tillgänglighet och verifieringssignaler.`,
    verifiedLabel: "Verifierade listningar",
    regionsLabel: "Regionala guider",
    emptyTitle: "Inga verifierade listningar ännu",
    emptyText: "Marknaden är tekniskt förberedd men marknadsförs inte förrän verifierade partneruppgifter finns.",
    regionEyebrow: "REGIONAL CASINOGUIDE",
    regionTitle: (region) => `Onlinecasinon i ${region}`,
    regionDescription: (region, market) => `Partnercasinoinformation uttryckligen märkt för ${region}, ${market}. Regional tillgänglighet och erbjudanden övervakas separat när tillförlitliga källor finns.`,
  },
};

export function getMarketCopy(language: string): MarketCopy {
  return MARKET_COPY[language.toLowerCase()] || MARKET_COPY.en;
}
