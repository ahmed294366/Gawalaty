import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Calendar, Map, AlertCircle } from "lucide-react";
import { getAnnouncementsAction } from './announcementsAction';

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncementsAction();
    if (announcements?.error) { throw new Error(announcements.message) }

    const getDaysUntilExpiry = (expiryDate) => {
        const
            today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const isExpiringsSoon = (expiryDate) => {
        const daysLeft = getDaysUntilExpiry(expiryDate);
        return daysLeft <= 3 && daysLeft >= 0;
    };

    return (
        <div className="px-4 py-8 min-h-screen flex items-center flex-col w-full">
            <div className="mb-4 w-5xl max-w-full">
                <h1 className="flex items-center gap-3 mb-2 font-bold text-xl">
                    <Megaphone className="h-8 w-8 text-primary" />
                    Announcements
                </h1>
                <p className="text-muted-foreground">
                </p>
            </div>

            {announcements.length === 0 ? (
                <Card className={"w-5xl max-w-full"}>
                    <CardContent className="py-16 text-center">
                        <Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="mb-2 font-semibold text-xl">No announcements at that moment</h3>
                        <p className="text-xl text-zinc-500 mb-6">
                            We will post updates and announcements here.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/">
                                Back to home
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="gap-4 flex flex-col">
                    {announcements.map(announcement => (
                        <Card key={announcement.id} className="w-5xl max-w-full">
                            <CardContent className="p-0">
                                {/* Header with gradient */}
                                <div className="bg-linear-to-r from-primary to-primary/70 p-4 text-primary-foreground">
                                    <div className="flex items-start gap-3">
                                        <Megaphone className="h-6 w-6 shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <h2 className="mb-1">{announcement.title}</h2>
                                            <div className="flex items-center gap-2 text-sm opacity-90">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {isExpiringsSoon(announcement.expiresAt) && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Ends soon
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {announcement.description}
                                    </p>

                                    {/* Footer info */}
                                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Expires In: {new Date(announcement.expiresAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {announcement.trip?.title && announcement.trip?.id && (
                                            <>
                                                <span className="text-muted-foreground/30">•</span>
                                                <div className="flex items-center gap-2">
                                                    <Map className="h-4 w-4" />
                                                    <Link
                                                        href={`/trip/${announcement.tripId}`}
                                                        className="text-primary hover:underline"
                                                    >
                                                        {announcement.trip.title}
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Call to action if linked to trip */}
                                    {announcement.trip?.id && (
                                        <Link href={`/trip/${announcement.trip.id}`}>
                                            <Button 
                                            variant="outline" className="w-full mt-2">
                                                See trip details
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
