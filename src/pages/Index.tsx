import { useState, useEffect } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionCard, Transaction } from "@/components/TransactionCard";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { MonthSelector } from "@/components/MonthSelector";
import { MonthProjection } from "@/components/MonthProjection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { isSameMonth, isBefore, isFuture, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financial-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage when transactions change
  useEffect(() => {
    localStorage.setItem('financial-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (newTransaction: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
    };
    setTransactions([transaction, ...transactions]);
    toast({
      title: "Transação adicionada!",
      description: `${transaction.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transaction.amount.toFixed(2)} foi registrada.`,
    });
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(
      transactions.map(t => 
        t.id === updatedTransaction.id ? updatedTransaction : t
      )
    );
    setEditingTransaction(null);
    toast({
      title: "Transação atualizada!",
      description: "As informações foram salvas com sucesso.",
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast({
      title: "Transação removida!",
      description: "A transação foi excluída com sucesso.",
      variant: "destructive",
    });
  };

  const startEditing = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const stopEditing = () => {
    setEditingTransaction(null);
  };

  // Calculate totals for selected month
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const isFutureMonth = isFuture(selectedDate) && !isSameMonth(selectedDate, new Date());
  
  // Generate recurring transactions for future months
  const generateRecurringTransactions = (): Transaction[] => {
    if (!isFutureMonth) return [];
    
    return recurringTransactions.map(transaction => ({
      ...transaction,
      id: `recurring-${transaction.id}-${selectedYear}-${selectedMonth}`,
      date: new Date(selectedYear, selectedMonth, new Date(transaction.date).getDate()).toISOString(),
    }));
  };
  
  const realMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === selectedMonth && 
           transactionDate.getFullYear() === selectedYear;
  });
  
  const monthlyTransactions = isFutureMonth 
    ? [...realMonthTransactions, ...generateRecurringTransactions()]
    : realMonthTransactions;

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const recurringTransactions = transactions.filter(t => t.isRecurring);

  // Calculate accumulated balance up to the selected month
  const calculatePreviousBalance = () => {
    let accumulatedBalance = 0;
    
    // Get all months before the selected month
    const allTransactionDates = [...new Set(transactions.map(t => {
      const date = new Date(t.date);
      return `${date.getFullYear()}-${date.getMonth()}`;
    }))];
    
    allTransactionDates.forEach(dateKey => {
      const [year, month] = dateKey.split('-').map(Number);
      const monthDate = new Date(year, month, 1);
      
      // Only count transactions from months before the selected month
      if (isBefore(monthDate, new Date(selectedYear, selectedMonth, 1))) {
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getMonth() === month && tDate.getFullYear() === year;
        });
        
        const monthIncome = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const monthExpenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
          
        accumulatedBalance += (monthIncome - monthExpenses);
      }
    });
    
    return accumulatedBalance;
  };

  const previousBalance = calculatePreviousBalance();
  const isCurrentMonth = isSameMonth(selectedDate, new Date());

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-primary rounded-2xl shadow-elevated">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Controle Financeiro
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas finanças e projete o futuro
            </p>
          </div>
        </div>
        
        <AddTransactionDialog
          onAddTransaction={addTransaction}
          editingTransaction={editingTransaction}
          onUpdateTransaction={updateTransaction}
          onClose={stopEditing}
        />
      </div>

      {/* Month Navigation */}
      <div className="mb-8">
        <MonthSelector 
          currentDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="projection" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Projeção Mensal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Balance Cards */}
          <BalanceCard
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
          />
        </TabsContent>

        <TabsContent value="projection" className="space-y-6">
          <MonthProjection 
            selectedDate={selectedDate}
            transactions={transactions}
            previousBalance={previousBalance}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Stats - Only show for current month */}
      {isCurrentMonth && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recent Transactions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Este Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transações</span>
                  <span className="font-medium">{monthlyTransactions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Média por dia</span>
                  <span className="font-medium">
                    R$ {(Math.abs(balance) / new Date().getDate()).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recurring Transactions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Recorrentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total configuradas</span>
                  <span className="font-medium">{recurringTransactions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Valor mensal</span>
                  <span className="font-medium">
                    R$ {recurringTransactions.reduce((sum, t) => 
                      sum + (t.type === 'income' ? t.amount : -t.amount), 0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            Transações de {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          {transactions.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setTransactions([]);
                toast({
                  title: "Dados limpos!",
                  description: "Todas as transações foram removidas.",
                });
              }}
              className="text-expense hover:text-expense"
            >
              Limpar Tudo
            </Button>
          )}
        </div>

        {monthlyTransactions.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                {isCurrentMonth ? "Nenhuma transação ainda" : "Nenhuma transação neste mês"}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {isCurrentMonth 
                  ? "Comece adicionando sua primeira receita ou despesa para começar a controlar suas finanças."
                  : `Não há transações registradas para ${format(selectedDate, "MMMM yyyy", { locale: ptBR })}.`
                }
              </p>
              {isCurrentMonth && (
                <AddTransactionDialog
                  onAddTransaction={addTransaction}
                  editingTransaction={editingTransaction}
                  onUpdateTransaction={updateTransaction}
                  onClose={stopEditing}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {monthlyTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={startEditing}
                onDelete={deleteTransaction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;