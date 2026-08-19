"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"


type Produit = {
  id: number
  nom: string
  categorie: string | null
  prix: number
  image_url: string | null
}


type LigneCommande = {
  id: number
  produit_id: number
  quantite: number
  prix_unitaire: number
  produit?: Produit
  preparee?: boolean
}


type Commande = {
  id: number
  client_nom: string
  client_telephone: string
  client_remarque: string | null
  date_retrait: string
  total: number
  statut: string
  created_at: string
  lignes: LigneCommande[]
}


export default function AdminPage() {

  const [commandes, setCommandes] = useState<Commande[]>([])
  const [chargement, setChargement] = useState(true)


  useEffect(() => {
    chargerCommandes()
  }, [])



  async function chargerCommandes() {

    setChargement(true)


    const { data, error } = await supabase
      .from("Commandes")
      .select(`
        id,
        client_nom,
        client_telephone,
        client_remarque,
        date_retrait,
        total,
        statut,
        created_at,
        Lignes_Commande (
          id,
          produit_id,
          quantite,
          prix_unitaire,
          Produits (
            id,
            nom,
            categorie,
            prix,
            image_url
          )
        )
      `)
      .neq("statut", "Récupérée")
      .order("date_retrait", { ascending: true })



    if (error) {
      console.error("Erreur chargement commandes :", error)
      setChargement(false)
      return
    }



    const commandesPreparees = data.map((commande:any) => ({
      ...commande,
      lignes: commande.Lignes_Commande.map((ligne:any)=>({
        id: ligne.id,
        produit_id: ligne.produit_id,
        quantite: ligne.quantite,
        prix_unitaire: ligne.prix_unitaire,
        produit: ligne.Produits,
        preparee:false
      }))
    }))


    setCommandes(commandesPreparees)

    setChargement(false)
  }


  function togglePreparation(
    commandeId:number,
    ligneId:number
  ) {

    setCommandes((anciennes)=>

      anciennes.map((commande)=>{

        if(commande.id !== commandeId){
          return commande
        }


        return {
          ...commande,

          lignes: commande.lignes.map((ligne)=>{

            if(ligne.id !== ligneId){
              return ligne
            }


            return {
              ...ligne,
              preparee: !ligne.preparee
            }

          })

        }

      })

    )

  }



  function progressionCommande(commande:Commande){

    if(commande.lignes.length === 0){
      return 0
    }


    const preparees = commande.lignes.filter(
      ligne => ligne.preparee
    ).length


    return Math.round(
      (preparees / commande.lignes.length) * 100
    )

  }



  async function mettreCommandePrete(
    commandeId:number
  ){

    const { error } = await supabase
      .from("Commandes")
      .update({
        statut:"Prête"
      })
      .eq("id", commandeId)



    if(error){

      console.error(
        "Erreur changement statut :",
        error
      )

      return
    }



    setCommandes((anciennes)=>

      anciennes.map((commande)=>

        commande.id === commandeId

        ? {
            ...commande,
            statut:"Prête"
          }

        : commande

      )

    )

  }




  function prevenirClient(
    commande:Commande
  ){

    const message =
`Bonjour ${commande.client_nom},

Votre commande DI Shop est prête.

Vous pouvez venir la récupérer à la date prévue.

Merci.`


    let telephone = commande.client_telephone.replace(/\s/g, "")

    // Conversion au format international attendu par WhatsApp
    if (telephone.startsWith("0")) {
      telephone = "33" + telephone.slice(1)
    } else if (telephone.startsWith("+")) {
      telephone = telephone.slice(1)
    }


    const lien = document.createElement("a")
    lien.href = `https://wa.me/${telephone}?text=${encodeURIComponent(message)}`
    lien.target = "_blank"
    lien.rel = "noopener noreferrer"
    document.body.appendChild(lien)
    lien.click()
    document.body.removeChild(lien)

  }



  function validerEtPrevenir(
    commande:Commande
  ){

    // On ouvre WhatsApp tout de suite pour garder le geste de clic
    // (nécessaire sur mobile pour que l'ouverture ne soit pas bloquée)
    prevenirClient(commande)

    mettreCommandePrete(commande.id)

  }



  async function marquerRecuperee(
    commandeId:number
  ){

    const confirmation = window.confirm(
      "Confirmer que cette commande a été récupérée ? Elle sera supprimée de la liste."
    )

    if(!confirmation){
      return
    }

    const res = await fetch(`/api/commandes/${commandeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "Récupérée" }),
    })

    const data = await res.json()

    if(data.success){
      setCommandes((anciennes) =>
        anciennes.filter((commande) => commande.id !== commandeId)
      )
    } else {
      alert("Erreur lors de l'archivage de la commande")
    }

  }



  async function deconnexion() {
    await fetch("/api/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }



  if(chargement){

    return (

      <div className="p-8">

        Chargement des commandes...

      </div>

    )

  }



  return (

    <main className="p-8 space-y-6">


      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Administration DI Shop
        </h1>

        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-sm text-blue-600 underline">
            Tableau de bord
          </Link>
          <Link href="/admin/stock" className="text-sm text-blue-600 underline">
            Gérer le stock
          </Link>

          <button
            onClick={deconnexion}
            className="text-sm text-gray-500 underline"
          >
            Se déconnecter
          </button>
        </div>

      </div>



      {
        commandes.length === 0 &&

        <p>
          Aucune commande actuellement.
        </p>

      }



      {
        commandes.map((commande)=>(


          <section

            key={commande.id}

            className="border rounded-xl p-5 space-y-4 shadow-sm"

          >


            <div className="flex justify-between">


              <div>

                <h2 className="text-xl font-semibold">

                  Commande #{commande.id}

                </h2>


                <p>
                  Client : {commande.client_nom}
                </p>


                <p>
                  Téléphone : {commande.client_telephone}
                </p>


                <p>
                  Date retrait : {commande.date_retrait}
                </p>


                {
                  commande.client_remarque &&

                  <p>
                    Remarque : {commande.client_remarque}
                  </p>

                }


              </div>



              <div>

                <span className="font-semibold">

                  Statut :

                </span>

                {" "}

                {commande.statut}


              </div>


            </div>





            <div className="space-y-3">


              {
                commande.lignes.map((ligne)=>(


                  <div

                    key={ligne.id}

                    className="flex items-center gap-3 border p-3 rounded"

                  >


                    <input

                      type="checkbox"

                      checked={ligne.preparee}

                      onChange={()=>togglePreparation(
                        commande.id,
                        ligne.id
                      )}

                    />



                    <div>

                      <p className="font-medium">

                        {ligne.produit?.nom}

                      </p>


                      <p>

                        Quantité :
                        {" "}
                        {ligne.quantite}

                      </p>


                      <p>

                        Prix :
                        {" "}
                        {ligne.prix_unitaire} €

                      </p>


                    </div>


                  </div>


                ))

              }


            </div>
            <div className="space-y-2">


              <div className="flex justify-between text-sm">

                <span>
                  Progression préparation
                </span>


                <span>
                  {progressionCommande(commande)} %
                </span>


              </div>



              <div className="w-full bg-gray-200 rounded-full h-3">


                <div

                  className="bg-green-500 h-3 rounded-full"

                  style={{
                    width:
                      `${progressionCommande(commande)}%`
                  }}

                />


              </div>


            </div>





            {
              progressionCommande(commande) === 100
              &&
              commande.statut !== "Prête"

              &&


              <button

                onClick={()=>
                  validerEtPrevenir(
                    commande
                  )
                }

                className="bg-blue-600 text-white px-4 py-2 rounded"

              >

                Marquer comme prête et prévenir le client

              </button>

            }





            {
              commande.statut === "Prête"

              &&


              <button

                onClick={()=>
                  prevenirClient(
                    commande
                  )
                }

                className="bg-green-600 text-white px-4 py-2 rounded mr-2"

              >

                Renvoyer le message au client

              </button>

            }



            {
              commande.statut === "Prête"

              &&


              <button

                onClick={()=>
                  marquerRecuperee(
                    commande.id
                  )
                }

                className="bg-gray-700 text-white px-4 py-2 rounded"

              >

                ✅ Marquer comme récupérée

              </button>

            }



          </section>


        ))

      }


    </main>

  )

}
