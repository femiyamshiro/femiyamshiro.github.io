import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./extended.css";
import "./mobile.css";
import "./ipad-v2.css";

export const metadata: Metadata = {
  title: "卷册工坊 · iPad 人物卡",
  description: "与卷册工坊 Windows v1 规则行为同步的 D&D 5R iPad/Web PWA 人物卡构筑与跑团工具。",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "卷册工坊", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7f1d2d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
