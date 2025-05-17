import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MotoristaService, MotoristaLogado } from '../../../services/motorista.service'; 

@Component({
  selector: 'app-motorista-dashboard',
  templateUrl: './motorista-dashboard.component.html',
  styleUrls: ['./motorista-dashboard.component.css']
})
export class MotoristaDashboardComponent implements OnInit {
  motorista: MotoristaLogado | null = null;

  constructor(
    private motoristaService: MotoristaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.motorista = this.motoristaService.getMotoristaLogado();

    if (!this.motorista) {
      this.router.navigate(['/motorista-login']); 
    }
  }

  logout(): void {
    this.motoristaService.logoutMotorista();
    this.router.navigate(['/motorista-login']); 
  }

  navigateTo(feature: string): void {
    alert(`Funcionalidade "${feature}" ainda não implementada.`);
    console.log(`Navegar para /motorista/${feature}`);
  }
}