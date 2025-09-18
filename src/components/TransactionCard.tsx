import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  isRecurring?: boolean;
}

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const isIncome = transaction.type === "income";
  
  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isIncome ? "bg-success-light text-success" : "bg-expense-light text-expense"
            )}>
              {isIncome ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground">{transaction.description}</h3>
                {transaction.isRecurring && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    Mensal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{transaction.category}</span>
                <span>•</span>
                <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-semibold text-lg",
              isIncome ? "text-success" : "text-expense"
            )}>
              {isIncome ? "+" : "-"}R$ {Math.abs(transaction.amount).toFixed(2)}
            </span>
            
            <div className="flex gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(transaction)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-expense hover:text-expense"
                onClick={() => onDelete(transaction.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}