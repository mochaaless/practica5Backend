import { Vuelo, VueloModel } from "./types.ts";

export const formModelToVuelo = (vuelosModel: VueloModel): Vuelo => {
  return {
    id: vuelosModel._id!.toString(),
    origen: vuelosModel.origen,
    destino: vuelosModel.destino,
    date: vuelosModel.date
  };
};
