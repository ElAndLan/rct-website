"use client";

import { useState } from "react";
import { DashboardMessage } from "@/app/actions/admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, User, Clock, Phone, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DashboardMailboxProps {
  messages: DashboardMessage[];
}

export function DashboardMailbox({ messages }: DashboardMailboxProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    messages.length > 0 ? messages[0].id : null,
  );

  const selectedMessage = messages.find((m) => m.id === selectedId);

  return (
    <div className="grid md:grid-cols-12 gap-6 h-[600px]">
      {/* Message List */}
      <Card className="md:col-span-5 lg:col-span-4 flex flex-col overflow-hidden h-full">
        <CardHeader className="px-4 py-3 border-b bg-muted/30">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Inbox ({messages.length})
          </CardTitle>
        </CardHeader>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-1 p-2">
              {messages.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No messages found.
                </div>
              ) : (
                messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => setSelectedId(message.id)}
                    className={`flex flex-col items-start gap-1 p-3 text-left text-sm rounded-md transition-colors border ${
                      selectedId === message.id
                        ? "bg-primary/10 border-primary/20"
                        : "hover:bg-muted border-transparent"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-semibold line-clamp-1">
                        {message.name}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {format(new Date(message.date), "MMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <Badge
                        variant={
                          message.type === "CONTACT"
                            ? "default"
                            : message.type === "VOLUNTEER"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px] px-1 py-0 h-4"
                      >
                        {message.type}
                      </Badge>
                      <span className="font-medium text-xs truncate">
                        {message.subject}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground w-full">
                      {message.preview}
                    </p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* Message Details */}
      <Card className="md:col-span-7 lg:col-span-8 h-full flex flex-col overflow-hidden">
        {selectedMessage ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b flex-none">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Badge variant="outline">{selectedMessage.type}</Badge>
                    <span>•</span>
                    <span>
                      {format(new Date(selectedMessage.date), "PPpp")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-md">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedMessage.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-primary hover:underline"
                  >
                    {selectedMessage.email || "No email"}
                  </a>
                </div>
                {selectedMessage.details.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMessage.details.phone}</span>
                  </div>
                )}
                {selectedMessage.details.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMessage.details.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {selectedMessage.type === "CONTACT" ? (
                    <div className="prose max-w-none text-sm whitespace-pre-wrap">
                      {selectedMessage.details.message}
                    </div>
                  ) : selectedMessage.type === "MEMBERSHIP" ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">
                            Membership Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Tier:
                              </span>
                              <span className="font-medium">
                                {selectedMessage.details.tier}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Amount:
                              </span>
                              <span className="font-medium">
                                ${selectedMessage.details.amount}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Status:
                              </span>
                              <Badge variant="outline">
                                {selectedMessage.details.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-semibold text-xs uppercase text-muted-foreground mb-2">
                            Family Members
                          </h4>
                          <div className="space-y-1 text-sm">
                            {selectedMessage.details.familyMembers &&
                            selectedMessage.details.familyMembers.length > 0 ? (
                              selectedMessage.details.familyMembers.map(
                                (member: any, i: number) => (
                                  <div key={i} className="flex gap-2">
                                    <span className="font-medium">
                                      {member.name}
                                    </span>
                                    {member.email && (
                                      <span className="text-muted-foreground text-xs">
                                        ({member.email})
                                      </span>
                                    )}
                                  </div>
                                ),
                              )
                            ) : (
                              <span className="text-muted-foreground italic">
                                None listed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Contact Preferences
                        </h4>
                        <div className="flex gap-2">
                          {selectedMessage.details.hideAddress && (
                            <Badge variant="secondary">Hide Address</Badge>
                          )}
                          {selectedMessage.details.hidePhone && (
                            <Badge variant="secondary">Hide Phone</Badge>
                          )}
                          {selectedMessage.details.hideEmail && (
                            <Badge variant="secondary">Hide Email</Badge>
                          )}
                          {!selectedMessage.details.hideAddress &&
                            !selectedMessage.details.hidePhone &&
                            !selectedMessage.details.hideEmail && (
                              <span className="text-sm text-muted-foreground">
                                No privacy restrictions
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Roles of Interest
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMessage.details.roles.map((role: string) => (
                            <Badge key={role} variant="outline">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedMessage.details.about && (
                        <div>
                          <h4 className="font-semibold mb-2">About</h4>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {selectedMessage.details.about}
                          </p>
                        </div>
                      )}

                      {selectedMessage.details.availability && (
                        <div>
                          <h4 className="font-semibold mb-2">Availability</h4>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {selectedMessage.details.availability}
                          </p>
                        </div>
                      )}

                      {selectedMessage.details.additionalComments && (
                        <div>
                          <h4 className="font-semibold mb-2">
                            Additional Comments
                          </h4>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {selectedMessage.details.additionalComments}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Mail className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a message to view details</p>
          </div>
        )}
      </Card>
    </div>
  );
}
