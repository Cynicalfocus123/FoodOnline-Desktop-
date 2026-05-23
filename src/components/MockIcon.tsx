import { IconName } from "../data/home";

type MockIconProps = {
  name: IconName;
  className?: string;
};

export function MockIcon({ name, className = "h-5 w-5" }: MockIconProps) {
  const commonProps = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  switch (name) {
    case "categories":
      return (
        <svg {...commonProps}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "snack":
      return (
        <svg {...commonProps}>
          <path d="M8 4.5h8l1.5 15h-11z" />
          <path d="M9.5 8.5h5" />
          <path d="M10 12h4" />
        </svg>
      );
    case "grocery":
      return (
        <svg {...commonProps}>
          <path d="M5 7h15l-1.4 7.5a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6z" />
          <path d="M8.5 7V5.5A2.5 2.5 0 0 1 11 3h2a2.5 2.5 0 0 1 2.5 2.5V7" />
          <circle cx="10" cy="19" r="1.2" />
          <circle cx="16" cy="19" r="1.2" />
        </svg>
      );
    case "beverage":
      return (
        <svg {...commonProps}>
          <path d="M10 4.5h4l-.7 3H14l1.2 12h-6.4L10 7.5h.7z" />
          <path d="M13 3v1.5" />
        </svg>
      );
    case "beauty":
      return (
        <svg {...commonProps}>
          <path d="M8.5 7h7v11a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z" />
          <path d="M9.5 4h5v3h-5z" />
        </svg>
      );
    case "personal-care":
      return (
        <svg {...commonProps}>
          <path d="M9 4.5h6l1 5-2 10h-4l-2-10z" />
          <path d="M9.5 8.5h5" />
        </svg>
      );
    case "home":
      return (
        <svg {...commonProps}>
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M6.5 9.5V20h11V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "electronics":
      return (
        <svg {...commonProps}>
          <rect x="4" y="5" width="16" height="11" rx="2" />
          <path d="M9 19h6" />
          <path d="M12 16v3" />
        </svg>
      );
    case "baby":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="8" r="3" />
          <path d="M7.5 20v-3.5A3.5 3.5 0 0 1 11 13h2a3.5 3.5 0 0 1 3.5 3.5V20" />
        </svg>
      );
    case "health":
      return (
        <svg {...commonProps}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
          <rect x="4" y="4" width="16" height="16" rx="4" />
        </svg>
      );
    case "paan":
      return (
        <svg {...commonProps}>
          <path d="M12 4.5c4.2 0 7.5 3.3 7.5 7.4 0 4.5-3.5 7.6-7.5 7.6S4.5 16.4 4.5 11.9C4.5 7.8 7.8 4.5 12 4.5Z" />
          <path d="M9.5 14.5c2-3.2 3.4-5 5.5-7" />
        </svg>
      );
    case "dairy":
      return (
        <svg {...commonProps}>
          <path d="M10 4.5h4l-.6 3.2 1.3 11.8H9.3l1.3-11.8z" />
          <path d="M10.6 10.2h2.8" />
        </svg>
      );
    case "fruit":
      return (
        <svg {...commonProps}>
          <path d="M8 10c0-3 2.2-5.5 5-5.5S18 7 18 10c0 4.5-2.4 8-5 8s-5-3.5-5-8Z" />
          <path d="M12.5 5c0-1.2.7-2.2 2-2.5" />
          <path d="M10 4.5c-.8-1-2-1.5-3.4-1.5" />
        </svg>
      );
    case "breakfast":
      return (
        <svg {...commonProps}>
          <path d="M5 12h14" />
          <path d="M7 12a5 5 0 1 0 10 0" />
          <path d="M12 7V4.5" />
        </svg>
      );
    case "sweet":
      return (
        <svg {...commonProps}>
          <path d="m7 10 5-6 5 6v8.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 18.5Z" />
          <path d="M9.5 13h5" />
        </svg>
      );
    case "bakery":
      return (
        <svg {...commonProps}>
          <path d="M6 13a6 6 0 0 1 12 0v4.5A2.5 2.5 0 0 1 15.5 20h-7A2.5 2.5 0 0 1 6 17.5Z" />
          <path d="M8 11.5V9a2 2 0 1 1 4 0v2.5" />
          <path d="M14 11.5V8.8a1.8 1.8 0 1 1 3.6 0v2.7" />
        </svg>
      );
    case "tea":
      return (
        <svg {...commonProps}>
          <path d="M6 8.5h9v4.5A4 4 0 0 1 11 17H10a4 4 0 0 1-4-4Z" />
          <path d="M15 9.5h1.2A2.8 2.8 0 0 1 19 12.3 2.7 2.7 0 0 1 16.3 15H15" />
          <path d="M8.5 4.5v2" />
          <path d="M12 4.5v2" />
        </svg>
      );
    case "grain":
      return (
        <svg {...commonProps}>
          <path d="M12 4.5c2.5 2.3 4 5 4 8.4a4 4 0 1 1-8 0c0-3.4 1.5-6.1 4-8.4Z" />
          <path d="M12 6.5v11" />
        </svg>
      );
    case "spice":
      return (
        <svg {...commonProps}>
          <rect x="8" y="4.5" width="8" height="4" rx="1" />
          <path d="M9 8.5h6l1 10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "sauce":
      return (
        <svg {...commonProps}>
          <path d="M10 4.5h4l-.8 3.5 1.1 10a2 2 0 0 1-2 2h-.6a2 2 0 0 1-2-2l1.1-10Z" />
        </svg>
      );
    case "meat":
      return (
        <svg {...commonProps}>
          <path d="M9 8.5c0-2.5 2-4.5 4.5-4.5A5.5 5.5 0 0 1 19 9.5c0 4.2-3 7.5-7 7.5A5 5 0 0 1 7 12c0-1.6.8-2.8 2-3.5Z" />
          <circle cx="10" cy="13.5" r="1.5" />
        </svg>
      );
    case "organic":
      return (
        <svg {...commonProps}>
          <path d="M5 13c0-4.5 3.5-8 8-8h6c0 7-4.5 14-12 14H5z" />
          <path d="M9 15c2.5-2 4.8-4.8 6.5-8" />
        </svg>
      );
    case "pharma":
      return (
        <svg {...commonProps}>
          <rect x="7" y="4.5" width="10" height="15" rx="2.5" />
          <path d="M10 8.5h4" />
          <path d="M12 6.5v4" />
        </svg>
      );
    case "cleaning":
      return (
        <svg {...commonProps}>
          <path d="M10 4.5h4l1.5 3H8.5z" />
          <path d="M9 7.5h6l1 10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
          <path d="M12 10.5v5" />
        </svg>
      );
    case "office":
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="5" width="15" height="14" rx="2" />
          <path d="M8 5V3.5" />
          <path d="M16 5V3.5" />
          <path d="M4.5 9.5h15" />
        </svg>
      );
    case "pet":
      return (
        <svg {...commonProps}>
          <circle cx="8.5" cy="8" r="1.7" />
          <circle cx="15.5" cy="8" r="1.7" />
          <circle cx="6.5" cy="12.5" r="1.6" />
          <circle cx="17.5" cy="12.5" r="1.6" />
          <path d="M12 19c2.6 0 4.8-1.8 4.8-4s-2.2-4-4.8-4-4.8 1.8-4.8 4 2.2 4 4.8 4Z" />
        </svg>
      );
    default:
      return null;
  }
}
