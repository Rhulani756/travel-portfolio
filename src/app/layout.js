import "./globals.css";

export const metadata = {
  title: "Rhulani Matiane — Journeys in Code",
  description:
    "Portfolio of Rhulani Matiane — software engineering, cybersecurity, and machine learning projects.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@400;500&display=swap"
        rel="stylesheet"
        precedence="default"
      />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}