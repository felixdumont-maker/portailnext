import type { Metadata } from "next";
import { Bricolage_Grotesque, Atkinson_Hyperlegible, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "CocktailOS — Portail Client",
  description: "Portail Client Cocktail Média",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Cocktail OS", statusBarStyle: "default" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cn(bricolage.variable, atkinson.variable, "font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
