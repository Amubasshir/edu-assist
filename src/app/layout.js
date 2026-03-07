import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans-3",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "EduAssist — Special Education Tools",
  description: "Smarter Tools for Special Education Teams",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${lora.variable} ${sourceSans3.variable} antialiased bg-beige-warm text-black font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
