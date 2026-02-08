"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { PlanDetails } from "@/types";

type PricingSwitchProps = {
  onSwitch: (value: string) => void
}

type PricingCardProps = {
  isYearly?: boolean
  isQuarterly?: boolean
  title: string
  monthlyPrice?: number
  yearlyPrice?: number
  description: string
  features: string[]
  actionLabel: string
  popular?: boolean
  exclusive?: boolean
}

export const PricingHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <section className="text-center">
    <h2 className="text-3xl font-bold">{title}</h2>
    <p className="text-xl pt-1">{subtitle}</p>
    <br />
  </section>
);

export const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <Tabs defaultValue="0" className="w-40 mx-auto" onValueChange={onSwitch}>
    <TabsList className="py-6 px-2">
      <TabsTrigger value="0" className="text-base">
        Mensuel
      </TabsTrigger>
      <TabsTrigger value="1" className="text-base">
        Trimestriel
      </TabsTrigger>
      <TabsTrigger value="2" className="text-base">
        Annuel
      </TabsTrigger>
    </TabsList>
  </Tabs>
);

export const PricingCard = ({
                              isYearly,
                              name,
                              monthly_price,
                              annual_price,
                              description,
                              account_creation_included,
                              cv_video_access,
                              cv_video_consultations,
                              job_postings,
                              popular,
                              exclusive
                            }: PlanDetails) => (
  <Card
    className={cn(`w-72 flex flex-col justify-between py-1 ${popular ? "border-rose-400" : "border-zinc-700"} mx-auto sm:mx-0`, {
      "animate-background-shine bg-white dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] transition-colors":
      exclusive
    })}>
    <div>
      <CardHeader className="pb-8 pt-4">
        {isYearly && annual_price && monthly_price ? (
          <div className="flex justify-between">
            <CardTitle className="text-zinc-700 dark:text-zinc-300 text-lg">{name}</CardTitle>
            <div
              className={cn("px-2.5 rounded-xl h-fit text-sm py-1 bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white", {
                "bg-gradient-to-r from-orange-400 to-rose-400 dark:text-black ": popular
              })}>
              Économisez MAD{monthly_price * 12 - annual_price}
            </div>
          </div>
        ) : (
          <CardTitle className="text-zinc-700 dark:text-zinc-300 text-lg">{name}</CardTitle>
        )}
        <div className="flex gap-0.5">
          <h3
            className="text-3xl font-bold">{annual_price && isYearly ? "MAD" + annual_price : monthly_price ? "MAD " + monthly_price : "0MAD"}</h3>
          <span
            className="flex flex-col justify-end text-sm mb-1">{annual_price && isYearly ? "/an" : monthly_price ? "/mois" : null}</span>
        </div>
        <CardDescription className="pt-1.5 h-12">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <CheckItem key={account_creation_included}
                   text={"Création de compte client et gestion des candidatures *"} />
        <CheckItem key={cv_video_access} text={"Accès visualisation de CV vidéos ** "} />
        <CheckItem key={cv_video_consultations}
                   text={"Accès coordonnées candidats: " + (cv_video_consultations === 0 ? "Non inclus" : cv_video_consultations.toString() + " contacts/mois") + " *** "} />
      </CardContent>
    </div>
    <CardFooter className="mt-2">
      <Button
        className="relative inline-flex w-full items-center justify-center rounded-md bg-black text-white dark:bg-white px-6 font-medium  dark:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
        <div
          className="absolute -inset-0.5 -z-10 rounded-lg bg-gradient-to-b from-[#c7d2fe] to-[#8678f9] opacity-75 blur" />
        Commencer
      </Button>
    </CardFooter>
  </Card>
);
export const CheckItem = ({ text }: { text: string }) => (
  <div className="flex gap-2">
    <CheckCircle2 size={18} className="my-auto text-green-400" />
    <p className="pt-0.5 text-zinc-700 dark:text-zinc-300 text-sm">{text}</p>
  </div>
);

