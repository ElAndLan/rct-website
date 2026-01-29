import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function AuditionsIndexPage() {
  // Fetch shows with audition data
  const shows = await prisma.show.findMany({
    include: {
      audition: {
        include: {
          _count: {
            select: { slots: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Auditions Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shows & Productions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Show Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audition Status</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No shows found. Create a show first.
                  </TableCell>
                </TableRow>
              ) : (
                shows.map((show) => {
                  const hasAudition = !!show.audition;
                  const isActive = show.audition?.isActive;

                  return (
                    <TableRow key={show.id}>
                      <TableCell className="font-medium">
                        {show.title}
                        <div className="text-xs text-muted-foreground">
                          /{show.slug}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{show.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {hasAudition ? (
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{show.audition?._count.slots || 0}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/auditions/${show.id}`}>
                          <Button variant="ghost" size="sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            {hasAudition ? "Manage" : "Setup"}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
