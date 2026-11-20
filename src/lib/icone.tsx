export function iconeJSX(taille: number) {
  const anneau = Math.round(taille * 0.74)
  const epaisseur = Math.max(2, Math.round(taille * 0.018))

  return (
    <div
      style={{
        width: taille,
        height: taille,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #5B6B30, #3A4520)",
      }}
    >
      <div
        style={{
          width: anneau,
          height: anneau,
          borderRadius: "50%",
          border: `${epaisseur}px solid #C9A227`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#F4E9C8",
          fontSize: Math.round(taille * 0.34),
          fontWeight: 700,
        }}
      >
        AL
      </div>
    </div>
  )
}
