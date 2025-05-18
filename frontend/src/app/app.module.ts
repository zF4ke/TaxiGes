import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

// Material UI
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { AddTaxiComponent } from './pages/gestao-de-taxis/add-taxi/add-taxi.component';
import { ListTaxisComponent } from './pages/gestao-de-taxis/list-taxis/list-taxis.component';
import { ListPriceComponent } from './pages/gestao-de-precos/list-price/list-price.component';
import { AddPriceComponent } from './pages/gestao-de-precos/add-price/add-price.component';
import { SimulateTravelComponent } from './pages/ferramentas-de-viagem/simulate-travel/simulate-travel.component';
import { AddMotoristaComponent } from './pages/gestao-de-motoristas/add-motorista/add-motorista.component';
import { ListMotoristaComponent } from './pages/gestao-de-motoristas/list-motorista/list-motorista.component';
import { MotoristaLoginComponent } from './pages/gestao-de-motoristas/motorista-login/motorista-login.component';
import { MotoristaDashboardComponent } from './pages/gestao-de-motoristas/motorista-dashboard/motorista-dashboard.component';
import { PedidoTaxiComponent } from './pages/pedidos-de-taxi/pedido-taxi/pedido-taxi.component';
import { ListPedidosComponent } from './pages/pedidos-de-taxi/list-pedidos/list-pedidos.component';
import { PedidoDetalheComponent } from './pages/pedidos-de-taxi/pedido-detalhe/pedido-detalhe.component';
import { MatDividerModule } from '@angular/material/divider';
import { MotoristaPedidoDetalheComponent } from './pages/pedidos-de-taxi/motorista-pedido-detalhe/motorista-pedido-detalhe.component';
import { MapaSelecionarDestinoComponent } from './pages/pedidos-de-taxi/mapa-selecionar-destino/mapa-selecionar-destino.component';
import { RequisitarTaxiTurnoComponent } from './pages/gestao-de-motoristas/requisitar-taxi-turno/requisitar-taxi-turno.component';
import { ListTurnosComponent } from './pages/gestao-de-motoristas/list-turnos/list-turnos.component';
import { TravelRegisterComponent } from './pages/ferramentas-de-viagem/travel-register/travel-register.component';
import {TravelResumeComponent} from './pages/ferramentas-de-viagem/travel-resume/travel-resume.component';
import { MotoristaMinhasViagensComponent } from './pages/ferramentas-de-viagem/motorista-minhas-viagens/motorista-minhas-viagens.component';
import { RelatorioTaxisComponent } from './pages/relatorios/relatorio-taxis/relatorio-taxis.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },

  // Rotas de gestão de taxis
  { path: 'add-taxi', component: AddTaxiComponent },
  { path: 'list-taxis', component: ListTaxisComponent },

  // Rotas de gestão de preços
  { path: 'add-price', component: AddPriceComponent },
  { path: 'list-prices', component: ListPriceComponent },

  // Rotas de gestão de motoristas
  { path: 'add-motorista', component: AddMotoristaComponent },
  { path: 'list-motoristas', component: ListMotoristaComponent },
  { path: 'motorista-login', component: MotoristaLoginComponent },
  { path: 'motorista-dashboard', component: MotoristaDashboardComponent },
  { path: 'requisitar-taxi-turno', component: RequisitarTaxiTurnoComponent },
  { path: 'list-turnos', component:ListTurnosComponent},

  // Rotas de pedidos de taxi
  { path: 'pedido-taxi', component: PedidoTaxiComponent },
  { path: 'pedidos', component: ListPedidosComponent },
  { path: 'pedido/:id', component: PedidoDetalheComponent },
  { path: 'motorista/pedido/:id', component: MotoristaPedidoDetalheComponent },

  // Rotas de ferramentas de viagem
  { path: 'simulate-travel', component: SimulateTravelComponent},
  { path: 'travel-register', component: TravelRegisterComponent },
  { path: 'viagem/resumo/:id', component: TravelResumeComponent },
  { path: 'motorista-minhas-viagens', component: MotoristaMinhasViagensComponent },
  
  // Rotas de relatórios
  { path: 'relatorios/taxis', component: RelatorioTaxisComponent },
  
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    AddTaxiComponent,
    ListTaxisComponent,
    ListPriceComponent, 
    AddPriceComponent,
    SimulateTravelComponent,
    AddMotoristaComponent,
    ListMotoristaComponent,
    MotoristaLoginComponent,
    MotoristaDashboardComponent,
    PedidoTaxiComponent,
    ListPedidosComponent,
    PedidoDetalheComponent,
    MotoristaPedidoDetalheComponent,
    MapaSelecionarDestinoComponent,
    RequisitarTaxiTurnoComponent,
    ListTurnosComponent,
    MotoristaMinhasViagensComponent,
    TravelRegisterComponent,
    TravelResumeComponent,
    RelatorioTaxisComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    CommonModule,
    MatSelectModule,
    MatDividerModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
