export type AboutIconName =
  | "arrow"
  | "backend"
  | "camera"
  | "code"
  | "compass"
  | "creative"
  | "frontend"
  | "motion"
  | "notes"
  | "product"
  | "quality"
  | "travel";

export interface AboutLink {
  label: string;
  href: string;
  icon: AboutIconName;
  external?: boolean;
}

export interface CurrentStatusItem {
  label: string;
  desc: string;
}

export interface LifeCoordinateItem {
  label: string;
  desc: string;
  image?: string;
}

export interface FragmentItem {
  category: string;
  tags: string[];
  desc: string;
  image?: string;
}

export interface AboutProfile {
  name: string;
  role: string;
  headline: string;
  introduction: string;
  tags: string[];
  avatar: string;
  rotatingTexts?: string[];
  currentStatus: {
    title: string;
    items: CurrentStatusItem[];
  };
  coordinates: {
    title: string;
    items: LifeCoordinateItem[];
  };
  fragments: {
    title: string;
    subtitle: string;
    items: FragmentItem[];
  };
  beliefs: {
    title: string;
    subtitle: string;
    items: string[];
  };
  explore: {
    title: string;
    desc: string;
    links: AboutLink[];
    closing: string;
    footerSubtitle: string;
  };
}
