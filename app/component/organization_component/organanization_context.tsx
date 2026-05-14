"use client";
import React, { createContext, useContext, useState } from "react";

interface Props {
  organizationId: string;
  setOrganizationId: React.Dispatch<React.SetStateAction<string>>;
}

const organizationContext = createContext<Props | null>(null);
export default function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [organizationId, setOrganizationId] = useState<string>("");
  return (
    <organizationContext.Provider
      value={{ organizationId, setOrganizationId }}
    >
      {children}
    </organizationContext.Provider>
  );
}

export const useOrganizationContext = () => {
  const context = useContext(organizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within OrganizationProvider');
  }
  return context;
};
