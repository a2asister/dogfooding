"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  Users,
  Handshake,
  LayoutDashboard,
  Settings,
  Shield,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "数据看板",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "房源管理",
    href: "/properties",
    icon: <Building2 size={20} />,
    children: [
      { label: "房源列表", href: "/properties", icon: null },
    ],
  },
  {
    label: "客户管理",
    href: "/clients",
    icon: <Users size={20} />,
    children: [
      { label: "客户列表", href: "/clients", icon: null },
    ],
  },
  {
    label: "销售业务",
    href: "/sales",
    icon: <Handshake size={20} />,
    children: [
      { label: "带看预约", href: "/sales", icon: null },
    ],
  },
  {
    label: "组织权限",
    href: "/organization",
    icon: <Shield size={20} />,
    children: [
      { label: "门店管理", href: "/organization", icon: null },
    ],
  },
  {
    label: "系统配置",
    href: "/settings",
    icon: <Settings size={20} />,
    children: [
      { label: "字典管理", href: "/settings", icon: null },
    ],
  },
];

const NavItemComponent = ({ item }: { item: NavItem }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isActive = hasChildren
    ? item.children?.some((child) => pathname === child.href)
    : pathname === item.href;

  return (
    <div className="mb-1">
      {hasChildren ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors",
            isActive
              ? "bg-primary-50 text-primary-700"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            <span>{item.label}</span>
          </div>
          <ChevronDown
            size={16}
            className={cn(
              "transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )}
          />
        </button>
      ) : (
        <Link
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
            isActive
              ? "bg-primary-50 text-primary-700"
              : "text-gray-600 hover:bg-gray-50"
          )}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      )}
      {hasChildren && isOpen && (
        <div className="mt-1 ml-6 space-y-1">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "block px-4 py-2 text-sm rounded-lg transition-colors",
                pathname === child.href
                  ? "text-primary-700 font-medium"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export function Sidebar({
  isMobileOpen,
  onClose,
}: {
  isMobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">房产管家</h1>
              <p className="text-xs text-gray-500">销售租赁一体化平台</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-medium">张</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                张三
              </p>
              <p className="text-xs text-gray-500 truncate">店长 · 北京朝阳店</p>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden transition-opacity duration-300",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 lg:hidden transform transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">房产管家</h1>
              <p className="text-xs text-gray-500">销售租赁一体化平台</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto h-[calc(100vh-120px)]">
          {navItems.map((item) => (
            <NavItemComponent key={item.href} item={item} />
          ))}
        </nav>
      </aside>
    </>
  );
}
