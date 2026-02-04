"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateMembershipApplication,
  deleteMembershipApplication,
} from "@/app/actions/membership";
import { format } from "date-fns";
import { Plus, Trash2, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatPhoneNumber, formatZipCode } from "@/lib/formatters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type MembershipApplication = {
  id: string;
  type: string;
  school: string | null;
  grade: string | null;
  firstName: string;
  lastName: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phoneHome: string | null;
  phoneCell: string | null;
  email: string | null;
  age: string | null;
  birthDate: string | null;
  hideAddress: boolean;
  hidePhone: boolean;
  hideEmail: boolean;
  familyMembers: string | null; // JSON string
  tier: string;
  amount: string;
  createdAt: Date;
};

interface AdminMembershipFormProps {
  application: MembershipApplication;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AdminMembershipForm({
  application,
  onSuccess,
  onCancel,
}: AdminMembershipFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Parse initial family members
  let initialFamilyMembers = [];
  try {
    initialFamilyMembers = JSON.parse(application.familyMembers || "[]");
  } catch (e) {
    initialFamilyMembers = [];
  }

  // State initialization
  const [membershipType, setMembershipType] = useState(application.type);
  const [familyMembers, setFamilyMembers] =
    useState<{ name: string; birthDate: string }[]>(initialFamilyMembers);
  const [selectedTier, setSelectedTier] = useState(application.tier);
  const [amount, setAmount] = useState(application.amount || "0");

  // Formatted Fields State
  const [phoneHome, setPhoneHome] = useState(application.phoneHome || "");
  const [phoneCell, setPhoneCell] = useState(application.phoneCell || "");
  const [zip, setZip] = useState(application.zip || "");

  // Privacy toggles
  const [hideAddress, setHideAddress] = useState(application.hideAddress);
  const [hidePhone, setHidePhone] = useState(application.hidePhone);
  const [hideEmail, setHideEmail] = useState(application.hideEmail);

  const addFamilyMember = () => {
    if (familyMembers.length >= 4) return;
    setFamilyMembers([...familyMembers, { name: "", birthDate: "" }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (
    index: number,
    field: "name" | "birthDate",
    value: string,
  ) => {
    const newMembers = [...familyMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFamilyMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("familyMembers", JSON.stringify(familyMembers));
    formData.append("hideAddress", hideAddress ? "on" : "off");
    formData.append("hidePhone", hidePhone ? "on" : "off");
    formData.append("hideEmail", hideEmail ? "on" : "off");
    formData.append("amount", amount);

    // Explicitly set the radio/select values if not picked up (sometimes issues with controlled components)
    if (!formData.get("type")) formData.append("type", membershipType);
    if (!formData.get("tier")) formData.append("tier", selectedTier);

    const result = await updateMembershipApplication(application.id, formData);

    if (result.success) {
      toast.success("Application updated successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } else {
      toast.error(result.error || "Failed to update application");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteMembershipApplication(application.id);
    if (result.success) {
      toast.success("Application deleted");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/memberships");
      }
    } else {
      toast.error(result.error || "Failed to delete");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.push("/admin/memberships");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </Button>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  membership application for {application.firstName}{" "}
                  {application.lastName}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Membership Type */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Membership Type</Label>
              <Select
                name="type"
                value={membershipType}
                onValueChange={setMembershipType}
              >
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">
                    Regular Member (Adult)
                  </SelectItem>
                  <SelectItem value="Student">Student Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student Fields */}
            {membershipType === "Student" && (
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    name="school"
                    defaultValue={application.school || ""}
                    placeholder="Enter school name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    name="grade"
                    defaultValue={application.grade || ""}
                    placeholder="Enter grade"
                  />
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={application.firstName}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={application.lastName}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={application.address || ""}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={application.city || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={application.state || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input
                    id="zip"
                    name="zip"
                    value={zip}
                    onChange={(e) => setZip(formatZipCode(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneHome">Home Phone</Label>
                  <Input
                    id="phoneHome"
                    name="phoneHome"
                    value={phoneHome}
                    onChange={(e) =>
                      setPhoneHome(formatPhoneNumber(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneCell">Cell Phone</Label>
                  <Input
                    id="phoneCell"
                    name="phoneCell"
                    value={phoneCell}
                    onChange={(e) =>
                      setPhoneCell(formatPhoneNumber(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={application.email || ""}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    defaultValue={application.age || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    defaultValue={application.birthDate || ""}
                  />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Directory Privacy Settings
              </h3>
              <p className="text-sm text-muted-foreground">
                Select items you wish to HIDE from the membership directory.
                (Admins can always see this data).
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hideAddress"
                    checked={hideAddress}
                    onCheckedChange={(c) => setHideAddress(c === true)}
                  />
                  <Label htmlFor="hideAddress">Hide Address</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hidePhone"
                    checked={hidePhone}
                    onCheckedChange={(c) => setHidePhone(c === true)}
                  />
                  <Label htmlFor="hidePhone">Hide Phone Numbers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hideEmail"
                    checked={hideEmail}
                    onCheckedChange={(c) => setHideEmail(c === true)}
                  />
                  <Label htmlFor="hideEmail">Hide Email</Label>
                </div>
              </div>
            </div>

            {/* Family Members */}
            {membershipType === "Regular" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-lg">
                    Additional Family Members
                  </Label>
                  {familyMembers.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFamilyMember}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Member
                    </Button>
                  )}
                </div>

                {familyMembers.map((member, index) => (
                  <div
                    key={index}
                    className="grid md:grid-cols-2 gap-4 items-end p-4 border rounded bg-slate-50"
                  >
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={member.name}
                        onChange={(e) =>
                          updateFamilyMember(index, "name", e.target.value)
                        }
                        placeholder="Family member name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Birth Date</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={member.birthDate}
                          onChange={(e) =>
                            updateFamilyMember(
                              index,
                              "birthDate",
                              e.target.value,
                            )
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFamilyMember(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {familyMembers.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No additional members added yet.
                  </p>
                )}
              </div>
            )}

            {/* Membership Tiers */}
            <div className="space-y-6 border-t pt-6">
              <Label className="font-bold text-xl block mb-4">
                Membership Tier & Payment
              </Label>

              <RadioGroup
                name="tier"
                value={selectedTier}
                onValueChange={setSelectedTier}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="Regular Member" id="tier-regular" />
                    <Label htmlFor="tier-regular">Regular Member ($25)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="Friend" id="tier-friend" />
                    <Label htmlFor="tier-friend">Friend ($26-49)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="Bronze" id="tier-bronze" />
                    <Label htmlFor="tier-bronze">Bronze ($50-99)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="Silver" id="tier-silver" />
                    <Label htmlFor="tier-silver">Silver ($100-249)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="Gold" id="tier-gold" />
                    <Label htmlFor="tier-gold">Gold ($250-499)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="Platinum" id="tier-platinum" />
                    <Label htmlFor="tier-platinum">Platinum ($500+)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="Archangel" id="tier-archangel" />
                    <Label htmlFor="tier-archangel">Archangel ($1000+)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="Corporate" id="tier-corporate" />
                    <Label htmlFor="tier-corporate">Corporate ($2500+)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-lg">
                    <RadioGroupItem value="Sponsor" id="tier-sponsor" />
                    <Label htmlFor="tier-sponsor">Sponsor ($5000+)</Label>
                  </div>
                </div>
              </RadioGroup>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="amount">Contribution Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/memberships")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
