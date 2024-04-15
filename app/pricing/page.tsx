"use client";
import React, { useEffect, useState } from "react";
import { PricingCard, PricingHeader, PricingSwitch } from "@/components/plans/PlanDetailsComponent";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { PlanDetails } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const [isYearly, setIsYearly] = useState(false);
  const [isQuarterly, setQuarterly] = useState(false);
  const [plans, setPlans] = useState([] as PlanDetails[]);


  const togglePricingPeriod = (value: string) => setIsYearly(parseInt(value) === 1);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/plans",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json"
            }
          }
        );
        const data = await response.json();

        setPlans(data);
      } catch (error) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données."
        });
      }
    };

    fetchData();
  }, [authToken, toast]);


  return (
    <div className="py-8">
      <PricingHeader title="Pricing Plans" subtitle="Choose the plan that's right for you" />
      <PricingSwitch onSwitch={togglePricingPeriod} />
      <section className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-8 mt-8">
        {plans.length === 0 && [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="w-72 h-72" />)}
        {plans.map((plan) => {
          return <PricingCard key={plan.id} {...plan} isYearly={isYearly} isQuarterly={isQuarterly} />;
        })}
      </section>
      {/*<p>Le client dispose d'un espace client lui permettant de s'identifier pour gérer les candidatures et diffuser les*/}
      {/*  offres d'emploi</p>*/}
      {/*<p>Avant sousciption à l'une des offres et avant le paiement, le client dispose d'un accès illimité à la*/}
      {/*  candidathèque des CV vidéos qu'il peut visualiser mais sans avoir l'accès aux coordonnées des candidats</p>*/}
      {/*<p>Le client a accès aux coordonnées des candidats dont les CV vidéos ont été séléctionnes dans la limite du*/}
      {/*  nombre des CV vidéos du pannel choisi</p>*/}
    </div>
  );
}