import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms'; 
import { Router } from '@angular/router';
import { MotoristaService, MotoristaSelecao, MotoristaLogado } from '../../services/motorista.service';

@Component({
  selector: 'app-motorista-login',
  templateUrl: './motorista-login.component.html',
  styleUrls: ['./motorista-login.component.css']
})
export class MotoristaLoginComponent implements OnInit {
  motoristasParaSelecao: MotoristaSelecao[] = [];
  errorMessage: string | null = null;

  constructor(
    private motoristaService: MotoristaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Se já houver um motorista logado, redireciona para o dashboard
    if (this.motoristaService.getMotoristaLogado()) {
      this.router.navigate(['/motorista-dashboard']);
      return; 
    }
    this.loadMotoristasParaSelecao();
  }

  loadMotoristasParaSelecao(): void {
    this.motoristaService.getMotoristasParaSelecao().subscribe(
      (data) => {
        this.motoristasParaSelecao = data;
      },
      (error) => {
        console.error('Erro ao carregar motoristas para seleção:', error);
        this.errorMessage = 'Não foi possível carregar a lista de motoristas. Tente mais tarde.';
      }
    );
  }

  onSubmitNIF(form: NgForm): void {
    this.errorMessage = null;
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      this.errorMessage = "Por favor, corrija os erros no formulário.";
      return;
    }

    const nif = form.value.nif;
    this.motoristaService.loginComNIF(nif).subscribe({
      next: (motoristaLogado) => {
        console.log('Login com NIF bem-sucedido:', motoristaLogado);
        this.router.navigate(['/motorista-dashboard']); 
      },
      error: (err) => {
        console.error('Erro no login com NIF:', err);
        this.errorMessage = err.error?.message || 'NIF não encontrado ou ocorreu um erro no servidor.';

      }
    });
  }

  onSelectMotorista(event: Event): void {
    this.errorMessage = null;
    const selectElement = event.target as HTMLSelectElement;
    const motoristaId = selectElement.value;

    if (motoristaId) {
      const motoristaInfo = this.motoristasParaSelecao.find(m => m._id === motoristaId);
      if (motoristaInfo) {

        const motoristaParaLogin: MotoristaLogado = {
            _id: motoristaInfo._id,
            nome: motoristaInfo.nome,
            nif: motoristaInfo.nif
        };
        this.motoristaService.setMotoristaLogado(motoristaParaLogin);
        console.log('Motorista selecionado da lista:', motoristaParaLogin);
        this.router.navigate(['/motorista-dashboard']);
      }
    }
  }
}