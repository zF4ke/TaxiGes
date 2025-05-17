import { Component, OnInit } from '@angular/core';
import { Motorista } from '../../../models/motorista.model';
import { MotoristaService } from '../../../services/motorista.service';

@Component({
  selector: 'app-list-motorista',
  templateUrl: './list-motorista.component.html',
  styleUrls: ['./list-motorista.component.css']
})
export class ListMotoristaComponent implements OnInit{
  motoristas: Motorista[] = []; 
  displayedColumns: string[] = ['nif', 'nome', 'genero', 'anoNascimento', 'cartaConducao', 'localidade', 'createdAt'];
  isLoading = true; 

  constructor(private motoristaService: MotoristaService) {}

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
}
