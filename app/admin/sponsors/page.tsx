import { getSponsors, deleteSponsor } from "@/app/actions/sponsors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function SponsorsAdminPage() {
  const sponsors = await getSponsors();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
          <p className="text-muted-foreground">
            Manage community sponsors and partners.
          </p>
        </div>

        <Link href="/admin/sponsors/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Sponsor
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sponsors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No sponsors found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sponsors.map((sponsor) => (
                  <TableRow key={sponsor.id}>
                    <TableCell>{sponsor.order}</TableCell>
                    <TableCell>
                      {sponsor.imageUrl ? (
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                          <Image
                            src={sponsor.imageUrl}
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          No Img
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {sponsor.name}
                    </TableCell>
                    <TableCell>
                      {sponsor.websiteUrl ? (
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-[200px] block"
                        >
                          {sponsor.websiteUrl}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {sponsor.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/sponsors/${sponsor.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form
                          action={async () => {
                            "use server";
                            await deleteSponsor(sponsor.id);
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
