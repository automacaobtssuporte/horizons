export const tiposAnimais = [
  { value: "bovino", label: "Bovino" },
  { value: "suino", label: "Suíno" }
];

export const partesBovinoOpcoes = [
  { value: "1", label: "Dianteiro" },
  { value: "2", label: "Traseiro" },
  { value: "3", label: "Serrote" },
  { value: "4", label: "Boi Inteiro" },
  { value: "5", label: "Ponta de Agulha" },
  { value: "6", label: "Costela" },
  { value: "99", label: "Descarte" },
  { value: "100", label: "Outro (Específico)" },
];

export const partesSuinoOpcoes = [
  { value: "11", label: "Pernil" },
  { value: "12", label: "Paleta" },
  { value: "13", label: "Lombo" },
  { value: "14", label: "Costela Suína" },
  { value: "15", label: "Panceta (Barriga)" },
  { value: "16", label: "Copa" },
  { value: "17", label: "Papada" },
  { value: "18", label: "Pé" },
  { value: "19", label: "Rabo" },
  { value: "20", label: "Suíno Inteiro" },
  { value: "99", label: "Descarte" },
  { value: "100", "label": "Outro (Específico)" },
];

export const getPartesOpcoesPorTipo = (tipoAnimal) => {
  switch (tipoAnimal) {
    case "bovino":
      return partesBovinoOpcoes;
    case "suino":
      return partesSuinoOpcoes;
    default:
      return partesBovinoOpcoes;
  }
};