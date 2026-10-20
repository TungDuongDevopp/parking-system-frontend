import {
    IconLayoutDashboard,
    IconUserCircle,
    IconUsersGroup,
    IconUserDollar,
    IconParking,
    IconSquareDashed,
    IconCalendarClock,
    IconCalendarRepeat,
    IconClockPlay,
    IconLicense,
    IconCreditCard,
    IconReceipt,
    IconFileInvoice,
    IconShieldLock,
} from "@tabler/icons-react";

import type { TablerIcon } from "@tabler/icons-react";

type Role = "Admin" | "Staff";

export interface Item {
    label: string;
    path: string | Partial<Record<Role, string>>;
    icon: TablerIcon;
    roles: Role[];
}

export const SideBarMenus: Item[] = [
    {
        label: "Dashboard",
        path: { Admin: "/admin", Staff: "/staff" },
        icon: IconLayoutDashboard,
        roles: ["Admin", "Staff"],
    },
    {
        label: "User",
        path: "/admin/users",
        icon: IconUserCircle,
        roles: ["Admin"],
    },
    {
        label: "Role",
        path: "/admin/roles",
        icon: IconShieldLock,
        roles: ["Admin"],
    },
    {
        label: "Staff",
        path: "/admin/staffs",
        icon: IconUsersGroup,
        roles: ["Admin"],
    },
    {
        label: "Customer",
        path: "/admin/customers",
        icon: IconUserDollar,
        roles: ["Admin"],
    },
    {
        label: "Parking Area",
        path: "/admin/parkingAreas",
        icon: IconParking,
        roles: ["Admin", "Staff"],
    },
    {
        label: "Parking Spot",
        path: "/parking-spots",
        icon: IconSquareDashed,
        roles: ["Admin", "Staff"],
    },
    {
        label: "Reservation",
        path: "/reservations",
        icon: IconCalendarClock,
        roles: ["Admin", "Staff"],
    },
    {
        label: "Subscription",
        path: "/subscriptions",
        icon: IconCalendarRepeat,
        roles: ["Admin"],
    },
    {
        label: "Parking Session",
        path: "/parking-sessions",
        icon: IconClockPlay,
        roles: ["Admin", "Staff"],
    },
    {
        label: "License Plate",
        path: "/license-plates",
        icon: IconLicense,
        roles: ["Admin", "Staff"],
    },
    {
        label: "Payment",
        path: "/payments",
        icon: IconCreditCard,
        roles: ["Admin", "Staff"],
    },
    {
        label: "Transaction",
        path: "/transactions",
        icon: IconReceipt,
        roles: ["Admin"],
    },
    {
        label: "Quotation",
        path: "/quotations",
        icon: IconFileInvoice,
        roles: ["Admin"],
    },
];