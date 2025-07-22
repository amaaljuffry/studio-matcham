import type { Cafe } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ExternalLink,
  MapPinIcon,
  Star,
  Leaf,
  Globe,
  InstagramIcon,
  FacebookIcon,
  TagIcon,
  TwitterIcon,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";

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
    <Card
      className="w-full max-w-lg mx-auto shadow-lg overflow-hidden"
      style={{ backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
    >
      <CardHeader className="p-4">
        <div
          className="relative w-32 h-32 rounded-md overflow-hidden mb-3 mx-auto aspect-square flex items-center justify-center"
          style={{ backgroundColor: "hsl(var(--muted))" }}
        >
          {cafe.logoLink ? (
            <Image
              src={cafe.logoLink}
              alt={`Logo of ${cafe.name}`}
              fill={true}
              sizes="(max-width: 768px) 128px, (max-width: 1200px) 128px, 128px"
              style={{ objectFit: "contain", objectPosition: "center" }}
              priority
            />
          ) : (
            <Image
              src="/logo.svg"
              alt={`Placeholder logo for ${cafe.name}`}
              fill={true}
              sizes="(max-width: 768px) 128px, (max-width: 1200px) 128px, 128px"
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          )}
        </div>
        <CardTitle
          className="text-xl lg:text-2xl font-semibold"
          style={{ color: "hsl(var(--primary))" }}
        >
          {cafe.name}
        </CardTitle>
        <CardDescription className="text-sm flex items-center" style={{ color: "hsl(var(--muted-foreground))" }}>
          <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
          {cafe.address} - {cafe.state}
        </CardDescription>
        {(cafe.latitude && cafe.longitude) && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:text-primary hover:bg-primary/10"
              style={{ color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--muted-foreground))" }}
            >
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${cafe.latitude},${cafe.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${cafe.name} on Google Maps`}
              >
                <MapPinIcon className="w-4 h-4 mr-1.5" /> Google Maps
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hover:text-primary hover:bg-primary/10"
              style={{ color: "hsl(var(--muted-foreground))", borderColor: "hsl(var(--muted-foreground))" }}
            >
              <a
                href={`https://waze.com/ul?ll=${cafe.latitude},${cafe.longitude}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${cafe.name} on Waze`}
              >
                <ExternalLink className="w-4 h-4 mr-1.5" /> Waze
              </a>
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
          <span className="text-sm">{cafe.openinghours || "Not specified"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
          <Badge
            variant="outline"
            className="text-sm"
            style={{
              borderColor: "hsl(var(--accent))",
              color: "hsl(var(--accent))",
              backgroundColor: "hsl(var(--accent)/0.1)",
            }}
          >
            {cafe.rating} / 5
          </Badge>
        </div>

        {cafe.halalstatus && cafe.halalstatus !== "Not Specified" && (
          <div className="flex items-center space-x-2">
            <Badge
              variant={cafe.halalstatus === "Non Halal" ? "destructive" : "secondary"}
              style={{
                color:
                  cafe.halalstatus === "Non Halal"
                    ? "hsl(var(--destructive))"
                    : "hsl(var(--secondary))",
                borderColor:
                  cafe.halalstatus === "Non Halal"
                    ? "hsl(var(--destructive))"
                    : "hsl(var(--secondary))",
              }}
            >
              {cafe.halalstatus}
            </Badge>
          </div>
        )}

        {cafe.tags && cafe.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              <TagIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <h4 className="font-medium">Tags:</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {cafe.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs"
                  style={{ color: "hsl(var(--secondary))", backgroundColor: "hsl(var(--secondary)/0.1)" }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {cafe.socialmedialinks && <div className="border-t" style={{ borderColor: "hsl(var(--border))" }} />}

        {cafe.socialmedialinks && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
              Connect:
            </h4>
            <div className="flex flex-wrap gap-2">
              {cafe.socialmedialinks.website && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:text-primary hover:bg-primary/10"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <a
                    href={cafe.socialmedialinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${cafe.name} website`}
                  >
                    <Globe className="w-4 h-4 mr-1.5" /> Website
                  </a>
                </Button>
              )}
              {cafe.socialmedialinks.instagram && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:text-primary hover:bg-primary/10"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <a
                    href={cafe.socialmedialinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${cafe.name} Instagram`}
                  >
                    <InstagramIcon className="w-4 h-4 mr-1.5" /> Instagram
                  </a>
                </Button>
              )}
              {cafe.socialmedialinks.facebook && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:text-primary hover:bg-primary/10"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <a
                    href={cafe.socialmedialinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${cafe.name} Facebook`}
                  >
                    <FacebookIcon className="w-4 h-4 mr-1.5" /> Facebook
                  </a>
                </Button>
              )}
              {cafe.socialmedialinks.twitter && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:text-primary hover:bg-primary/10"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <a
                    href={cafe.socialmedialinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${cafe.name} Twitter/X`}
                  >
                    <TwitterIcon className="w-4 h-4 mr-1.5" /> Twitter/X
                  </a>
                </Button>
              )}
              {cafe.socialmedialinks.tiktok && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:text-primary hover:bg-primary/10"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <a
                    href={cafe.socialmedialinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${cafe.name} TikTok`}
                  >
                    <TikTokIcon /> TikTok
                  </a>
                </Button>
              )}
              {cafe.socialmedialinks.whatsapp && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:text-primary hover:bg-primary/10"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  <a
                    href={
                      cafe.socialmedialinks.whatsapp.startsWith("http")
                        ? cafe.socialmedialinks.whatsapp
                        : `https://wa.me/${cafe.socialmedialinks.whatsapp.replace(/\D/g, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${cafe.name} WhatsApp`}
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
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
