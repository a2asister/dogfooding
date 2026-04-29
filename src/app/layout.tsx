import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Layout } from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "房产管家 - 销售租赁一体化平台",
  description: "多类型房源全生命周期管理、客户线索360°管理、销售业务闭环、组织权限管控、数据可视化看板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
