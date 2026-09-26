function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

interface WelcomeHeaderProps {
  name: string;
}

export default function WelcomeHeader({ name }: WelcomeHeaderProps) {
  const firstName = name.trim().split(/\s+/)[0];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        {getGreeting()}, {firstName}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Track your job search and stay prepared for every opportunity.
      </p>
    </div>
  );
}
