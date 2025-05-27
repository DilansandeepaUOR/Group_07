import React from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Filter, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/Components/ui/alert-dialog";
import { convertTimeFormat } from "./utils";

const AppointmentList = ({
  appointments = [],
  statusFilter,
  setStatusFilter,
  noAppointments,
  handleCancelAppointment,
  isCancelling,
  cancellingAppointmentId,
  formatDate,
  getStatusColor
}) => {
  const getFilteredAppointments = () => {
    if (statusFilter === "all") {
      return appointments;
    }
    return appointments.filter(app => app.status === statusFilter);
  };

  return (
    <Card className="shadow-lg border-t-4 border-t-[#008879]">
      <CardHeader className="bg-slate-50 border-b pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-[#008879]" />
            My Appointments
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-36">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>View and manage your pet appointments</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {noAppointments ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-gray-500 text-sm">No appointments found</p>
          </div>
        ) : getFilteredAppointments().length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500 text-sm">No appointments found with the selected filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getFilteredAppointments().map((appointment) => (
              <div
                key={appointment.appointment_id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-gray-800">
                    #{appointment.appointment_id} - {appointment.Pet_name || appointment.petType}
                  </div>
                  <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 text-sm text-gray-600 gap-2 mb-2">
                  <div>
                    <span className="block text-gray-400">Date</span>
                    {formatDate(appointment.appointment_date)}
                  </div>
                  <div>
                    <span className="block text-gray-400">Time</span>
                    {convertTimeFormat(appointment.appointment_time)}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-gray-400">Reason</span>
                    {appointment.reason}
                  </div>
                  {appointment.additional_note && (
                    <div className="col-span-2">
                      <span className="block text-gray-400">Note</span>
                      {appointment.additional_note}
                    </div>
                  )}
                </div>

                {appointment.status === "Scheduled" && (
                  <div className="flex justify-end mt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-red-600 border-red-300 bg-red-50 hover:bg-red-100 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this appointment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Go Back</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancelAppointment(appointment.appointment_id)}
                            disabled={
                              isCancelling && cancellingAppointmentId === appointment.appointment_id
                            }
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {isCancelling && cancellingAppointmentId === appointment.appointment_id
                              ? "Cancelling..."
                              : "Yes, Cancel"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentList; 