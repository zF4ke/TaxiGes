import { Component, OnInit } from '@angular/core';
import { Motorista } from '../../../models/motorista.model';
import { MotoristaService } from '../../../services/motorista.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-list-motorista',
  templateUrl: './list-motorista.component.html',
  styleUrls: ['./list-motorista.component.css']
})
export class ListMotoristaComponent implements OnInit{
  motoristas: Motorista[] = []; 
  displayedColumns: string[] = ['nif', 'nome', 'genero', 'anoNascimento', 'cartaConducao', 'localidade', 'createdAt', 'acoes'];
  isLoading = true; 

  constructor(
    private motoristaService: MotoristaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMotoristas(); 
  }

  // Função para carregar os motoristas
  loadMotoristas(): void {
    this.isLoading = true; 
    this.motoristaService.getAllMotoristas().subscribe({
      next: (data) => {
        
        this.motoristas = data; 
        this.isLoading = false;
        console.log('Motoristas carregados:', this.motoristas);
      },
      error: (error) => {
       
        console.error('Erro ao carregar motoristas:', error);
        this.isLoading = false;
        
      }
    });
  }

  //funcao para remover um motorista
  removerMotorista(motoristaId: string, motoristaNome: string): void {
    const confirmacao = window.confirm(`Tem a certeza que deseja remover o motorista ${motoristaNome}? Esta ação não pode ser desfeita.`);

    if (confirmacao) {
      this.isLoading = true; 
      this.motoristaService.deleteMotorista(motoristaId).subscribe({ 
        next: (response) => {
          console.log(response.message);
          alert(response.message); 
          this.loadMotoristas(); 
        },
        error: (err) => {
          console.error('Erro ao remover motorista:', err);
          alert(err.error?.message || 'Ocorreu um erro ao tentar remover o motorista.');
          this.isLoading = false;
        }
      });
    }
  }

  editarMotorista(motoristaId: string): void {
    console.log('Navegando para editar motorista com ID:', motoristaId);
    this.router.navigate(['/gestao-motoristas/editar', motoristaId]);
  }
  
}
