import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Separator } from "@/Components/ui/separator";
import { PawPrint, ArrowRight } from "lucide-react";

const PetInfoForm = ({ 
  userPets = [], 
  petDetails, 
  handlePetSelection, 
  handlePetDetailChange, 
  setPetDetails,
  onContinue,
  onBack 
}) => {
  return (
    <Card className="shadow-lg border-t-4 border-t-[#008879]">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl flex items-center">
          <PawPrint className="mr-2 h-5 w-5 text-[#008879]" />
          Pet Information
        </CardTitle>
        <CardDescription>Tell us about the pet we'll be caring for</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {userPets.length > 0 && (
          <>
            <Label className="mb-2 block font-medium">Select a Pet</Label>
            <Select
              value={petDetails.pet_id || ""}
              onValueChange={handlePetSelection}
            >
              <SelectTrigger className="mb-4">
                <SelectValue placeholder="Select a pet" />
              </SelectTrigger>
              <SelectContent>
                {userPets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>
                    {pet.name} ({pet.type})
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Add a new pet</SelectItem>
              </SelectContent>
            </Select>
            
            <Separator className="my-4" />
          </>
        )}
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pet_name">Pet Name *</Label>
              <Input
                id="pet_name"
                name="pet_name"
                value={petDetails.pet_name}
                onChange={handlePetDetailChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="pet_type">Pet Type *</Label>
              <Select
                value={petDetails.pet_type}
                onValueChange={(value) => setPetDetails(prev => ({ ...prev, pet_type: value }))}
              >
                <SelectTrigger id="pet_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pet_breed">Breed/Species</Label>
              <Input
                id="pet_breed"
                name="pet_breed"
                value={petDetails.pet_breed}
                onChange={handlePetDetailChange}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="pet_age">Age</Label>
              <Input
                id="pet_age"
                name="pet_age"
                value={petDetails.pet_age}
                onChange={handlePetDetailChange}
                className="mt-1"
                placeholder="e.g. 2 years"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="pet_weight">Weight (kg)</Label>
            <Input
              id="pet_weight"
              name="pet_weight"
              value={petDetails.pet_weight}
              onChange={handlePetDetailChange}
              className="mt-1"
              type="number"
            />
          </div>
          
          <div>
            <Label htmlFor="special_notes">Special Notes (allergies, medical history, etc.)</Label>
            <textarea
              id="special_notes"
              name="special_notes"
              value={petDetails.special_notes}
              onChange={handlePetDetailChange}
              className="mt-1 w-full p-2 rounded-md border border-gray-300"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-slate-50 flex justify-between">
        <Button 
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button 
          onClick={onContinue}
          className="bg-[#008879] hover:bg-[#07776b] text-white"
        >
          Continue
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PetInfoForm; 