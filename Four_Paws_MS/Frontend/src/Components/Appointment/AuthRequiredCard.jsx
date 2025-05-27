import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";

const AuthRequiredCard = ({ onLogin }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl">Authentication Required</CardTitle>
        <CardDescription>You need to be logged in to manage appointments</CardDescription>
      </CardHeader>
      <CardContent className="py-12 text-center">
        <p className="text-gray-600 mb-6">Please log in to view and book appointments for your pets</p>
        <Button 
          onClick={onLogin}
          className="bg-[#008879] hover:bg-[#07776b] text-white"
        >
          Login to Continue
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthRequiredCard; 