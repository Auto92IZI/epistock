"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

type Produit = {
  id: number;
  nom: string;
  categorie: string | null;
  stock: number;
  prix: number;
  image_url: string;
};

type PanierItem = {
  produit: Produit;
  quantite: number;
};

export default function Home() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<PanierItem[]>([]);
  const [panierOuvert, setPanierOuvert] = useState(false);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [categorieSelectionnee, setCategorieSelectionnee] = useState("Tous");
  const [recherche, setRecherche] = useState("");

  const [clientNom, setClientNom] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  const [clientAdresse, setClientAdresse] = useState("");
  const [clientRemarque, setClientRemarque] = useState("");
  const [dateRetrait, setDateRetrait] = useState("");

  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [commandeValidee, setCommandeValidee] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProduits() {
      const { data, error } = await supabase
        .from("Produits")
        .select("*")
        .eq("disponible", true);

      if (error) {
        setError(error.message);
      } else {
        setProduits(data || []);
      }
    }

    fetchProduits();
  }, []);

  const categories = [
    "Tous",
    ...Array.from(
      new Set(
        produits
          .map((p) => p.categorie)
          .filter((c): c is string => !!c && c.trim() !== "")
      )
    ),
  ];

  const produitsFiltres = produits
    .filter((p) =>
      categorieSelectionnee === "Tous" ? true : p.categorie === categorieSelectionnee
    )
    .filter((p) =>
      recherche.trim() === ""
        ? true
        : p.nom.toLowerCase().includes(recherche.trim().toLowerCase())
    );

  function ajouterAuPanier(produit: Produit) {
    setCart((panierActuel) => {
      const produitExistant = panierActuel.find(
        (item) => item.produit.id === produit.id
      );

      if (produitExistant) {
        if (produitExistant.quantite >= produit.stock) {
          return panierActuel;
        }

        return panierActuel.map((item) =>
          item.produit.id === produit.id
            ? { ...item, quantite: item.quantite + 1 }
            : item
        );
      }

      if (produit.stock <= 0) {
        return panierActuel;
      }

      return [...panierActuel, { produit, quantite: 1 }];
    });
  }

  function augmenterQuantite(produitId: number) {
    setCart((panierActuel) =>
      panierActuel.map((item) => {
        if (item.produit.id !== produitId) {
          return item;
        }

        if (item.quantite >= item.produit.stock) {
          return item;
        }

        return {
          ...item,
          quantite: item.quantite + 1,
        };
      })
    );
  }

  function diminuerQuantite(produitId: number) {
    setCart((panierActuel) =>
      panierActuel
        .map((item) => {
          if (item.produit.id !== produitId) {
            return item;
          }

          return {
            ...item,
            quantite: item.quantite - 1,
          };
        })
        .filter((item) => item.quantite > 0)
    );
  }

  const nombreArticles = cart.reduce(
    (total, item) => total + item.quantite,
    0
  );

  const totalPanier = cart.reduce(
    (total, item) => total + item.produit.prix * item.quantite,
    0
  );

  async function validerCommande() {
    setMessageErreur(null);

    if (!clientNom.trim()) {
      setMessageErreur("Merci de renseigner votre nom et prénom.");
      return;
    }

    if (!clientTelephone.trim()) {
      setMessageErreur("Merci de renseigner votre numéro de téléphone.");
      return;
    }

    if (!dateRetrait) {
      setMessageErreur("Merci de choisir une date de retrait.");
      return;
    }

    if (cart.length === 0) {
      setMessageErreur("Votre panier est vide.");
      return;
    }

    setEnvoiEnCours(true);

    try {
      const lignesCommande = cart.map((item) => ({
        produit_id: item.produit.id,
        quantite: item.quantite,
        prix_unitaire: item.produit.prix,
      }));

      const reponse = await fetch("/api/commande", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientNom: clientNom.trim(),
          clientTelephone: clientTelephone.trim(),
          dateRetrait: dateRetrait,
          clientRemarque: clientRemarque.trim() || null,
          total: totalPanier,
          lignes: lignesCommande,
        }),
      });

      const resultat = await reponse.json();

      if (!reponse.ok || !resultat.success) {
        throw new Error(resultat.message || "Erreur lors de la création de la commande.");
      }

      const commandeId = resultat.commandeId;

      setCommandeValidee(Number(commandeId));
      setCart([]);
      setFormulaireOuvert(false);
      setPanierOuvert(false);
      setClientNom("");
      setClientTelephone("");
      setDateRetrait("");
      setClientRemarque("");
    } catch (err) {
      setMessageErreur(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la commande."
      );
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">
            🛍️ DI Shop
          </h1>

          <div className="flex items-center gap-2">
            <a
              href="/admin"
              aria-label="Administration"
              className="opacity-30 hover:opacity-70 transition-opacity p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </a>

            <button
              onClick={() => setPanierOuvert(true)}
              className="rounded-full bg-black px-5 py-3 font-semibold text-white shadow-md transition hover:bg-gray-800"
            >
              🛒 Panier : {nombreArticles} article(s)
            </button>
          </div>
        </div>

        {commandeValidee !== null && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
            <h2 className="text-xl font-bold text-green-800">
              ✅ Votre commande a bien été prise en compte !
            </h2>

            <p className="mt-2 text-green-700">
              Merci pour votre commande.
            </p>

            <p className="mt-1 font-semibold text-green-800">
              Numéro de commande : #{commandeValidee}
            </p>

            <p className="mt-1 text-green-700">
              📱 Un message vous sera envoyé dès que votre commande sera prête à être récupérée.
            </p>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="mb-4">
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="🔍 Rechercher un produit..."
            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
          />
        </div>

        {categories.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((categorie) => (
              <button
                key={categorie}
                onClick={() => setCategorieSelectionnee(categorie)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  categorieSelectionnee === categorie
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 border hover:bg-gray-100"
                }`}
              >
                {categorie}
              </button>
            ))}
          </div>
        )}

        {produitsFiltres.length === 0 && (
          <p className="text-gray-600">Aucun produit ne correspond à votre recherche.</p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produitsFiltres.map((produit) => {
            const itemPanier = cart.find(
              (item) => item.produit.id === produit.id
            );

            const quantite = itemPanier?.quantite || 0;

            return (
              <div
                key={produit.id}
                className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-56 items-center justify-center bg-white p-4">
                  <img
                    src={produit.image_url}
                    alt={produit.nom}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">

                  <h2 className="text-xl font-bold">
                    {produit.nom}
                  </h2>

                  <p className="mt-2 text-gray-700">
                    Stock disponible : {produit.stock}
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {produit.prix.toFixed(2)} €
                  </p>

                  {quantite > 0 && (
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <button
                        onClick={() => diminuerQuantite(produit.id)}
                        className="h-9 w-9 rounded-full border text-lg font-bold hover:bg-gray-100"
                      >
                        −
                      </button>

                      <span className="font-bold">
                        {quantite}
                      </span>

                      <button
                        onClick={() => augmenterQuantite(produit.id)}
                        disabled={quantite >= produit.stock}
                        className="h-9 w-9 rounded-full border text-lg font-bold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  )}

                  {quantite === 0 && (
                    <button
                      onClick={() => ajouterAuPanier(produit)}
                      disabled={produit.stock <= 0}
                      className="mt-auto w-full rounded-lg bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {produit.stock <= 0 ? "Rupture de stock" : "Ajouter au panier"}
                    </button>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {panierOuvert && (
          <div className="fixed inset-0 z-50 bg-black/40">

            <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  🛒 Mon panier
                </h2>

                <button
                  onClick={() => setPanierOuvert(false)}
                  className="text-2xl font-bold text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 && (
                <p className="text-gray-600">
                  Votre panier est vide.
                </p>
              )}

              {cart.length > 0 && (
                <>
                  <div className="space-y-5">

                    {cart.map((item) => (
                      <div
                        key={item.produit.id}
                        className="border-b pb-5"
                      >

                        <div className="flex items-center justify-between">

                          <div>
                            <p className="font-semibold">
                              {item.produit.nom}
                            </p>

                            <p className="text-sm text-gray-600">
                              {item.produit.prix.toFixed(2)} € / unité
                            </p>
                          </div>

                          <p className="font-bold">
                            {(item.quantite * item.produit.prix).toFixed(2)} €
                          </p>

                        </div>

                        <div className="mt-3 flex items-center gap-3">

                          <button
                            onClick={() =>
                              diminuerQuantite(item.produit.id)
                            }
                            className="h-8 w-8 rounded-full border font-bold hover:bg-gray-100"
                          >
                            −
                          </button>

                          <span className="font-bold">
                            {item.quantite}
                          </span>

                          <button
                            onClick={() =>
                              augmenterQuantite(item.produit.id)
                            }
                            disabled={
                              item.quantite >= item.produit.stock
                            }
                            className="h-8 w-8 rounded-full border font-bold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>

                        </div>

                      </div>
                    ))}

                  </div>

                  <div className="mt-8 border-t pt-6">

                    <div className="flex items-center justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>
                        {totalPanier.toFixed(2)} €
                      </span>
                    </div>

                    <button
                      onClick={() => setFormulaireOuvert(true)}
                      className="mt-6 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                      Passer la commande
                    </button>

                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {formulaireOuvert && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  📦 Informations de commande
                </h2>

                <button
                  onClick={() => setFormulaireOuvert(false)}
                  className="text-2xl font-bold text-gray-500 hover:text-black"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">

                <div>
                  <label className="mb-1 block font-semibold">
                    Nom / prénom *
                  </label>

                  <input
                    type="text"
                    value={clientNom}
                    onChange={(e) => setClientNom(e.target.value)}
                    placeholder="Votre nom et prénom"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold">
                    Téléphone *
                  </label>

                  <input
                    type="tel"
                    value={clientTelephone}
                    onChange={(e) =>
                      setClientTelephone(e.target.value)
                    }
                    placeholder="06 12 34 56 78"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold">
                    Date de retrait souhaitée *
                  </label>

                  <input
                    type="date"
                    value={dateRetrait}
                    onChange={(e) => setDateRetrait(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
                  />
                </div>

                <div className="rounded-lg bg-gray-50 border p-3 text-sm text-gray-600">
                  ℹ️ Nous ne proposons pas de livraison, uniquement du retrait. La date sélectionnée est indicative : la date et l'heure exactes de disponibilité vous seront communiquées par message dès que votre commande sera prête.
                </div>

                {messageErreur && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    ⚠️ {messageErreur}
                  </div>
                )}

                <div className="border-t pt-4">

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{totalPanier.toFixed(2)} €</span>
                  </div>

                </div>

                <button
                  onClick={validerCommande}
                  disabled={envoiEnCours}
                  className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {envoiEnCours
                    ? "Enregistrement..."
                    : "Valider ma commande"}
                </button>

              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
