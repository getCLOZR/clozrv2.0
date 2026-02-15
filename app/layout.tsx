import "./globals.css";

/**
 * Root layout for the clozr app. Wraps all routes with shared providers and metadata.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
