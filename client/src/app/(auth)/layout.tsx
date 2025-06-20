export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center pt-48 justify-center bg-background">{children}</div>
  );
}
