import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export function BalanceCard({ totalIncome, totalExpenses, balance }: BalanceCardProps) {
  const isPositive = balance >= 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Saldo Principal */}
      <Card className={cn(
        "shadow-elevated col-span-1 md:col-span-3",
        isPositive ? "bg-gradient-success" : "bg-gradient-expense"
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="text-white/90 text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Saldo Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-white">
            R$ {balance.toFixed(2)}
          </div>
          <p className="text-white/80 text-sm mt-1">
            {isPositive ? "Você está no azul!" : "Atenção aos gastos"}
          </p>
        </CardContent>
      </Card>
      
      {/* Receitas */}
      <Card className="shadow-card bg-success-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-success text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Receitas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-success">
            R$ {totalIncome.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      
      {/* Despesas */}
      <Card className="shadow-card bg-expense-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-expense text-sm font-medium flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Despesas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-expense">
            R$ {totalExpenses.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}