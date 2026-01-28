import { getShows } from "@/app/actions/shows";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

export default async function ShowsPage() {
    const shows = await getShows();
    
    const currentSeason = shows.filter(s => s.status === 'UPCOMING' || s.status === 'CURRENT');
    const pastShows = shows.filter(s => s.status === 'PAST');

    return (
        <PublicLayout>
            <div className="bg-muted/30 py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Current Season</h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        Join us for an exciting lineup of productions at Reading Civic Theatre.
                    </p>

                    {currentSeason.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            {currentSeason.map((show) => (
                                <Card key={show.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-video relative bg-muted">
                                        {show.imageUrl ? (
                                            <img src={show.imageUrl} alt={show.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <Badge variant={show.status === 'CURRENT' ? 'default' : 'secondary'}>
                                                {show.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{show.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {show.shortDescription || show.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {show.startDate && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {new Date(show.startDate).toLocaleDateString()} 
                                                {show.endDate && ` - ${new Date(show.endDate).toLocaleDateString()}`}
                                            </div>
                                        )}
                                        <div className="flex gap-4">
                                            <Link href={`/shows/${show.slug}`} className="flex-1">
                                                <Button variant="outline" className="w-full">Learn More</Button>
                                            </Link>
                                            {show.ticketLink && (
                                                <a href={show.ticketLink} target="_blank" rel="noreferrer" className="flex-1">
                                                    <Button className="w-full">Buy Tickets</Button>
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No upcoming shows scheduled at the moment. Check back soon!
                        </div>
                    )}
                </div>
            </div>

            {pastShows.length > 0 && (
                <div className="py-16 container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Past Productions</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {pastShows.map((show) => (
                            <Link key={show.id} href={`/shows/${show.slug}`} className="group">
                                <Card className="h-full overflow-hidden hover:border-primary transition-colors">
                                    <div className="aspect-[2/3] bg-muted relative">
                                        {show.imageUrl ? (
                                            <img src={show.imageUrl} alt={show.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{show.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {show.startDate ? new Date(show.startDate).getFullYear() : 'Past'}
                                        </p>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
