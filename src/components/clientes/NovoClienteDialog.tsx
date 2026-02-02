import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { Cliente } from '@/types/database';

interface NovoClienteDialogProps {
  onClienteCreated?: (cliente: Cliente) => void;
  trigger?: React.ReactNode;
}

export default function NovoClienteDialog({ onClienteCreated, trigger }: NovoClienteDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome_empresa: '',
    cnpj_cpf: '',
    contato_principal: '',
    telefone: '',
    email: '',
  });

  const resetForm = () => {
    setForm({
      nome_empresa: '',
      cnpj_cpf: '',
      contato_principal: '',
      telefone: '',
      email: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome_empresa.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da empresa é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          nome_empresa: form.nome_empresa.trim(),
          cnpj_cpf: form.cnpj_cpf.trim() || null,
          contato_principal: form.contato_principal.trim() || null,
          telefone: form.telefone.trim() || null,
          email: form.email.trim() || null,
          created_by: user?.id,
          status: 'ativo',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Cliente cadastrado com sucesso.',
      });

      resetForm();
      setOpen(false);
      onClienteCreated?.(data as Cliente);
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível cadastrar o cliente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="icon" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Cadastre um novo cliente rapidamente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_empresa">Nome da Empresa *</Label>
            <Input
              id="nome_empresa"
              value={form.nome_empresa}
              onChange={(e) => setForm({ ...form, nome_empresa: e.target.value })}
              placeholder="Ex: Empresa ABC Ltda"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
            <Input
              id="cnpj_cpf"
              value={form.cnpj_cpf}
              onChange={(e) => setForm({ ...form, cnpj_cpf: e.target.value })}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contato_principal">Contato Principal</Label>
            <Input
              id="contato_principal"
              value={form.contato_principal}
              onChange={(e) => setForm({ ...form, contato_principal: e.target.value })}
              placeholder="Nome do responsável"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@empresa.com"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Cadastrar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
