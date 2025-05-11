export interface Viagem {
  _id: string;
  motoristaId: string;
  pedidoId: string;
  dataHoraInicio: string;
  dataHoraFim?: string;
  status: string;
}