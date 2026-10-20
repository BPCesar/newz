import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-display text-6xl">404</p>
      <p className="text-xl">Essa notícia não está mais nas bancas.</p>
      <Link href="/" className="btn btn-orange">Voltar para o início</Link>
    </div>
  );
}
