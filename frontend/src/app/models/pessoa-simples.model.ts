import { Genero } from "./pessoa.model";

export interface PessoaSimples {
  nif: string;
  nome: string;
  genero: Genero;
  anoNascimento: number;
}
