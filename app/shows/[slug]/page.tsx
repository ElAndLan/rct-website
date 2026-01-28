import { getShowBySlug } from "@/app/actions/shows";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ShowPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const show = await getShowBySlug(slug);

    if (!show) notFound();

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Hero Section */}
            <div className="relative h-[50vh] w-full overflow-hidden bg-muted">
                {show.imageUrl ? (
                    <img 
                        src={show.imageUrl} 
                        alt={show.title} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
                        No Image Available
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 container mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 drop-shadow-md">{show.title}</h1>
                    <div className="flex gap-2">
                        <Badge variant="outline" className="text-lg py-1 px-4 border-white/20 bg-black/40 text-white backdrop-blur-sm">
                            {show.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-12">
                    
                    {/* Synopsis */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-primary">Synopsis</h2>
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                            {show.description || "No description available."}
                        </div>
                    </section>

                    {/* Program */}
                    {(show.isProgramActive && (show.programContent || show.programPdfUrl)) && (
                        <section id="program">
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-primary">Digital Program</h2>
                            
                            {show.programPdfUrl && (
                                <div className="mb-6">
                                    <a href={show.programPdfUrl} target="_blank" rel="noopener noreferrer">
                                        <Button size="lg" className="w-full md:w-auto">
                                            <Ticket className="mr-2 h-5 w-5" /> Download PDF Program
                                        </Button>
                                    </a>
                                </div>
                            )}

                            {show.programContent && (
                                <div className="bg-muted p-6 rounded-lg shadow-inner whitespace-pre-wrap font-serif">
                                    {show.programContent}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Photos */}
                    {show.photos.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-primary">Gallery</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {show.photos.map((photo) => (
                                    <div key={photo.id} className="relative group overflow-hidden rounded-lg aspect-square bg-muted">
                                        <img 
                                            src={photo.url} 
                                            alt={photo.caption || "Show photo"} 
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                        />
                                        {photo.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                {photo.caption}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="space-y-8">
                    {/* Show Details Card */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
                        {show.startDate && (
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold">Dates</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(show.startDate).toLocaleDateString()}
                                        {show.endDate && ` - ${new Date(show.endDate).toLocaleDateString()}`}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {show.location && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold">Location</h3>
                                    <p className="text-sm text-muted-foreground">{show.location}</p>
                                </div>
                            </div>
                        )}

                        {show.ticketLink && (show.status === 'UPCOMING' || show.status === 'CURRENT') && (
                            <a href={show.ticketLink} target="_blank" rel="noreferrer" className="block">
                                <Button className="w-full" size="lg">Buy Tickets</Button>
                            </a>
                        )}
                    </div>

                    {/* Cast List */}
                    {show.cast.length > 0 && (
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold mb-4">Cast</h3>
                            <ul className="space-y-3">
                                {show.cast.map((member) => (
                                    <li key={member.id} className="flex justify-between items-start border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                        <span className="font-medium">{member.name}</span>
                                        <span className="text-sm text-muted-foreground text-right ml-4">{member.role}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
