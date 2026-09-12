import type { CatalogKind } from "@/lib/catalog";

export function hubFaqs(cat: CatalogKind): { question: string; answer: string }[] {
  return [
    {
      question: `Does TopPick rank ${cat.plural.toLowerCase()}?`,
      answer: `No. ${cat.plural} are researched as a class. If a reviewed public profile does not exist yet, the directory stays empty instead of filling with invented brands.`,
    },
    {
      question: `What do you compare for ${cat.plural.toLowerCase()}?`,
      answer: cat.summary,
    },
    {
      question: "Will missing fees or licenses be estimated?",
      answer: "No. Undisclosed fields stay empty. TopPick does not invent fees, ratings, traffic or live market data to complete a table.",
    },
    {
      question: "Does my country change what I can use?",
      answer: "Yes. Product availability and whether TopPick can promote a product are stored separately per market. A global homepage is not proof of access.",
    },
  ];
}

export function hubCompareNotes(cat: CatalogKind) {
  return [
    `Stay inside ${cat.plural.toLowerCase()} — do not mix this class with a different job.`,
    "Read custody first: who can move the asset, and what happens if the operator pauses withdrawals.",
    "Treat unpublished fees, licenses and yields as missing evidence, not as a hidden pass.",
    "Check the market record before you treat a button as available in your country.",
  ];
}
