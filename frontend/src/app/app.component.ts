import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MotoristaService, MotoristaLogado } from '../app/services/motorista.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'taxi-ges-frontend';

  constructor(
    public motoristaService: MotoristaService, 
    private router: Router,
    private cdRef: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {}

  get nomeMotoristaLogado(): string | null {
    const motorista = this.motoristaService.getMotoristaLogado();
    return motorista ? motorista.nome : null;
  }

  logout(): void {
    this.motoristaService.logoutMotorista();
    this.cdRef.detectChanges();
    this.router.navigate(['/motorista-login']); 
  }
}
