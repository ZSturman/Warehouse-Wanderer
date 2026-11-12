import type { Visit } from "../../types";
import { StorageKeys } from "../StorageKeys";
import { createCollectionRepository } from "./collectionRepository";

export const VisitsRepository = createCollectionRepository<Visit>(StorageKeys.visits);
