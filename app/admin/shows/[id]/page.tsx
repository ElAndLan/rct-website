import { getShowById } from "@/app/actions/shows";
import { ShowEditor } from "@/components/admin/show-editor";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditShowPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const show = await getShowById(id);

    if (!show) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/shows">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Show: {show.title}</h1>
                    <p className="text-muted-foreground">Manage details, cast, and photos.</p>
                </div>
            </div>

            <ShowEditor show={show} />
        </div>
    );
}
