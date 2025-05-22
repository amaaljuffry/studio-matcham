import type { Cafe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, MapPinIcon, Star, Leaf } from "lucide-react";
import Image from "next/image";

interface CafeDetailsCardProps {
  cafe: Cafe;
}

export function CafeDetailsCard({ cafe }: CafeDetailsCardProps) {
  return (
    <Card className="w-full shadow-lg overflow-hidden bg-card">
      <CardHeader className="p-4">
        <div className="relative w-full h-48 rounded-md overflow-hidden mb-3">
          <Image
            src={cafe.image}
            alt={cafe.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={cafe.dataAiHint || "cafe food"}
          />
        </div>
        <CardTitle className="text-xl font-semibold text-primary">{cafe.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground flex items-center">
            <MapPinIcon className="w-4 h-4 mr-1.5" />
            {cafe.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary" />
          <span className="text-sm">{cafe.openingHours}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-accent" />
          <Badge variant="outline" className="text-sm border-accent text-accent">{cafe.rating} / 5</Badge>
        </div>
        {cafe.menuLink && (
          <Button variant="outline" asChild className="w-full hover:bg-accent/10 border-accent text-accent">
            <a href={cafe.menuLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Menu
            </a>
          </Button>
        )}
         {!cafe.menuLink && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Leaf className="w-4 h-4 mr-1.5" />
            <span>Menu details typically available at location.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
