import { HiMiniTicket, HiMiniUser } from "react-icons/hi2";
import { IconType } from "react-icons";

export interface MenuItem {
  name: string;
  link: string;
  icon: IconType;
}

export const menus: MenuItem[] = [
  { name: "My Tickets", link: "/mytickets", icon: HiMiniTicket },
  { name: "Profile", link: "/profile", icon: HiMiniUser },
];
