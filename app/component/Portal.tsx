// app/components/Portal.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export default function Portal({ children, containerId = "modal-root" }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Find or create the portal container
    let portalContainer = document.getElementById(containerId);
    
    if (!portalContainer) {
      portalContainer = document.createElement("div");
      portalContainer.id = containerId;
      portalContainer.style.position = "relative";
      portalContainer.style.zIndex = "9999";
      document.body.appendChild(portalContainer);
    }
    
    setContainer(portalContainer);
    
    return () => {
      // Only remove if we created it and it's still a child of body
      if (portalContainer && 
          portalContainer.parentNode === document.body && 
          portalContainer.children.length === 0) {
        try {
          document.body.removeChild(portalContainer);
        } catch (error) {
          console.warn("Failed to remove portal container:", error);
        }
      }
    };
  }, [containerId]);

  if (!mounted || !container) return null;
  
  return createPortal(children, container);
}