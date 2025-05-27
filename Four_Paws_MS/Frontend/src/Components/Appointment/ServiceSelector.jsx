import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Checkbox } from "@/Components/ui/checkbox";
import { PawPrint, ArrowRight } from "lucide-react";

const ServiceSelector = ({ 
  serviceOptions = [], 
  selectedServices = [], 
  toggleService, 
  calculateTotal, 
  onContinue 
}) => {
  return (
    <Card className="shadow-lg border-t-4 border-t-[#008879]">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-xl flex items-center">
          <PawPrint className="mr-2 h-5 w-5 text-[#008879]" />
          Select Mobile Services
        </CardTitle>
        <CardDescription>Choose the services you need for your pet</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          {serviceOptions.map((service) => (
            <div 
              key={service.id}
              className={`border rounded-lg p-4 cursor-pointer hover:border-[#008879] transition-all ${selectedServices.includes(service.id) ? 'border-[#008879] bg-green-50' : 'border-gray-200'}`}
              onClick={() => toggleService(service.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{service.icon}</div>
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <p className="text-xs text-gray-500">Duration: {service.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="font-medium">${service.price}</p>
                  <Checkbox
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Selected Services:</span>
            <span className="font-medium">{selectedServices.length}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium">Total:</span>
            <span className="font-bold text-lg">${calculateTotal()}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-slate-50 flex justify-end">
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

export default ServiceSelector; 