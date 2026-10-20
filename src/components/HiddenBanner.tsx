export default function HiddenBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="bg-orange-dark px-4 py-2 text-center text-sm font-bold text-cream">
      Página oculta: só você (administrador) está vendo. Visitantes recebem “página não encontrada”.
    </div>
  );
}
