import {
  ArrowUpRight,
  BracketsCurly,
  Camera,
  Compass,
  Database,
  GitBranch,
  ImageSquare,
  Lightning,
  MapTrifold,
  Notebook,
  Palette,
  ShieldCheck,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import type { AboutIconName } from "@/interface/about";

export const aboutIcons: Record<AboutIconName, Icon> = {
  arrow: ArrowUpRight,
  backend: Database,
  camera: Camera,
  code: BracketsCurly,
  compass: Compass,
  creative: Palette,
  frontend: ImageSquare,
  motion: Lightning,
  notes: Notebook,
  product: GitBranch,
  quality: ShieldCheck,
  travel: MapTrifold,
};
