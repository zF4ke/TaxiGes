import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-travel-resume',
  templateUrl: './travel-resume.component.html',
  styleUrls: ['./travel-resume.component.css']
})
export class TravelResumeComponent implements OnInit {
  destino?: string;
  precoFinal?: number;
  kmPercorridos?: number;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as { [key: string]: any } | undefined;
    this.destino = state?.['destino'];
    this.precoFinal = state?.['precoFinal'];
    this.kmPercorridos = state?.['kmPercorridos'];
  }
}