import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI LAB: 가짜 연구원",
  description: "AI 연구소를 배경으로 한 웹 3D 소셜 추리 게임 프로토타입"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
