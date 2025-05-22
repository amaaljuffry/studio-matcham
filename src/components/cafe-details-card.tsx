
import type { Cafe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, MapPinIcon, Star, Leaf, Globe, InstagramIcon, FacebookIcon, TagIcon, TwitterIcon, MessageCircle } from "lucide-react"; // Added TwitterIcon, MessageCircle for TikTok/WhatsApp
import Image from "next/image";

// Simple mapping for TikTok, as lucide-react might not have it directly
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.5.06 1.54-.35 3.09-.93 4.55-.58 1.45-1.34 2.73-2.3 3.85s-2.14 2.04-3.56 2.71c-1.42.67-2.96.98-4.5.96-1.54-.03-3.08-.38-4.48-.98s-2.61-1.46-3.6-2.68c-.91-1.13-1.56-2.44-1.88-3.87-.32-1.43-.28-2.93.05-4.38.32-1.44.98-2.76 1.9-3.9 1-1.17 2.28-2.08 3.78-2.65.02-.46.04-.93.05-1.4.02-1.52.53-3.04 1.55-4.15s2.47-1.72 4.05-1.72c.1-.01.2-.01.29-.01zM7.75 16.13c.02.02.02.02.02.02.43.42.93.75 1.47.99.54.24 1.12.36 1.72.35.59.01 1.17-.1 1.71-.33.54-.24.99-.57 1.4-.98.02-.02.03-.03.03-.03s-.02-.02-.02-.02c-.49-.49-.94-.92-1.31-1.45s-.68-1.13-.88-1.8c-.2-.67-.3-1.39-.29-2.15.01-.76.12-1.5.32-2.2s.5-1.33.87-1.9c.37-.57.83-1.06 1.36-1.45.02-.02.02-.02.02-.02s-.02.01-.02.01c-.52.47-1.01.98-1.41 1.58s-.71 1.29-.91 2.07c-.2.78-.29 1.61-.27 2.45.02.84.13 1.64.34 2.4.11.43.23.84.37 1.25.09.24.19.48.29.71z"></path>
  </svg>
);


interface CafeDetailsCardProps {
  cafe: Cafe;
}

export function CafeDetailsCard({ cafe }: CafeDetailsCardProps) {
  return (
    <Card className="w-full shadow-lg overflow-hidden bg-card">
      <CardHeader className="p-4">
        <div className="relative w-full h-48 md:h-56 rounded-md overflow-hidden mb-3 bg-muted">
          {cafe.logoLink ? (
            <Image
              src={cafe.logoLink} // Use logoLink
              alt={`Logo of ${cafe.name}`}
              fill={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{objectFit: "contain"}} // Use contain for logos
              data-ai-hint={cafe.dataAiHint || "cafe logo"}
              priority
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center">
                <Leaf className="w-16 h-16 text-muted-foreground" />
              </div>
          )}
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

        {cafe.halalStatus && cafe.halalStatus !== "Not Specified" && (
           <div className="flex items-center space-x-2">
            <Badge variant={cafe.halalStatus === "Non Halal" ? "destructive" : "secondary"}>
                {cafe.halalStatus}
            </Badge>
          </div>
        )}

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

        {(cafe.socialMediaLinks) && <div className="border-t border-border pt-4 space-y-3" />}
        
        {/* Removed direct menuLink - expect menu via website or social */}

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
              {cafe.socialMediaLinks.twitter && (
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <a href={cafe.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${cafe.name} Twitter/X`}>
                    <TwitterIcon className="w-4 h-4 mr-1.5" /> Twitter/X
                  </a>
                </Button>
              )}
              {cafe.socialMediaLinks.tiktok && (
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <a href={cafe.socialMediaLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label={`${cafe.name} TikTok`}>
                    <TikTokIcon /> TikTok
                  </a>
                </Button>
              )}
               {cafe.socialMediaLinks.whatsapp && (
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <a href={cafe.socialMediaLinks.whatsapp.startsWith('http') ? cafe.socialMediaLinks.whatsapp : `https://wa.me/${cafe.socialMediaLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label={`${cafe.name} WhatsApp`}>
                    <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
         {!cafe.socialMediaLinks?.website && !cafe.socialMediaLinks?.instagram && !cafe.socialMediaLinks?.facebook && ( // Check if any primary link exists
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Leaf className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span>Menu and more details typically available at location or via social media.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
