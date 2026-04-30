import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Portfolio Archive",
  description: "AI 전공 학생을 위한 프로젝트, 활동, 수상, 연구 기록 포트폴리오"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
