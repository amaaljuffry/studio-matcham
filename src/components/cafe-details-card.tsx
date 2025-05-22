import type { Cafe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, MapPinIcon, Star, Leaf, Globe, InstagramIcon, FacebookIcon, TagIcon } from "lucide-react";
import Image from "next/image";

interface CafeDetailsCardProps {
  cafe: Cafe;
}

export function CafeDetailsCard({ cafe }: CafeDetailsCardProps) {
  return (
    <Card className="w-full shadow-lg overflow-hidden bg-card">
      <CardHeader className="p-4">
        <div className="relative w-full h-48 md:h-56 rounded-md overflow-hidden mb-3">
          <Image
            src={cafe.image}
            alt={cafe.name}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{objectFit: "cover"}}
            data-ai-hint={cafe.dataAiHint || "cafe food"}
            priority // Prioritize loading image for selected cafe
          />
        </div>
        <CardTitle className="text-xl lg:text-2xl font-semibold text-primary">{cafe.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground flex items-center">
            <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
            {cafe.address} - {cafe.state}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-sm">{cafe.openingHours}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-accent flex-shrink-0" />
          <Badge variant="outline" className="text-sm border-accent text-accent bg-accent/10">{cafe.rating} / 5</Badge>
        </div>

        {cafe.tags && cafe.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
                <TagIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <h4 className="font-medium">Tags:</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {cafe.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {(cafe.menuLink || cafe.socialMediaLinks) && <div className="border-t border-border pt-4 space-y-3" />}
        
        {cafe.menuLink && (
          <Button variant="outline" asChild className="w-full hover:bg-primary/10 border-primary text-primary">
            <a href={cafe.menuLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Menu
            </a>
          </Button>
        )}
         {!cafe.menuLink && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Leaf className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>Menu details typically available at location.</span>
          </div>
        )}

        {cafe.socialMediaLinks && (
          <div className="space-y-2">
             <h4 className="text-sm font-medium text-muted-foreground">Connect:</h4>
            <div className="flex flex-wrap gap-2">
              {cafe.socialMediaLinks.website && (
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <a href={cafe.socialMediaLinks.website} target="_blank" rel="noopener noreferrer" aria-label={`${cafe.name} website`}>
                    <Globe className="w-4 h-4 mr-1.5" /> Website
                  </a>
                </Button>
              )}
              {cafe.socialMediaLinks.instagram && (
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <a href={cafe.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${cafe.name} Instagram`}>
                    <InstagramIcon className="w-4 h-4 mr-1.5" /> Instagram
                  </a>
                </Button>
              )}
              {cafe.socialMediaLinks.facebook && (
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <a href={cafe.socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${cafe.name} Facebook`}>
                    <FacebookIcon className="w-4 h-4 mr-1.5" /> Facebook
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
