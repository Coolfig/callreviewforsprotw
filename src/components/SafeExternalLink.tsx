import { ExternalLink } from "lucide-react";
import { ReactNode } from "react";

interface SafeExternalLinkProps {
  url: string | null | undefined;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}

function isValidExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * SafeExternalLink — validates URLs before rendering outbound links.
 * - Only renders as <a> if the URL starts with http:// or https://
 * - Always opens in new tab with noopener noreferrer
 * - Never appends extra query params
 * - Shows "Link unavailable" state if URL is invalid/missing
 */
const SafeExternalLink = ({ url, children, className = "", showIcon = false }: SafeExternalLinkProps) => {
  if (!isValidExternalUrl(url)) {
    return (
      <span className={`opacity-50 cursor-not-allowed ${className}`} title="Link unavailable">
        {children}
      </span>
    );
  }

  return (
    <a
      href={url!}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      {showIcon && <ExternalLink className="w-3 h-3 inline ml-1 opacity-60" />}
    </a>
  );
};

export { SafeExternalLink, isValidExternalUrl };
export default SafeExternalLink;
