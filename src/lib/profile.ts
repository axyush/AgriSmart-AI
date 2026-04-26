import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";
import { lsGet, lsSet, KEYS } from "./storage";

export interface FarmerProfile {
  name: string;
  location: string;
  crops: string[];   // crop interests
  language: string;  // lang code, also stored in agri-lang
  createdAt: number;
}

interface Ctx {
  profile: FarmerProfile | null;
  setProfile: (p: FarmerProfile | null) => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
}

const ProfileContext = createContext<Ctx | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<FarmerProfile | null>(null);
  const [onboarded, setOnboardedState] = useState<boolean>(true); // default true to avoid SSR flicker

  useEffect(() => {
    setProfileState(lsGet<FarmerProfile | null>(KEYS.profile, null));
    setOnboardedState(lsGet<boolean>(KEYS.onboarded, false));
  }, []);

  const setProfile = (p: FarmerProfile | null) => {
    setProfileState(p);
    lsSet(KEYS.profile, p);
  };
  const setOnboarded = (v: boolean) => {
    setOnboardedState(v);
    lsSet(KEYS.onboarded, v);
  };

  return createElement(ProfileContext.Provider, { value: { profile, setProfile, onboarded, setOnboarded } }, children);
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
