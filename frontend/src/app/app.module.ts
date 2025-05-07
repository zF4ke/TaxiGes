import { NgModule } from '@angular/core';
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
import { AppComponent } from './app.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { AddTaxiComponent } from './pages/add-taxi/add-taxi.component';
import { ListTaxisComponent } from './pages/list-taxis/list-taxis.component';
import { ListPriceComponent } from './pages/list-price/list-price.component';
import { AddPriceComponent } from './pages/add-price/add-price.component';
import { UpdatePriceComponent } from './pages/update-price/update-price.component';
import { SimulateTravelComponent } from './pages/simulate-travel/simulate-travel.component';
import { AddMotoristaComponent } from './pages/add-motorista/add-motorista.component';
import { ListMotoristaComponent } from './pages/list-motorista/list-motorista.component';
import { MotoristaLoginComponent } from './pages/motorista-login/motorista-login.component';
import { MotoristaDashboardComponent } from './pages/motorista-dashboard/motorista-dashboard.component';



const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'add-taxi', component: AddTaxiComponent },
  { path: 'list-taxis', component: ListTaxisComponent },
  { path: 'list-prices', component: ListPriceComponent },
  { path: 'add-price', component: AddPriceComponent },
  { path: 'update-price/:id', component: UpdatePriceComponent},
  { path: 'simulate-travel', component: SimulateTravelComponent},
  { path: 'add-motorista', component: AddMotoristaComponent },
  { path: 'list-motoristas', component: ListMotoristaComponent },
  { path: 'motorista-login', component: MotoristaLoginComponent },
  { path: 'motorista-dashboard', component: MotoristaDashboardComponent },
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
    UpdatePriceComponent,
    SimulateTravelComponent,
    AddMotoristaComponent,
    ListMotoristaComponent,
    MotoristaLoginComponent,
    MotoristaDashboardComponent
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
    MatTableModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatSelectModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
