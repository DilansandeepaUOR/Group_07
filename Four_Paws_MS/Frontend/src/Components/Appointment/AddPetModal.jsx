import React, { useState,useEffect } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/Components/ui/dialog";
import { Plus } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AddPetModal = ({ onPetAdded, userId }) => {
  const [open, setOpen] = useState(false);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("Dog");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("http://localhost:3001/appointments/pets", {
        Pet_name: petName,
        Pet_type: petType,
        gender,
        dob,
        user_id: userId || user?.id
      });

      toast.success("Pet added successfully!");
      onPetAdded();
      setOpen(false);
      setPetName("");
      setPetType("Dog");
      setGender("");
      setDob("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add pet. Please try again.");
      console.error("Error adding pet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/auth/user", { 
          withCredentials: true 
        });
        
        if (response.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        setUser(null);
      }
    };

    if (!userId) {
      checkAuth();
    }
  }, [userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          <Plus className="h-4 w-4 mr-1" /> Add Pet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Pet</DialogTitle>
          <DialogDescription>
            Register your pet to book appointments
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="petName" className="pb-2">Pet Name</Label>
            <Input
              id="petName"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="petType" className="pb-2">Pet Type</Label>
            <Select value={petType} onValueChange={setPetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select pet type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dog">Dog</SelectItem>
                <SelectItem value="Cat">Cat</SelectItem>
                <SelectItem value="Bird">Bird</SelectItem>
                <SelectItem value="Rabbit">Rabbit</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="gender" className="pb-2">Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dob" className="pb-2">Date of Birth</Label>
            <Input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#008879] hover:bg-[#07776b] text-white">
              {isSubmitting ? "Adding..." : "Add Pet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPetModal; 