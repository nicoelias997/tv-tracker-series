import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';

interface PortalProps {
  children: any;
}

/**
 * Portal component to render children outside of the parent DOM hierarchy
 * Useful for modals, tooltips, etc. that need to overlay the entire page
 */
export default function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get portal root element
    let root = document.getElementById('portal-root');

    if (!root) {
      root = document.createElement('div');
      root.id = 'portal-root';
      // Portal root should not have z-index - let children control their own z-index
      document.body.appendChild(root);
    }

    setPortalRoot(root);
    setMounted(true);

    return () => {
      // Clean up if this was the last portal
      if (root && root.childNodes.length === 0 && root.parentNode) {
        root.parentNode.removeChild(root);
      }
    };
  }, []);

  if (!mounted || !portalRoot) {
    return null;
  }

  return createPortal(children, portalRoot);
}
