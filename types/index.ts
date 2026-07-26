export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface TimelineItem {
  year: string;
  title: string;
  subtitle: string;
  description?: string;
}

export interface TechItem {
  name: string;
  icon: string; // icon component name from react-icons/si
  row: 1 | 2;
}
