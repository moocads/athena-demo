import type { Metadata } from "next";
import { Bricolage_Grotesque, Onest } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const onest = Onest({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Athena Health & Beauty | Premium Collagen & Whey Protein",
  description:
    "Discover premium collagen peptides and whey protein created for everyday wellness, beauty, strength, and recovery.",
  openGraph: {
    title: "Athena Health & Beauty",
    description:
      "Modern wellness nutrition for everyday strength, beauty, and balance.",
    images: ["/images/athena/hero.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${onest.variable}`}>{children}</body>
    </html>
  );
}
