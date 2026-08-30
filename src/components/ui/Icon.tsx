import {
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CloudDownload,
  CloudUpload,
  Copy,
  Download,
  Ellipsis,
  FileText,
  House,
  Lightbulb,
  LogOut,
  Menu,
  Mic,
  Moon,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Volume2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "arrow-left": ArrowLeft,
  bell: Bell,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "circle-help": CircleHelp,
  "cloud-download": CloudDownload,
  "cloud-upload": CloudUpload,
  copy: Copy,
  download: Download,
  ellipsis: Ellipsis,
  "file-text": FileText,
  house: House,
  lightbulb: Lightbulb,
  "log-out": LogOut,
  menu: Menu,
  mic: Mic,
  moon: Moon,
  pause: Pause,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  search: Search,
  settings: Settings,
  "shield-check": ShieldCheck,
  sun: Sun,
  "volume-2": Volume2,
  x: X,
  zap: Zap,
};

interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
}

export function Icon({
  name,
  size = 18,
  stroke = 1.75,
  color = "currentColor",
  className,
}: IconProps) {
  const LucideIconComponent = ICONS[name];
  if (!LucideIconComponent) return null;

  return (
    <LucideIconComponent
      size={size}
      strokeWidth={stroke}
      color={color}
      aria-hidden="true"
      className={className}
    />
  );
}
