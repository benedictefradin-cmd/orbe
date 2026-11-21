import { useEffect, useState } from "react";

/** Vrai une fois la page interactive : avant, un envoi ne serait pas traité par le formulaire. */
export function usePret(): boolean {
  const [pret, setPret] = useState(false);
  useEffect(() => setPret(true), []);
  return pret;
}
