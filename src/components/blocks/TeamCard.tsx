import type * as React from "react";

import { Card, CardContent } from "@/components/elements/Card";
import { cn } from "@/lib/utils";

/*
 * Individual team member card. Composes Card for the surface; the
 * consumer provides the content (avatar, name, role, bio) through
 * children. Named container (team-card) so slot content can adapt to the
 * card's own width via Tailwind @container queries
 */
interface TeamCardProps extends React.ComponentProps<"div"> {}

function TeamCard({ className, children, ...props }: TeamCardProps) {
  return (
    <Card data-slot="team-card" className={cn("@container/team-card", className)} {...props}>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export { TeamCard, type TeamCardProps };
