export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed top-20 left-10 w-80 h-80 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-gradient-radial from-secondary/8 to-transparent rounded-full blur-3xl animate-float delay-200 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-accent-purple/5 to-transparent rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-sm text-foreground-muted z-10">
        <p>© 2025 Bitcoin Navi. Powered by AI & Web3.</p>
      </div>
    </div>
  );
}
