"use client";

import { useState, useEffect, useRef } from "react";
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
import { createMembershipApplication } from "@/app/actions/membership";
import { format } from "date-fns";
import { Download, Plus, Trash2, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function MembershipForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [membershipType, setMembershipType] = useState("Regular");
  const [familyMembers, setFamilyMembers] = useState<
    { name: string; birthDate: string }[]
  >([]);
  const [selectedTier, setSelectedTier] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [hideAddress, setHideAddress] = useState(false);
  const [hidePhone, setHidePhone] = useState(false);
  const [hideEmail, setHideEmail] = useState(false);

  // Auto-fill Date
  const currentDate = format(new Date(), "MM/dd/yyyy");

  const addFamilyMember = () => {
    if (familyMembers.length < 4) {
      setFamilyMembers([...familyMembers, { name: "", birthDate: "" }]);
    }
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

    // Determine Amount based on Tier
    let amount = "0";
    if (selectedTier === "Regular Member") amount = "25.00";
    else if (selectedTier === "Friend")
      amount = customAmount || "26.00"; // Should validate range
    else if (selectedTier === "Bronze") amount = customAmount || "50.00";
    else if (selectedTier === "Silver") amount = customAmount || "100.00";
    else if (selectedTier === "Gold") amount = customAmount || "250.00";
    else if (selectedTier === "Platinum") amount = customAmount || "500.00";
    else if (selectedTier === "Music Sponsor") amount = "1000.00";
    else if (selectedTier === "Lighting Sponsor") amount = "1500.00";
    else if (selectedTier === "Sound Sponsor") amount = "1500.00";
    else if (selectedTier === "Show Rights Sponsor") amount = "3000.00";
    else if (selectedTier === "Season Sponsor") amount = "10000.00";

    formData.append("tier", selectedTier || "Registered Member");
    formData.append("amount", amount);

    const result = await createMembershipApplication(formData);

    if (result.success) {
      toast.success("Application Submitted Successfully!");

      // Redirect logic
      if (Number(amount) > 0) {
        // Construct PayPal URL (This is a generic example, ideally use your specific PayPal Logic)
        // Since user didn't specify exact PayPal link structure, we redirect to the Donate page
        // OR we can try to construct a specific link if provided.
        // For now, redirecting to generic Donate page as requested:
        // "it should redirect them to the Donation page to make their donation"
        window.location.href = "/donate";
      } else {
        // Just reset or show success
        setIsSubmitting(false);
        (e.target as HTMLFormElement).reset();
        setFamilyMembers([]);
        setSelectedTier("");
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      console.error("Submission Error:", result.error);
      toast.error(
        result.error || "Failed to submit application. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSuccess && successRef.current) {
      successRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div ref={successRef} className="max-w-4xl mx-auto py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800">
            Application Received
          </h2>
          <p className="text-lg text-green-700">
            We at Reading Civic Theatre thank you for applying for our
            membership! Your application has been submitted successfully.
          </p>
          <div className="pt-6">
            <Button
              onClick={() => setIsSuccess(false)}
              variant="outline"
              className="border-green-200 hover:bg-green-100 text-green-700"
            >
              Submit Another Application
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12">
      <Card className="border-2">
        <CardContent className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold underline decoration-2 underline-offset-4">
              Membership Application
            </h2>
            <p className="text-muted-foreground">
              <span className="font-bold underline">Note:</span> Under the
              bylaws of RCT, everyone participating in a show or serving on a
              committee shall become a member of the Society.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Date */}
            <div className="flex items-center gap-2">
              <Label className="font-bold underline text-lg">Date:</Label>
              <span className="text-lg">{currentDate}</span>
            </div>

            {/* Membership Type */}
            <div className="space-y-4">
              <Label className="font-bold underline text-lg">
                Membership Type:
              </Label>
              <RadioGroup
                defaultValue="Regular"
                name="type"
                className="space-y-3"
                onValueChange={setMembershipType}
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem
                    value="Regular"
                    id="type-regular"
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="type-regular" className="font-bold">
                      Regular
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      18 years of age or older, including college students
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value="Student"
                      id="type-student"
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="type-student" className="font-bold">
                        Student
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Elementary and Secondary school
                      </p>
                    </div>
                  </div>
                  {membershipType === "Student" && (
                    <div className="ml-6 grid grid-cols-2 gap-4">
                      <Input name="school" placeholder="School (Optional)" />
                      <Input name="grade" placeholder="Grade (Optional)" />
                    </div>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <RadioGroupItem
                    value="Family"
                    id="type-family"
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="type-family" className="font-bold">
                      Family
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      List additional family members later in the form if you
                      want them listed on our membership base
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <Label className="font-bold text-lg block">
                Please provide information below:
              </Label>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" required />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="zip">Zip</Label>
                  <Input id="zip" name="zip" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneHome">Home Phone</Label>
                  <Input id="phoneHome" name="phoneHome" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneCell">Cell Phone</Label>
                  <Input id="phoneCell" name="phoneCell" type="tel" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (Optional)</Label>
                  <Input id="age" name="age" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">
                    Birthday (Month/Day) (Optional)
                  </Label>
                  <Input id="birthDate" name="birthDate" placeholder="MM/DD" />
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="bg-muted p-4 rounded-lg space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold">Note:</span> RCT publishes a
                Membership List, which includes the address, home phone number
                and email address of each member. You may opt out of having your
                address, phone number and/or email address from being included
                in this list by checking any of the following:
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hideAddress"
                    checked={hideAddress}
                    onCheckedChange={(c) => setHideAddress(!!c)}
                  />
                  <Label htmlFor="hideAddress">Do not list my address</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hidePhone"
                    checked={hidePhone}
                    onCheckedChange={(c) => setHidePhone(!!c)}
                  />
                  <Label htmlFor="hidePhone">Do not list my phone number</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hideEmail"
                    checked={hideEmail}
                    onCheckedChange={(c) => setHideEmail(!!c)}
                  />
                  <Label htmlFor="hideEmail">
                    Do not list my email address
                  </Label>
                </div>
              </div>
            </div>

            {/* Additional Family Members */}
            {membershipType === "Family" && (
              <div className="space-y-4 border-t pt-4">
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
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Birth Date (Month/Year)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={member.birthDate}
                          onChange={(e) =>
                            updateFamilyMember(
                              index,
                              "birthDate",
                              e.target.value,
                            )
                          }
                          placeholder="MM/YYYY"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
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
                Membership Tiers and Benefits
              </Label>

              <RadioGroup
                name="tier"
                onValueChange={setSelectedTier}
                className="space-y-4"
              >
                <div className="border p-4 rounded-lg space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Registered Member" id="tier-free" />
                    <Label htmlFor="tier-free" className="font-bold text-lg">
                      Registered Member - Free
                    </Label>
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground space-y-1">
                    <p>Need to complete registration form – no donation.</p>
                    <p>Vocalines provided. No voting privileges.</p>
                    <p className="italic text-xs">
                      (Since it is in our bylaws that everyone in cast or
                      participating in a show must become a member, we find it
                      difficult to eliminate this requirement)
                    </p>
                  </div>
                </div>

                <div className="border p-4 rounded-lg space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Regular Member" id="tier-regular" />
                    <Label htmlFor="tier-regular" className="font-bold text-lg">
                      Regular Member - Adult ($25.00)
                    </Label>
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground space-y-1">
                    <p>Benefits - Vocalines and voting privileges (over 18).</p>
                    <p className="font-bold text-xs text-primary">
                      NOTE: You have to attend at least one General membership
                      meeting prior to the election meeting to exercise your
                      voting privileges.
                    </p>
                  </div>
                </div>

                <div className="border p-4 rounded-lg space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Friend" id="tier-friend" />
                    <Label htmlFor="tier-friend" className="font-bold text-lg">
                      Friend ($26.00 - $49.00)
                    </Label>
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground space-y-1">
                    <p>Ten percent off one Adult/Senior show ticket.</p>
                    <p className="text-xs">
                      Does not apply to Student ticket prices. Contact the RCT
                      Ticket Chairperson
                    </p>
                    {selectedTier === "Friend" && (
                      <div className="mt-2">
                        <Label className="text-xs">
                          Enter Amount ($26 - $49):
                        </Label>
                        <Input
                          type="number"
                          min="26"
                          max="49"
                          placeholder="26.00"
                          className="w-32 mt-1"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border p-4 rounded-lg space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Bronze" id="tier-bronze" />
                    <Label htmlFor="tier-bronze" className="font-bold text-lg">
                      Bronze Member ($50.00 - $99.00)
                    </Label>
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground space-y-1">
                    <p>
                      Benefits- Ten percent off two Adult/Senior show tickets
                    </p>
                    <p className="text-xs">
                      Contact the RCT Ticket Chairperson
                    </p>
                    {selectedTier === "Bronze" && (
                      <div className="mt-2">
                        <Label className="text-xs">
                          Enter Amount ($50 - $99):
                        </Label>
                        <Input
                          type="number"
                          min="50"
                          max="99"
                          placeholder="50.00"
                          className="w-32 mt-1"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Silver, Gold, Platinum could follow similar pattern, abbreviated for brevity but implementing full logic */}
                <div className="border p-4 rounded-lg space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Silver" id="tier-silver" />
                    <Label htmlFor="tier-silver" className="font-bold text-lg">
                      Silver Member ($100.00 - $249.00)
                    </Label>
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground">
                    <p>Benefits- One complimentary show ticket per year.</p>
                    {selectedTier === "Silver" && (
                      <div className="mt-2">
                        <Label className="text-xs">
                          Enter Amount ($100 - $249):
                        </Label>
                        <Input
                          type="number"
                          min="100"
                          max="249"
                          placeholder="100.00"
                          className="w-32 mt-1"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border p-4 rounded-lg space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Gold" id="tier-gold" />
                    <Label htmlFor="tier-gold" className="font-bold text-lg">
                      Gold Member ($250.00 - $499.00)
                    </Label>
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground">
                    <p>Benefits- Two complementary show tickets</p>
                    {selectedTier === "Gold" && (
                      <div className="mt-2">
                        <Label className="text-xs">
                          Enter Amount ($250 - $499):
                        </Label>
                        <Input
                          type="number"
                          min="250"
                          max="499"
                          placeholder="250.00"
                          className="w-32 mt-1"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border p-4 rounded-lg space-y-2 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Platinum" id="tier-platinum" />
                    <Label
                      htmlFor="tier-platinum"
                      className="font-bold text-lg"
                    >
                      Platinum Member ($500.00 - $999.00)
                    </Label>
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground">
                    <p>Benefits- 4 complementary show tickets</p>
                    {selectedTier === "Platinum" && (
                      <div className="mt-2">
                        <Label className="text-xs">
                          Enter Amount ($500 - $999):
                        </Label>
                        <Input
                          type="number"
                          min="500"
                          max="999"
                          placeholder="500.00"
                          className="w-32 mt-1"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Label className="font-bold text-lg block">
                    Special Donation Levels
                  </Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Music Sponsor ($1000)",
                      "Lighting Sponsor ($1500)",
                      "Sound Sponsor ($1500)",
                      "Show Rights Sponsor ($3000)",
                      "Season Sponsor ($10,000)",
                    ].map((sponsor) => {
                      const value = sponsor.split(" (")[0];
                      return (
                        <div
                          key={sponsor}
                          className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50"
                        >
                          <RadioGroupItem
                            value={value}
                            id={`sponsor-${value}`}
                          />
                          <Label
                            htmlFor={`sponsor-${value}`}
                            className="cursor-pointer"
                          >
                            {sponsor}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    *For these special donation levels the patron will receive
                    two Gala Tickets, four complementary show tickets, and
                    special recognition.
                    <br />
                    ** Please contact Jeannette DeAngelo, RCT President for
                    further information.
                  </p>
                </div>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full text-lg h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center space-y-8">
        <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-300">
          <h3 className="text-xl font-bold mb-4">Prefer to mail it in?</h3>
          <p className="mb-4">
            Alternatively, you can print out this form and mail it to the
            following address:
          </p>
          <address className="not-italic font-mono bg-white inline-block p-4 rounded border mb-6">
            ATTN: New Membership
            <br />
            PO Box 4494
            <br />
            Reading, PA 19606
          </address>
          <div>
            <Button variant="outline" asChild>
              <a href="/uploads/RCT-Membership-form-2026.pdf" download>
                <Download className="mr-2 h-4 w-4" /> Download Membership Form
                PDF
              </a>
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          For additional assistance, please e-mail:{" "}
          <a
            href="mailto:membership@readingcivic.org"
            className="text-primary hover:underline"
          >
            membership@readingcivic.org
          </a>{" "}
          or contact Jeanette DeAngelo, RCT President, for further information.
        </p>
      </div>
    </div>
  );
}
