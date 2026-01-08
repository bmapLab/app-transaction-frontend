'use client';

import { useEffect, useState } from "react";
import api from "./api";
import toast from "react-hot-toast";
import { microtask } from "framer-motion";
import { minify } from "next/dist/build/swc/generated-native";
import { div } from "framer-motion/client";
import { Activity, ArrowDownCircle, ArrowUpCircle, PlusCircle, Trash, TrendingDown, TrendingUp, Wallet } from "lucide-react";

type Transaction = {
  id: string;
  text : string;
  amount: number;
  created_at: string;
};

export default function Home() {
  const [Transaction, setTransaction] = useState<Transaction[]>([]);
  const [text, setText] = useState<string>('');
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState<boolean>(false);

  const getTransactions = async () => {
    try{
      const res = await api.get<Transaction[]>('transactions/')
      setTransaction(res.data)
      toast.success('Transactions chargée avec succès'); 
    }catch(error){
      console.error('Erreur lors du chargement des transactions:', error);
      toast.error('Erreur lors du chargement des transactions');
    }
  }
  const deleteTransactions = async (id: string) => {
    try{
      const res = await api.delete(`transactions/${id}/`)
      getTransactions()
      toast.success('Transactions supprimée avec succès'); 
    }catch(error){
      console.error('Erreur suppression transactions', error);
      toast.error('Erreur suppression transaction');
    }
  }
  const addTransactions = async () => {
    if(!text || amount == "" || isNaN(Number(amount))){ 
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading (true);
    try{
      const res = await api.post(`transactions/` , {
        text,
        amount: Number(amount),
      }
      )
      getTransactions()
      const modal = document.getElementById('my_modal_3') as HTMLDialogElement
      if(modal){
        modal.close();
      }
      toast.success('Transactions Ajoutée avec succès')
      setText('')
      setAmount('')
    }catch(error){
      console.error('Erreur ajout transactions', error);
      toast.error('Erreur suppression transaction');
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    getTransactions();
  }, []);
  const amounts = Transaction.map((t) => Number(t.amount) || 0);
  const balance = amounts.reduce((acc, item) => (acc += item), 0) || 0;
  const income = amounts.filter((a) => a > 0).reduce((acc, item) => (acc += item), 0) || 0;
  const expense = amounts.filter((a) => a < 0).reduce((acc, item) => (acc += item), 0) || 0;
  const ratio = income === 0 ? 0 : (Math.abs(expense) / income) * 100;
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute : '2-digit',
    });};
  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-5 ">
        <div className="flex flex-col gap-1">
            <div className="badge badge-soft">
              <Wallet className="w-4 h-4" />
              votre solde
            </div>
          <div className="stat-value">
            {balance.toFixed(2)  } €
          </div>
        </div>
      
        <div className="flex flex-col gap-1">
            <div className="badge badge-soft badge-success">
              <ArrowUpCircle className="w-4 h-4" />
              Revenus
            </div>
          <div className="stat-value">
            {income.toFixed(2)  } €
          </div>
        </div>
      
        <div className="flex flex-col gap-1">
            <div className="badge badge-soft badge-error">
              <ArrowDownCircle className="w-4 h-4" />
              Depenses
            </div>
          <div className="stat-value">
            {expense.toFixed(2)  } €
          </div>
        </div>
      
      </div>
      <div className="rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-5 ">
      <div className="flex justify-between items-center text-sm sm:text-base mb-1">
        <div className="badge badge-soft badge-warning gap-1">
          <Activity className="w-4 h-4"/>
          Depenses Vs Revenus    
        </div>
        <div>{ratio.toFixed(0)}%</div>
      </div>
      <progress className="progress progress-warning w-full" value={ratio} max={100}></progress>
      </div>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      <button className="btn btn-warning sm:w-auto" 
      onClick={()=>(document.getElementById('my_modal_3') as HTMLDialogElement).showModal()}> 
      <PlusCircle className="w-4 h-4"/>
      Ajouter une transaction</button>

      <div className="overflow-x-auto rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5">
  <table className="table table-zebra min-w-175">
    {/* head */}
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>Montant</th>
        <th>Date</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {Transaction.map((t, index) => (
        <tr key={t.id} >
          <th>{index + 1}</th>
          <td>{t.text}</td>
          <td className="font-semibold flex items-center gap-2 whitespace-nowrap">{t.amount > 0 ? (
            <TrendingUp className="text-success w-6 h-4"/>
          ) : (
            <TrendingDown className="text-error w-6 h-4"/>
          )}
            {t.amount > 0 ? `+${t.amount}`  : `${t.amount}`} 
          €</td>
          <td>{formatDate(t.created_at)}
          </td>
          <td> 
            <button onClick={() => deleteTransactions(t.id)} className="btn btn-sm btn-error btn-soft" title="Supprimer"> 
             
              <Trash className="w-4 h-4"/> </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

<dialog id="my_modal_3" className="modal backdrop-blur">
        <div className="modal-box w-11/12 max-w-md border-2 border-warning/10 border-dashed">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg">Ajouter une transaction</h3>
          <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <label className="label">Text</label>
                <input type="text"
                name="text"
                value={text}
                onChange={ (e)=> setText(e.target.value)}
                placeholder="entrez le titre"
                className="input w-full" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="label">Montant (négatif - Dépenses, positif - revenus)</label>
                <input type="Number"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(
                  e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="entrez le titre"
                className="input w-full" />
              </div>
                  <button onClick={addTransactions}
                  disabled={loading}
                  className="w-full btn btn-warning sm:w-auto">
                    <PlusCircle className="w-4 h-4" />
                    Ajouter
                  </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
