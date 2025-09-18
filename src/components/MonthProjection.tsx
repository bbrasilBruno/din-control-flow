import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calculator, Calendar } from "lucide-react";
import { Transaction } from "./TransactionCard";
import { format, isFuture, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MonthProjectionProps {
  selectedDate: Date;
  transactions: Transaction[];
  previousBalance: number;
}

export function MonthProjection({ selectedDate, transactions, previousBalance }: MonthProjectionProps) {
  const isFutureMonth = isFuture(selectedDate) && !isSameMonth(selectedDate, new Date());
  
  // Get transactions for the current month (including recurring ones)
  const monthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const isSameMonthYear = transactionDate.getMonth() === selectedDate.getMonth() && 
                           transactionDate.getFullYear() === selectedDate.getFullYear();
    
    // For future months, only include recurring transactions
    if (isFutureMonth) {
      return t.isRecurring;
    }
    
    return isSameMonthYear;
  });

  // Calculate projected recurring income/expenses for future months
  const recurringTransactions = transactions.filter(t => t.isRecurring);
  
  const projectedIncome = isFutureMonth 
    ? recurringTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    : monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  const projectedExpenses = isFutureMonth
    ? recurringTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    : monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const monthlyBalance = projectedIncome - projectedExpenses;
  const finalBalance = previousBalance + monthlyBalance;
  
  const isPositiveBalance = finalBalance >= 0;
  const isPositiveMonthly = monthlyBalance >= 0;

  return (
    <div className="space-y-6">
      {/* Month Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-lg font-medium">
            {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
          </span>
        </div>
        <Badge variant={isFutureMonth ? "secondary" : "default"}>
          {isFutureMonth ? "Projeção" : "Atual"}
        </Badge>
      </div>

      {/* Balance Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Initial Balance */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Saldo Inicial
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className={cn(
              "text-xl font-bold",
              previousBalance >= 0 ? "text-success" : "text-expense"
            )}>
              R$ {previousBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="shadow-card bg-success-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-success text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {isFutureMonth ? "Receitas Fixas" : "Receitas"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-success">
              +R$ {projectedIncome.toFixed(2)}
            </div>
            {isFutureMonth && (
              <p className="text-xs text-success/70">
                {recurringTransactions.filter(t => t.type === 'income').length} itens fixos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card className="shadow-card bg-expense-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-expense text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {isFutureMonth ? "Custos Fixos" : "Despesas"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-expense">
              -R$ {projectedExpenses.toFixed(2)}
            </div>
            {isFutureMonth && (
              <p className="text-xs text-expense/70">
                {recurringTransactions.filter(t => t.type === 'expense').length} itens fixos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Final Balance */}
        <Card className={cn(
          "shadow-elevated",
          isPositiveBalance ? "bg-gradient-success" : "bg-gradient-expense"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-white/90 text-sm font-medium">
              Saldo Final
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-white">
              R$ {finalBalance.toFixed(2)}
            </div>
            <p className="text-white/80 text-xs">
              {isPositiveMonthly ? "+" : ""}R$ {monthlyBalance.toFixed(2)} no mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Transactions Preview */}
      {isFutureMonth && recurringTransactions.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Transações Recorrentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recurringTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      transaction.type === 'income' ? "bg-success" : "bg-expense"
                    )} />
                    <div>
                      <span className="font-medium">{transaction.description}</span>
                      <p className="text-xs text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "font-semibold",
                    transaction.type === 'income' ? "text-success" : "text-expense"
                  )}>
                    {transaction.type === 'income' ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Future Month Warning */}
      {isFutureMonth && recurringTransactions.length === 0 && (
        <Card className="shadow-card border-warning bg-warning-light">
          <CardContent className="flex items-center gap-3 py-4">
            <Calendar className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-warning">Nenhuma transação recorrente configurada</p>
              <p className="text-sm text-warning/80">
                Adicione receitas e custos fixos para ver projeções mais precisas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}