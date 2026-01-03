import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Hex Safe</h1>
      <p style={{ color: 'var(--muted)' }}>Sistema Financeiro em Construção...</p>

      <div style={{ marginTop: '2rem' }}>
        <Link href="/dashboard">
          <button style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Acessar Dashboard
          </button>
        </Link>
      </div>
    </main>
  );
}
