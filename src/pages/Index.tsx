import { useState, useEffect } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionCard, Transaction } from "@/components/TransactionCard";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Calendar, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

  // Calculate totals
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const recurringTransactions = transactions.filter(t => t.isRecurring);

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
              {new Date().toLocaleDateString('pt-BR', { 
                month: 'long', 
                year: 'numeric' 
              })}
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

      {/* Balance Cards */}
      <div className="mb-8">
        <BalanceCard
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}
        />
      </div>

      {/* Quick Stats */}
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

      {/* Transactions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            Transações Recentes
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

        {transactions.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                Nenhuma transação ainda
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                Comece adicionando sua primeira receita ou despesa para começar a controlar suas finanças.
              </p>
              <AddTransactionDialog
                onAddTransaction={addTransaction}
                editingTransaction={editingTransaction}
                onUpdateTransaction={updateTransaction}
                onClose={stopEditing}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {transactions.map((transaction) => (
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