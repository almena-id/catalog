import {
  AwardIcon,
  BadgeCheckIcon,
  BriefcaseIcon,
  BuildingIcon,
  CarIcon,
  FileTextIcon,
  FolderIcon,
  GlobeIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HouseIcon,
  IdCardIcon,
  KeyIcon,
  LandmarkIcon,
  MailIcon,
  PhoneIcon,
  PlaneIcon,
  ShieldIcon,
  TagIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { createElement } from "react";

/**
 * What a category is drawn with: the API serves each category's `icon` as one
 * of these lucide names (the anchor picks it in the registry).
 */
const icons: Record<string, LucideIcon> = {
  tag: TagIcon,
  user: UserIcon,
  "id-card": IdCardIcon,
  house: HouseIcon,
  mail: MailIcon,
  phone: PhoneIcon,
  "file-text": FileTextIcon,
  folder: FolderIcon,
  "graduation-cap": GraduationCapIcon,
  briefcase: BriefcaseIcon,
  users: UsersIcon,
  award: AwardIcon,
  "badge-check": BadgeCheckIcon,
  shield: ShieldIcon,
  "heart-pulse": HeartPulseIcon,
  car: CarIcon,
  landmark: LandmarkIcon,
  building: BuildingIcon,
  globe: GlobeIcon,
  key: KeyIcon,
  plane: PlaneIcon,
  wallet: WalletIcon,
};

/** A category's icon; the tag for a name this portal does not know, or none. */
export function categoryIcon(name: string | null | undefined): LucideIcon {
  return (name && Object.hasOwn(icons, name) ? icons[name] : undefined) ?? TagIcon;
}

/** A category's icon, drawn: `icon` its lucide name. */
export function CategoryIcon({
  icon,
  ...props
}: LucideProps & { icon: string | null | undefined }) {
  return createElement(categoryIcon(icon), props);
}
