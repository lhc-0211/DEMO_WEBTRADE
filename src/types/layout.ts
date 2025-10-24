import type { FC, SVGProps } from "react";

export type SidebarMode = "full" | "mini" | "hidden";

export interface SidebarItem {
  id: string;
  title: string;
  icon: FC<SVGProps<SVGSVGElement>>; // component type
  path: string;
  requiresLogin?: boolean;
}

export interface SidebarItemGroup {
  id: string;
  items: SidebarItem[];
}

export type ModeTableSynThetic = "INDAY" | "FOREIGN";
