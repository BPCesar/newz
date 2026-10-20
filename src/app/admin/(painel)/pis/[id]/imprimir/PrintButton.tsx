"use client";

export default function PrintButton() {
  return (
    <button type="button" className="btn btn-orange" onClick={() => window.print()}>
      Imprimir / salvar em PDF
    </button>
  );
}
