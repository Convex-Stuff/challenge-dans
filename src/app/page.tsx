import { ConstructionIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <PageShell title={siteConfig.name}>
      <EmptyState icon={ConstructionIcon} title="Nothing here yet" />
    </PageShell>
  );
}
