import type { Metadata } from "next";
import { BusinessSubmissionForm } from "@/components/business-submission-form";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PageHero } from "@/components/page-hero";
import { getCategories } from "@/lib/businesses";

export const metadata: Metadata = {
  title: "Registrar comercio",
  description:
    "Postula un comercio de Pereira y revisa una vista previa antes de enviarlo a revision.",
};

export default function RegisterBusinessPage() {
  const categories = getCategories();

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Sumar mi comercio"
          title="Registra tu comercio"
          description="Completa la informacion, revisa como se vera la tarjeta en la web y envia el comercio para revision antes de publicarlo."
        />
        <BusinessSubmissionForm categories={categories} />
      </main>
      <Footer />
    </>
  );
}
