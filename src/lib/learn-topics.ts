export type LearnTopic = {
  slug: string;
  title: string;
  subtitle: string;
  position: number;
};

export const LEARN_TOPICS: LearnTopic[] = [
  {
    slug: 'vdxf-keys',
    title: 'VDXF Keys',
    subtitle: 'How semantic keys are deterministically derived from URIs',
    position: 1,
  },
  {
    slug: 'contentmultimap',
    title: 'contentmultimap',
    subtitle: 'The on-chain key-value store inside every identity',
    position: 2,
  },
  {
    slug: 'signdata',
    title: 'signdata',
    subtitle: 'How data gets signed into a Merkle Mountain Range',
    position: 3,
  },
  {
    slug: 'verifysignature',
    title: 'verifysignature',
    subtitle: 'One RPC call to verify any signature, no auth required',
    position: 4,
  },
  {
    slug: 'identity',
    title: 'VerusID',
    subtitle: 'Self-sovereign identity as the container for everything',
    position: 5,
  },
  {
    slug: 'sendcurrency',
    title: 'sendcurrency',
    subtitle: 'Encrypted file delivery via shielded transactions',
    position: 6,
  },
  {
    slug: 'on-chain-rights',
    title: 'On-Chain Rights',
    subtitle: 'Rights assertions that travel with identity control',
    position: 7,
  },
  {
    slug: 'trust-model',
    title: 'The Trust Model',
    subtitle: 'How all the pieces compose into zero-trust verification',
    position: 8,
  },
  {
    slug: 'control-tokens',
    title: 'ID Control Tokens',
    subtitle: 'How definecurrency creates a transferable token bound to an identity',
    position: 9,
  },
  {
    slug: 'marketplace',
    title: 'Verus Marketplace',
    subtitle: 'Decentralized atomic swaps with makeoffer, getoffers, and takeoffer',
    position: 10,
  },
];

export function getAdjacentTopics(slug: string): {
  prev?: LearnTopic;
  next?: LearnTopic;
} {
  const idx = LEARN_TOPICS.findIndex((t) => t.slug === slug);
  return {
    prev: idx > 0 ? LEARN_TOPICS[idx - 1] : undefined,
    next: idx < LEARN_TOPICS.length - 1 ? LEARN_TOPICS[idx + 1] : undefined,
  };
}
