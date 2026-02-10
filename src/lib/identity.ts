import { nanoid } from "nanoid";

const IDENTITY_KEY = "planpoker_identity";

interface Identity {
  oddsId: string;
  name: string;
}

export function getIdentity(): Identity | null {
  const stored = localStorage.getItem(IDENTITY_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setIdentity(name: string): Identity {
  const existing = getIdentity();
  const identity: Identity = {
    oddsId: existing?.oddsId ?? nanoid(12),
    name,
  };
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  return identity;
}

export function generateSlug(): string {
  return nanoid(8);
}
