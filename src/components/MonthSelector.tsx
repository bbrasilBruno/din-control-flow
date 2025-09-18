import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function MonthSelector({ currentDate, onDateChange }: MonthSelectorProps) {
  const goToPreviousMonth = () => {
    onDateChange(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  const goToCurrentMonth = () => {
    onDateChange(new Date());
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentDate.getMonth() === now.getMonth() && 
           currentDate.getFullYear() === now.getFullYear();
  };

  return (
    <div className="flex items-center justify-between bg-card rounded-lg p-4 shadow-card">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousMonth}
        className="h-9 w-9 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        {!isCurrentMonth() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goToCurrentMonth}
            className="text-xs"
          >
            Hoje
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={goToNextMonth}
        className="h-9 w-9 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}