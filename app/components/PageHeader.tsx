'use client';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  display?: boolean;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  display = false,
  action,
}: PageHeaderProps) {
  return (
    <header
      className="flex justify-between items-start"
      style={{ marginBottom: display ? 25 : 20 }}
    >
      <div className="min-w-0 flex-1" style={{ paddingRight: 10 }}>
        <h1 className={display ? 'font-display' : 'font-hister'}>{title}</h1>
        {subtitle && (
          <p
            className="font-caption-sm text-secondary uppercase tracking-widest"
            style={{ marginTop: 6 }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 flex items-center" style={{ gap: 8 }}>
          {action}
        </div>
      )}
    </header>
  );
}
